import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/login', {
                username,
                password
            });

            // Store token in localStorage
            localStorage.setItem('token', response.data.token);
            console.log("Login exitoso:", username);
            navigate('/admin');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
            console.error("Error de login:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass p-8 rounded-2xl w-full max-w-md flex flex-col items-center">
                <div className="premium-gradient p-3 rounded-xl mb-6">
                    <ShieldCheck size={40} color="white" />
                </div>
                <h1 className="text-3xl font-bold mb-2 text-gradient">Oculus</h1>
                <p className="text-gray-400 mb-8 text-center text-sm">Sistema de Control de Asistencia Biométrico</p>

                <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Usuario</label>
                        <input
                            type="text"
                            placeholder="admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="premium-gradient mt-4 text-white hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <LogIn size={18} />
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <div className="mt-8 text-xs text-gray-500 border-t border-white/5 pt-4 w-full text-center">
                    Versión 1.0.0-MVP &copy; 2026
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
