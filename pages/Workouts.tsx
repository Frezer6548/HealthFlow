
import React, { useState, useEffect } from 'react';
import { AppState, Workout } from '../types';
import Card from '../components/Card';
import { Play, Clock, Zap, RotateCcw, SkipForward, RefreshCw, Search } from 'lucide-react';

const MOCK_WORKOUTS: Workout[] = [
  {
    id: 'w1',
    title: 'Blitz de Corpo Inteiro',
    description: 'Treino rápido para o corpo todo, ideal para quem tem pouco tempo.',
    duration: 20,
    difficulty: 'medium',
    exercises: [
      { name: 'Polichinelos', reps: '30', sets: 3, time: 30 },
      { name: 'Agachamentos', reps: '15', sets: 3, time: 45 },
      { name: 'Flexões de Braço', reps: '10', sets: 3, time: 45 },
      { name: 'Prancha Abdominal', time: 60, sets: 1 }
    ]
  },
  {
    id: 'w2',
    title: 'Cardio Intenso',
    description: 'Foco em queima de gordura e resistência cardiovascular.',
    duration: 30,
    difficulty: 'hard',
    exercises: [
      { name: 'Burpees', reps: '10', sets: 4, time: 45 },
      { name: 'Corrida no Lugar', time: 60, sets: 4 },
      { name: 'Escalador (Mountain Climber)', reps: '20', sets: 4, time: 30 }
    ]
  },
  {
    id: 'w3',
    title: 'Yoga Relax',
    description: 'Alongamento e relaxamento para terminar bem o dia.',
    duration: 15,
    difficulty: 'easy',
    exercises: [
      { name: 'Postura da Criança', time: 60, sets: 1 },
      { name: 'Saudação ao Sol', reps: '5', sets: 2, time: 120 },
      { name: 'Alongamento de Coluna', time: 60, sets: 1 }
    ]
  }
];

interface WorkoutsProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const Workouts: React.FC<WorkoutsProps> = ({ state, updateState }) => {
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeWorkout && secondsLeft > 0 && !isPaused) {
      const timer = setInterval(() => setSecondsLeft(s => s - 1), 1000);
      return () => clearInterval(timer);
    } else if (activeWorkout && secondsLeft === 0) {
      nextExercise();
    }
  }, [activeWorkout, secondsLeft, isPaused]);

  const fetchSuggestedWorkouts = () => {
    // Aqui no futuro poderíamos usar o Gemini para sugerir treinos baseados no histórico
    updateState(prev => ({ ...prev, workouts: MOCK_WORKOUTS }));
  };

  const startWorkout = (workout: Workout) => {
    setActiveWorkout(workout);
    setCurrentExerciseIdx(0);
    setSecondsLeft(workout.exercises[0].time || 45);
    setIsPaused(false);
  };

  const nextExercise = () => {
    if (activeWorkout && currentExerciseIdx < activeWorkout.exercises.length - 1) {
      setCurrentExerciseIdx(prev => prev + 1);
      setSecondsLeft(activeWorkout.exercises[currentExerciseIdx + 1].time || 45);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    setActiveWorkout(null);
    updateState(prev => ({ ...prev, streak: prev.streak + 1 }));
    alert("Parabéns! Treino concluído!");
  };

  if (activeWorkout) {
    const current = activeWorkout.exercises[currentExerciseIdx];
    const progress = ((currentExerciseIdx + 1) / activeWorkout.exercises.length) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveWorkout(null)} className="text-slate-500 hover:text-slate-900 flex items-center gap-1">
            <RotateCcw size={18} /> Cancelar Treino
          </button>
          <div className="text-sm font-bold text-blue-600 uppercase tracking-widest">{activeWorkout.title}</div>
        </div>

        <Card className="text-center py-12 space-y-8 bg-white">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center animate-pulse">
              <Zap size={40} />
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">{current.name}</h2>
            <p className="text-slate-500">{current.reps ? `${current.sets || 3} séries de ${current.reps}` : `Segure por ${current.time}s`}</p>
          </div>

          <div className="relative">
            <div className="text-8xl font-black text-slate-900 transition-all tabular-nums">
              {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
            </div>
            {isPaused && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                <span className="text-2xl font-bold text-slate-500 uppercase tracking-widest">Pausado</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => setIsPaused(!isPaused)} 
              className="bg-slate-100 p-6 rounded-2xl hover:bg-slate-200 transition-colors text-slate-900"
            >
              {isPaused ? <Play fill="currentColor" /> : "PAUSA"}
            </button>
            <button 
              onClick={nextExercise}
              className="bg-emerald-500 hover:bg-emerald-600 text-white p-6 rounded-2xl flex-1 font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              Próximo Exercício <SkipForward size={20} />
            </button>
          </div>
        </Card>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Treinos</h2>
          <p className="text-slate-500">Gere sugestões de treinos personalizados.</p>
        </div>
        <button 
          onClick={fetchSuggestedWorkouts}
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
        >
          <RefreshCw size={18} /> Gerar Treinos
        </button>
      </div>

      {state.workouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.workouts.map((workout) => (
            <Card key={workout.id} className="group hover:border-blue-500 transition-all cursor-pointer">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    workout.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-600' :
                    workout.difficulty === 'medium' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {workout.difficulty}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-sm">
                    <Clock size={14} /> {workout.duration}m
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-500 transition-colors">{workout.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mt-1">{workout.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {workout.exercises.slice(0, 3).map((ex, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 px-2 py-1 rounded-md text-slate-500">
                      {ex.name}
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => startWorkout(workout)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all"
                >
                  <Play size={18} fill="currentColor" /> Iniciar Treino
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white border border-slate-100 rounded-3xl flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
             <Search size={40} />
          </div>
          <div className="max-w-xs">
            <h3 className="text-xl font-bold text-slate-900">Sem treinos ativos</h3>
            <p className="text-slate-500 text-sm mt-1">Clique em "Gerar Treinos" para carregar novas sugestões personalizadas.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workouts;
