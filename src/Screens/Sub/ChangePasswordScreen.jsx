import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';
import './Sub.css';

export default function ChangePasswordScreen() {
    const { changePassword } = useAuth();
    const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (formData) => {
        if (formData.newPassword !== formData.confirmPassword) {
            setError('confirmPassword', { message: 'Las contraseñas no coinciden' });
            return;
        }

        try {
            await changePassword(formData.currentPassword, formData.newPassword);
            toast.success('Contraseña actualizada');
            reset();
        } catch (error) {
            console.error('Error cambiando la contraseña:', error);
            switch (error.code) {
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('currentPassword', { message: 'Contraseña actual incorrecta' });
                    break;
                case 'auth/weak-password':
                    setError('newPassword', { message: 'La nueva contraseña debe tener al menos 6 caracteres' });
                    break;
                default:
                    toast.error('No se pudo cambiar la contraseña.');
            }
        }
    };

    return (
        <div className="Profile-Container">
            <Link to="/profile" className="Home-Link">← Volver al perfil</Link>

            <div className="Profile-Card">
                <h1 className="title-profile">Cambiar contraseña</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="Profile-EditForm">
                    <div className="Profile-FormGroup">
                        <label htmlFor="currentPassword">Contraseña actual</label>
                        <input id="currentPassword" type="password" {...register('currentPassword', { required: true })} />
                        {errors.currentPassword && (
                            <span className="Profile-FieldError">{errors.currentPassword.message || 'Campo requerido'}</span>
                        )}
                    </div>

                    <div className="Profile-FormGroup">
                        <label htmlFor="newPassword">Nueva contraseña</label>
                        <input id="newPassword" type="password" {...register('newPassword', { required: true, minLength: 6 })} />
                        {errors.newPassword && (
                            <span className="Profile-FieldError">{errors.newPassword.message || 'Mínimo 6 caracteres'}</span>
                        )}
                    </div>

                    <div className="Profile-FormGroup">
                        <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
                        <input id="confirmPassword" type="password" {...register('confirmPassword', { required: true })} />
                        {errors.confirmPassword && (
                            <span className="Profile-FieldError">{errors.confirmPassword.message}</span>
                        )}
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Actualizando...' : 'Cambiar contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
}