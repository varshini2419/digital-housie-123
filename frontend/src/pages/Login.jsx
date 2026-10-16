import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';
import useGameStore from '../store/useGameStore';
import useSpeech from '../hooks/useSpeech';

const Login = () => {
  const { unlockAudio } = useSpeech();
  const [sessions, setSessions] = useState([]);
  const [formData, setFormData] = useState({
    sessionId: '',
    mobile: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Pending request status: null | 'PENDING' | 'ACCEPTED' | 'DECLINED'
  const [requestStatus, setRequestStatus] = useState(null);
  const [pendingMessage, setPendingMessage] = useState('');
  
  const { setSession, setTicket } = useGameStore();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://127.0.0.1:5000')}/api/player/sessions`);
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setSessions(data);
        }
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

  // Direct login / approval verification helper
  const handleLoginDirect = useCallback(async (isPolling = false) => {
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

      const contentType = res.headers.get('content-type');
      let data = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Server error (${res.status})`);
      }

      if (data.declined) {
        setRequestStatus('DECLINED');
        setPendingMessage('');
        setError(data.message || 'Your join request was declined by the host.');
        return;
      }

      if (data.pendingApproval) {
        setRequestStatus('PENDING');
        setPendingMessage(data.message || 'Access request sent to host. Waiting for approval...');
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
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
      }, 700);

    } catch (err) {
      if (!isPolling) {
        setError(err.message || 'An unexpected error occurred.');
        setRequestStatus(null);
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [formData.sessionId, formData.mobile, navigate, setSession, setTicket]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    unlockAudio();
    
    if (!formData.sessionId || !formData.mobile) {
      setError('Please select a session and enter your registered mobile number.');
      return;
    }
    
    setError('');
    setPendingMessage('');
    await handleLoginDirect(false);
  };

  // Socket & polling watchdog while request is PENDING
  useEffect(() => {
    if (requestStatus !== 'PENDING') return;

    const interval = setInterval(() => {
      handleLoginDirect(true);
    }, 3000);

    // Socket listener for real-time approval / decline
    const backendUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://127.0.0.1:5000');
    const socket = io(backendUrl);
    socketRef.current = socket;

    socket.emit('join_game', { 
      sessionId: formData.sessionId, 
      ticketCode: formData.mobile, 
      role: 'player' 
    });

    socket.on('request_approved', () => {
      handleLoginDirect(false);
    });

    socket.on('request_declined', ({ message }) => {
      setRequestStatus('DECLINED');
      setPendingMessage('');
      setError(message || 'Your join request was declined by the host.');
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [requestStatus, formData.mobile, formData.sessionId, handleLoginDirect]);

  return (
    <div className="min-h-screen bg-white text-stone-900 px-4 py-8 flex flex-col items-center justify-center relative font-sans">
      
      {/* Warm Golden subtle ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-yellow-400/10 blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-rose-400/5 blur-3xl"></div>
      </div>

      {/* Top Header Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-700 px-4 py-2 rounded-xl text-xs font-bold border border-stone-200 shadow-xs transition-all active:scale-95"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Central Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-[0_12px_40px_rgba(217,119,6,0.08)] border-2 border-amber-200 relative z-10 overflow-hidden">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

        {/* Badge & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>PLAYER ACCESS PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-stone-900 leading-tight mb-2">
            Join Your Game Session
          </h1>
          <p className="text-xs sm:text-sm font-medium text-stone-600">
            Select your active session and enter your registered mobile number to enter the live game.
          </p>
        </div>

        {/* Status Banners */}
        {requestStatus === 'PENDING' && (
          <div className="bg-amber-500/15 border border-amber-500/30 text-amber-900 p-4 rounded-2xl mb-6 text-xs sm:text-sm flex items-center gap-3 font-semibold shadow-xs animate-pulse">
            <span className="text-xl">⏳</span>
            <div>
              <div className="font-bold text-sm">Request In Waiting...</div>
              <div className="text-[11px] opacity-90">{pendingMessage || 'Your join request was sent to the host. Please wait for approval.'}</div>
            </div>
          </div>
        )}

        {requestStatus === 'ACCEPTED' && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 p-4 rounded-2xl mb-6 text-xs sm:text-sm flex items-center gap-3 font-semibold shadow-xs">
            <span className="text-xl">✅</span>
            <div>
              <div className="font-bold text-sm">Request Accepted!</div>
              <div className="text-[11px] opacity-90">Host approved your request. Entering game room...</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-300 text-rose-700 p-3.5 rounded-xl mb-6 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Select Session */}
          <div>
            <label htmlFor="sessionId" className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              SELECT ACTIVE GAME SESSION
            </label>
            <div className="relative">
              <select
                id="sessionId"
                name="sessionId"
                value={formData.sessionId}
                onChange={handleChange}
                disabled={requestStatus === 'PENDING'}
                className="w-full p-3.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-semibold text-xs sm:text-sm outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer appearance-none pr-10 disabled:opacity-75 disabled:cursor-not-allowed"
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
            <label htmlFor="mobile" className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1.5">
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
              className="w-full p-3.5 rounded-xl bg-white border border-stone-300 text-stone-900 font-semibold text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs disabled:opacity-75 disabled:cursor-not-allowed"
            />
          </div>

          {/* Join Live Game Now Button */}
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

        {/* Footer Link to Register */}
        <div className="mt-6 pt-4 border-t border-amber-100 text-center">
          <p className="text-xs font-semibold text-stone-500 flex items-center justify-center gap-1">
            <span>Don't have a ticket yet?</span>
            <Link to="/register" className="text-amber-700 font-bold hover:underline ml-1 flex items-center gap-1">
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
