import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomeScreen from './Main/HomeScreen';
import ProjectScreen from './Main/ProjectScreen';
import TaskScreen from './Main/TaskScreen';
import CalendarScreen from './Main/CalendarScreen';
import ProfileScreen from './Main/ProfileScreen';
import { useAuth } from '../Context/AuthContext';

/* Sub Pantallas */
import ProjectDetailScreen from './Sub/ProjectDetailScreen';
import KanbanScreen from './Sub/KanbanScreen';
import TaskDetailScreen from './Sub/TaskDetailScreen';
import ChangePasswordScreen from './Sub/ChangePasswordScreen';
import StatsScreen from './Sub/StatsScreen';
import ThemeSettingsScreen from './Sub/ThemeSettingsScreen';
import ExportDataScreen from './Sub/ExportDataScreen';

export default function MainNavigator() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => setMenuOpen(false);


    const handleLogout = async () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            try {
                await logout();
                navigate('/login');
            } catch (error) {
                console.error('Error logging out:', error);
            }
        }

    };

    const handleDeleteAccount = async () => {
        if (window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            try {
                // TODO: lógica de eliminación de cuenta
            } catch (error) {
                console.error('Error deleting account:', error);
            }
        }
    };

    return (
        <div className="Main-Container">
            <header className="header-main">
                <div className="Primer-Cabezal">
                    <i className="fas fa-bars" onClick={toggleMenu}></i>
                    <nav className={`NavBar ${menuOpen ? 'open' : ''}`}>
                        <ul>
                            <li><Link to="/" className="Nav-Link" onClick={closeMenu}><i className="fas fa-home"></i><span>Inicio</span></Link></li>
                            <li><Link to="/projects" className="Nav-Link" onClick={closeMenu}><i className="fas fa-project-diagram"></i><span>Proyectos</span></Link></li>
                            <li><Link to="/tasks" className="Nav-Link" onClick={closeMenu}><i className="fas fa-tasks"></i><span>Tareas</span></Link></li>
                            <li><Link to="/calendar" className="Nav-Link" onClick={closeMenu}><i className="fas fa-calendar"></i><span>Calendario</span></Link></li>
                            <li><Link to="/profile" className="Nav-Link" onClick={closeMenu}><i className="fas fa-user"></i><span>Perfil</span></Link></li>
                        </ul>
                    </nav>
                    <div className={`NavBar-overlay ${menuOpen ? 'open' : ''}`} onClick={closeMenu}></div>
                </div>
                <div className="Segundo-Cabezal">
                    {user && (
                        <div className="User-Container">
                            <div className="User-Avatar">
                                {user.photoUrl ? (
                                    <img src={user.photoUrl} alt="Avatar" />
                                ) : (
                                    <i className="fa-solid fa-user"></i>
                                )}
                            </div>
                            <div className="User-Name">
                                <p>{user.displayName || 'Usuario'}</p>
                                <span>{user.email}</span>
                            </div>
                            <div className="DropDown-Content">
                                <ul className="DropDown-Menu">
                                    <li><button className="DropDown-Item" onClick={handleLogout}>
                                        Cerrar Sesion
                                    </button></li>
                                    <li><button className="DropDown-Item" onClick={handleDeleteAccount}>
                                        Eliminar Cuenta
                                    </button></li>
                                </ul>
                                <p>Version 1.0.0</p>
                            </div>
                        </div>
                    )}
                </div>
            </header>
            <main className="Main-Content">
                <Routes>
                    <Route path="/" element={<HomeScreen />} />
                    <Route path="/projects" element={<ProjectScreen />} />
                    <Route path="/tasks" element={<TaskScreen />} />
                    <Route path="/calendar" element={<CalendarScreen />} />
                    <Route path="/profile" element={<ProfileScreen />} />
                    <Route path="/projects/:id" element={<ProjectDetailScreen />} />
                    <Route path="/projects/:id/kanban" element={<KanbanScreen />} />
                    <Route path="/tasks/:taskId" element={<TaskDetailScreen />} />
                    <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetailScreen />} />
                    <Route path="/profile/change-password" element={<ChangePasswordScreen />} />
                    <Route path="/profile/stats" element={<StatsScreen />} />
                    <Route path="/profile/theme" element={<ThemeSettingsScreen />} />
                    <Route path="/profile/export" element={<ExportDataScreen />} />
                </Routes>
            </main>
            <footer className="footer-main">
                <p>&copy; 2026 Taskmaster. Todos los derechos reservados.</p>
            </footer>
        </div>
    )
}