import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './Auth.css';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);

        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('Ya existe una cuenta con ese correo.');
                    break;
                case 'auth/invalid-email':
                    setError('El correo ingresado no es válido.');
                    break;
                case 'auth/weak-password':
                    setError('La contraseña debe tener al menos 6 caracteres.');
                    break;
                default:
                    setError('Ocurrió un error. Intentá de nuevo más tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className="Auth-container">
            <div className="Register-container">
                <h2 className="Register-title">Registro</h2>
                <form onSubmit={handleSubmit} className="Register-form">

                    <div className="Register-group">
                        <label htmlFor="name" className="Register-label">Nombre</label>
                        <div className="Input-box">
                            <i className="fas fa-user"></i>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="Register-input"
                                placeholder="Ingrese su nombre"
                                required
                            />
                        </div>
                    </div>
                    <div className="Register-group">
                        <label htmlFor="email" className="Register-label">Correo</label>
                        <div className="Input-box">
                            <i className="fas fa-envelope"></i>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="Register-input"
                                placeholder="Ingrese su correo"
                                required
                            />
                        </div>
                    </div>
                    <div className="Register-group">
                        <label htmlFor="password" className="Register-label">Contraseña</label>
                        <div className="Input-box">
                            <i className="fas fa-lock"></i>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="Register-input"
                                placeholder="Ingrese su contraseña"
                                required
                            />
                            <i
                                className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} // 👈 ícono dinámico
                                id="togglePassword"
                                onClick={togglePasswordVisibility} // 👈 manejador
                                style={{ cursor: 'pointer' }} // para que se vea clickeable
                            ></i>
                        </div>
                    </div>
                    <div className="Register-group">
                        <label htmlFor="ConfirmPassword" className="Register-label">Confirmar contraseña</label>
                        <div className="Input-box">
                            <i className="fas fa-lock"></i>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="ConfirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="Register-input"
                                placeholder="Confirme su contraseña"
                                required
                            />
                            <i
                                className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} // 👈 ícono dinámico
                                id="togglePassword"
                                onClick={togglePasswordVisibility} // 👈 manejador
                                style={{ cursor: 'pointer' }} // para que se vea clickeable
                            ></i>
                        </div>
                    </div>

                    {error && <p className="Register-error">{error}</p>}

                    <button type="submit" className="Register-button" disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>
                <div className="Login-Account">
                    <p className="Login-p">
                        ¿Ya tienes una cuenta? <Link to="/login" className="Login-link">Inicia sesión aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}