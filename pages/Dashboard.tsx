
import React from 'react';
import { AppState } from '../types';
import Card from '../components/Card';
import { Droplet, Dumbbell, Utensils, Trophy, ChevronRight, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Água
  const todayWater = state.hydration
    .filter(h => h.date.startsWith(today))
    .reduce((acc, curr) => acc + curr.amount, 0);
  const waterGoal = 3000;
  const waterPercent = Math.min((todayWater / waterGoal) * 100, 100);

  // Calorias e Macros REAIS do state
  const totalCalories = state.meals.reduce((acc, curr) => acc + curr.calories, 0);
  const protein = state.meals.reduce((acc, curr) => acc + curr.macros.protein, 0);
  const carbs = state.meals.reduce((acc, curr) => acc + curr.macros.carbs, 0);
  const fat = state.meals.reduce((acc, curr) => acc + curr.macros.fat, 0);
  
  const totalMacros = protein + carbs + fat || 1; // evitar divisão por zero
  const macroData = [
    { name: 'Proteína', value: Math.round((protein / totalMacros) * 100), color: '#3b82f6' },
    { name: 'Carbos', value: Math.round((carbs / totalMacros) * 100), color: '#10b981' },
    { name: 'Gordura', value: Math.round((fat / totalMacros) * 100), color: '#f59e0b' },
  ];

  // Gráfico Semanal (Vazio para novos usuários)
  const activityData = [
    { day: 'Seg', calories: 0 },
    { day: 'Ter', calories: 0 },
    { day: 'Qua', calories: 0 },
    { day: 'Qui', calories: 0 },
    { day: 'Sex', calories: 0 },
    { day: 'Sáb', calories: 0 },
    { day: 'Dom', calories: 0 },
  ];
  
  // Simples lógica para preencher o dia atual no gráfico se houver consumo
  const dayIndex = (new Date().getDay() + 6) % 7; // Ajusta para Seg-Dom
  activityData[dayIndex].calories = totalCalories;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md">
              <Trophy size={48} className="text-yellow-300" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold">Olá, {state.user.name || 'Usuário'}!</h3>
              <p className="opacity-90">
                {totalCalories === 0 && todayWater === 0 
                  ? "Bem-vindo! Vamos começar registrando sua primeira atividade?" 
                  : "Você está no caminho certo para suas metas."}
              </p>
            </div>
            <Link to="/profile" className="mt-2 sm:mt-0 sm:ml-auto bg-white text-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-slate-100 transition-colors">
              Perfil
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard 
              icon={<Droplet className="text-blue-500" />} 
              label="Hidratação" 
              value={`${todayWater}ml`} 
              target={`de ${waterGoal}ml`}
              percent={waterPercent}
              color="blue"
              link="/hydration"
            />
            <MetricCard 
              icon={<Dumbbell className="text-emerald-500" />} 
              label="Treinos" 
              value="0 min" 
              target="de 60 min"
              percent={0}
              color="emerald"
              link="/workouts"
            />
            <MetricCard 
              icon={<Utensils className="text-orange-500" />} 
              label="Calorias" 
              value={totalCalories.toLocaleString()} 
              target="de 2,100"
              percent={Math.min((totalCalories / 2100) * 100, 100)}
              color="orange"
              link="/diet"
            />
          </div>
        </div>

        <Card title="Atividade Semanal" className="h-full">
          <div className="h-48 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(59, 130, 246, 0.1)'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="calories" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-slate-500 text-sm">Resumo de consumo calórico</span>
            <div className="flex items-center text-slate-400 text-sm font-bold">
              <TrendingUp size={16} className="mr-1" />
              Iniciando...
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Distribuição Nutricional" subtitle="Macros de hoje">
          {totalCalories > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-4 w-full">
                {macroData.map(macro => (
                  <div key={macro.name} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span>{macro.name}</span>
                      <span>{macro.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${macro.value}%`, backgroundColor: macro.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 italic">
              Registre uma refeição na aba Dieta para ver a distribuição.
            </div>
          )}
        </Card>

        <Card 
          title="Conquistas Recentes" 
          headerAction={<Link to="/profile" className="text-blue-500 text-sm font-semibold hover:underline">Ver Todas</Link>}
        >
          <div className="space-y-4">
            {state.badges.filter(b => b.achieved).slice(0, 3).map(badge => (
              <div key={badge.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="text-3xl">{badge.icon}</div>
                <div>
                  <h4 className="font-bold text-slate-900">{badge.name}</h4>
                  <p className="text-xs text-slate-500">{badge.description}</p>
                </div>
                <div className="ml-auto text-emerald-500">
                  <Award size={20} />
                </div>
              </div>
            ))}
            {state.badges.filter(b => b.achieved).length === 0 && (
              <div className="text-center py-8 text-slate-500 italic">
                Nenhuma conquista ainda. Comece a rastrear para ganhar badges!
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  target: string;
  percent: number;
  color: string;
  link: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, target, percent, color, link }) => {
  return (
    <Link to={link} className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-lg group-hover:scale-110 transition-transform">{icon}</div>
        <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
      </div>
      <h4 className="text-sm font-medium text-slate-500 mb-1">{label}</h4>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs text-slate-400">{target}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 bg-${color}-500`} style={{ width: `${percent}%` }}></div>
      </div>
    </Link>
  );
};

export default Dashboard;
