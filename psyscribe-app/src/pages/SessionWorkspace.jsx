import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";

export default function SessionWorkspace() {
    const navigate = useNavigate();

    const [isRecording, setIsRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [activeTab, setActiveTab] = useState('transcript');

    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');
    const [planType, setPlanType] = useState('free');

    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [soapData, setSoapData] = useState(null);
    const [isLoadingSoap, setIsLoadingSoap] = useState(false);

    const [therapyType, setTherapyType] = useState('КПТ (Когнітивно-поведінкова)');
    const [doctorNotes, setDoctorNotes] = useState('');
    const [manualTranscript, setManualTranscript] = useState('');

    const [copyTransStatus, setCopyTransStatus] = useState('КОПІЮВАТИ ТЕКСТ');
    const [copySoapStatus, setCopySoapStatus] = useState('КОПІЮВАТИ ВСЕ');
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);

    const recognitionRef = useRef(null);
    const isRecordingRef = useRef(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // ВАЖЛИВО: Сортуємо за created_at, щоб перші 3 були "старими"
            const { data: clientsData } = await supabase
                .from('clients')
                .select('id, name, created_at')
                .order('created_at', { ascending: true });
            if (clientsData) setClients(clientsData);

            const { data: profileData } = await supabase
                .from('profiles')
                .select('ai_prompt, plan_type')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setCustomPrompt(profileData.ai_prompt);
                setPlanType(profileData.plan_type || 'free');
            }
        };

        fetchInitialData();
    }, [navigate]);

    // ДОДАНО: Функція перевірки, чи заблокований клієнт
    const isClientLocked = (clientId) => {
        if (planType === 'pro') return false;
        const index = clients.findIndex(c => c.id === clientId);
        return index >= 3; // Якщо він 4-й і далі (індекс 3+) - блокуємо
    };

    useEffect(() => {
        let interval = null;
        if (isRecording) {
            interval = setInterval(() => setSeconds(s => s + 1), 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    useEffect(() => {
        if (!recognitionRef.current && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'uk-UA';

            recognition.onresult = (event) => {
                let finalStr = '';
                let interimStr = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) finalStr += event.results[i][0].transcript + ' ';
                    else interimStr += event.results[i][0].transcript;
                }
                if (finalStr) setTranscript(prev => prev + finalStr);
                setInterimTranscript(interimStr);
            };

            recognitionRef.current = recognition;
        }

        if (recognitionRef.current) {
            recognitionRef.current.onend = () => {
                if (isRecordingRef.current) {
                    try { recognitionRef.current.start(); } catch(e) {}
                }
            };
        }
    }, []);

    const toggleRecording = () => {
        if (!selectedClientId) return toast.error("Будь ласка, оберіть клієнта!");

        if (isRecording) {
            isRecordingRef.current = false;
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            setTranscript('');
            setInterimTranscript('');
            setSeconds(0);
            isRecordingRef.current = true;
            setIsRecording(true);
            try { recognitionRef.current?.start(); } catch(e) {}
        }
    };

    const generateSOAP = async () => {
        const finalTranscript = `${transcript} ${interimTranscript} \n\n ${manualTranscript}`.trim();

        if (!finalTranscript) return toast.error('Текст розмови порожній!');
        if (!selectedClientId) return toast.error('Оберіть клієнта!');

        if (planType === 'free') {
            const { count } = await supabase
                .from('sessions')
                .select('*', { count: 'exact', head: true })
                .eq('client_id', selectedClientId);

            if (count >= 2) {
                setIsPaywallOpen(true);
                return;
            }
        }

        setActiveTab('soap');
        setIsLoadingSoap(true);
        setSoapData(null);

        try {
            const clientName = clients.find(c => c.id === selectedClientId)?.name || "Клієнт";

            const response = await fetch('import.meta.env.VITE_API_URL/api/generate-soap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transcript: finalTranscript,
                    clientName: clientName,
                    therapyType: therapyType,
                    doctorNotes: doctorNotes,
                    customPrompt: customPrompt
                })
            });

            if (!response.ok) throw new Error("Помилка при з'єднанні з AI-сервером");

            const data = await response.json();
            setSoapData(data);

            const { data: userData } = await supabase.auth.getUser();
            const { error: dbError } = await supabase.from('sessions').insert([{
                client_id: selectedClientId,
                user_id: userData.user.id,
                transcript: finalTranscript,
                soap_note: data,
                therapy_type: therapyType
            }]);

            if (dbError) throw dbError;
            toast.success("Сесію проаналізовано та збережено!");

        } catch (err) {
            console.error(err);
            toast.error("Помилка: " + err.message);
        } finally {
            setIsLoadingSoap(false);
        }
    };

    const handleCopyTranscript = () => {
        const fullText = (transcript + ' ' + interimTranscript + ' ' + manualTranscript).trim();
        navigator.clipboard.writeText(fullText);
        setCopyTransStatus('Скопійовано! ✓');
        setTimeout(() => setCopyTransStatus('КОПІЮВАТИ ТЕКСТ'), 2000);
    };

    const handleCopySOAP = () => {
        if (!soapData) return;
        const formattedText = `СУБ'ЄКТИВНЕ:\n${soapData.subjective}\n\nОБ'ЄКТИВНЕ:\n${soapData.objective}\n\nОЦІНКА:\n${soapData.assessment}\n\nПЛАН:\n${soapData.plan}`;
        navigator.clipboard.writeText(formattedText);
        setCopySoapStatus('Скопійовано! ✓');
        setTimeout(() => setCopySoapStatus('КОПІЮВАТИ ВСЕ'), 2000);
    };

    const formatTime = (totalSeconds) => {
        const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const s = String(totalSeconds % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    // Змінна для перевірки, чи обраний клієнт заблокований
    const isCurrentClientLocked = selectedClientId && isClientLocked(selectedClientId);
    const handleSubscribe = async () => {
        try {
            // Отримуємо поточного юзера
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return toast.error("Будь ласка, увійдіть в систему!");

            // ВСТАВ СЮДИ СВІЙ PRICE ID ЗІ STRIPE
            const PRICE_ID = 'price_1TEtb3C7woZkJdzPKXTKL0P4';

            toast.loading("Готуємо сторінку оплати...", { id: 'stripe-loading' });

            const response = await fetch('import.meta.env.VITE_API_URLapi/create-checkout-session', {
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

        <div className="workspace-layout">
            <header>
                <div className="logo" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>
                    <div className="logo-dot"></div>
                    PsyScribe
                </div>

                <div className="header-selector">
                    <label>Клієнт:</label>
                    <select
                        value={selectedClientId}
                        onChange={(e) => {
                            setSelectedClientId(e.target.value);
                            setIsRecording(false); // Зупиняємо запис при зміні клієнта
                            if(recognitionRef.current) recognitionRef.current.stop();
                        }}
                        className="client-dropdown"
                    >
                        <option value="">Оберіть зі списку...</option>
                        {clients.map((c, index) => {
                            const locked = planType === 'free' && index >= 3;
                            return (
                                // Додаємо візуальний маркер в дропдаун
                                <option key={c.id} value={c.id}>
                                    {c.name} {locked ? ' 🔒 (PRO)' : ''}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </header>

            <main style={{ position: 'relative' }}>
                {/* --- ОВЕРЛЕЙ БЛОКУВАННЯ ЯКЩО ОБРАНО PRO-КЛІЄНТА --- */}
                {isCurrentClientLocked && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(31, 32, 36, 0.85)', backdropFilter: 'blur(4px)',
                        zIndex: 10, display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center', borderRadius: '16px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔒</div>
                        <h2 style={{ fontFamily: 'Playfair Display', color: '#c8a96e', marginBottom: '10px' }}>Клієнт заблокований</h2>
                        <p style={{ color: '#8a8d91', textAlign: 'center', maxWidth: '400px', marginBottom: '25px', lineHeight: '1.6' }}>
                            Цей клієнт виходить за ліміт безкоштовного тарифу (максимум 3).<br/>
                            Оновіть підписку, щоб розблокувати доступ до історії та нових сесій.
                        </p>
                        <button className="new-session-btn" onClick={() => setIsPaywallOpen(true)}>
                            Розблокувати з PRO ✨
                        </button>
                    </div>
                )}

                <div className="left-panel" style={{ opacity: isCurrentClientLocked ? 0.3 : 1, pointerEvents: isCurrentClientLocked ? 'none' : 'auto', transition: '0.3s' }}>
                    <div>
                        <div className="section-label">Запис сесії</div>
                        <div className="recorder-card">
                            <div className="timer">{formatTime(seconds)}</div>
                            <div className={`waveform ${isRecording ? 'active' : ''}`}>
                                {[...Array(5)].map((_, i) => <div key={i} className="wave-bar" style={{animationDelay: `${i * 0.1}s`}}></div>)}
                            </div>
                            <button className={`rec-btn ${isRecording ? 'active' : ''}`} onClick={toggleRecording}>
                                <div className="rec-icon"></div>
                            </button>
                            <div className={`rec-status ${isRecording ? 'active' : ''}`}>
                                {isRecording ? 'Запис триває...' : 'Натисніть, щоб почати запис'}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="section-label">Інформація про сесію</div>
                        <div className="field-group">
                            <div className="field">
                                <label>Тип терапії</label>
                                <select value={therapyType} onChange={(e) => setTherapyType(e.target.value)}>
                                    <option>КПТ (Когнітивно-поведінкова)</option>
                                    <option>Психодинамічна</option>
                                    <option>ACT (Терапія прийняття)</option>
                                    <option>Гештальт-терапія</option>
                                </select>
                            </div>
                            <div className="field">
                                <label>Нотатки лікаря (необов'язково)</label>
                                <textarea rows="3" value={doctorNotes} onChange={(e) => setDoctorNotes(e.target.value)} placeholder="Ключові теми, що не потрапили в запис..." />
                            </div>
                        </div>
                    </div>

                    <button className="generate-btn" onClick={generateSOAP} disabled={isLoadingSoap || (!transcript && !manualTranscript)}>
                        {isLoadingSoap ? 'Генерація...' : 'Згенерувати SOAP-нотатки'}
                    </button>
                </div>

                <div className="right-panel" style={{ opacity: isCurrentClientLocked ? 0.3 : 1, pointerEvents: isCurrentClientLocked ? 'none' : 'auto', transition: '0.3s' }}>
                    <div className="tabs">
                        <button className={`tab ${activeTab === 'transcript' ? 'active' : ''}`} onClick={() => setActiveTab('transcript')}>ТРАНСКРИПЦІЯ</button>
                        <button className={`tab ${activeTab === 'soap' ? 'active' : ''}`} onClick={() => setActiveTab('soap')}>SOAP-НОТАТКИ</button>
                    </div>

                    {activeTab === 'transcript' && (
                        <div className="tab-content active">
                            {transcript || interimTranscript ? (
                                <div className="transcript-box">
                                    <span>{transcript}</span>
                                    <span style={{color: '#c8a96e'}}>{interimTranscript}</span>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">🎙</div>
                                    <div className="empty-text">Поки що порожньо</div>
                                    <div className="empty-sub">Оберіть клієнта та почніть запис або введіть текст вручну нижче</div>
                                </div>
                            )}

                            <div className="field" style={{marginTop: 'auto', paddingTop: '20px'}}>
                                <label>Вручну (якщо є готовий текст)</label>
                                <textarea rows="4" value={manualTranscript} onChange={(e) => setManualTranscript(e.target.value)} placeholder="Вставте текст розмови тут..." />
                            </div>
                            {(transcript || manualTranscript) && (
                                <button className="copy-btn" onClick={handleCopyTranscript} style={{marginTop: '10px'}}>{copyTransStatus}</button>
                            )}
                        </div>
                    )}

                    {activeTab === 'soap' && (
                        <div className="tab-content active">
                            {isLoadingSoap && (
                                <div className="loading-bar visible" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                                    <div className="spinner"></div>
                                    Аналізуємо сесію з урахуванням ваших налаштувань...
                                </div>
                            )}

                            {!isLoadingSoap && !soapData && (
                                <div className="empty-state">
                                    <div className="empty-icon">📋</div>
                                    <div className="empty-text">Очікування даних</div>
                                </div>
                            )}

                            {soapData && (
                                <>
                                    <div className="soap-grid">
                                        {Object.entries(soapData).map(([key, value]) => {
                                            const labels = { subjective: 'Суб\'єктивне', objective: 'Об\'єктивне', assessment: 'Оцінка', plan: 'План' };
                                            if (!labels[key]) return null;
                                            return (
                                                <div className="soap-block" key={key}>
                                                    <div className="soap-header">
                                                        <div className="soap-letter">{key[0].toUpperCase()}</div>
                                                        <div className="soap-title">{labels[key]}</div>
                                                    </div>
                                                    <div className="soap-body">{value}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button className="copy-btn" onClick={handleCopySOAP} style={{ alignSelf: 'flex-end', marginTop: '16px' }}>{copySoapStatus}</button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* --- МОДАЛКА PAYWALL --- */}
            {isPaywallOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ textAlign: 'center', padding: '40px 30px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚀</div>
                        <h3 style={{ fontFamily: 'Playfair Display', fontSize: '28px', color: '#c8a96e', marginBottom: '15px' }}>
                            Перейдіть на PRO
                        </h3>
                        <p style={{ color: '#8a8d91', fontSize: '15px', marginBottom: '25px', lineHeight: '1.6' }}>
                            Ви досягли лімітів безкоштовного тарифу. <br/>
                            Відкрийте безлімітну генерацію AI-нотаток та розблокуйте всіх клієнтів.
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