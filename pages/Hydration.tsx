
import React, { useState, useMemo } from 'react';
import { AppState, HydrationLog } from '../types';
import Card from '../components/Card';
import CircularProgress from '../components/CircularProgress';
import { Plus, Minus, History, Trash2, Trophy, Clock, Droplet } from 'lucide-react';

interface HydrationProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const Hydration: React.FC<HydrationProps> = ({ state, updateState }) => {
  const [cupSize, setCupSize] = useState(250);
  const today = new Date().toISOString().split('T')[0];

  const todayLogs = useMemo(() => {
    return state.hydration.filter(h => h.date.startsWith(today));
  }, [state.hydration, today]);

  const totalToday = useMemo(() => {
    return todayLogs.reduce((acc, curr) => acc + curr.amount, 0);
  }, [todayLogs]);

  const goal = 3000;
  const progress = Math.min((totalToday / goal) * 100, 100);

  const addWater = (amount: number) => {
    const newLog: HydrationLog = {
      date: new Date().toISOString(),
      amount
    };
    updateState(prev => {
      const newState = { ...prev, hydration: [...prev.hydration, newLog] };
      
      // Check for badge achievement
      if (totalToday + amount >= 3000) {
        newState.badges = newState.badges.map(b => 
          b.id === 'h2o-master' ? { ...b, achieved: true } : b
        );
      }
      return newState;
    });
  };

  const removeLog = (index: number) => {
    updateState(prev => {
      const logs = [...prev.hydration];
      const absoluteLog = todayLogs[index];
      const absoluteIndex = logs.findIndex(l => l.date === absoluteLog.date);
      if (absoluteIndex !== -1) {
        logs.splice(absoluteIndex, 1);
      }
      return { ...prev, hydration: logs };
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Card className="flex flex-col items-center py-12">
          <CircularProgress progress={progress} size={240} label="Meta Diária" />
          <div className="mt-8 text-center">
            <h2 className="text-4xl font-black text-slate-900 mb-2">{totalToday} <span className="text-xl font-normal text-slate-400">/ {goal} ml</span></h2>
            <p className="text-slate-500 font-medium">
              {totalToday >= goal ? "Parabéns! Você atingiu sua meta diária! 🎉" : `Beba mais ${goal - totalToday}ml para atingir a meta.`}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => addWater(cupSize)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-3xl flex flex-col items-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            <div className="bg-white/20 p-2 rounded-xl"><Plus /></div>
            <span className="font-bold">Beber {cupSize}ml</span>
          </button>
          <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col items-center gap-3">
             <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Tamanho do Copo</span>
             <div className="flex items-center gap-4">
               <button onClick={() => setCupSize(Math.max(50, cupSize - 50))} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Minus size={18} /></button>
               <span className="text-xl font-bold text-slate-900">{cupSize}ml</span>
               <button onClick={() => setCupSize(Math.min(1000, cupSize + 50))} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Plus size={18} /></button>
             </div>
          </div>
        </div>
      </div>

      <Card title="Histórico de Hoje" headerAction={<History className="text-slate-400" />}>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {todayLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center gap-3">
              <Droplet size={48} className="opacity-20" />
              <p>Nenhum registro hoje. Hora de se hidratar!</p>
            </div>
          ) : (
            todayLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-xl">
                    <Droplet size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Consumo de Água</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={12} />
                      {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-blue-600">+{log.amount} ml</span>
                  <button 
                    onClick={() => removeLog(i)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )).reverse()
          )}
        </div>
        
        {totalToday >= 2000 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-center gap-4">
            <Trophy className="text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-700">Você já bebeu mais de 2L hoje. Excelente!</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Hydration;
