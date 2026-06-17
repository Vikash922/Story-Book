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

export function useChatRoom(roomCode: string | null, userId?: string, isChatActive: boolean = false) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [participants, setParticipants] = useState<Record<string, ParticipantState>>({});
  const isPolling = useRef(false);
  
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

    const fetchMessages = async () => {
      if (!isActive) return;
      
      // If page is hidden, pause polling completely to save 100% data
      if (document.hidden) {
        // Retry in 5 seconds (gentle background check, or wait until visibilitychange listener fires)
        scheduleNextPoll(5000);
        return;
      }

      if (isPolling.current) return;
      isPolling.current = true;

      try {
        // Find the maximum timestamp in our local messages to do delta-fetching
        const localMsgs = messagesRef.current;
        const lastTimestamp = localMsgs.length > 0 
          ? Math.max(...localMsgs.map(m => m.timestamp)) 
          : 0;

        const res = await fetch(`/api/room/${roomCode}?since=${lastTimestamp}&user=${userId || ''}&active=${isChatActive}`);
        if (res.ok && isActive) {
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
        console.error('Failed to fetch messages', e);
      } finally {
        isPolling.current = false;
        if (isActive) {
          // Adjust interval based on level of activity
          // 0-4 idle polls: 1.5s
          // 5-10 idle polls: 3s
          // 11+ idle polls: 5s 
          let nextDelay = 1500;
          if (idlePollCount.current > 10) {
            nextDelay = 5000;
          } else if (idlePollCount.current > 4) {
            nextDelay = 3000;
          }
          scheduleNextPoll(nextDelay);
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

  const sendMessage = async (code: string, text: string, sender: string) => {
    try {
      const res = await fetch(`/api/room/${code}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sender })
      });
      if (res.ok) {
        const msg = await res.json();
        // Reset idle count immediately since active chatting is happening
        idlePollCount.current = 0;
        // Optimistically add to local state
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  const sendTypingStatus = async (isTyping: boolean) => {
    if (!roomCode || !userId) return;
    try {
      await fetch(`/api/room/${roomCode}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: userId, isTyping })
      });
    } catch (e) {
      // Fail silently to avoid polluting console with connection/aborted requests
    }
  };

  const createRoom = async () => {
    try {
      const res = await fetch('/api/room', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        return data.code;
      }
    } catch (e) {
      console.error('Failed to create room', e);
    }
    return null;
  };

  return { messages, typingUsers, participants, sendMessage, sendTypingStatus, createRoom };
}
