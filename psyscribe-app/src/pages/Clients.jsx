import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function Clients() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Дані
    const [clients, setClients] = useState([]);
    const [planType, setPlanType] = useState('free');

    // Модалки
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [newClientName, setNewClientName] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login'); return; }
        setUser(user);

        // 1. Завантажуємо тариф
        const { data: profileData } = await supabase
            .from('profiles')
            .select('plan_type')
            .eq('id', user.id)
            .single();

        if (profileData) setPlanType(profileData.plan_type || 'free');

        // 2. Завантажуємо клієнтів (Сортуємо за датою створення: найстаріші перші)
        // Це важливо, щоб при даунгрейді перші 3 клієнти залишилися легальними
        const { data: clientsData, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (error) {
            toast.error("Помилка завантаження клієнтів");
        } else {
            setClients(clientsData || []);
        }

        setLoading(false);
    };

    const handleOpenAddClientModal = () => {
        if (planType === 'free' && clients.length >= 3) {
            setIsPaywallOpen(true);
        } else {
            setIsModalOpen(true);
        }
    };

    const handleAddClient = async (e) => {
        e.preventDefault();
        if (!newClientName.trim()) return;

        // Додаємо user_id, щоб клієнт не був "нічиїм"
        const { data, error } = await supabase
            .from('clients')
            .insert([{ name: newClientName, user_id: user.id }])
            .select();

        if (!error && data) {
            setClients([...clients, data[0]]);
            setNewClientName('');
            setIsModalOpen(false);
            toast.success('Нового клієнта успішно додано!');
        } else {
            toast.error('Помилка при додаванні: ' + error?.message);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (loading) return <div className="loading-screen">Завантаження...</div>;

    // Реверсуємо масив для відображення, щоб нові були зверху,
    // але зберігаємо оригінальний індекс для перевірки блокування
    const displayClients = [...clients].reverse();
    const handleSubscribe = async () => {
        try {
            // Отримуємо поточного юзера
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return toast.error("Будь ласка, увійдіть в систему!");

            // ВСТАВ СЮДИ СВІЙ PRICE ID ЗІ STRIPE
            const PRICE_ID = 'price_1TEtb3C7woZkJdzPKXTKL0P4';

            toast.loading("Готуємо сторінку оплати...", { id: 'stripe-loading' });

            const response = await fetch('http://localhost:3000/api/create-checkout-session', {
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
                        <Link to="/clients" className="db-nav-link active"><span>👥</span> Клієнти</Link>
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

            {/* ОСНОВНИЙ КОНТЕНТ */}
            <div className="db-content-wrapper">
                <main className="db-content">
                    <header className="cp-hero-card">
                        <div className="cp-hero-info">
                            <div className="cp-hero-title">
                                <div className="cp-hero-avatar" style={{ background: '#1f2024', color: '#c8a96e' }}>👥</div>
                                <div>
                                    <h1>Ваші клієнти</h1>
                                    <p>Управління базою та історією сесій</p>
                                </div>
                            </div>
                        </div>
                        <button className="new-session-btn" onClick={handleOpenAddClientModal}>
                            + Додати клієнта
                        </button>
                    </header>

                    <section className="db-recent-section" style={{ marginTop: '30px' }}>
                        {clients.length > 0 ? (
                            <div className="db-stats-grid">
                                {displayClients.map((client) => {
                                    // Знаходимо реальний індекс клієнта в хронологічному масиві
                                    const realIndex = clients.findIndex(c => c.id === client.id);
                                    const isLocked = planType === 'free' && realIndex >= 3;

                                    return (
                                        <div
                                            className="db-stat-card"
                                            key={client.id}
                                            style={{
                                                padding: '24px',
                                                cursor: isLocked ? 'not-allowed' : 'pointer',
                                                opacity: isLocked ? 0.6 : 1,
                                                position: 'relative',
                                                border: isLocked ? '1px solid #333' : ''
                                            }}
                                            onClick={() => {
                                                if (isLocked) {
                                                    setIsPaywallOpen(true);
                                                } else {
                                                    navigate(`/clients/${client.id}`);
                                                }
                                            }}
                                        >
                                            {isLocked && (
                                                <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#1f2024', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', color: '#8a8d91', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    🔒 PRO
                                                </div>
                                            )}

                                            <div className="db-avatar" style={{ background: '#1f2024', color: isLocked ? '#555' : '#c8a96e', width: '50px', height: '50px', fontSize: '20px', marginBottom: '15px' }}>
                                                {client.name[0]}
                                            </div>
                                            <div className="stat-data">
                                                <span className="db-user-name" style={{ fontSize: '18px', color: isLocked ? '#8a8d91' : '#e8e6e0' }}>{client.name}</span>
                                                <span className="stat-desc" style={{ marginTop: '8px' }}>
                                                    {isLocked ? 'Доступ заблоковано' : 'Відкрити картку →'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="db-empty-state">
                                <div className="empty-emoji">📭</div>
                                <h3>У вас ще немає клієнтів</h3>
                                <p>Додайте свого першого клієнта, щоб почати роботу.</p>
                                <button className="new-session-btn" onClick={handleOpenAddClientModal} style={{ marginTop: '15px' }}>
                                    + Додати клієнта
                                </button>
                            </div>
                        )}
                    </section>
                </main>
            </div>

            {/* --- МОДАЛКА ДОДАВАННЯ КЛІЄНТА --- */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Новий клієнт</h3>
                        <form onSubmit={handleAddClient}>
                            <div className="field">
                                <label>Повне ім'я клієнта</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    placeholder="Напр. Олена Петренко"
                                    className="modern-select"
                                    style={{ width: '100%', marginTop: '8px' }}
                                />
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
                            Ви досягли ліміту безкоштовного тарифу. <br/>
                            Відкрийте безлімітний доступ до всіх клієнтів та генерації нотаток.
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