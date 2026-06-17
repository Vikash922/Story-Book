import { Share, Link, BookMarked, ChevronLeft, Library as LibraryIcon, WifiOff, Moon, Sun, Smile, ShoppingBag } from 'lucide-react';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { useChatRoom, getApiUrl } from '../lib/api';
import { useShake, requestShakePermission } from '../lib/useShake';
import { library, Book } from '../data/books';
import MeeshoView from './MeeshoView';

const EMOJIS = ['🚀', '❤️', '😂', '🔥', '🎉', '👀', '👍', '💯', '💀', '✨', '🥺', '🙏', '⚡', '☕', '🌟', '🍕', '🐱', '🎮', '🌈', '💡', '🔔', '🎈', '🍀', '🌸', '🌮', '🍭', '🧁', '🍦', '🍔', '🍟', '🍩', '🍪', '🍿', '🎸', '🎨', '✈️', '🏝️', '🔮', '🧸', '💝'];

const EMOJI_STICKERS = [
  { id: 'glass-heart', emoji: '💖', name: 'Glow Heart', style: 'bg-gradient-to-br from-pink-500 to-rose-500 border-pink-400 text-white shadow-lg border rounded-2xl p-3' },
  { id: 'gold-star', emoji: '⭐', name: 'Golden Champ', style: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 border-yellow-300 text-amber-950 shadow-lg border rounded-full p-3' },
  { id: 'ghost-boo', emoji: '👻', name: 'Scary Boo', style: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow border rounded-xl p-3' },
  { id: 'cool-sun', emoji: '😎', name: 'Cool Shade', style: 'bg-gradient-to-br from-yellow-300 to-orange-500 border-yellow-400 text-white shadow-lg border rounded-full p-3' },
  { id: 'crying-loud', emoji: '😭', name: 'Sad Tear', style: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow border rounded-2xl p-3' },
  { id: 'explosion-pow', emoji: '💥', name: 'Pow Boom', style: 'bg-gradient-to-br from-orange-600 to-red-600 border-red-500 text-white shadow-lg border rounded-3xl p-3' },
];

const ANIMATED_STICKERS = [
  { id: 'bounce-heart', emoji: '❤️', name: 'Hop Heart', animation: 'animate-sticker-bounce text-red-500 text-5xl filter drop-shadow-[0_4px_10px_rgba(239,68,68,0.5)]' },
  { id: 'wiggle-hand', emoji: '👋', name: 'Wiggle Hand', animation: 'animate-sticker-wiggle text-amber-500 text-5xl filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)]' },
  { id: 'spin-star', emoji: '⭐', name: '3D Gold Star', animation: 'animate-sticker-spin-3d text-yellow-400 text-5xl filter drop-shadow-[0_4px_10px_rgba(250,204,21,0.5)]' },
  { id: 'pulsing-fire', emoji: '🔥', name: 'Inferno Flame', animation: 'animate-sticker-pulse text-orange-500 text-5xl filter drop-shadow-[0_4px_10px_rgba(249,115,22,0.5)]' },
  { id: 'float-rocket', emoji: '🚀', name: 'Cosmic Rocket', animation: 'animate-sticker-float text-indigo-400 text-5xl filter drop-shadow-[0_4px_10px_rgba(129,140,248,0.5)]' },
  { id: 'bouncing-cat', emoji: '🐱', name: 'Happy Kitty', animation: 'animate-sticker-bounce text-orange-400 text-5xl filter drop-shadow-[0_4px_10px_rgba(251,146,60,0.5)]' },
  { id: 'spinning-globe', emoji: '🌍', name: 'Rotating World', animation: 'animate-sticker-spin-3d text-blue-400 text-5xl filter drop-shadow-[0_4px_10px_rgba(96,165,250,0.5)]' },
  { id: 'ghost-float', emoji: '👻', name: 'Spooky Ghost', animation: 'animate-sticker-float text-slate-400 text-5xl filter drop-shadow-[0_4px_10px_rgba(148,163,184,0.5)]' },
];

export default function DisguisedApp() {
  const [mode, setMode] = useState<'reader' | 'chat' | 'shopping'>('reader');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [userId] = useState(() => `u_${Math.random().toString(36).substring(2, 6)}`);
  
  // Connect to API, passing mode === 'chat' as isActive to enable read status triggers
  const { messages, typingUsers, participants, sendMessage, sendTypingStatus, createRoom } = useChatRoom(roomCode, userId, mode === 'chat');
  
  // Tick calculation logic mimicking WhatsApp
  const getMessageTickStatus = (msg: any) => {
    if (msg.isSystem || msg.sender !== userId) return null;
    
    const otherParticipantId = Object.keys(participants || {}).find(uid => uid !== userId);
    if (!otherParticipantId) return 'single';

    const other = (participants || {})[otherParticipantId];
    if (!other) return 'single';

    const isRead = other.lastRead >= msg.timestamp;
    if (isRead) return 'blue';

    const isOnline = other.lastSeen > 0 && (Date.now() - other.lastSeen < 12000);
    if (isOnline) return 'double';

    return 'single';
  };

  const renderTicks = (msg: any) => {
    const tickStatus = getMessageTickStatus(msg);
    if (!tickStatus) return null;

    if (tickStatus === 'blue') {
      return (
        <span className="text-[11px] font-bold text-[#34B7F1] leading-none tracking-tighter" title="Read">
          ✓✓
        </span>
      );
    }
    if (tickStatus === 'double') {
      return (
        <span className={`text-[11px] font-bold leading-none tracking-tighter ${isDarkMode ? 'text-[#888888]' : 'text-[#7A786E]'}`} title="Delivered">
          ✓✓
        </span>
      );
    }
    return (
      <span className={`text-[11.5px] font-bold leading-none ${isDarkMode ? 'text-[#666666]' : 'text-[#9A988E]'}`} title="Sent">
        ✓
      </span>
    );
  };

  // Local typing tracking
  const [isLocalTyping, setIsLocalTyping] = useState(false);
  const localTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (localTypingTimeoutRef.current) {
        clearTimeout(localTypingTimeoutRef.current);
      }
    };
  }, []);
  
  // Chat inputs
  const [newMessage, setNewMessage] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'offline' | 'synced'>('syncing');
  const [lastReadCount, setLastReadCount] = useState(0);
  const [shakeSensitivity, setShakeSensitivity] = useState(20);
  const [showSensitivitySetting, setShowSensitivitySetting] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book>(library.find(b => b.id === 'b9') || library[0]);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [bookmarkTaps, setBookmarkTaps] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activePickerTab, setActivePickerTab] = useState<'emoji' | 'sticker' | 'animated'>('emoji');

  useEffect(() => {
    if (mode !== 'reader') return;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height > 0) {
        setScrollProgress((scrollY / height) * 100);
      } else {
        setScrollProgress(0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode, currentBook]);

  useEffect(() => {
    if (bookmarkTaps === 3) {
      setShowJoinPrompt(prev => !prev);
      setBookmarkTaps(0);
    } else if (bookmarkTaps > 0) {
      const timer = setTimeout(() => setBookmarkTaps(0), 1000);
      return () => clearTimeout(timer);
    }
  }, [bookmarkTaps]);

  useEffect(() => {
    if (!showJoinPrompt) return;
    const hidePrompt = () => setShowJoinPrompt(false);
    window.addEventListener('scroll', hidePrompt, { passive: true });
    window.addEventListener('wheel', hidePrompt, { passive: true });
    window.addEventListener('touchmove', hidePrompt, { passive: true });
    return () => {
      window.removeEventListener('scroll', hidePrompt);
      window.removeEventListener('wheel', hidePrompt);
      window.removeEventListener('touchmove', hidePrompt);
    };
  }, [showJoinPrompt]);

  useEffect(() => {
    if (mode === 'chat') {
      setLastReadCount(messages.length);
    }
  }, [mode, messages.length]);

  const hasUnread = mode === 'reader' && messages.length > lastReadCount;

  useEffect(() => {
    if (mode === 'reader') {
      setSyncStatus('syncing');
      const timer1 = setTimeout(() => setSyncStatus('synced'), 1500);
      const timer2 = setTimeout(() => setSyncStatus('offline'), 5000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [mode]);

  // Auto-scroll chat to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (mode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, typingUsers, mode]);

  // PANIC TRIGGER: Shake Detection
  useShake(() => {
    if (mode === 'chat') {
      panicMode();
    }
  }, shakeSensitivity);

  const panicMode = () => {
    // Instant switch to reader, no animations.
    setMode('reader');
  };

  useEffect(() => {
    if (mode !== 'chat') return;

    // 1. Tab Focus / Window Blur / Visibility Loss
    const handleFocusLoss = () => {
      panicMode();
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        panicMode();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        panicMode();
      }
    };

    // 2. Escape Key (Desktop keyboard)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        panicMode();
      }
    };

    // 3. Android/Mobile Gestures: Two-finger simultaneous tap
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        panicMode();
      }
    };

    // 4. Android/Mobile/Desktop: Triple Tap anywhere on screen within 500ms
    let lastTapTime = 0;
    let tapCount = 0;
    const handleUniversalTap = () => {
      const now = Date.now();
      if (now - lastTapTime < 500) {
        tapCount++;
        if (tapCount >= 3) {
          panicMode();
          tapCount = 0;
        }
      } else {
        tapCount = 1;
      }
      lastTapTime = now;
    };

    window.addEventListener('blur', handleFocusLoss);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('click', handleUniversalTap);

    return () => {
      window.removeEventListener('blur', handleFocusLoss);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('click', handleUniversalTap);
    };
  }, [mode]);

  const handleStartChat = async () => {
    await requestShakePermission();
    // Generate a random 6-digit room code instantly on the client
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRoomCode(code);
    setMode('chat');
    setShowJoinPrompt(false);
    
    // Create the room in Firestore/backend silently in the background
    createRoom().catch(() => {});
  };

  const handleJoinChat = async () => {
    if (joinCode.length !== 6) return;
    await requestShakePermission();
    // Instantly transition to the chat room. Firebase listener will connect and sync messages in the background
    const targetCode = joinCode.toUpperCase();
    setRoomCode(targetCode);
    setMode('chat');
    setShowJoinPrompt(false);
  };

  const copyToClipboard = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (e) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = roomCode;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomCode) return;
    sendMessage(roomCode, newMessage, userId);
    setNewMessage('');
    
    // Reset typing state immediately
    if (localTypingTimeoutRef.current) {
      clearTimeout(localTypingTimeoutRef.current);
    }
    setIsLocalTyping(false);
    sendTypingStatus(false);
  };

  const handleInputChange = (val: string) => {
    setNewMessage(val);
    if (!roomCode) return;

    if (!isLocalTyping) {
      setIsLocalTyping(true);
      sendTypingStatus(true);
    }

    if (localTypingTimeoutRef.current) {
      clearTimeout(localTypingTimeoutRef.current);
    }

    localTypingTimeoutRef.current = setTimeout(() => {
      setIsLocalTyping(false);
      sendTypingStatus(false);
    }, 2500);
  };

  const sendWaitMessage = () => {
    if (roomCode) {
      sendMessage(roomCode, "⚠️ Paused reading... (Wait, someone is here!)", userId);
      const prev = syncStatus;
      setSyncStatus('offline');
      setTimeout(() => setSyncStatus(prev), 1500);
    }
  };

  const libModal = showLibraryModal && (
    <div className={`fixed inset-0 z-[9999] p-6 lg:p-20 flex flex-col justify-center items-center ${isDarkMode ? 'bg-[#2C2C2C]/95' : 'bg-[#E8E7DF]/95'}`}>
      <div className={`max-w-3xl w-full border rounded shadow-2xl p-6 relative h-[80vh] flex flex-col ${isDarkMode ? 'bg-[#222222] border-[#333333]' : 'bg-white border-[#D1CEC0]'}`}>
         <div className={`flex items-center justify-between mb-6 border-b pb-4 shrink-0 ${isDarkMode ? 'border-[#333333]' : 'border-[#D1CEC0]'}`}>
           <h2 className={`text-sm font-bold font-sans uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-[#EAEAEA]' : 'text-[#1A1A1A]'}`}>
             <LibraryIcon size={16} /> Academic Repository
           </h2>
           <button onClick={() => setShowLibraryModal(false)} className={`font-sans text-xs uppercase tracking-widest border px-3 py-1 rounded transition-colors ${isDarkMode ? 'text-[#888888] hover:text-[#EAEAEA] border-[#333333]' : 'text-[#7A786E] hover:text-[#1A1A1A] border-[#D1CEC0]'}`}>Close</button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1 pr-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            {library.map((book) => (
               <div key={book.id} onClick={() => { setCurrentBook(book); setShowLibraryModal(false); }} className={`p-4 border rounded cursor-pointer transition-colors ${currentBook.id === book.id ? (isDarkMode ? 'border-[#C5B37D] bg-[#111111]' : 'border-[#B59F5B] bg-[#FDFCF0]') : (isDarkMode ? 'border-[#333333] hover:border-[#EAEAEA] bg-[#222222]' : 'border-[#D1CEC0] hover:border-[#1A1A1A] bg-white')}`}>
                 <p className={`text-[10px] font-mono mb-2 truncate uppercase tracking-tighter ${isDarkMode ? 'text-[#888888]' : 'text-[#7A786E]'}`} title={book.filename}>{book.filename}</p>
                 <h3 className={`font-bold mb-1 line-clamp-2 ${isDarkMode ? 'text-[#EAEAEA]' : 'text-[#1A1A1A]'}`}>{book.title}</h3>
                 <p className={`text-xs font-sans mb-3 ${isDarkMode ? 'text-[#A0A0A0]' : 'text-[#5C5A52]'}`}>{book.author}</p>
                 <div className={`flex gap-2 text-[10px] uppercase font-sans font-bold ${isDarkMode ? 'text-[#777777]' : 'text-[#AAA8A0]'}`}>
                   <span className={`px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-[#F5F2E6]'}`}>PDF</span>
                   <span className={`px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-[#F5F2E6]'}`}>{(book.content.join('').length / 1024).toFixed(1)} KB</span>
                 </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );

  if (mode === 'reader' || mode === 'shopping') {
    return (
      <div 
        className={`${isDarkMode ? 'dark' : ''} min-h-screen ${isDarkMode ? 'bg-[#111111] text-[#EAEAEA]' : 'bg-[#FDFCF0] text-[#1A1A1A]'} font-serif relative pb-8 selection:bg-[#E8E6DD] dark:selection:bg-[#444444]`}
        style={{ transition: 'none !important' }} 
      >
        <div className={mode === 'reader' ? 'block' : 'hidden'}>
          <div className={`sticky top-0 z-30 ${isDarkMode ? 'bg-[#111111]/95 border-[#222222]' : 'bg-[#FDFCF0]/95 border-[#E8E6DD]'} backdrop-blur-md border-b`}>
            <header className="max-w-3xl mx-auto px-6 py-4 md:py-6 flex justify-between items-start">
              <div 
                className="flex-1 cursor-pointer group" 
                onClick={() => setShowLibraryModal(true)}
                onDoubleClick={(e) => { e.stopPropagation(); setMode('shopping'); }}
                title="Double tap for formatting options"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-sans font-bold tracking-widest uppercase px-2 py-0.5 border rounded transition-colors ${isDarkMode ? 'text-[#C5B37D] border-[#444444] group-hover:bg-[#1A1A1A]' : 'text-[#B59F5B] border-[#C5C2B5] group-hover:bg-[#F5F2E6]'}`}>Select Volume</span>
                </div>
                <h1 className={`text-base md:text-2xl font-semibold mb-1 tracking-tight leading-snug ${isDarkMode ? 'text-[#EAEAEA]' : 'text-[#1A1A1A]'}`}>
                  {currentBook.title}
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-[#888888]' : 'text-[#7A786E]'}`}>By {currentBook.author}</p>
              </div>
              
              <div className="relative pl-2 md:pl-6 flex flex-col items-end gap-1.5 md:gap-2 shrink-0">
              <div 
                onClick={(e) => { e.stopPropagation(); setMode('shopping'); }}
                className={`flex items-center justify-end gap-2 text-[9px] md:text-[10px] w-auto font-sans uppercase tracking-tighter shrink-0 cursor-pointer select-none hover:opacity-80 transition-opacity ${isDarkMode ? 'text-[#888888]' : 'text-[#7A786E]'}`}
                title="Quick Diagnostics Toggle"
              >
                <span className="hidden sm:inline">{hasUnread ? 'Index Updating...' : syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'synced' ? 'Synced' : 'Offline Mode'}</span>
                <span className="inline sm:hidden">{hasUnread ? 'Sync' : syncStatus === 'syncing' ? 'Sync' : syncStatus === 'synced' ? 'Live' : 'Offline'}</span>
                <div className={`w-2 h-2 rounded-full shrink-0 ${hasUnread ? 'bg-amber-600 animate-pulse' : syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : syncStatus === 'synced' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>
              <div className="flex gap-1 items-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsDarkMode(!isDarkMode); }}
                  className={`p-2 transition-colors focus:outline-none flex items-center justify-center shrink-0 ${isDarkMode ? 'text-[#888888] hover:text-[#EAEAEA]' : 'text-[#7A786E] hover:text-[#1A1A1A]'}`}
                  aria-label="Toggle Theme"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                {roomCode && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); sendWaitMessage(); }}
                    className={`p-2 transition-colors focus:outline-none flex items-center justify-center shrink-0 ${isDarkMode ? 'text-[#888888] hover:text-[#EAEAEA]' : 'text-[#7A786E] hover:text-[#1A1A1A]'}`}
                    aria-label="Pause Reader"
                  >
                    <WifiOff size={20} />
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setBookmarkTaps(prev => prev + 1); }}
                  className={`p-2 transition-colors focus:outline-none flex items-center justify-center shrink-0 touch-manipulation select-none ${isDarkMode ? 'text-[#888888] hover:text-[#EAEAEA]' : 'text-[#7A786E] hover:text-[#1A1A1A]'}`}
                  aria-label="Annotations"
                >
                  <BookMarked size={20} />
                </button>
                
                {/* Subtle invisible separator bullet dot that toggles Meesho shop */}
                <span 
                  onClick={(e) => { e.stopPropagation(); setMode('shopping'); }}
                  className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-800 opacity-20 hover:opacity-100 transition-opacity cursor-pointer select-none ml-1.5"
                  title="Format Checker"
                />
              </div>

            {/* Secret Join Menu */}
            {showJoinPrompt && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowJoinPrompt(false)} onTouchStart={() => setShowJoinPrompt(false)} />
                <div className={`absolute right-0 top-12 shadow-xl border rounded p-4 w-64 z-50 font-sans ${isDarkMode ? 'bg-[#222222] border-[#333333]' : 'bg-white border-[#D1CEC0]'}`}>
                  <p className={`text-xs font-bold font-sans uppercase mb-4 tracking-widest ${isDarkMode ? 'text-[#A0A0A0]' : 'text-[#5C5A52]'}`}>Annotation Sync</p>
                <div className="space-y-3">
                  <button 
                    onClick={handleStartChat}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded text-[11px] font-bold tracking-widest transition-opacity ${isDarkMode ? 'bg-[#EAEAEA] text-[#111111] hover:bg-[#C0C0C0]' : 'bg-[#1A1A1A] text-white hover:bg-[#2C2B26]'}`}
                  >
                    <Share size={14} /> 
                    NEW SESSION
                  </button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className={`w-full border-t ${isDarkMode ? 'border-[#333333]' : 'border-[#D1CEC0]'}`}></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                      <span className={`px-2 ${isDarkMode ? 'bg-[#222222] text-[#888888]' : 'bg-white text-[#7A786E]'}`}>or</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="ENTER CODE" 
                      className={`w-full border rounded px-3 py-1.5 text-xs uppercase focus:outline-none ${isDarkMode ? 'border-[#333333] bg-[#111111] text-[#EAEAEA] focus:border-[#C5B37D]' : 'border-[#D1CEC0] bg-white text-[#1A1A1A] focus:border-[#B59F5B]'}`}
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                    <button 
                      onClick={handleJoinChat}
                      disabled={joinCode.length !== 6}
                      className={`border px-3 py-1.5 rounded transition-opacity ${joinCode.length !== 6 ? 'opacity-40 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-[#1A1A1A] border-[#333333] text-[#EAEAEA] hover:bg-[#2C2C2C]' : 'bg-[#F5F2E6] border-[#D1CEC0] text-[#1A1A1A] hover:bg-[#E8E6DD]'}`}
                    >
                      <Link size={14} />
                    </button>
                  </div>

                  {roomCode && (
                    <button 
                      onClick={() => setMode('chat')}
                      className={`w-full text-center text-[11px] mt-2 font-bold hover:underline ${isDarkMode ? 'text-[#C5B37D]' : 'text-[#B59F5B]'}`}
                    >
                      RESUME ACTIVE SESSION
                    </button>
                  )}
                </div>
              </div>
              </>
            )}
          </div>
          </header>
        </div>

        <main className={`max-w-3xl mx-auto px-6 pb-24 text-[20px] md:text-[22px] leading-[1.8] space-y-8 ${isDarkMode ? 'text-[#D1D1D1]' : 'text-[#2C2B26]'}`}>
          {currentBook.content.map((paragraph, idx) => (
            <p key={idx}>
              {paragraph}
              {idx === 0 && hasUnread && <sup className={`font-sans ml-0.5 cursor-help ${isDarkMode ? 'text-[#909090]' : 'text-[#8C8A80]'}`} title="Citation requested">[+]</sup>}
            </p>
          ))}
        </main>
        {libModal}
        <div className="fixed bottom-0 left-0 h-[2px] bg-transparent w-full z-30">
          <div 
            className={`h-full ${isDarkMode ? 'bg-[#666666]' : 'bg-[#A5A295]'}`} 
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Meesho is preloaded and always mounted to ensure zero latency transition */}
      <div className={mode === 'shopping' ? 'block' : 'hidden'}>
        <MeeshoView onClose={() => setMode('reader')} isDarkMode={isDarkMode} />
      </div>
    </div>
    );
  }

  const renderMessageContent = (text: string) => {
    if (text.startsWith('[sticker:') && text.endsWith(']')) {
      const stickerId = text.substring(9, text.length - 1);
      
      const animSticker = ANIMATED_STICKERS.find(s => s.id === stickerId);
      if (animSticker) {
        return (
          <div className="flex justify-start my-3 select-none cursor-default">
            <span className={`${animSticker.animation} leading-none block font-sans`} title={animSticker.name}>
              {animSticker.emoji}
            </span>
          </div>
        );
      }
      
      const styleSticker = EMOJI_STICKERS.find(s => s.id === stickerId);
      if (styleSticker) {
        return (
          <div className="flex justify-start my-3 select-none cursor-default">
            <div className={`${styleSticker.style} flex flex-col items-center justify-center min-w-[90px] aspect-square transition-all hover:scale-110 duration-200 border`}>
              <span className="text-4xl leading-none font-sans">{styleSticker.emoji}</span>
              <span className="text-[8.5px] font-sans uppercase tracking-wider font-extrabold mt-2 opacity-85 block truncate text-center w-full">{styleSticker.name}</span>
            </div>
          </div>
        );
      }
    }
    
    return text;
  };

  // --- DISGUISED CHAT MODE ---
  // The layout follows the High Density design template.
  return (
    <div 
      className={`${isDarkMode ? 'dark' : ''} h-[100dvh] font-sans flex flex-col overflow-hidden select-none will-change-transform cursor-pointer ${isDarkMode ? 'bg-[#111111] text-[#EAEAEA]' : 'bg-[#FDFCF0] text-[#1A1A1A]'}`} 
      style={{ transition: 'none !important' }} // ZERO delay swap
      onClick={panicMode}
    >
      {/* DISGUISED HEADER BAR */}
      <header 
        className={`h-12 border-b flex items-center justify-between px-4 md:px-6 shrink-0 cursor-default ${isDarkMode ? 'bg-[#1A1A1A] border-[#333333]' : 'bg-[#F5F2E6] border-[#D1CEC0]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setShowLibraryModal(true)} title="Switch Book">
          <div className="w-3 h-3 rounded-full bg-red-400 opacity-20 group-hover:opacity-60 transition-opacity"></div>
          <span className={`text-xs font-sans font-bold tracking-widest uppercase hidden sm:block transition-colors ${isDarkMode ? 'text-[#A0A0A0] group-hover:text-[#EAEAEA]' : 'text-[#5C5A52] group-hover:text-[#1A1A1A]'}`}>{currentBook.filename}</span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className={`hidden md:flex items-center gap-2 text-[10px] font-sans uppercase tracking-tighter ${isDarkMode ? 'text-[#888888]' : 'text-[#7A786E]'}`}>
            <span>Auto-Sync: Enabled</span>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          <button 
            onClick={copyToClipboard}
            className={`flex items-center gap-2 px-3 py-1 border text-[11px] font-sans font-bold rounded hover:opacity-80 transition-opacity ${isDarkMode ? 'bg-[#222222] border-[#444444]' : 'bg-white border-[#C5C2B5] hover:bg-[#FDFCF0]'}`}
          >
            <span className={isDarkMode ? 'text-[#C5B37D]' : 'text-[#B59F5B]'}>{roomCode}</span>
            {copyFeedback ? <span className="text-green-600">Copied</span> : 'Copy'}
          </button>
          <button 
            onClick={panicMode}
            className={`px-3 py-1 text-[11px] font-sans rounded hover:opacity-80 transition-none cursor-pointer ${isDarkMode ? 'bg-[#EAEAEA] text-[#111111]' : 'bg-[#1A1A1A] text-white'}`}
            style={{ transition: 'none !important' }} 
          >
            Close Reader (ESC)
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" onClick={panicMode}>
        {/* DISGUISED SIDEBAR (Navigation/TOC) */}
        <aside 
          className={`hidden lg:flex w-64 border-r flex-col p-4 shrink-0 cursor-default ${isDarkMode ? 'bg-[#151515] border-[#333333]' : 'bg-[#FAF8F2] border-[#D1CEC0]'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-8">
            <h3 className={`text-xs font-bold font-sans uppercase mb-4 tracking-widest ${isDarkMode ? 'text-[#A0A0A0]' : 'text-[#5C5A52]'}`}>Table of Contents</h3>
            <ul className={`space-y-3 text-[13px] ${isDarkMode ? 'text-[#BBBBBB]' : 'text-[#4A4840]'}`}>
              <li className="flex justify-between items-center opacity-60"><span>I. Abstract</span><span className="text-[10px]">01</span></li>
              <li className="flex justify-between items-center font-bold border-l-2 border-amber-900 pl-2"><span>II. Methodology</span><span className="text-[10px]">14</span></li>
              <li className="flex justify-between items-center opacity-60"><span>III. Statistical Analysis</span><span className="text-[10px]">42</span></li>
              <li className="flex justify-between items-center opacity-60"><span>IV. Conclusion</span><span className="text-[10px]">89</span></li>
            </ul>
          </div>

          <div className={`mt-auto border-t pt-4 ${isDarkMode ? 'border-[#333333]' : 'border-[#D1CEC0]'}`}>
            <h3 className={`text-xs font-bold font-sans uppercase mb-3 tracking-widest ${isDarkMode ? 'text-[#A0A0A0]' : 'text-[#5C5A52]'}`}>Annotations</h3>
            <div className={`p-3 border rounded shadow-sm cursor-pointer group ${isDarkMode ? 'bg-[#222222] border-[#333333]' : 'bg-white border-[#D1CEC0]'}`}>
              <p className={`text-[11px] leading-tight ${isDarkMode ? 'text-[#A0A0A0] group-hover:text-white' : 'text-[#6B685E] group-hover:text-black'}`}>"Share study session with colleagues via token..."</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[10px] font-mono font-bold tracking-widest ${isDarkMode ? 'text-[#C5B37D]' : 'text-[#B59F5B]'}`}>{roomCode}</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] ${isDarkMode ? 'border-[#333333] text-[#888888]' : 'border-[#D1CEC0] text-[#7A786E]'}`}>📋</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN READER / CHAT AREA */}
        <main className="flex-1 flex flex-col relative min-w-0">
          <div 
            className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8 max-w-2xl mx-auto w-full"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* SYSTEM DISGUISE ELEMENT */}
            <div className={`py-4 border-y border-dashed opacity-40 mb-8 ${isDarkMode ? 'border-[#444444]' : 'border-[#E8E6DD]'}`}>
              <p className={`text-[12px] text-center ${isDarkMode ? 'text-[#888888]' : 'text-[#7A786E]'}`}>Page 14 of 212 — Section II: Empirical Data Collection</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {messages.map((msg) => {
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center w-full my-1.5 select-none pointer-events-none">
                      <span className={`text-[9.5px] font-mono tracking-wider uppercase opacity-35 px-2 py-0.5 ${
                        isDarkMode 
                          ? 'text-[#888888]' 
                          : 'text-[#7A786E]'
                      }`}>
                        ◇ {msg.text} ◇
                      </span>
                    </div>
                  );
                }

                const isMe = msg.sender === userId;
                const aliasName = msg.sender.substring(2).toUpperCase();
                
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} w-full`}>
                    <div className={`flex items-center gap-1.5 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-[10px] font-sans font-bold uppercase tracking-widest ${isMe ? (isDarkMode ? 'text-[#C5B37D]' : 'text-[#B59F5B]') : (isDarkMode ? 'text-[#909090]' : 'text-[#8C8A80]')}`}>
                        {isMe ? 'You' : `Ref: ${aliasName}`}
                      </span>
                      <span className={`text-[9.5px] font-mono opacity-50 ${isDarkMode ? 'text-[#888888]' : 'text-[#7A786E]'}`}>
                        • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    
                    <div className={`px-4 py-3 rounded-2xl text-[15px] md:text-[16px] leading-relaxed shadow-xs max-w-[85%] md:max-w-[75%] transition-all ${
                      isMe 
                        ? (isDarkMode 
                            ? 'bg-[#C5B37D]/10 border border-[#C5B37D]/30 text-[#EAEAEA] rounded-tr-none' 
                            : 'bg-[#EDE9DB] border border-[#C5C2B5] text-[#2C2B26] rounded-tr-none')
                        : (isDarkMode 
                            ? 'bg-[#181818] border border-[#333333] text-[#EAEAEA] rounded-tl-none' 
                            : 'bg-white border border-[#D1CEC0] text-[#2C2B26] rounded-tl-none')
                    }`}>
                      <div>{renderMessageContent(msg.text)}</div>
                      {isMe && (
                        <div className="flex justify-end items-center gap-1 mt-1 -mr-1">
                          {renderTicks(msg)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Dynamic synchronized typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex flex-col items-start w-full mt-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[10px] font-sans font-bold uppercase tracking-widest ${isDarkMode ? 'text-[#909090]' : 'text-[#8C8A80]'}`}>
                      Ref: {typingUsers[0].substring(2).toUpperCase()}
                    </span>
                    <span className={`text-[9.5px] font-mono opacity-50 ${isDarkMode ? 'text-[#888888]' : 'text-[#7A786E]'}`}>
                      • is typing
                    </span>
                  </div>
                  
                  <div className={`px-4 py-2.5 rounded-2xl shadow-xs transition-all flex items-center gap-1.5 ${
                    isDarkMode 
                      ? 'bg-[#181818] border border-[#333333] text-[#C5B37D] rounded-tl-none' 
                      : 'bg-white border border-[#D1CEC0] text-[#B59F5B] rounded-tl-none'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce shrink-0" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce shrink-0" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce shrink-0" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div 
            className={`shrink-0 border-t px-4 md:px-10 py-4 md:py-0 md:h-20 flex items-center gap-3 cursor-default ${isDarkMode ? 'bg-[#1A1A1A] border-[#333333]' : 'bg-[#F5F2E6] border-[#D1CEC0]'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={panicMode}
              className={`w-10 h-10 flex items-center justify-center rounded border shrink-0 cursor-pointer ${isDarkMode ? 'bg-[#222222] border-[#444444] text-[#888888] hover:text-[#EAEAEA]' : 'bg-white border-[#C5C2B5] text-[#7A786E] hover:text-[#1A1A1A] hover:bg-[#FDFCF0] active:bg-[#E8E6DD]'}`}
              style={{ transition: 'none !important' }}
              title="Close Reader (Esc)"
              type="button"
            >
              <BookMarked size={18} />
            </button>
            <form onSubmit={handleSend} className="relative w-full">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Add academic note or search text..."
                className={`w-full h-10 border rounded px-4 md:pr-24 text-sm focus:outline-none focus:ring-1 placeholder:text-[#AAA8A0] ${isDarkMode ? 'bg-[#111111] border-[#444444] focus:ring-[#C5B37D] text-[#EAEAEA]' : 'bg-white border-[#C5C2B5] focus:ring-[#B59F5B]'}`}
                autoComplete="off"
              />
              <div className="absolute right-3 top-2 flex items-center gap-2">
                <div className={`hidden md:block text-[10px] font-sans font-bold px-1.5 py-0.5 rounded cursor-default border ${isDarkMode ? 'text-[#777777] border-[#444444]' : 'text-[#AAA8A0] border-[#D1CEC0]'}`}>Enter</div>
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs disabled:opacity-50 cursor-pointer ${isDarkMode ? 'bg-[#EAEAEA] text-[#111111]' : 'bg-[#1A1A1A] text-white'}`}
                  aria-label="Submit"
                >
                  ↵
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* RIGHT METADATA PANEL */}
        <aside 
          className={`hidden xl:flex w-56 border-l flex-col p-4 shrink-0 cursor-default ${isDarkMode ? 'bg-[#151515] border-[#333333]' : 'bg-[#FAF8F2] border-[#D1CEC0]'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6">
            <h3 
              className={`text-xs font-bold font-sans uppercase mb-3 tracking-widest cursor-pointer ${isDarkMode ? 'text-[#A0A0A0]' : 'text-[#5C5A52]'}`}
              onClick={() => setShowSensitivitySetting(!showSensitivitySetting)}
            >
              Reader Status
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-sans">
                <span className={isDarkMode ? 'text-[#888888]' : 'text-[#7A786E]'}>Mode:</span>
                <span className={`font-bold uppercase ${isDarkMode ? 'text-[#C5B37D]' : 'text-[#B59F5B]'}`}>Stealth-Active</span>
              </div>
              <div className="flex justify-between text-[11px] font-sans items-center">
                <span className={isDarkMode ? 'text-[#888888]' : 'text-[#7A786E]'}>Shake Sensor:</span>
                <span className="text-green-600 font-bold uppercase cursor-pointer" onClick={() => setShowSensitivitySetting(!showSensitivitySetting)}>Ready</span>
              </div>
              {showSensitivitySetting && (
                <div className={`pt-2 pb-1 border-t mt-2 border-dashed ${isDarkMode ? 'border-[#333333]' : 'border-[#D1CEC0]'}`}>
                  <div className="flex justify-between text-[10px] font-sans mb-1">
                    <span className={isDarkMode ? 'text-[#888888]' : 'text-[#7A786E]'}>Trigger Threshold</span>
                    <span className={`font-mono ${isDarkMode ? 'text-[#A0A0A0]' : 'text-[#5C5A52]'}`}>{shakeSensitivity}G</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="40" 
                    value={shakeSensitivity} 
                    onChange={(e) => setShakeSensitivity(Number(e.target.value))}
                    className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isDarkMode ? 'bg-[#333333] accent-[#C5B37D]' : 'bg-[#D1CEC0] accent-[#B59F5B]'}`}
                  />
                  <div className={`flex justify-between text-[8px] font-sans mt-1 ${isDarkMode ? 'text-[#777777]' : 'text-[#AAA8A0]'}`}>
                    <span>High Sens.</span>
                    <span>Low Sens.</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between text-[11px] font-sans pt-1">
                <span className="text-[#7A786E]">Participants:</span>
                <span className="text-black font-bold uppercase">{messages.length > 0 ? Array.from(new Set(messages.map(m => m.sender))).length : 1}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-xs font-bold font-sans text-[#5C5A52] uppercase mb-3 tracking-widest flex items-center justify-between">
              Recent Files
              <LibraryIcon size={14} className="cursor-pointer hover:text-black" onClick={() => setShowLibraryModal(true)} title="Open Library" />
            </h3>
            <div className="space-y-1">
              {library.filter(b => b.id !== currentBook.id).slice(0, 3).map((book) => (
                <div key={book.id} onClick={() => setCurrentBook(book)} className={`p-2 rounded cursor-pointer border border-transparent transition-colors ${isDarkMode ? 'hover:bg-[#222222] hover:border-[#333333]' : 'hover:bg-white hover:border-[#D1CEC0]'}`}>
                   <p className={`text-[11px] font-bold truncate ${isDarkMode ? 'text-[#EAEAEA]' : 'text-black'}`}>{book.filename.split('/').pop()}</p>
                   <p className={`text-[9px] truncate ${isDarkMode ? 'text-[#888888]' : 'text-[#7A786E]'}`}>{book.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className={`h-24 w-full rounded border flex items-center justify-center p-4 text-center transition-colors ${isDarkMode ? 'bg-[#1e1e1e] border-[#333333]' : 'bg-[#E8E6DD] border-[#D1CEC0]'}`}>
              <p className={`text-[10px] leading-tight font-sans ${isDarkMode ? 'text-[#888888]' : 'text-[#5C5A52]'}`}>
                "Instant Panic" feature triggers at {shakeSensitivity}Gs of acceleration. Keep your hand steady.
              </p>
            </div>
          </div>
        </aside>
      </div>
      {libModal}
    </div>
  );
}

