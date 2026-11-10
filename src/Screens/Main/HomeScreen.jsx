import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useHomeData } from '../../hooks/useHomeData';
import TaskMasterLoader from '../../Components/Loader/TaskMasterLoader';
import './Main.css';

export default function HomeScreen() {
    const { user } = useAuth();
    const { loading, error, stats, todayTasks, activeProjects } = useHomeData();

    if (loading) {
        return <TaskMasterLoader message="Cargando resumen..."/>;
    }

    if (error) {
        return <div className="Home-Container"><p className="Home-Error">No pudimos cargar tu información. Intentá recargar la página.</p></div>;
    }

    return (
        <div className="Home-Container">
            <h1 className="title">Bienvenido, {user.displayName || 'Usuario'}</h1>

            <section className="Home-Stats">
                <div className="Stat-Card">
                    <span className="Stat-Number">{stats.pending}</span>
                    <span className="Stat-Label">Tareas pendientes</span>
                </div>
                <div className="Stat-Card">
                    <span className="Stat-Number">{stats.done}</span>
                    <span className="Stat-Label">Completadas</span>
                </div>
                <div className="Stat-Card">
                    <span className="Stat-Number">{stats.activeProjects}</span>
                    <span className="Stat-Label">Proyectos activos</span>
                </div>
            </section>

            <section className="Home-Section">
                <div className="Home-Section-Header">
                    <h2>Tareas de hoy</h2>
                    <Link to="/tasks" className="Home-Link">Ver todas</Link>
                </div>
                {todayTasks.length === 0 ? (
                    <p className="Home-Empty">No tenés tareas para hoy. 🎉</p>
                ) : (
                    <ul className="Home-TaskList">
                        {todayTasks.map((task) => (
                            <li key={task.id} className="Home-TaskItem">
                                <span>{task.title}</span>
                                {task.source === 'project' && <span className="Home-TaskBadge">Proyecto</span>}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="Home-Section">
                <div className="Home-Section-Header">
                    <h2>Proyectos activos</h2>
                    <Link to="/projects" className="Home-Link">Ver todos</Link>
                </div>
                {activeProjects.length === 0 ? (
                    <p className="Home-Empty">Todavía no tenés proyectos activos.</p>
                ) : (
                    <ul className="Home-ProjectList">
                        {activeProjects.map((project) => (
                            <li key={project.id} className="Home-ProjectItem">
                                <span>{project.name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}