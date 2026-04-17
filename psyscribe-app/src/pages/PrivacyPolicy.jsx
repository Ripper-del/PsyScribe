import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    // Прокручуємо сторінку вгору при відкритті
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="privacy-page" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: '#e8e6e0', fontFamily: 'Inter, sans-serif' }}>
            <button
                onClick={() => navigate(-1)}
                style={{ background: 'none', border: 'none', color: '#c8a96e', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}
            >
                ← Назад
            </button>

            <h1 style={{ fontFamily: 'Playfair Display', color: '#c8a96e', marginBottom: '30px' }}>Політика конфіденційності PsyScribe</h1>

            <p style={{ color: '#8a8d91', marginBottom: '20px' }}>Останнє оновлення: {new Date().toLocaleDateString()}</p>

            <section style={{ marginBottom: '30px', lineHeight: '1.6' }}>
                <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '15px' }}>1. Вступ</h2>
                <p>Вітаємо у PsyScribe. Ми розуміємо абсолютну важливість медичної та психотерапевтичної таємниці. Ця Політика конфіденційності пояснює, як ми збираємо, використовуємо та захищаємо ваші дані та дані ваших клієнтів.</p>
            </section>

            <section style={{ marginBottom: '30px', lineHeight: '1.6' }}>
                <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '15px' }}>2. Які дані ми збираємо</h2>
                <ul style={{ paddingLeft: '20px', color: '#d1d1d1' }}>
                    <li style={{ marginBottom: '10px' }}><b>Облікові дані:</b> Ваша електронна адреса (надійно зберігається через Supabase Auth).</li>
                    <li style={{ marginBottom: '10px' }}><b>Дані сесій:</b> Текстові транскрипції, створені під час запису, та згенеровані SOAP-нотатки.</li>
                    <li style={{ marginBottom: '10px' }}><b>Платіжні дані:</b> Ми не зберігаємо дані ваших карток. Усі транзакції безпечно обробляються сервісом Stripe.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '30px', lineHeight: '1.6' }}>
                <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '15px' }}>3. Використання Штучного Інтелекту (Google Gemini)</h2>
                <p>PsyScribe використовує Google Gemini API для генерації професійних нотаток. <b>Важливо:</b> Дані, що передаються через API для генерації нотаток, <b>не використовуються</b> Google для навчання їхніх публічних моделей ШІ. Текст транскрипції обробляється виключно для надання вам результату і не зберігається на серверах Google після генерації.</p>
            </section>

            <section style={{ marginBottom: '30px', lineHeight: '1.6' }}>
                <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '15px' }}>4. Зберігання та Ізоляція Даних</h2>
                <p>Ваші дані зберігаються у безпечній хмарній базі даних. Ми використовуємо технологію <b>Row Level Security (RLS)</b>, яка на рівні ядра бази даних гарантує, що кожен терапевт має доступ виключно до своїх клієнтів та сесій. Ніхто інший не може отримати доступ до вашого робочого простору.</p>
            </section>

            <section style={{ marginBottom: '30px', lineHeight: '1.6' }}>
                <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '15px' }}>5. Видалення даних</h2>
                <p>Ви маєте повний контроль над своїми даними. Ви можете видалити будь-якого клієнта або сесію в будь-який момент. Видалення є незворотним і дані назавжди стираються з наших серверів.</p>
            </section>

            <section style={{ marginBottom: '30px', lineHeight: '1.6' }}>
                <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '15px' }}>6. Контакти</h2>
                <p>Якщо у вас виникли питання щодо конфіденційності, будь ласка, зв'яжіться з нами за адресою: <i>[vladyslav.marinov@gmail.com]</i>.</p>
            </section>
        </div>
    );
}