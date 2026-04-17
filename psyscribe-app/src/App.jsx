import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import SessionWorkspace from './pages/SessionWorkspace';
import ProtectedRoute from './components/ProtectedRoute';
import ClientProfile from './pages/ClientProfile';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
    return (
        <BrowserRouter>
            {/* ОСЬ НАШІ КРАСИВІ СПОВІЩЕННЯ */}
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#1f2024',
                        color: '#e8e6e0',
                        border: '1px solid #333',
                        fontFamily: "'Inter', sans-serif",
                        borderRadius: '12px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#c8a96e', // Золотий колір для галочки успіху
                            secondary: '#1f2024',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ff4d4d', // Червоний для помилок
                            secondary: '#1f2024',
                        },
                    },
                }}
            />

            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/session" element={<ProtectedRoute><SessionWorkspace /></ProtectedRoute>} />
                <Route path="/clients/:id" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;