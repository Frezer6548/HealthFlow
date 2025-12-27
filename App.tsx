
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Droplet, 
  Dumbbell, 
  Utensils, 
  LayoutDashboard, 
  User as UserIcon, 
  Bell, 
  Flame,
  LogOut,
  Loader2
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Hydration from './pages/Hydration';
import Workouts from './pages/Workouts';
import Diet from './pages/Diet';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import { AppState } from './types';
import { INITIAL_USER, INITIAL_BADGES } from './constants';
import { supabase } from './services/supabase';
import { saveUserState, getUserState } from './services/dbService';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const isInitialLoad = useRef(true);
  
  const [state, setState] = useState<AppState>({
    user: INITIAL_USER,
    hydration: [],
    workouts: [],
    meals: [],
    badges: INITIAL_BADGES,
    streak: 0,
    lastVisit: new Date().toISOString()
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      
      if (currentSession) {
        // Captura o nome do metadata do Supabase (definido no Auth.tsx)
        const nameFromAuth = currentSession.user.user_metadata?.full_name || '';
        loadUserData(currentSession.user.id, nameFromAuth);
      } else {
        setAuthLoading(false);
        if (event === 'SIGNED_OUT') {
          setState({
            user: INITIAL_USER,
            hydration: [],
            workouts: [],
            meals: [],
            badges: INITIAL_BADGES,
            streak: 0,
            lastVisit: new Date().toISOString()
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (uid: string, metadataName: string) => {
    try {
      const cloudState = await getUserState(uid);
      if (cloudState) {
        // Se o nome no DB estiver vazio ou for "User", forçamos o nome do metadata
        const updatedState = { ...cloudState };
        if (!updatedState.user.name || updatedState.user.name.toLowerCase() === 'user') {
          updatedState.user.name = metadataName;
        }
        setState(updatedState);
      } else {
        // Novo usuário: Dashboard zerada com o nome correto
        const newState: AppState = {
          user: { ...INITIAL_USER, name: metadataName },
          hydration: [],
          workouts: [],
          meals: [],
          badges: INITIAL_BADGES,
          streak: 0,
          lastVisit: new Date().toISOString()
        };
        setState(newState);
        await saveUserState(uid, newState);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setAuthLoading(false);
      isInitialLoad.current = false;
    }
  };

  useEffect(() => {
    if (session?.user?.id && !authLoading && !isInitialLoad.current) {
      const timer = setTimeout(() => {
        saveUserState(session.user.id, state).catch(err => {
          console.warn("Autosave failed:", err);
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, session, authLoading]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => updater(prev));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="text-blue-600 animate-spin" size={48} />
        <p className="text-slate-500 font-medium animate-pulse">Sincronizando HealthFlow...</p>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
        <nav className="fixed bottom-0 left-0 w-full md:relative md:w-64 md:h-screen bg-white border-t md:border-t-0 md:border-r border-slate-200 z-50">
          <div className="hidden md:flex items-center gap-2 p-6 mb-8">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Flame className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">HealthFlow</h1>
          </div>

          <div className="flex md:flex-col justify-around md:justify-start items-center md:items-stretch px-2 md:px-4 py-2 md:py-0 gap-1 h-full md:h-auto">
            <NavItem to="/" icon={<LayoutDashboard size={22} />} label="Home" />
            <NavItem to="/hydration" icon={<Droplet size={22} />} label="Água" />
            <NavItem to="/workouts" icon={<Dumbbell size={22} />} label="Treinos" />
            <NavItem to="/diet" icon={<Utensils size={22} />} label="Dieta" />
            <NavItem to="/profile" icon={<UserIcon size={22} />} label="Perfil" />
            
            <button 
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-3 px-4 py-3 mt-auto mb-6 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 h-screen bg-slate-50">
          <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between z-40">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <span className="md:hidden flex items-center gap-1">
                <Flame className="text-blue-500 w-5 h-5" />
                HF
              </span>
              <PageTitle />
            </h2>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                <Flame size={16} />
                <span>{state.streak} Dias</span>
              </div>
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </header>

          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard state={state} />} />
              <Route path="/hydration" element={<Hydration state={state} updateState={updateState} />} />
              <Route path="/workouts" element={<Workouts state={state} updateState={updateState} />} />
              <Route path="/diet" element={<Diet state={state} updateState={updateState} />} />
              <Route path="/profile" element={<Profile state={state} updateState={updateState} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all w-full
        ${isActive 
          ? 'text-blue-600 bg-blue-50 font-semibold shadow-sm' 
          : 'text-slate-500 hover:bg-slate-100'
        }
      `}
    >
      {icon}
      <span className="text-[10px] md:text-sm font-medium">{label}</span>
    </Link>
  );
};

const PageTitle: React.FC = () => {
  const location = useLocation();
  switch (location.pathname) {
    case '/': return <span className="hidden md:inline ml-2">• Início</span>;
    case '/hydration': return <span className="hidden md:inline ml-2">• Hidratação</span>;
    case '/workouts': return <span className="hidden md:inline ml-2">• Treinos</span>;
    case '/diet': return <span className="hidden md:inline ml-2">• Nutrição</span>;
    case '/profile': return <span className="hidden md:inline ml-2">• Perfil</span>;
    default: return null;
  }
};

export default App;
