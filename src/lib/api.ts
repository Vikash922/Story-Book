import { useEffect, useState, useRef } from 'react';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  deleteDoc 
} from 'firebase/firestore';

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

export function getApiUrl(path: string): string {
  const custom = (import.meta as any).env?.VITE_BACKEND_URL;
  if (custom) {
    return `${custom.replace(/\/$/, '')}${path}`;
  }
  
  const origin = window.location.origin;
  const isCloudRun = origin.includes('.run.app');
  const isLocalDev = origin.includes('localhost:3000') || origin.includes('127.0.0.1:3000');
  
  if (isCloudRun || isLocalDev) {
    return path;
  }
  
  return `https://ais-pre-wbcgrvqnhnscn372f2kj2r-501921130895.asia-southeast1.run.app${path}`;
}

export function useChatRoom(roomCode: string | null, userId?: string, isChatActive: boolean = false) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [participants, setParticipants] = useState<Record<string, ParticipantState>>({});

  // Real-time listeners setup
  useEffect(() => {
    if (!roomCode || !userId) {
      setMessages([]);
      setTypingUsers([]);
      setParticipants({});
      return;
    }

    // --- 1. Message listener ---
    const messagesRef = collection(db, 'rooms', roomCode, 'messages');
    const qMessages = query(messagesRef, orderBy('timestamp', 'asc'), limit(150));
    
    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      const msgsList: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgsList.push({
          id: doc.id,
          text: data.text || '',
          sender: data.sender || '',
          timestamp: data.timestamp || Date.now(),
          isSystem: !!data.isSystem
        });
      });
      setMessages(msgsList);
    }, (error) => {
      console.error("Firestore message channel error:", error);
    });

    // --- 2. Typing listener ---
    const typingRef = collection(db, 'rooms', roomCode, 'typing');
    const unsubscribeTyping = onSnapshot(typingRef, (snapshot) => {
      const activeTypers: string[] = [];
      const now = Date.now();
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Clear typers active status older than 10 seconds
        if (doc.id !== userId && data.isTyping && (now - (data.lastActive || 0) < 10000)) {
          activeTypers.push(doc.id);
        }
      });
      setTypingUsers(activeTypers);
    });

    // --- 3. Participants listener & Heartbeat ---
    const participantsRef = collection(db, 'rooms', roomCode, 'participants');
    
    // Heartbeat: update current user's seen status
    const updateHeartbeat = async () => {
      try {
        await setDoc(doc(db, 'rooms', roomCode, 'participants', userId), {
          lastSeen: Date.now(),
          lastRead: Date.now()
        }, { merge: true });
      } catch (err) {
        console.error("Failed to write presence heartbeat:", err);
      }
    };
    
    updateHeartbeat();
    const heartbeatInterval = setInterval(updateHeartbeat, 8000);

    const unsubscribeParticipants = onSnapshot(participantsRef, (snapshot) => {
      const partsMap: Record<string, ParticipantState> = {};
      const now = Date.now();
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only show participants active within the last 30 seconds
        if (now - (data.lastSeen || 0) < 30000) {
          partsMap[doc.id] = {
            lastSeen: data.lastSeen || 0,
            lastRead: data.lastRead || 0
          };
        }
      });
      setParticipants(partsMap);
    });

    // Clean up on unmount or room/user change
    return () => {
      clearInterval(heartbeatInterval);
      unsubscribeMessages();
      unsubscribeTyping();
      unsubscribeParticipants();
      
      // Mark offline and clean up typing on leave
      setDoc(doc(db, 'rooms', roomCode, 'typing', userId), {
        isTyping: false,
        lastActive: 0
      }, { merge: true }).catch(() => {});

      setDoc(doc(db, 'rooms', roomCode, 'participants', userId), {
        lastSeen: 0,
        lastRead: 0
      }, { merge: true }).catch(() => {});
    };
  }, [roomCode, userId]);

  const sendMessage = async (code: string, text: string, sender: string) => {
    if (!code) return;
    try {
      const messagesRef = collection(db, 'rooms', code, 'messages');
      await addDoc(messagesRef, {
        text,
        sender,
        timestamp: Date.now(),
        isSystem: false
      });
    } catch (e) {
      console.error('Failed to send message via Firestore', e);
    }
  };

  const sendTypingStatus = async (isTyping: boolean) => {
    if (!roomCode || !userId) return;
    try {
      const typingDoc = doc(db, 'rooms', roomCode, 'typing', userId);
      await setDoc(typingDoc, {
        isTyping,
        lastActive: Date.now()
      }, { merge: true });
    } catch (e) {
      // Fail silently to prevent console log bloating
    }
  };

  const createRoom = async () => {
    try {
      // Generate unique 6 digit room code
      const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
      const roomRef = doc(db, 'rooms', roomCode);
      await setDoc(roomRef, {
        createdAt: Date.now()
      });
      return roomCode;
    } catch (e) {
      console.error('Failed to create Firebase room', e);
      // Fallback: request from server if API remains available
      try {
        const res = await fetch(getApiUrl('/api/room'), { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          return data.code;
        }
      } catch (err) {
        console.error("Fallback server room creation failed:", err);
      }
    }
    return null;
  };

  return { messages, typingUsers, participants, sendMessage, sendTypingStatus, createRoom };
}
