import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './Auth.css';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // 👈 nuevo estado

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            switch (err.code) {
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                case 'auth/user-not-found':
                    setError('Correo o contraseña incorrectos.');
                    break;
                case 'auth/invalid-email':
                    setError('El correo ingresado no es válido.');
                    break;
                default:
                    setError('Ocurrió un error. Intentá de nuevo más tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Función para alternar la visibilidad
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className="Auth-container">
            <div className="Login-container">
                <h2 className="Login-title">Acceso</h2>
                <form onSubmit={handleSubmit} className="Login-form">
                    <div className="Login-group">
                        <label htmlFor="email" className="Login-label">Correo</label>
                        <div className="Input-box">
                            <i className="fas fa-envelope"></i>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="Login-input"
                                placeholder="Ingrese su Correo"
                                required
                            />
                        </div>
                    </div>
                    <div className="Login-group">
                        <label htmlFor="password" className="Login-label">Contraseña</label>
                        <div className="Input-box">
                            <i className="fas fa-lock"></i>
                            <input
                                type={showPassword ? 'text' : 'password'} // 👈 tipo dinámico
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="Login-input"
                                placeholder="Ingrese su Contraseña"
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
                    <div className="forgot-password">
                        <label htmlFor="checkbox" className="Login-label">
                            <input type="checkbox" className="checkbox" name="checkbox" id="checkbox" />
                            Recordar contraseña
                        </label>
                        <Link to="/forgot-password" className="Login-link">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    {error && <p className="Login-error">{error}</p>}

                    <button type="submit" className="Login-button" disabled={loading}>
                        {loading ? 'Accediendo...' : 'Acceder'}
                    </button>
                    <div className="Social">
                        <p className="parrafo-social">O accede con:</p>
                        <div className="buttons-social">
                            <button className="btn-social Google"><i className="fab fa-google social-icon"></i> Google</button>
                            <button className="btn-social Facebook"><i className="fab fa-facebook-f social-icon"></i> Facebook</button>
                        </div>
                    </div>
                </form>
                <div className="Register-Account">
                    <p className="Register-p">
                        ¿No tienes una cuenta? <Link to="/register" className="Register-link">Regístrate aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}