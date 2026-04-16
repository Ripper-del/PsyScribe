import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Завантажуємо секретні змінні з .env
dotenv.config();

const app = express();
// Дозволяємо фронтенду робити запити до нашого сервера
app.use(cors());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Ініціалізація AI та Бази даних
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);


// --- ДОДАНО: РОУТ 1 (ВЕБХУК) ---
// ВАЖЛИВО: Він має стояти ДО app.use(express.json())
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Перевіряємо підпис Stripe (щоб хакери не могли "намалювати" собі оплату)
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('❌ Помилка Webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Якщо оплата пройшла успішно
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Витягуємо ID юзера, який ми передали при створенні сесії
        const userId = session.metadata.supabase_user_id;
        const stripeCustomerId = session.customer;
        const subscriptionId = session.subscription;

        console.log(`💰 Оплата успішна! Вмикаємо PRO для юзера: ${userId}`);

        // Автоматично оновлюємо базу даних Supabase
        const { error } = await supabase
            .from('profiles')
            .update({
                plan_type: 'pro',
                stripe_customer_id: stripeCustomerId,
                stripe_subscription_id: subscriptionId
            })
            .eq('id', userId);

        if (error) {
            console.error("❌ Помилка оновлення БД:", error);
        } else {
            console.log("✅ Тариф PRO успішно активовано!");
        }
    }

    // Завжди повертаємо 200 OK, щоб Stripe знав, що ми прийняли сигнал
    res.send();
});


// Тепер дозволяємо серверу розуміти JSON формат для всіх ІНШИХ роутів
app.use(express.json());


// --- ДОДАНО: РОУТ 2 (СТВОРЕННЯ СЕСІЇ ОПЛАТИ) ---
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { userId, userEmail, priceId } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId, // price_1Pxyz... з фронтенду
                    quantity: 1,
                },
            ],
            mode: 'subscription', // Тип: підписка
            customer_email: userEmail,

            // Куди кидаємо після оплати
            success_url: 'https://psyscribe.vercel.app/dashboard?success=true',
            cancel_url: 'https://psyscribe.vercel.app/dashboard?canceled=true',

            // Зашиваємо ID, щоб вебхук знав, кому давати PRO
            metadata: {
                supabase_user_id: userId
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("❌ Помилка створення Stripe сесії:", error);
        res.status(500).json({ error: error.message });
    }
});


// існуючий роут для генерації
app.post('/api/generate-soap', async (req, res) => {
    try {
        console.log("Отримані дані для AI:", req.body.clientName);

        const { transcript, customPrompt, therapyType, clientName } = req.body;

        const prompt = `
      Ти — професійний психолог. Проаналізуй транскрипт сесії з клієнтом ${clientName}.
      Метод: ${therapyType}.
      
      ТРАНСКРИПТ РОЗМОВИ / НОТАТКИ:
      """
      ${transcript}
      """
      
      ВКАЗІВКИ ЛІКАРЯ (ВРАХУЙ ЦЕ В ТЕКСТІ НОТАТОК):
      "${customPrompt || 'Пиши у професійному стилі.'}"
      
      ВІДПОВІДАЙ СУВОРО У ФОРМАТІ JSON. НІЯКОГО ЗАЙВОГО ТЕКСТУ ДО АБО ПІСЛЯ JSON.
      {
        "subjective": "опис тут",
        "objective": "опис тут",
        "assessment": "опис тут",
        "plan": "опис тут"
      }
    `;

        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-lite-preview",
            generationConfig: { responseMimeType: "application/json" } // Магія тут!
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const soapJson = JSON.parse(text);
            res.json(soapJson);
        } catch (parseError) {
            console.error("Помилка парсингу JSON від AI:", text);
            res.status(500).json({ error: "ШІ видав невірний формат" });
        }

    } catch (error) {
        console.error("КРИТИЧНА ПОМИЛКА СЕРВЕРА:", error);
        res.status(500).json({ error: "Внутрішня помилка сервера" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер успішно запущено на порту ${PORT}`);
});