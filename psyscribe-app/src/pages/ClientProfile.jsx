import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ClientProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [client, setClient] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSession, setExpandedSession] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            const { data: c } = await supabase.from('clients').select('*').eq('id', id).single();
            const { data: s } = await supabase.from('sessions').select('*').eq('client_id', id).order('created_at', { ascending: false });

            setClient(c);
            setSessions(s || []);
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (loading) return <div className="loading-screen">Завантаження профілю...</div>;

    return (
        <div className="dashboard-layout">
            {/* SIDEBAR - такий самий як на Dashboard */}
            <aside className="db-sidebar">
                <div className="db-logo">
                    <div className="logo-dot"></div>
                    PsyScribe
                </div>

                <nav className="db-nav">
                    <div className="nav-group">
                        <button onClick={() => navigate('/dashboard')} className="db-nav-link" style={{background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left'}}>
                            <span>📊</span> Дашборд
                        </button>
                        <a href="#" className="db-nav-link active"><span>👥</span> Клієнти</a>
                    </div>
                    <a href="#" className="db-nav-link"><span>⚙️</span> Налаштування</a>
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

            {/* MAIN CONTENT */}
            <div className="db-content-wrapper">
                <main className="db-content">
                    <div className="cp-hero-card">
                        <div className="cp-hero-info">
                            <button onClick={() => navigate('/dashboard')} className="text-btn back-btn">
                                ← Назад до кабінету
                            </button>

                            <div className="cp-hero-title">
                                <div className="cp-hero-avatar">{client?.name[0].toUpperCase()}</div>
                                <div>
                                    <h1>{client?.name}</h1>
                                    <p>Повна історія сесій та аналітика</p>
                                </div>
                            </div>
                        </div>

                        <button className="new-session-btn" onClick={() => navigate('/session')}>
                            + Нова сесія
                        </button>
                    </div>

                    <div className="db-section-label">Архів зустрічей ({sessions.length})</div>

                    <div className="cp-sessions-list">
                        {sessions.length > 0 ? (
                            sessions.map(session => (
                                <div
                                    key={session.id}
                                    className={`db-stat-card cp-session-card ${expandedSession === session.id ? 'expanded' : ''}`}
                                    onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                                >
                                    <div className="cp-session-header">
                                        <div className="stat-icon">📅</div>
                                        <div className="stat-data">
                      <span className="stat-num" style={{fontSize: '20px'}}>
                        {new Date(session.created_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                                            <span className="stat-desc">{session.therapy_type || 'Загальна сесія'}</span>
                                        </div>
                                        <div className="cp-expand-icon">{expandedSession === session.id ? '−' : '+'}</div>
                                    </div>

                                    {expandedSession === session.id && (
                                        <div className="cp-soap-details">
                                            <div className="db-stats-grid" style={{marginTop: '20px', gridTemplateColumns: '1fr 1fr', marginBottom: 0}}>
                                                {session.soap_note && Object.entries(session.soap_note).map(([key, value]) => (
                                                    <div key={key} className="db-stat-card" style={{padding: '20px', background: '#1c1d21', border: 'none'}}>
                                                        <div className="stat-data">
                                                            <span className="stat-desc" style={{color: '#c8a96e', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px'}}>{key}</span>
                                                            <span className="db-user-name" style={{fontSize: '14px', whiteSpace: 'normal', lineHeight: '1.5'}}>{value}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="db-empty-state">
                                <p>У цього клієнта ще не було проведених сесій.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}