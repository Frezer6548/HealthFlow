
import React from 'react';
import { AppState, UserProfile } from '../types';
import Card from '../components/Card';
import { Settings, Shield, HelpCircle, LogOut, ChevronRight, User } from 'lucide-react';
import { supabase } from '../services/supabase';

interface ProfileProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const Profile: React.FC<ProfileProps> = ({ state, updateState }) => {
  const handleInputChange = (field: keyof UserProfile, value: string | string[]) => {
    updateState(prev => ({
      ...prev,
      user: { ...prev.user, [field]: value }
    }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Garante que o nome seja exibido corretamente
  const displayName = state.user.name || 'Usuário';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-6 p-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-blue-500/20">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900">{displayName}</h2>
          <p className="text-slate-500">Membro HealthFlow</p>
          <div className="flex gap-2 mt-3">
             <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase px-2 py-1 rounded">Status: Ativo</span>
             <span className="bg-blue-100 text-blue-600 text-[10px] font-black uppercase px-2 py-1 rounded">Plano: Free</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Informações da Conta" subtitle="Seus dados de exibição.">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nome de Exibição</label>
              <input 
                type="text" 
                value={state.user.name} 
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Seu nome completo"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>
            
            <div className="pt-4 border-t border-slate-100">
               <p className="text-[10px] text-slate-400 text-center">As alterações são sincronizadas automaticamente na nuvem.</p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Preferências do App">
            <div className="space-y-2">
              <SettingsRow icon={<Shield size={18} className="text-blue-500" />} label="Privacidade & Segurança" />
              <SettingsRow icon={<HelpCircle size={18} className="text-emerald-500" />} label="Central de Ajuda" />
              <SettingsRow icon={<Settings size={18} className="text-orange-500" />} label="Configurações Gerais" />
              <hr className="my-4 border-slate-100" />
              <SettingsRow 
                icon={<LogOut size={18} className="text-red-500" />} 
                label="Sair da Conta" 
                isDestructive 
                onClick={handleLogout}
              />
            </div>
          </Card>

          <Card title="Badges Conquistadas">
            <div className="flex flex-wrap gap-4">
              {state.badges.map(badge => (
                <div 
                  key={badge.id} 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-sm ${badge.achieved ? 'bg-yellow-100 scale-105' : 'bg-slate-50 grayscale opacity-40'}`}
                  title={badge.description}
                >
                  {badge.icon}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SettingsRow: React.FC<{ icon: React.ReactNode; label: string; isDestructive?: boolean; onClick?: () => void }> = ({ icon, label, isDestructive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group ${isDestructive ? 'text-red-500' : 'text-slate-700'}`}
    >
      <div className="flex items-center gap-3">
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
    </button>
  );
};

export default Profile;
