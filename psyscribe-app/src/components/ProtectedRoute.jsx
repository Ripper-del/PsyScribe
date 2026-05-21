import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';

export default function ProtectedRoute({ children }) {
    const [session, setSession] = useState(undefined);

    useEffect(() => {
        // Перевіряємо, чи є активна сесія прямо зараз
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Підписуємось на зміни стану (логін/логаут)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Поки ми чекаємо відповіді від Supabase (undefined) — показуємо пустий екран або спінер
    if (session === undefined) return <div className="loading-screen">Завантаження...</div>;

    // Якщо сесії немає — редирект на логін
    if (session === null) return <Navigate to="/login" replace />;

    // Якщо все ок — показуємо контент сторінки
    return children;
}