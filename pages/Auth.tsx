
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Flame, Mail, Lock, User, Loader2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    // Validação básica client-side
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (signUpError) throw signUpError;
        
        setSuccess('Conta criada com sucesso! Verifique seu e-mail para confirmar (se necessário).');
      }
    } catch (err: any) {
      console.error("Auth error caught:", err);
      
      const message = err.message || '';
      
      // Tratamento específico para "Invalid login credentials"
      if (message.includes('Invalid login credentials') || err.status === 400) {
        setError('E-mail ou senha incorretos. Verifique seus dados ou crie uma nova conta.');
      } 
      // Tratamento para Rate Limit (o erro de 42 segundos)
      else if (message.includes('security purposes') || err.status === 429) {
        setError('Muitas tentativas. Por favor, aguarde cerca de 1 minuto antes de tentar novamente.');
      } 
      // Tratamento para usuário já existente
      else if (message.includes('User already registered')) {
        setError('Este e-mail já está em uso. Tente fazer login em vez de se cadastrar.');
      } 
      else {
        setError(message || 'Ocorreu um erro ao processar sua solicitação.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
            <Flame className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">HealthFlow</h1>
          <p className="text-slate-500 font-medium italic">Transforme sua rotina em bem-estar.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm animate-shake">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-xl flex items-start gap-3 text-sm">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{success}</div>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Seu Nome</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como devemos te chamar?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo 6 caracteres"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : isLogin ? 'Entrar no HealthFlow' : 'Criar minha Conta'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-sm font-bold text-blue-600 hover:underline"
            disabled={loading}
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se agora' : 'Já possui conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
