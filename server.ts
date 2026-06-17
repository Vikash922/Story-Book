import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data store for ephemeral stealth chat
  const rooms = new Map<string, any[]>();
  const typingStates = new Map<string, Record<string, number>>();
  const roomParticipants = new Map<string, Map<string, { lastSeen: number, lastRead: number, joinedSent?: boolean, leftSent?: boolean }>>();

  app.post('/api/room', (req, res) => {
    // Generate a 6-character room code 
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms.set(code, []);
    res.json({ code });
  });

  app.get('/api/room/:code', (req, res) => {
    const { code } = req.params;
    const since = parseInt(req.query.since as string, 10) || 0;
    const userId = req.query.user as string;
    const isActiveTab = req.query.active === 'true';
    if (!rooms.has(code)) {
      rooms.set(code, []);
    }
    const allMessages = rooms.get(code)!;
    const now = Date.now();
    
    if (!roomParticipants.has(code)) {
      roomParticipants.set(code, new Map());
    }
    const participants = roomParticipants.get(code)!;

    // Sweep stale participants (inactive for more than 30 seconds)
    for (const [pUserId, state] of participants.entries()) {
      if (pUserId !== userId && state.lastSeen > 0 && now - state.lastSeen > 30000) {
        state.lastSeen = 0; // mark offline silently, do not push spam system alerts for auto sweeps
      }
    }

    // Track current user's state
    if (userId) {
      const existing = participants.get(userId) || { lastSeen: 0, lastRead: 0, joinedSent: false, leftSent: false };

      existing.lastSeen = now;
      if (isActiveTab) {
        existing.lastRead = now;
      }

      if (!existing.joinedSent) {
        existing.joinedSent = true;
        existing.leftSent = false;

        const aliasName = userId.substring(2).toUpperCase();
        allMessages.push({
          id: `sys_join_${userId}_${now}`,
          text: `Ref: ${aliasName} has joined the study session`,
          sender: 'system',
          timestamp: now,
          isSystem: true
        });
      }

      participants.set(userId, existing);
    }

    // Clean up expired typers (older than 4 seconds)
    const roomTyping = typingStates.get(code) || {};
    const activeTypers = Object.entries(roomTyping)
      .filter(([_, timestamp]) => now - timestamp < 4000)
      .map(([sender]) => sender);
      
    // Update typingState registry with only active typers
    const cleanedRecord: Record<string, number> = {};
    activeTypers.forEach(sender => {
      cleanedRecord[sender] = roomTyping[sender];
    });
    typingStates.set(code, cleanedRecord);

    // Assemble metadata mapping
    const participantsList: Record<string, { lastSeen: number, lastRead: number }> = {};
    for (const [pUserId, state] of participants.entries()) {
      participantsList[pUserId] = {
        lastSeen: state.lastSeen,
        lastRead: state.lastRead
      };
    }

    if (since > 0) {
      const filtered = allMessages.filter(m => m.timestamp > since);
      res.json({ messages: filtered, isDelta: true, typing: activeTypers, participants: participantsList });
    } else {
      res.json({ messages: allMessages, isDelta: false, typing: activeTypers, participants: participantsList });
    }
  });

  app.post('/api/room/:code/leave', (req, res) => {
    const { code } = req.params;
    const { sender } = req.body;
    if (!rooms.has(code)) {
      rooms.set(code, []);
    }
    const allMessages = rooms.get(code)!;
    const now = Date.now();

    if (roomParticipants.has(code)) {
      const participants = roomParticipants.get(code)!;
      if (participants.has(sender)) {
        const state = participants.get(sender)!;
        if (state.lastSeen > 0) {
          state.lastSeen = 0; // offline
          
          if (!state.leftSent) {
            state.leftSent = true;
            state.joinedSent = false; // Reset so they can rejoin cleanly on next open
            
            const aliasName = sender.substring(2).toUpperCase();
            allMessages.push({
              id: `sys_leave_${sender}_${now}`,
              text: `Ref: ${aliasName} has left the study session`,
              sender: 'system',
              timestamp: now,
              isSystem: true
            });
          }
        }
      }
    }
    res.json({ success: true });
  });

  app.post('/api/room/:code/typing', (req, res) => {
    const { code } = req.params;
    const { sender, isTyping } = req.body;
    
    if (!typingStates.has(code)) {
      typingStates.set(code, {});
    }
    
    const roomTyping = typingStates.get(code)!;
    if (isTyping) {
      roomTyping[sender] = Date.now();
    } else {
      delete roomTyping[sender];
    }
    
    res.json({ success: true });
  });

  app.post('/api/room/:code/message', (req, res) => {
    const { code } = req.params;
    const { text, sender } = req.body;
    
    if (!rooms.has(code)) {
      rooms.set(code, []);
    }
    
    // Clear typing indicator for this user since they've sent a message
    const roomTyping = typingStates.get(code);
    if (roomTyping && roomTyping[sender]) {
      delete roomTyping[sender];
    }

    const now = Date.now();
    
    // Also proactively update reader timestamp for the sender
    if (roomParticipants.has(code)) {
      const participants = roomParticipants.get(code)!;
      if (participants.has(sender)) {
        participants.get(sender)!.lastRead = now;
        participants.get(sender)!.lastSeen = now;
      }
    }

    const msg = {
      id: Math.random().toString(36).substring(2, 10),
      text,
      sender,
      timestamp: now
    };
    
    rooms.get(code)?.push(msg);
    res.json(msg);
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
