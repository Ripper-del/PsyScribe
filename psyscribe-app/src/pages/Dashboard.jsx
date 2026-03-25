import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast'; // Додали тости для красивих сповіщень

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [greeting, setGreeting] = useState('');
    const [loading, setLoading] = useState(true);

    // Стейт для мобільного меню
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Статистика та Тарифи
    const [stats, setStats] = useState({ clientsCount: 0, sessionsCount: 0, hoursSaved: 0 });
    const [recentClients, setRecentClients] = useState([]);
    const [planType, setPlanType] = useState('free'); // Стейт тарифу

    // Стейт для модалок
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false); // Стейт Пейволу
    const [newClientName, setNewClientName] = useState('');

    const navigate = useNavigate();

    const greetings = [
        "Готові допомагати сьогодні?", "Вітаємо у вашому кабінеті!", "Раді бачити вас знову!",
        "Ваші клієнти чекають на вас ✨", "Час для професійного зростання"
    ];

    useEffect(() => { initDashboard(); }, []);

    const initDashboard = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login'); return; }
        setUser(user);
        setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);

        // 1. Завантажуємо тариф
        const { data: profileData } = await supabase
            .from('profiles')
            .select('plan_type')
            .eq('id', user.id)
            .single();
        if (profileData) setPlanType(profileData.plan_type);

        // Передаємо user.id у функції, щоб фільтрувати тільки НАШИХ клієнтів
        await Promise.all([ fetchStats(user.id), fetchRecentClients(user.id) ]);
        setLoading(false);
    };

    const fetchStats = async (userId) => {
        try {
            // ДОДАНО: eq('user_id', userId) щоб рахувати тільки своїх
            const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', userId);
            const { count: sessionsCount } = await supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('user_id', userId);
            setStats({ clientsCount: clientsCount || 0, sessionsCount: sessionsCount || 0, hoursSaved: ((sessionsCount || 0) * 0.41).toFixed(1) });
        } catch (err) { console.error("Помилка статистики:", err); }
    };

    const fetchRecentClients = async (userId) => {
        // ДОДАНО: eq('user_id', userId)
        const { data } = await supabase.from('clients').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(8);
        if (data) setRecentClients(data);
    };

    // НОВА ФУНКЦІЯ: Перевірка лімітів перед відкриттям модалки
    const handleOpenAddClientModal = () => {
        if (planType === 'free' && stats.clientsCount >= 3) {
            setIsPaywallOpen(true);
        } else {
            setIsModalOpen(true);
        }
    };

    const handleAddClient = async (e) => {
        e.preventDefault();
        if (!newClientName.trim()) return;

        // ВИПРАВЛЕНО: Додаємо user_id при створенні клієнта!
        const { data, error } = await supabase
            .from('clients')
            .insert([{ name: newClientName, user_id: user.id }])
            .select();

        if (!error && data) {
            setRecentClients([data[0], ...recentClients].slice(0, 4));
            setStats(prev => ({ ...prev, clientsCount: prev.clientsCount + 1 }));
            setNewClientName('');
            setIsModalOpen(false);
            toast.success('Нового клієнта додано!');
        } else {
            toast.error('Помилка при додаванні: ' + error?.message);
        }
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

            const response = await fetch('$https://psyscribe-pearl.vercel.app//api/create-checkout-session', {
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

            {/* МОБІЛЬНИЙ ХЕДЕР */}
            <div className="mobile-header">
                <div className="db-logo"><div className="logo-dot"></div>PsyScribe</div>
                <button className="burger-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
            </div>

            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

            <aside className={`db-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>✕</button>

                <div className="db-logo">
                    <div className="logo-dot"></div>
                    PsyScribe
                </div>

                <nav className="db-nav">
                    <div className="nav-group">
                        <Link to="/dashboard" className="db-nav-link active"><span>📊</span> Дашборд</Link>
                        <Link to="/clients" className="db-nav-link"><span>👥</span> Клієнти</Link>
                    </div>
                    <Link to="/settings" className="db-nav-link"><span>⚙️</span> Налаштування</Link>
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

            {/* CONTENT */}
            <div className="db-content-wrapper">
                <main className="db-content">
                    <header className="cp-hero-card">
                        <div className="cp-hero-info">
                            <div className="cp-hero-title">
                                <div className="cp-hero-avatar" style={{ background: '#1f2024', color: '#c8a96e' }}>👋</div>
                                <div>
                                    <h1>{greeting}</h1>
                                    <p>Ваша практика під контролем AI.</p>
                                </div>
                            </div>
                        </div>
                        <Link to="/session" className="new-session-btn" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                            + Нова сесія
                        </Link>
                    </header>

                    <div className="db-section-label">Ваш реальний прогрес</div>

                    <section className="db-stats-grid">
                        <div className="db-stat-card">
                            <div className="stat-icon">🎙</div>
                            <div className="stat-data">
                                <span className="stat-num">{stats.sessionsCount}</span>
                                <span className="stat-desc">Сесій в базі</span>
                            </div>
                        </div>
                        <div className="db-stat-card">
                            <div className="stat-icon">👤</div>
                            <div className="stat-data">
                                <span className="stat-num">{stats.clientsCount}</span>
                                <span className="stat-desc">Клієнтів</span>
                            </div>
                        </div>
                        <div className="db-stat-card">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-data">
                                <span className="stat-num">{stats.hoursSaved}</span>
                                <span className="stat-desc">Годин заощаджено</span>
                            </div>
                        </div>
                    </section>

                    <section className="db-recent-section">
                        <div className="db-recent-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <h2 style={{ margin: 0, fontFamily: 'Playfair Display', fontSize: '24px' }}>Останні клієнти</h2>
                                {/* ВИКЛИКАЄМО НОВУ ФУНКЦІЮ ЗАМІСТЬ ПРОСТО setIsModalOpen */}
                                <button className="add-client-mini-btn" onClick={handleOpenAddClientModal} title="Додати нового клієнта">+</button>
                            </div>
                            <Link to="/clients" className="text-btn" style={{ textDecoration: 'none' }}>Всі клієнти →</Link>
                        </div>

                        {recentClients.length > 0 ? (
                            <div className="db-stats-grid" style={{marginBottom: 0}}>
                                {recentClients.map(client => (
                                    <div className="db-stat-card" key={client.id} style={{padding: '20px', cursor: 'pointer'}} onClick={() => navigate(`/clients/${client.id}`)}>
                                        <div className="db-avatar" style={{background: '#1f2024', color: '#c8a96e'}}>{client.name[0]}</div>
                                        <div className="stat-data">
                                            <span className="db-user-name">{client.name}</span>
                                            <span className="stat-desc">Переглянути профіль →</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="db-empty-state"><div className="empty-emoji">📭</div><h3>Поки що порожньо</h3><p>Додайте клієнта, щоб побачити його тут.</p></div>
                        )}
                    </section>
                </main>
            </div>

            {/* МОДАЛКА ДОДАВАННЯ КЛІЄНТА */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Новий клієнт</h3>
                        <form onSubmit={handleAddClient}>
                            <div className="field">
                                <label>Повне ім'я клієнта</label>
                                <input autoFocus type="text" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Напр. Олена Петренко" className="modern-select" style={{ width: '100%', marginTop: '8px' }} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="db-logout-btn" onClick={() => setIsModalOpen(false)}>Скасувати</button>
                                <button type="submit" className="new-session-btn" style={{ padding: '8px 16px' }}>Зберегти</button>
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
                            Ви досягли ліміту безкоштовного тарифу (3 клієнти). <br/>
                            Відкрийте безлімітний доступ до створення клієнтів та генерації нотаток, щоб масштабувати свою практику.
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