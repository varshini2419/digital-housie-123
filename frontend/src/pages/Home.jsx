import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  LogIn, 
  CheckCircle2, 
  Gamepad2, 
  Ticket
} from 'lucide-react';
import useSpeech from '../hooks/useSpeech';
import ThemeToggle from '../components/ThemeToggle';

const Home = () => {
  const { unlockAudio } = useSpeech();
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

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

  const handlePlayerLoginClick = () => {
    unlockAudio();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] dark:bg-[#0B1120] text-[#1C1917] dark:text-[#F5F5F4] font-sans transition-colors duration-200 relative overflow-x-hidden">
      
      {/* WARM GOLDEN AMBIENT LIGHTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-28 -left-20 w-[28rem] h-[28rem] bg-amber-400/12 dark:bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -right-24 w-[30rem] h-[30rem] bg-yellow-300/15 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 left-1/3 w-[32rem] h-[32rem] bg-rose-400/5 dark:bg-rose-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 dark:bg-[#0B1120]/85 border-b border-amber-200/70 dark:border-slate-800 shadow-[0_4px_20px_rgba(217,119,6,0.04)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          
          {/* Logo with Golden Badge & Tiny Red Accent */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform border border-yellow-200">
              🎱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1C1917] dark:text-white font-serif">HOUSIE</span>
                <span className="bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  LIVE
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">Multiplayer Tambola</p>
            </div>
          </Link>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link 
              to="/admin" 
              className="text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 px-3 py-2 rounded-xl transition-colors hidden sm:block"
            >
              Host Portal 🔒
            </Link>
            <button
              onClick={handlePlayerLoginClick}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white px-5 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-md shadow-amber-500/25 hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer border border-yellow-300/40"
            >
              <LogIn className="w-4 h-4" />
              <span>PLAYER LOGIN</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO & SPOTLIGHT SECTION */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Harmonious Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 via-yellow-50 to-rose-50/50 dark:from-amber-950/50 dark:to-stone-900 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Telugu & English Voice Calling</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-serif text-[#1C1917] dark:text-white leading-tight mb-3">
            The Classic Indian <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700">Housie Game</span>
          </h1>

          <p className="text-sm text-stone-600 dark:text-stone-300 font-medium max-w-md mx-auto">
            Live number draws, synchronized tickets, automated instant claims, and bilingual voice modulation.
          </p>
        </div>

        {/* STATS ROW WITH GOLDEN THEME */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-md sm:max-w-lg mx-auto mb-8 text-center">
          
          {/* Active Sessions - Golden / Amber */}
          <div className="bg-white dark:bg-stone-800/90 rounded-2xl p-3 sm:p-4 border border-amber-200/90 dark:border-amber-900/60 shadow-[0_4px_16px_rgba(245,158,11,0.08)]">
            <p className="text-2xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-serif">
              {sessions.length || 5}
            </p>
            <p className="text-[10px] sm:text-xs font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-1">
              Active Sessions
            </p>
          </div>

          {/* Real-Time Sync - Light Green */}
          <div className="bg-white dark:bg-stone-800/90 rounded-2xl p-3 sm:p-4 border border-emerald-200/90 dark:border-emerald-900/60 shadow-[0_4px_16px_rgba(16,185,129,0.08)]">
            <p className="text-2xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-serif">
              100%
            </p>
            <p className="text-[10px] sm:text-xs font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-1">
              Real-Time Sync
            </p>
          </div>

          {/* Dual Voice - Soft Light Blue / Gold */}
          <div className="bg-white dark:bg-stone-800/90 rounded-2xl p-3 sm:p-4 border border-sky-200/90 dark:border-sky-900/60 shadow-[0_4px_16px_rgba(56,189,248,0.08)]">
            <p className="text-2xl sm:text-4xl font-black text-sky-600 dark:text-sky-400 font-serif">
              TE / EN
            </p>
            <p className="text-[10px] sm:text-xs font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-1">
              Dual Voice
            </p>
          </div>
        </div>

        {/* SPOTLIGHT: THE LIVE CALLING ROOM CARD (GOLDEN THEME WITH SMALL RED & GREEN ACCENTS) */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 sm:p-7 shadow-[0_12px_40px_rgba(217,119,6,0.08)] border-2 border-amber-200 dark:border-amber-900/70 relative">
            
            {/* Header inside ticket card */}
            <div className="flex items-center justify-between pb-3.5 border-b border-amber-100 dark:border-stone-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-200">
                  LIVE CALLING ROOM
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-bold px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                <span>🌐</span>
                <span>తెలుగు / English</span>
              </div>
            </div>

            {/* Current Calling Ball Banner with Rich Golden Theme & Subtle Warm Red Edge */}
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white rounded-2xl p-4 sm:p-5 mb-4 shadow-md flex items-center justify-between relative overflow-hidden border border-yellow-300/40">
              
              {/* Small subtle red highlight streak */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-rose-500/20 rounded-full blur-xl pointer-events-none"></div>

              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
                  CURRENT CALLING BALL
                </p>
                <p className="text-3xl sm:text-4xl font-black tracking-tight mt-0.5 text-white drop-shadow-xs">
                  సంఖ్య 42
                </p>
                <p className="text-xs sm:text-sm font-bold text-amber-100/90 mt-0.5">
                  నలభై రెండు / Number 42
                </p>
              </div>
              
              {/* Glowing 3D Golden Ball */}
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white text-stone-900 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl border-4 border-amber-200 shrink-0 transform rotate-2">
                42
              </div>
            </div>

            {/* Sample Ticket #042 Grid */}
            <div className="bg-[#FFFDF5] dark:bg-stone-900/60 border border-amber-200 dark:border-stone-800 rounded-2xl p-3 sm:p-4 shadow-inner mb-4">
              <div className="flex items-center justify-between text-xs font-black text-amber-950 dark:text-amber-200 px-1 mb-2">
                <span className="tracking-wide">SAMPLE TICKET #042</span>
                <span className="text-[10px] text-stone-500 font-semibold">3 Rows × 9 Columns</span>
              </div>
              
              <div className="grid grid-cols-9 gap-1 text-center font-bold text-xs sm:text-sm">
                {/* Row 1 */}
                <div className="bg-emerald-600 text-white py-1.5 rounded-lg shadow-xs font-black">4</div>
                <div className="bg-stone-100/60 dark:bg-stone-800/40 py-1.5 rounded-lg text-stone-300">-</div>
                <div className="bg-white dark:bg-stone-800 py-1.5 rounded-lg text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700">23</div>
                <div className="bg-stone-100/60 dark:bg-stone-800/40 py-1.5 rounded-lg text-stone-300">-</div>
                <div className="bg-emerald-600 text-white py-1.5 rounded-lg shadow-xs font-black">42</div>
                <div className="bg-stone-100/60 dark:bg-stone-800/40 py-1.5 rounded-lg text-stone-300">-</div>
                <div className="bg-white dark:bg-stone-800 py-1.5 rounded-lg text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700">67</div>
                <div className="bg-stone-100/60 dark:bg-stone-800/40 py-1.5 rounded-lg text-stone-300">-</div>
                <div className="bg-white dark:bg-stone-800 py-1.5 rounded-lg text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700">89</div>

                {/* Row 2 */}
                <div className="bg-stone-100/60 dark:bg-stone-800/40 py-1.5 rounded-lg text-stone-300">-</div>
                <div className="bg-white dark:bg-stone-800 py-1.5 rounded-lg text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700">15</div>
                <div className="bg-stone-100/60 dark:bg-stone-800/40 py-1.5 rounded-lg text-stone-300">-</div>
                <div className="bg-emerald-600 text-white py-1.5 rounded-lg shadow-xs font-black">33</div>
                <div className="bg-stone-100/60 dark:bg-stone-800/40 py-1.5 rounded-lg text-stone-300">-</div>
                <div className="bg-white dark:bg-stone-800 py-1.5 rounded-lg text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700">54</div>
                <div className="bg-stone-100/60 dark:bg-stone-800/40 py-1.5 rounded-lg text-stone-300">-</div>
                <div className="bg-white dark:bg-stone-800 py-1.5 rounded-lg text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700">78</div>
                <div className="bg-stone-100/60 dark:bg-stone-800/40 py-1.5 rounded-lg text-stone-300">-</div>

                {/* Row 3 */}
                <div className="bg-white dark:bg-stone-800 py-1.5 rounded-lg text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700">7</div>
                <div className="bg-stone-100/60 dark:bg-stone-800/40 py-1.5 rounded-lg text-stone-300">-</div>
                <div className="bg-white dark:bg-stone-800 py-1.5 rounded-lg text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700">28</div>
                <div className="bg-stone-100/60 dark:bg-stone-800/40 py-1.5 rounded-lg text-stone-300">-</div>
                <div className="bg-stone-100/60 dark:bg-stone-800/40 py-1.5 rounded-lg text-stone-300">-</div>
                <div className="bg-white dark:bg-stone-800 py-1.5 rounded-lg text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700">58</div>
                <div className="bg-stone-100/60 dark:bg-stone-800/40 py-1.5 rounded-lg text-stone-300">-</div>
                <div className="bg-emerald-600 text-white py-1.5 rounded-lg shadow-xs font-black">79</div>
                <div className="bg-emerald-600 text-white py-1.5 rounded-lg shadow-xs font-black">90</div>
              </div>
            </div>

            {/* Status footer with Light Green & Gold Badges */}
            <div className="flex items-center justify-between text-xs font-bold pt-1">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                Instant Automated Claim
              </span>
              <span className="flex items-center gap-1 text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                <span>🏆</span>
                <span>Jaldi 5 Available!</span>
              </span>
            </div>
          </div>

          {/* Action Buttons with Golden Theme & Subtle Red Badge */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handlePlayerLoginClick}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white py-3.5 rounded-2xl font-black text-sm tracking-wide shadow-md shadow-amber-500/25 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-yellow-300/40"
            >
              <LogIn className="w-4 h-4" />
              <span>JOIN ACTIVE SESSION / LOGIN</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/register"
              className="w-full sm:w-auto bg-white dark:bg-stone-800 hover:bg-amber-50/50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-amber-200 dark:border-stone-700 px-5 py-3.5 rounded-2xl font-bold text-xs tracking-wide shadow-xs transition-all text-center whitespace-nowrap flex items-center justify-center gap-1.5"
            >
              <Ticket className="w-4 h-4 text-rose-500" />
              <span>Register</span>
            </Link>
          </div>
        </div>

      </main>

      {/* COMPACT CLEAN FOOTER */}
      <footer className="border-t border-amber-200/60 dark:border-stone-800 py-6 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-stone-500 dark:text-stone-400">
          <p>© {new Date().getFullYear()} Housie Live Multiplayer Tambola</p>
          <div className="flex items-center gap-4">
            <button onClick={handlePlayerLoginClick} className="hover:text-amber-700 cursor-pointer">Player Login</button>
            <Link to="/register" className="hover:text-amber-700">Register</Link>
            <Link to="/admin" className="hover:text-amber-700">Host Portal</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
