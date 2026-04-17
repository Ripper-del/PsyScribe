import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="landing-container" style={{ backgroundColor: '#131417', minHeight: '100vh', overflowX: 'hidden', position: 'relative', fontFamily: 'Inter, sans-serif' }}>

            {/* АТМОСФЕРНІ ФОНОВІ СВІТІННЯ */}
            <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '100vw', height: '600px', background: 'radial-gradient(ellipse at top, rgba(200, 169, 110, 0.15), transparent 70%)', zIndex: 0, pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', bottom: '20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(200, 169, 110, 0.05), transparent 70%)', zIndex: 0, pointerEvents: 'none' }}></div>

            {/* ХЕДЕР */}
            <header style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 5%', maxWidth: '100%', margin: '0 auto' }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#c8a96e', borderRadius: '50%', boxShadow: '0 0 10px rgba(200, 169, 110, 0.5)' }}></div>
                    <span style={{ fontFamily: 'Playfair Display', fontSize: '24px', fontWeight: 'bold', color: '#e8e6e0', letterSpacing: '0.5px' }}>PsyScribe</span>
                </Link>

                <nav style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <a href="#pricing" style={{ textDecoration: 'none', color: '#8a8d91', fontSize: '15px', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#e8e6e0'} onMouseOut={e => e.target.style.color = '#8a8d91'}>Тарифи</a>
                    <Link to="/login" style={{ textDecoration: 'none', color: '#e8e6e0', fontSize: '15px', fontWeight: '500' }}>Увійти</Link>
                    <Link to="/login" className="new-session-btn" style={{ padding: '10px 24px', borderRadius: '8px', fontSize: '15px' }}>Спробувати безкоштовно</Link>
                </nav>
            </header>

            {/* HERO СЕКЦІЯ */}
            <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '120px 20px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: 'rgba(200, 169, 110, 0.1)', border: '1px solid rgba(200, 169, 110, 0.2)', color: '#c8a96e', padding: '8px 16px', borderRadius: '30px', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '30px', backdropFilter: 'blur(10px)' }}>
                    Надійна підтримка вашої практики
                </div>

                <h1 style={{ fontFamily: 'Playfair Display', fontSize: '64px', color: '#e8e6e0', margin: '0 0 30px 0', lineHeight: '1.1', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    Ви дбаєте про психічне здоров'я людей.<br />
                    <span style={{ color: '#c8a96e', fontStyle: 'italic' }}>Ми дбаємо про ваш час.</span>
                </h1>

                <p style={{ color: '#8a8d91', fontSize: '20px', lineHeight: '1.6', maxWidth: '700px', marginBottom: '50px' }}>
                    AI-асистент для психотерапевтів, який автоматично перетворює розмову на структуровані клінічні SOAP-нотатки за лічені секунди.
                </p>

                <div className="hero-actions-wrapper" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <Link to="/login" className="new-session-btn hero-cta-btn" style={{ padding: '16px 36px', fontSize: '18px', borderRadius: '12px', boxShadow: '0 8px 25px rgba(200, 169, 110, 0.25)' }}>
                        Почати роботу
                    </Link>
                    <a href="#pricing" className="db-logout-btn hero-cta-btn" style={{ padding: '16px 36px', fontSize: '18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        Дивитись тарифи
                    </a>
                </div>
            </section>

            {/* БЛОК ПРОБЛЕМИ (РОЗШИРЕНИЙ) */}
            <section style={{ position: 'relative', zIndex: 10, padding: '100px 5%', maxWidth: '100%', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                    <div style={{ background: 'linear-gradient(145deg, rgba(31,32,36,0.6) 0%, rgba(24,25,28,0.8) 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', backdropFilter: 'blur(20px)', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                        <h3 style={{ fontSize: '24px', color: '#e8e6e0', marginBottom: '15px' }}>20 хвилин на сесію</h3>
                        <p style={{ color: '#8a8d91', fontSize: '16px', lineHeight: '1.6' }}>Саме стільки в середньому витрачає терапевт на рутинну писанину після зустрічі з клієнтом.</p>
                    </div>
                    <div style={{ background: 'linear-gradient(145deg, rgba(31,32,36,0.6) 0%, rgba(24,25,28,0.8) 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', backdropFilter: 'blur(20px)', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔋</div>
                        <h3 style={{ fontSize: '24px', color: '#e8e6e0', marginBottom: '15px' }}>Вигорання</h3>
                        <p style={{ color: '#8a8d91', fontSize: '16px', lineHeight: '1.6' }}>Більше половини спеціалістів відмовляються від нових клієнтів через надмірне адміністративне навантаження.</p>
                    </div>
                    <div style={{ background: 'linear-gradient(145deg, rgba(31,32,36,0.6) 0%, rgba(24,25,28,0.8) 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', backdropFilter: 'blur(20px)', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚖️</div>
                        <h3 style={{ fontSize: '24px', color: '#e8e6e0', marginBottom: '15px' }}>Баланс життя</h3>
                        <p style={{ color: '#8a8d91', fontSize: '16px', lineHeight: '1.6' }}>Поверніть собі до 3-х годин щодня. Присвятіть їх професійному розвитку, відпочинку або родині.</p>
                    </div>
                </div>
            </section>

            {/* ЦІНОУТВОРЕННЯ (ШИРОКЕ ТА КРАСИВЕ) */}
            <section id="pricing" style={{ position: 'relative', zIndex: 10, padding: '120px 5%', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '70px' }}>
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: '42px', color: '#e8e6e0', margin: '0 0 15px 0' }}>Прозорі тарифи для вашої практики</h2>
                    <p style={{ color: '#8a8d91', fontSize: '18px' }}>Почніть безкоштовно, масштабуйтеся коли будете готові.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px', alignItems: 'center' }}>

                    {/* ТАРИФ: FREE */}
                    <div style={{ background: 'rgba(31,32,36,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px', padding: '50px', backdropFilter: 'blur(10px)' }}>
                        <h3 style={{ fontSize: '28px', margin: '0 0 10px 0', color: '#e8e6e0' }}>Базовий</h3>
                        <p style={{ color: '#8a8d91', marginBottom: '40px', fontSize: '16px' }}>Для знайомства з можливостями AI.</p>

                        <div style={{ fontSize: '56px', fontWeight: 'bold', color: '#fff', marginBottom: '40px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                            $0 <span style={{ fontSize: '18px', color: '#8a8d91', fontWeight: 'normal' }}>назавжди</span>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 50px 0', color: '#e8e6e0', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '16px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ color: '#c8a96e' }}>✓</span> До 3-х клієнтів у базі</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ color: '#c8a96e' }}>✓</span> До 2-х сесій на клієнта</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ color: '#c8a96e' }}>✓</span> Стандартна генерація SOAP</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#555' }}><span>✗</span> Кастомні вказівки для ШІ</li>
                        </ul>

                        {/* КНОПКА FREE: Додано ефект підскакування */}
                        <Link
                            to="/login"
                            style={{
                                display: 'block',
                                textAlign: 'center',
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#e8e6e0',
                                textDecoration: 'none',
                                fontSize: '16px',
                                transition: 'background 0.2s, transform 0.2s ease-out', // Додано transform у transition
                                transform: 'translateY(0)' // Початковий стан
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.transform = 'translateY(-5px)'; // Підскакування вгору
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.transform = 'translateY(0)'; // Повернення
                            }}
                        >
                            Створити безкоштовний акаунт
                        </Link>
                    </div>

                    {/* ТАРИФ: PRO */}
                    <div style={{ background: 'linear-gradient(180deg, rgba(40,35,30,0.8) 0%, rgba(24,25,28,0.9) 100%)', border: '1px solid #c8a96e', borderRadius: '30px', padding: '60px 50px', position: 'relative', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        <div style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', background: '#c8a96e', color: '#111', padding: '8px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px' }}>
                            БЕЗЛІМІТНА ПРАКТИКА
                        </div>

                        <h3 style={{ fontSize: '28px', margin: '0 0 10px 0', color: '#c8a96e' }}>PsyScribe PRO</h3>
                        <p style={{ color: '#8a8d91', marginBottom: '40px', fontSize: '16px' }}>Повний контроль та економія часу.</p>

                        <div style={{ fontSize: '56px', fontWeight: 'bold', color: '#fff', marginBottom: '40px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                            $29.99 <span style={{ fontSize: '18px', color: '#8a8d91', fontWeight: 'normal' }}>/ місяць</span>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 50px 0', color: '#e8e6e0', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '16px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ color: '#c8a96e', fontSize: '20px' }}>✓</span> <b>Необмежена</b> кількість клієнтів</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ color: '#c8a96e', fontSize: '20px' }}>✓</span> <b>Необмежена</b> генерація нотаток</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ color: '#c8a96e', fontSize: '20px' }}>✓</span> <b>Кастомні промпти</b> для ШІ</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ color: '#c8a96e', fontSize: '20px' }}>✓</span> Пріоритетна підтримка</li>
                        </ul>

                        {/* КНОПКА PRO: Додано ефект підскакування */}
                        <Link
                            to="/login"
                            className="new-session-btn"
                            style={{
                                display: 'block',
                                textAlign: 'center',
                                padding: '18px',
                                borderRadius: '12px',
                                fontSize: '18px',
                                textDecoration: 'none',
                                boxShadow: '0 8px 25px rgba(200, 169, 110, 0.3)',
                                transition: 'background 0.2s, transform 0.2s ease-out', // Додано transform у transition
                                transform: 'translateY(0)' // Початковий стан
                            }}
                            onMouseOver={e => {
                                // Ми не міняємо фон, бо він заданий класом new-session-btn,
                                // але додаємо підскакування
                                e.currentTarget.style.transform = 'translateY(-5px)';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Почати безкоштовно (14 днів)
                        </Link>
                    </div>

                </div>
            </section>

            {/* ФУТЕР */}
            <footer style={{ position: 'relative', zIndex: 10, padding: '40px 5%', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#8a8d91' }}>
                        <div style={{ width: '10px', height: '10px', background: '#555', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: '18px', fontFamily: 'Playfair Display' }}>PsyScribe</span>
                    </div>
                    <div style={{ display: 'flex', gap: '30px' }}>
                        <Link
                            to="/privacy-policy"
                            style={{ color: '#8a8d91', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                            onMouseOver={e => e.target.style.color = '#e8e6e0'}
                            onMouseOut={e => e.target.style.color = '#8a8d91'}
                        >
                            Політика конфіденційності
                        </Link>
                        <a href="mailto:vladyslav.marinov@gmail.com" style={{ color: '#8a8d91', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#e8e6e0'} onMouseOut={e => e.target.style.color = '#8a8d91'}>Підтримка</a>
                    </div>
                </div>
                <div style={{ textAlign: 'center', color: '#555', marginTop: '40px', fontSize: '13px' }}>
                    &copy; 2026 PsyScribe. Розроблено для терапевтів.
                </div>
            </footer>
        </div>
    );
}