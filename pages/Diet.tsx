
import React, { useState } from 'react';
import { AppState, Meal } from '../types';
import Card from '../components/Card';
import { Plus, Utensils, Search, Sparkles, X, ChevronRight, Loader2, CookingPot, Info } from 'lucide-react';
import { getMealSuggestions } from '../services/geminiService';

interface DietProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const Diet: React.FC<DietProps> = ({ state, updateState }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const addIngredient = () => {
    const val = inputValue.trim().toLowerCase();
    if (val && !ingredients.includes(val)) {
      setIngredients([...ingredients, val]);
      setInputValue('');
    }
  };

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const generateAIPlannedMeals = async () => {
    if (ingredients.length === 0) {
      alert("Adicione pelo menos um ingrediente para a IA trabalhar!");
      return;
    }
    
    setLoading(true);
    try {
      const suggestedMeals = await getMealSuggestions(ingredients);
      if (suggestedMeals && suggestedMeals.length > 0) {
        updateState(prev => ({ ...prev, meals: suggestedMeals }));
      } else {
        alert("Não consegui gerar receitas agora. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalCalories = state.meals.reduce((acc, curr) => acc + curr.calories, 0);
  const protein = state.meals.reduce((acc, curr) => acc + curr.macros.protein, 0);
  const carbs = state.meals.reduce((acc, curr) => acc + curr.macros.carbs, 0);
  const fat = state.meals.reduce((acc, curr) => acc + curr.macros.fat, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card title="Sua Despensa" subtitle="A IA criará receitas com base nisso" className="border-orange-100">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  placeholder="ex: Frango, Brócolis..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <button 
                  onClick={addIngredient}
                  className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 transition-colors"
                >
                  <Plus size={24} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[60px] content-start">
                {ingredients.map(ing => (
                  <span key={ing} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                    {ing}
                    <button onClick={() => removeIngredient(ing)} className="hover:text-orange-800"><X size={14} /></button>
                  </span>
                ))}
                {ingredients.length === 0 && <p className="text-slate-400 text-sm italic py-2">Liste o que você tem em casa.</p>}
              </div>

              <button 
                onClick={generateAIPlannedMeals}
                disabled={loading || ingredients.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                {loading ? 'Consultando Chef IA...' : 'Gerar Receitas com IA'}
              </button>
            </div>
          </Card>

          <Card title="Metas Nutricionais">
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-4xl font-black text-slate-900">{totalCalories}</span>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Calorias Sugeridas</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <MacroStat label="Proteína" value={protein} unit="g" color="blue" />
                <MacroStat label="Carbos" value={carbs} unit="g" color="emerald" />
                <MacroStat label="Gordura" value={fat} unit="g" color="orange" />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Utensils className="text-orange-500" />
            Sugestões da IA
          </h2>

          <div className="space-y-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-blue-600"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
                </div>
                <p className="text-slate-500 animate-pulse font-medium">Criando pratos personalizados para você...</p>
              </div>
            ) : state.meals.length > 0 ? (
              state.meals.map((meal, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedMeal(meal)}
                  className="group bg-white border border-slate-200 p-6 rounded-3xl hover:border-blue-400 transition-all cursor-pointer shadow-sm relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                      <Utensils size={32} className="text-orange-500" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                          {meal.type === 'breakfast' ? 'Café da Manhã' : meal.type === 'lunch' ? 'Almoço' : 'Jantar'}
                        </span>
                        <div className="text-slate-900 font-black">{meal.calories} kcal</div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-500 transition-colors">{meal.name}</h3>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>P: {meal.macros.protein}g</span>
                        <span>C: {meal.macros.carbs}g</span>
                        <span>G: {meal.macros.fat}g</span>
                      </div>
                      <p className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-2">
                        <Info size={14} /> Clique para ver o modo de preparo
                      </p>
                    </div>
                    <div className="flex items-center">
                      <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-all" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Search size={48} className="mx-auto text-slate-300 mb-4" />
                <h4 className="text-lg font-bold text-slate-900">Nenhuma receita gerada</h4>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto">Adicione os ingredientes que você tem e a IA criará o plano perfeito.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes da Receita */}
      {selectedMeal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300 border border-slate-200">
            <div className="sticky top-0 bg-white/90 backdrop-blur-md px-8 py-6 border-b border-slate-100 flex justify-between items-center z-10">
              <h3 className="text-2xl font-black text-slate-900">{selectedMeal.name}</h3>
              <button 
                onClick={() => setSelectedMeal(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-900"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl text-center">
                  <p className="text-blue-600 text-lg font-black">{selectedMeal.calories}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Calorias</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl text-center">
                  <p className="text-emerald-600 text-lg font-black">{selectedMeal.macros.protein}g</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Proteína</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-2xl text-center">
                  <p className="text-orange-600 text-lg font-black">{selectedMeal.macros.carbs}g</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Carbos</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl text-center">
                  <p className="text-purple-600 text-lg font-black">{selectedMeal.macros.fat}g</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gordura</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Utensils size={20} className="text-orange-500" /> Ingredientes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMeal.ingredients.map((ing, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl text-sm font-medium lowercase">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CookingPot size={20} className="text-blue-500" /> Modo de Preparo
                </h4>
                <div className="space-y-4">
                  {selectedMeal.preparationSteps && selectedMeal.preparationSteps.length > 0 ? (
                    selectedMeal.preparationSteps.map((step, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-8 h-8 shrink-0 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-sm">
                          {i + 1}
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic">Modo de preparo não disponível.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-8 border-t border-slate-100">
              <button 
                onClick={() => setSelectedMeal(null)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black transition-transform active:scale-95"
              >
                Entendido, Mãos à Obra!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MacroStat: React.FC<{ label: string; value: number; unit: string; color: string }> = ({ label, value, unit, color }) => {
  const colorMap: {[key: string]: string} = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    orange: 'text-orange-600'
  };
  return (
    <div className="bg-slate-50 p-3 rounded-2xl text-center">
      <div className={`text-sm font-black ${colorMap[color]}`}>{value}{unit}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{label}</div>
    </div>
  );
};

export default Diet;
