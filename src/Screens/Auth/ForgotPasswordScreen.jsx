import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './Auth.css';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('');

    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');

        try {
            await resetPassword(email);
            setStatus('success');
        } catch (error) {
            setStatus('error');

            switch (error.code) {
                case 'auth/user-not-found':
                    setErrorMsg('No existe una cuenta con ese correo.');
                    break;
                case 'auth/invalid-email':
                    setErrorMsg('El correo ingresado no es válido.');
                    break;
                default:
                    setErrorMsg('Ocurrió un error. Intentá de nuevo más tarde.');
            }
        }
    };

    return (
        <div className="Auth-container">
            <div className="Forgot-container">
                <Link to="/login" className="Forgot-back">
                    <button className="btn-volver">
                        <i class="fa-solid fa-arrow-left-long"></i>
                        Volver
                    </button>
                </Link>
                <h2 className="Forgot-title">Recuperar contraseña</h2>
                {status === 'success' ? (
                    <div className="Forgot-group">
                        <p>
                            Te enviamos un correo a <strong>{email}</strong> con
                            instrucciones para restablecer tu contraseña.
                        </p>
                        <Link to="/login" className="Forgot-back">
                            <button className="btn-success">
                                <i class="fa-solid fa-arrow-left-long"></i>
                                Volver al inicio de sesión
                            </button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="Forgot-form">
                        <div className="Forgot-group">
                            <label htmlFor="email" className="Forgot-label">Correo</label>
                            <div className="Input-box">
                                <i className="fas fa-envelope"></i>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="Forgot-input"
                                    placeholder="Ingrese su correo"
                                    required
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <p className="Forgot-error">{errorMsg}</p>
                        )}

                        <button type="submit" className="Forgot-button" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}