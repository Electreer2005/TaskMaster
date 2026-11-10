import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';
import TaskMasterLoader from '../../Components/Loader/TaskMasterLoader';
import './Main.css';

export default function ProfileScreen() {
    const { user, loading, updateDisplayName, updateProfilePhoto } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const profileForm = useForm();

    if (loading) return <TaskMasterLoader message="Cargando perfil..." />;
    if (!user) return null;

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPhotoPreview(URL.createObjectURL(file));
        setUploadingPhoto(true);

        try {
            await updateProfilePhoto(file);
            toast.success('Foto de perfil actualizada');
        } catch (error) {
            console.error('Error subiendo la foto:', error);
            toast.error('No se pudo actualizar la foto.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const onSaveProfile = async (formData) => {
        try {
            await updateDisplayName(formData.displayName);
            toast.success('Perfil actualizado');
            setIsEditing(false);
        } catch (error) {
            console.error('Error actualizando el perfil:', error);
            toast.error('No se pudo actualizar el perfil.');
        }
    };

    return (
        <div className="Profile-Container">
            <div className="Profile-Card">
                <h1 className="title-profile">Tu cuenta</h1>

                <div className="User-Img">
                    {photoPreview || user.photoURL ? (
                        <img src={photoPreview || user.photoURL} alt="Avatar" />
                    ) : (
                        <i className="fa-solid fa-user"></i>
                    )}

                    <label className="Profile-PhotoUpload">
                        {uploadingPhoto ? 'Subiendo...' : 'Cambiar foto'}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            disabled={uploadingPhoto}
                            hidden
                        />
                    </label>
                </div>

                {isEditing ? (
                    <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="Profile-EditForm">
                        <div className="Profile-FormGroup">
                            <label htmlFor="displayName">Nombre</label>
                            <input
                                id="displayName"
                                defaultValue={user.displayName || ''}
                                {...profileForm.register('displayName', { required: true })}
                            />
                        </div>
                        <div className="Profile-FormActions">
                            <button type="button" onClick={() => setIsEditing(false)}>Cancelar</button>
                            <button type="submit" disabled={profileForm.formState.isSubmitting}>
                                {profileForm.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="User-name">
                        <p>{user.displayName || 'Usuario'}</p>
                        <span>{user.email}</span>
                        <button className="Profile-EditButton" onClick={() => setIsEditing(true)}>
                            Editar nombre
                        </button>
                    </div>
                )}
            </div>

            <nav className="Profile-MenuList">
                <Link to="/profile/stats" className="Profile-MenuItem">
                    <button>
                        <i className="fa-solid fa-chart-pie"></i>
                        <span>Estadísticas</span>
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>

                </Link>
                <Link to="/profile/change-password" className="Profile-MenuItem">
                    <button>
                        <i className="fa-solid fa-lock"></i>
                        <span>Cambiar contraseña</span>
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>

                </Link>
                <Link to="/profile/theme" className="Profile-MenuItem">
                    <button>
                        <i className="fa-solid fa-palette"></i>
                        <span>Apariencia</span>
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>

                </Link>
                <Link to="/profile/export" className="Profile-MenuItem">
                    <button>
                        <i className="fa-solid fa-download"></i>
                        <span>Exportar datos</span>
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </Link>
            </nav>
        </div>
    );
}