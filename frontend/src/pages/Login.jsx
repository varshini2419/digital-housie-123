import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';
import useGameStore from '../store/useGameStore';
import useSpeech from '../hooks/useSpeech';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const { unlockAudio } = useSpeech();
  const [sessions, setSessions] = useState([]);
  const [formData, setFormData] = useState({
    sessionId: '',
    mobile: ''
  });
  const [error, setError] = useState('');
  const [requestStatus, setRequestStatus] = useState('IDLE'); // 'IDLE' | 'PENDING' | 'ACCEPTED' | 'DECLINED'
  const [pendingMessage, setPendingMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSession, setTicket } = useGameStore();

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (requestStatus !== 'PENDING' || !formData.mobile || !formData.sessionId) return;

    // Check status via HTTP polling every 3 seconds
    const interval = setInterval(() => {
      handleLoginDirect(true);
    }, 3000);

    // Socket listener for real-time approval/decline
    const socket = io(import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://127.0.0.1:5000'));
    socket.emit('join_game', { sessionId: formData.sessionId, ticketCode: formData.mobile, role: 'player' });

    socket.on('request_approved', () => {
      handleLoginDirect(false);
    });

    socket.on('request_declined', ({ message }) => {
      setRequestStatus('DECLINED');
      setPendingMessage(null);
      setError(message || 'Your join request was declined by the host.');
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [requestStatus, formData.mobile, formData.sessionId]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://127.0.0.1:5000')}/api/player/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleLoginDirect = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);

      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://127.0.0.1:5000')}/api/player/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: formData.sessionId, 
          mobile: formData.mobile 
        })
      });

      const data = await res.json();

      if (data.pendingApproval) {
        setRequestStatus('PENDING');
        setPendingMessage(data.message || 'Access request sent to host. Waiting for approval...');
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      const targetSessionId = data.session?.id || data.session?._id || data.sessionId;
      if (!targetSessionId) {
        setRequestStatus('PENDING');
        setPendingMessage('Waiting for host approval...');
        return;
      }

      // Host Accepted
      setRequestStatus('ACCEPTED');
      setPendingMessage('Request Accepted! Redirecting to game...');
      setError('');
      setSession(data.session);
      setTicket({
        ...data.ticket,
        playerName: data.ticket?.playerName || data.player?.name || ''
      });

      setTimeout(() => {
        navigate(`/game/${targetSessionId}`);
      }, 600);

    } catch (err) {
      if (!isPolling) {
        setError(err.message);
        setRequestStatus('IDLE');
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    unlockAudio();
    
    if (!formData.sessionId || !formData.mobile) {
      setError('Please select an active session and enter your registered mobile number.');
      return;
    }
    
    setError('');
    setPendingMessage(null);
    await handleLoginDirect(false);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] dark:bg-[#0B1120] text-[#1C1917] dark:text-[#F5F5F4] px-4 py-8 flex flex-col items-center justify-center relative font-sans">
      
      {/* Warm Golden ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-yellow-400/10 blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-rose-400/5 blur-3xl"></div>
      </div>

      {/* Top Header Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-white dark:bg-stone-800 hover:bg-stone-50 text-stone-700 dark:text-stone-200 px-4 py-2 rounded-xl text-xs font-bold border border-amber-200 dark:border-stone-700 shadow-xs transition-all active:scale-95"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Central Login Card (Golden Theme with Light Red & Yellow Accents) */}
      <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-3xl p-7 sm:p-9 shadow-[0_12px_40px_rgba(217,119,6,0.08)] border-2 border-amber-200 dark:border-amber-900/70 relative z-10 overflow-hidden">
        
        {/* Top Accent Line: Warm Gold to Yellow with subtle Red highlight */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

        {/* Badge & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 border border-amber-200/80 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>PLAYER ACCESS PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#1C1917] dark:text-white leading-tight mb-2">
            Join Your Game Session
          </h1>
          <p className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400">
            Select your active session and enter your registered mobile number to enter the live game.
          </p>
        </div>

        {/* Status Banners */}
        {requestStatus === 'PENDING' && (
          <div className="bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 p-4 rounded-2xl mb-6 text-xs sm:text-sm flex items-center gap-3 font-semibold shadow-xs animate-pulse">
            <span className="text-xl">⏳</span>
            <div>
              <div className="font-bold text-sm">Request In Waiting...</div>
              <div className="text-[11px] opacity-90">{pendingMessage || 'Your join request was sent to the host. Please wait.'}</div>
            </div>
          </div>
        )}

        {requestStatus === 'ACCEPTED' && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 p-4 rounded-2xl mb-6 text-xs sm:text-sm flex items-center gap-3 font-semibold shadow-xs">
            <span className="text-xl">✅</span>
            <div>
              <div className="font-bold text-sm">Request Accepted!</div>
              <div className="text-[11px] opacity-90">Host approved your request. Entering game room...</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-3.5 rounded-xl mb-6 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Select Session */}
          <div>
            <label htmlFor="sessionId" className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              SELECT ACTIVE GAME SESSION
            </label>
            <div className="relative">
              <select
                id="sessionId"
                name="sessionId"
                value={formData.sessionId}
                onChange={handleChange}
                disabled={requestStatus === 'PENDING'}
                className="w-full p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 text-[#1C1917] dark:text-white font-semibold text-xs sm:text-sm outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer appearance-none pr-10"
              >
                <option value="">-- Choose Active Session --</option>
                {sessions.map(session => (
                  <option key={session._id} value={session._id}>
                    {session.sessionName} ({new Date(session.startTime).toLocaleDateString()}) - {session.gameStatus}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 font-bold text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Mobile Number Input */}
          <div>
            <label htmlFor="mobile" className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              REGISTERED MOBILE NUMBER (PASSWORD)
            </label>
            <input
              id="mobile"
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              disabled={requestStatus === 'PENDING'}
              placeholder="Enter 10-digit mobile number"
              className="w-full p-3.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-[#1C1917] dark:text-white font-semibold text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs"
            />
          </div>

          {/* Join Live Game Now Button with Golden Gradient & Warm Shadow */}
          <button
            type="submit"
            disabled={loading || requestStatus === 'PENDING' || requestStatus === 'ACCEPTED'}
            className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-yellow-300/40 ${
              requestStatus === 'PENDING'
                ? 'bg-amber-500 text-white cursor-wait animate-pulse'
                : requestStatus === 'ACCEPTED'
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white'
            }`}
          >
            {loading 
              ? 'Checking Status...' 
              : requestStatus === 'PENDING' 
              ? '⏳ WAITING FOR HOST APPROVAL...' 
              : requestStatus === 'ACCEPTED' 
              ? '✅ ENTERING GAME...' 
              : 'JOIN LIVE GAME NOW'
            }
          </button>
        </form>

        {/* Footer Link to Register with tiny light red ticket badge */}
        <div className="mt-6 pt-4 border-t border-amber-100 dark:border-stone-800 text-center">
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1">
            <span>Don't have a ticket yet?</span>
            <Link to="/register" className="text-amber-700 dark:text-amber-400 font-bold hover:underline ml-1 flex items-center gap-1">
              <span className="text-rose-500 text-[10px]">🎟️</span>
              <span>REGISTER HERE</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
