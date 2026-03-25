import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AuthPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    // Стандартна авторизація по Email
    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = isLogin
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Успішний вхід!');
            navigate('/dashboard');
        }
        setLoading(false);
    };

    // МАГІЯ: Авторизація через Google
    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Повертаємо юзера сюди після успішного логіну (зміни порт, якщо у тебе інший!)
                redirectTo: '${window.location.origin}/dashboard'
            }
        });

        if (error) toast.error("Помилка Google: " + error.message);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="logo-dot"></div>
                    PsyScribe
                </div>

                <h2 className="auth-title">{isLogin ? 'З поверненням' : 'Створити акаунт'}</h2>
                <p className="auth-subtitle">Увійдіть, щоб продовжити роботу з клієнтами</p>

                {/* КНОПКА GOOGLE */}
                <button onClick={handleGoogleLogin} className="google-btn">
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Продовжити з Google
                </button>

                <div className="auth-divider">
                    <span>або</span>
                </div>

                <form onSubmit={handleAuth} className="auth-form">
                    <div className="field">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="doctor@clinic.com"
                            required
                        />
                    </div>
                    <div className="field">
                        <label>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="new-session-btn" style={{width: '100%', marginTop: '10px'}} disabled={loading}>
                        {loading ? 'Зачекайте...' : (isLogin ? 'Увійти' : 'Зареєструватися')}
                    </button>
                </form>

                <div className="auth-footer">
                    {isLogin ? "Немає акаунта?" : "Вже є акаунт?"}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-btn" style={{marginLeft: '8px', display: 'inline'}}>
                        {isLogin ? "Створити зараз" : "Увійти"}
                    </button>
                </div>
            </div>
        </div>
    );
}