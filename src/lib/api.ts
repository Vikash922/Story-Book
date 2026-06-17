import { useEffect, useState, useRef } from 'react';

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface ParticipantState {
  lastSeen: number;
  lastRead: number;
}

// Generate room code on client fallback
const generateLocalRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function useChatRoom(roomCode: string | null, userId?: string, isChatActive: boolean = false) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [participants, setParticipants] = useState<Record<string, ParticipantState>>({});
  const isPolling = useRef(false);
  const isFallbackMode = useRef(false);
  
  // Track continuous idle polls to back off frequency
  const idlePollCount = useRef(0);
  // Keep a ref of messages to read current value in polling interval without state dependencies
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  useEffect(() => {
    if (!roomCode) {
      setMessages([]);
      setTypingUsers([]);
      setParticipants({});
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;
    let isActive = true;

    // LocalStorage Fallback Handler
    const handleLocalFetch = () => {
      try {
        const now = Date.now();
        // Load messages
        const msgsStr = localStorage.getItem(`stealth_room_messages_${roomCode}`) || '[]';
        let localMsgs: ChatMessage[] = [];
        try {
          localMsgs = JSON.parse(msgsStr);
        } catch (_) {
          localMsgs = [];
        }

        // Load participants
        const partsStr = localStorage.getItem(`stealth_room_participants_${roomCode}`) || '{}';
        let parts: Record<string, { lastSeen: number, lastRead: number, joinedSent?: boolean, leftSent?: boolean }> = {};
        try {
          parts = JSON.parse(partsStr);
        } catch (_) {
          parts = {};
        }

        let messagesChanged = false;

        // Manage our own participant state
        if (userId) {
          const ourState = parts[userId] || { lastSeen: 0, lastRead: 0, joinedSent: false, leftSent: false };
          
          ourState.lastSeen = now;
          if (isChatActive) {
            ourState.lastRead = now;
          }

          if (!ourState.joinedSent) {
            ourState.joinedSent = true;
            ourState.leftSent = false;

            const aliasName = userId.substring(2).toUpperCase();
            localMsgs.push({
              id: `sys_join_${userId}_${now}`,
              text: `Ref: ${aliasName} has joined the study session`,
              sender: 'system',
              timestamp: now,
              isSystem: true
            });
            messagesChanged = true;
          }

          parts[userId] = ourState;
        }

        // Sweeping stale participants (inactive > 20 seconds)
        for (const [pUserId, state] of Object.entries(parts)) {
          if (pUserId !== userId && state.lastSeen > 0 && now - state.lastSeen > 20000) {
            state.lastSeen = 0; // mark offline

            if (!state.leftSent) {
              state.leftSent = true;
              state.joinedSent = false; // Reset rejoins path

              const aliasName = pUserId.substring(2).toUpperCase();
              localMsgs.push({
                id: `sys_leave_auto_${pUserId}_${now}`,
                text: `Ref: ${aliasName} has left the study session`,
                sender: 'system',
                timestamp: now,
                isSystem: true
              });
              messagesChanged = true;
            }
          }
        }

        // Save back updates if system alerts were appended
        if (messagesChanged) {
          localStorage.setItem(`stealth_room_messages_${roomCode}`, JSON.stringify(localMsgs));
        }
        localStorage.setItem(`stealth_room_participants_${roomCode}`, JSON.stringify(parts));

        // Load active typing states
        const typingStr = localStorage.getItem(`stealth_room_typing_${roomCode}`) || '{}';
        let typingMap: Record<string, number> = {};
        try {
          typingMap = JSON.parse(typingStr);
        } catch (_) {
          typingMap = {};
        }
        const typingList: string[] = [];

        for (const [typerId, typingTime] of Object.entries(typingMap)) {
          if (typerId !== userId && now - typingTime < 4000) {
            typingList.push(typerId);
          }
        }

        if (isActive) {
          setMessages(localMsgs);
          setTypingUsers(typingList);
          setParticipants(parts as Record<string, ParticipantState>);
        }

      } catch (err) {
        console.error('Error handling local fallback state', err);
      } finally {
        isPolling.current = false;
        if (isActive) {
          scheduleNextPoll(1500); // stable local fallback polling rate
        }
      }
    };

    const fetchMessages = async () => {
      if (!isActive) return;
      
      // If page is hidden, pause polling completely to save resources
      if (document.hidden) {
        scheduleNextPoll(5000);
        return;
      }

      if (isPolling.current) return;
      isPolling.current = true;

      if (isFallbackMode.current) {
        handleLocalFetch();
        return;
      }

      try {
        // Find the maximum timestamp in our local messages to do delta-fetching
        const localMsgs = messagesRef.current;
        const lastTimestamp = localMsgs.length > 0 
          ? Math.max(...localMsgs.map(m => m.timestamp)) 
          : 0;

        const res = await fetch(`/api/room/${roomCode}?since=${lastTimestamp}&user=${userId || ''}&active=${isChatActive}`);
        if (!res.ok) {
          console.warn('Server API returned non-OK status, switching to local storage fallback mode');
          isFallbackMode.current = true;
          isPolling.current = false;
          handleLocalFetch();
          return;
        }

        if (isActive) {
          const data = await res.json();
          const newMsgs: ChatMessage[] = data.messages || [];
          const allTypers: string[] = data.typing || [];
          const partMap: Record<string, ParticipantState> = data.participants || {};

          setParticipants(partMap);

          // Keep typing users other than ourselves
          const activeTypers = allTypers.filter(uid => uid !== userId);
          setTypingUsers(activeTypers);

          if (newMsgs.length > 0) {
            // New messages arrived! Append them and reset idle back-off
            setMessages(prev => {
              // Ensure we don't add duplicate IDs
              const existingIds = new Set(prev.map(m => m.id));
              const filteredNew = newMsgs.filter(m => !existingIds.has(m.id));
              if (filteredNew.length === 0) return prev;
              return [...prev, ...filteredNew];
            });
            idlePollCount.current = 0;
          } else {
            // No new messages. Increment idle count to slow down requests
            idlePollCount.current += 1;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch from server, adopting local storage fallback mode', e);
        isFallbackMode.current = true;
        isPolling.current = false;
        handleLocalFetch();
        return;
      } finally {
        if (!isFallbackMode.current) {
          isPolling.current = false;
          if (isActive) {
            // Adjust interval list
            let nextDelay = 1500;
            if (idlePollCount.current > 10) {
              nextDelay = 5000;
            } else if (idlePollCount.current > 4) {
              nextDelay = 3000;
            }
            scheduleNextPoll(nextDelay);
          }
        }
      }
    };

    const scheduleNextPoll = (delay: number) => {
      if (timeoutId) clearTimeout(timeoutId);
      if (isActive) {
        timeoutId = setTimeout(fetchMessages, delay);
      }
    };

    // Listen to focus and visibility changes to immediately fetch
    const handleVisibilityOrFocus = () => {
      if (!document.hidden) {
        idlePollCount.current = 0; // reset backoff
        fetchMessages();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    // Initial fetch
    fetchMessages();

    return () => {
      isActive = false;
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [roomCode, userId, isChatActive]);

  // Sync helper for writing fallback messages safely
  const reTriggerLocalWrite = (code: string, text: string, sender: string) => {
    try {
      const parentMsgs = localStorage.getItem(`stealth_room_messages_${code}`) || '[]';
      let decodedMsgs: ChatMessage[] = [];
      try {
        decodedMsgs = JSON.parse(parentMsgs);
      } catch (_) {
        decodedMsgs = [];
      }
      const hasMatch = decodedMsgs.some(m => m.text === text && m.sender === sender && Date.now() - m.timestamp < 3000);
      if (!hasMatch) {
        const newMsg: ChatMessage = {
          id: `msg_local_${sender}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          text,
          sender,
          timestamp: Date.now()
        };
        decodedMsgs.push(newMsg);
        localStorage.setItem(`stealth_room_messages_${code}`, JSON.stringify(decodedMsgs));
        setMessages(decodedMsgs);
      }
    } catch (err) {
      console.error('Error in fallback sync writing', err);
    }
  };

  const sendMessage = async (code: string, text: string, sender: string) => {
    // Keep local replication updated immediately
    try {
      const parentMsgs = localStorage.getItem(`stealth_room_messages_${code}`) || '[]';
      let decodedMsgs: ChatMessage[] = [];
      try {
        decodedMsgs = JSON.parse(parentMsgs);
      } catch (_) {
        decodedMsgs = [];
      }
      const newMsg: ChatMessage = {
        id: `msg_local_${sender}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        text,
        sender,
        timestamp: Date.now()
      };
      
      if (isFallbackMode.current) {
        decodedMsgs.push(newMsg);
        localStorage.setItem(`stealth_room_messages_${code}`, JSON.stringify(decodedMsgs));
        setMessages(decodedMsgs);
        idlePollCount.current = 0;
        return;
      }
    } catch (err) {
      console.warn('Failed writing local redundant copy', err);
    }

    try {
      const res = await fetch(`/api/room/${code}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sender })
      });
      if (res.ok) {
        const msg = await res.json();
        idlePollCount.current = 0;
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } else {
        isFallbackMode.current = true;
        reTriggerLocalWrite(code, text, sender);
      }
    } catch (e) {
      console.warn('Failed to send message to server, switching to local fallback mode', e);
      isFallbackMode.current = true;
      reTriggerLocalWrite(code, text, sender);
    }
  };

  const sendTypingStatus = async (isTyping: boolean) => {
    if (!roomCode || !userId) return;

    // Write client fallback typing info
    try {
      const typingStr = localStorage.getItem(`stealth_room_typing_${roomCode}`) || '{}';
      let typingMap: Record<string, number> = {};
      try {
        typingMap = JSON.parse(typingStr);
      } catch (_) {
        typingMap = {};
      }
      if (isTyping) {
        typingMap[userId] = Date.now();
      } else {
        delete typingMap[userId];
      }
      localStorage.setItem(`stealth_room_typing_${roomCode}`, JSON.stringify(typingMap));
    } catch (err) {
      console.warn('Failed writing local redundant typing metadata', err);
    }

    if (isFallbackMode.current) return;

    try {
      await fetch(`/api/room/${roomCode}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: userId, isTyping })
      });
    } catch (e) {
      // Fail silently to prevent console pollution
    }
  };

  const createRoom = async () => {
    try {
      const res = await fetch('/api/room', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return data.code as string;
      }
    } catch (e) {
      console.warn('Failed to connect to backend api to create room, adopting local fallback', e);
    }

    // Fallback room creation
    const localCode = generateLocalRoomCode();
    try {
      localStorage.setItem(`stealth_room_messages_${localCode}`, JSON.stringify([]));
      localStorage.setItem(`stealth_room_typing_${localCode}`, JSON.stringify({}));
      localStorage.setItem(`stealth_room_participants_${localCode}`, JSON.stringify({}));
    } catch (err) {
      console.error('Failed writing fallback parameters to localStorage', err);
    }
    return localCode;
  };

  return { messages, typingUsers, participants, sendMessage, sendTypingStatus, createRoom };
}
