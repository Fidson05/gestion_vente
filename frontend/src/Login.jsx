import React from 'react';
import { Package } from 'lucide-react';

function Login({ 
  username, setUsername, 
  password, setPassword, 
  email, setEmail, 
  isRegister, setIsRegister, 
  authError, setAuthError, 
  handleAuth 
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-2xl shadow-xl border border-slate-700">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-indigo-600 rounded-full text-white mb-2">
            <Package size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isRegister ? 'Créer un compte vendeur' : 'Gestion de Stock & Ventes'}
          </h2>
        </div>
        
        {authError && (
          <div className="p-3 mb-4 text-sm text-center rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800">
            {authError}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nom d'utilisateur</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500" />
          </div>
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition">
            {isRegister ? "✨ S'inscrire" : "🔑 Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button type="button" onClick={() => { setIsRegister(!isRegister); setAuthError(''); }} className="text-sm text-indigo-400 hover:underline bg-transparent border-none cursor-pointer">
            {isRegister ? "Déjà un compte ? Connectez-vous" : "Pas de compte ? Créez-en un"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;