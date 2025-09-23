// pages/Login.jsx 1
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../styles/login.css';

const Login = () => {
  const handleResetPassword = async () => {
    if (!email) {
      setMessage({
        type: 'error',
        content: 'Veuillez entrer votre email pour réinitialiser votre mot de passe.'
      });
      return;
    }
    setLoading(true);
    setMessage({ type: '', content: '' });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMessage({
        type: 'success',
        content: 'Un email de réinitialisation a été envoyé!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        content: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    // Vérifier si on a une session active au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.reload();
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });
    try {
      if (isLogin) {
        // Connexion
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage({
          type: 'success',
          content: 'Connexion réussie! Redirection...'
        });
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        // Inscription - seulement pour les administrateurs
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'admin'
            }
          }
        });
        if (error) throw error;
        setMessage({
          type: 'success',
          content: 'Inscription réussie! Un email de confirmation a été envoyé.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        content: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-container">
      <div className="login-card glass-effect animate-fade-in">
        <div className="login-header">
              <img src="/logo-SOGEPI.png" alt="Logo SOGEPI" className="login-logo" style={{marginBottom: '12px'}} />
          <h1 style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
            <span style={{fontWeight:800,letterSpacing:'1px'}}>SOGEPI Afrique S.A.R.L.</span>
            <span style={{fontSize:'1.5rem',color:'#228b22'}}>🌱</span>
          </h1>
          <p style={{fontSize:'1.05rem',color:'#228b22',fontWeight:500}}>Système de Gestion Interne</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          {message.content && (
            <div className={`message ${message.type}`}>{message.content}</div>
          )}

          <button 
            type="submit" 
            className="login-btn modern-btn"
            disabled={loading}
            style={{fontSize:'1.1rem',fontWeight:700,letterSpacing:'0.5px'}}
          >
            {loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'Créer un compte'}
          </button>
        </form>

        <div className="login-footer">
          <button 
            type="button" 
            className="switch-mode-btn"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            {isLogin ? 'Créer un compte administrateur' : 'Déjà un compte? Se connecter'}
          </button>

          {isLogin && (
            <button 
              type="button" 
              className="forgot-password-btn"
              onClick={handleResetPassword}
              disabled={loading}
            >
              Mot de passe oublié?
            </button>
          )}
        </div>

        <div className="login-info">
          <h3 style={{fontWeight:700,letterSpacing:'1px'}}>À propos de SOGEPI Afrique</h3>
          <p>Spécialiste en:</p>
          <ul>
            <li>✅ Moto-pompes</li>
            <li>✅ Matériels agricoles</li>
            <li>✅ Services de forage</li>
            <li>✅ Services d'irrigation</li>
          </ul>
          <p className="contact-info">
            Contact: <span style={{fontWeight:600}}>+221 77 606 29 00</span> | <span style={{fontWeight:600}}>contact@sogepi-afrique.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;