import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function Settings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Стейт для налаштувань та тарифу
    const [aiPrompt, setAiPrompt] = useState('');
    const [planType, setPlanType] = useState('free'); // ДОДАНО
    const [saving, setSaving] = useState(false);

    // Модалки
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false); // ДОДАНО
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login'); return; }
        setUser(user);

        // ДОДАНО: Витягуємо також plan_type
        const { data } = await supabase
            .from('profiles')
            .select('ai_prompt, plan_type')
            .eq('id', user.id)
            .single();

        if (data) {
            setAiPrompt(data.ai_prompt || '');
            setPlanType(data.plan_type || 'free');
        }
        setLoading(false);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error("Пароль має бути не менше 6 символів!");
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            toast.error("Помилка: " + error.message);
        } else {
            toast.success("Пароль успішно змінено!");
            setIsPassModalOpen(false);
            setNewPassword('');
        }
    };

    const saveSettings = async (e) => {
        e.preventDefault();
        // Якщо безкоштовний тариф - не даємо зберегти
        if (planType === 'free') {
            setIsPaywallOpen(true);
            return;
        }

        setSaving(true);
        const { error } = await supabase.from('profiles').update({ ai_prompt: aiPrompt }).eq('id', user.id);
        if (error) toast.error("Не вдалося зберегти!");
        else toast.success("Налаштування AI оновлено!");
        setSaving(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (loading) return <div className="loading-screen">Завантаження...</div>;
    const handleSubscribe = async () => {
        try {
            // Отримуємо поточного юзера
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return toast.error("Будь ласка, увійдіть в систему!");

            // ВСТАВ СЮДИ СВІЙ PRICE ID ЗІ STRIPE
            const PRICE_ID = 'price_1TEtb3C7woZkJdzPKXTKL0P4';

            toast.loading("Готуємо сторінку оплати...", { id: 'stripe-loading' });

            const response = await fetch('https://psyscribe-pearl.vercel.app/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    userEmail: user.email,
                    priceId: PRICE_ID
                }),
            });

            const data = await response.json();
            toast.dismiss('stripe-loading');

            if (data.url) {
                // Магія: перенаправляємо користувача на безпечну сторінку Stripe!
                window.location.href = data.url;
            } else {
                toast.error("Не вдалося створити сесію: " + (data.error || "Невідома помилка"));
            }
        } catch (error) {
            console.error("Помилка:", error);
            toast.dismiss('stripe-loading');
            toast.error("Помилка з'єднання з сервером");
        }
    };

    return (
        <div className="dashboard-layout">
            {/* МОБІЛЬНИЙ ХЕДЕР ТА САЙДБАР */}
            <div className="mobile-header">
                <div className="db-logo"><div className="logo-dot"></div>PsyScribe</div>
                <button className="burger-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
            </div>

            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

            <aside className={`db-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>✕</button>
                <div className="db-logo"><div className="logo-dot"></div>PsyScribe</div>
                <nav className="db-nav">
                    <div className="nav-group">
                        <Link to="/dashboard" className="db-nav-link"><span>📊</span> Дашборд</Link>
                        <Link to="/clients" className="db-nav-link"><span>👥</span> Клієнти</Link>
                    </div>
                    <Link to="/settings" className="db-nav-link active"><span>⚙️</span> Налаштування</Link>
                </nav>
                <div className="db-user-card">
                    <div className="db-user-info">
                        <div className="db-avatar">{user?.email[0].toUpperCase()}</div>
                        <div className="db-user-text">
                            <p className="db-user-name">{user?.email.split('@')[0]}</p>
                            <p className="db-user-sub">Терапевт</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="db-logout-btn">Вийти</button>
                </div>
            </aside>

            <div className="db-content-wrapper">
                <main className="db-content">
                    <header className="cp-hero-card">
                        <div className="cp-hero-info">
                            <div className="cp-hero-title">
                                <div className="cp-hero-avatar" style={{ background: '#1f2024', color: '#c8a96e' }}>⚙️</div>
                                <div>
                                    <h1>Налаштування</h1>
                                    <p>Персоналізація вашого робочого простору</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <section className="settings-section">
                        <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '600px' }}>
                            <div className="db-stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '30px' }}>
                                <h3 style={{ margin: '0 0 20px 0', fontFamily: 'Playfair Display', fontSize: '20px' }}>Обліковий запис</h3>
                                <div style={{ width: '100%', marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#8a8d91', fontSize: '12px' }}>Email</label>
                                    <input type="text" value={user?.email} disabled className="modern-select" style={{ width: '100%', opacity: 0.5 }} />
                                </div>

                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    <button type="button" onClick={() => setIsPassModalOpen(true)} className="db-logout-btn" style={{ width: 'auto', padding: '10px 20px' }}>
                                        Змінити пароль
                                    </button>
                                </div>
                            </div>

                            {/* --- БЛОК AI АСИСТЕНТА З БЛОКУВАННЯМ ДЛЯ FREE --- */}
                            <div className="db-stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '30px', position: 'relative', overflow: 'hidden' }}>
                                <h3 style={{ margin: '0 0 20px 0', fontFamily: 'Playfair Display', fontSize: '20px', color: '#c8a96e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    AI Асистент
                                    {planType === 'free' && <span style={{ fontSize: '11px', background: '#333', color: '#fff', padding: '4px 8px', borderRadius: '6px', letterSpacing: '1px' }}>🔒 PRO</span>}
                                </h3>

                                <div style={{ width: '100%', opacity: planType === 'free' ? 0.3 : 1, pointerEvents: planType === 'free' ? 'none' : 'auto', transition: '0.3s' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#8a8d91', fontSize: '12px' }}>Вказівки для генерації нотаток</label>
                                    <textarea
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        className="modern-select"
                                        rows="4"
                                        style={{ width: '100%', resize: 'vertical' }}
                                        placeholder="Наприклад: Пиши максимально стисло, фокусуйся на емоційному стані клієнта..."
                                    />
                                    <p style={{ fontSize: '11px', color: '#555', marginTop: '8px' }}>Ці вказівки Gemini буде використовувати при кожній розшифровці сесії.</p>
                                </div>

                                {/* Оверлей для Free юзерів */}
                                {planType === 'free' && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(31, 32, 36, 0.6)', backdropFilter: 'blur(2px)', borderRadius: '16px' }}>
                                        <button type="button" className="new-session-btn" onClick={() => setIsPaywallOpen(true)} style={{ padding: '10px 24px', boxShadow: '0 4px 15px rgba(200, 169, 110, 0.2)' }}>
                                            Відкрити з PRO ✨
                                        </button>
                                    </div>
                                )}
                            </div>

                            {planType === 'pro' && (
                                <button type="submit" className="new-session-btn" style={{ alignSelf: 'flex-start' }} disabled={saving}>
                                    {saving ? 'Зберігаємо...' : 'Зберегти зміни'}
                                </button>
                            )}
                        </form>
                    </section>
                </main>
            </div>

            {/* --- МОДАЛКА ЗМІНИ ПАРОЛЯ --- */}
            {isPassModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="auth-logo" style={{marginBottom: '20px'}}>
                            <div className="logo-dot"></div>
                            Безпека акаунта
                        </div>
                        <h3 style={{fontFamily: 'Playfair Display', fontSize: '24px', marginBottom: '10px'}}>Зміна пароля</h3>
                        <p style={{color: '#8a8d91', fontSize: '14px', marginBottom: '25px'}}>Введіть новий надійний пароль для входу в систему.</p>

                        <form onSubmit={handleUpdatePassword}>
                            <div className="field">
                                <label>Новий пароль</label>
                                <input
                                    autoFocus
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Мінімум 6 символів"
                                    className="modern-select"
                                    style={{ width: '100%', marginTop: '8px' }}
                                    required
                                />
                            </div>
                            <div className="modal-actions" style={{marginTop: '30px'}}>
                                <button type="button" className="db-logout-btn" onClick={() => {setIsPassModalOpen(false); setNewPassword('');}}>Скасувати</button>
                                <button type="submit" className="new-session-btn" style={{ padding: '8px 24px' }}>Оновити пароль</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- МОДАЛКА PAYWALL (PRO ТАРИФ) --- */}
            {isPaywallOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ textAlign: 'center', padding: '40px 30px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚀</div>
                        <h3 style={{ fontFamily: 'Playfair Display', fontSize: '28px', color: '#c8a96e', marginBottom: '15px' }}>
                            Перейдіть на PRO
                        </h3>
                        <p style={{ color: '#8a8d91', fontSize: '15px', marginBottom: '25px', lineHeight: '1.6' }}>
                            Кастомні вказівки для ШІ доступні лише в PRO-версії. <br/>
                            Відкрийте безлімітний доступ та налаштуйте генерацію нотаток під свій унікальний стиль.
                        </p>

                        <div style={{ background: '#18191c', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #333' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '10px' }}>
                                $29.99 <span style={{ fontSize: '14px', color: '#8a8d91', fontWeight: 'normal' }}>/ місяць</span>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left', color: '#e8e6e0', fontSize: '14px' }}>
                                <li style={{ marginBottom: '8px' }}>✓ Необмежена кількість клієнтів</li>
                                <li style={{ marginBottom: '8px' }}>✓ Необмежена генерація SOAP-нотаток</li>
                                <li style={{ marginBottom: '8px' }}>✓ Кастомні налаштування ШІ</li>
                                <li style={{ color: '#c8a96e' }}>🎁 14 днів безкоштовно</li>
                            </ul>
                        </div>

                        <div className="modal-actions" style={{ justifyContent: 'center', gap: '15px' }}>
                            <button type="button" className="db-logout-btn" onClick={() => setIsPaywallOpen(false)}>Пізніше</button>
                            <button type="button" className="new-session-btn" onClick={handleSubscribe}>
                                Почати безкоштовний період
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}