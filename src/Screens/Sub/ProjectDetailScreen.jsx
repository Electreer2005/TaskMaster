import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';
import { getProject, setProjectStatusManually, deleteProject } from '../../Api/Services/projectService';
import {
    subscribeToProjectTasks,
    createProjectTask,
    updateProjectTaskStatus,
    deleteProjectTask,
} from '../../Api/Services/taskService';
import { toLocalDate } from '../../utils/dateUtils';
import './Sub.css';

const PROJECT_STATUS_LABELS = { active: 'Activo', completed: 'Completado', archived: 'Archivado' };
const TASK_STATUS_LABELS = { todo: 'Pendiente', in_progress: 'En progreso', done: 'Listo' };

export default function ProjectDetailScreen() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

    useEffect(() => {
        if (!user) return;

        loadProject();

        // Suscripción en tiempo real a las tareas del proyecto
        const unsubscribe = subscribeToProjectTasks(user.uid, id, (data) => {
            setTasks(data);
        });

        return unsubscribe;
    }, [user, id]);

    async function loadProject() {
        setLoading(true);
        try {
            const projectData = await getProject(user.uid, id);
            if (!projectData) {
                toast.error('El proyecto no existe.');
                navigate('/projects');
                return;
            }
            setProject(projectData);
        } catch (error) {
            console.error('Error cargando el proyecto:', error);
            toast.error('No pudimos cargar el proyecto.');
        } finally {
            setLoading(false);
        }
    }

    const onCreateTask = async (formData) => {
        try {
            await createProjectTask(user.uid, id, formData);
            toast.success('Tarea creada');
            reset();
            setShowModal(false);
            loadProject(); // refresca taskCount del proyecto
        } catch (error) {
            console.error('Error creando tarea:', error);
            toast.error('No se pudo crear la tarea.');
        }
    };

    const handleStatusChange = async (task, newStatus) => {
        try {
            await updateProjectTaskStatus(user.uid, id, task.id, newStatus);
            loadProject(); // refresca contadores/status del proyecto
        } catch (error) {
            console.error('Error actualizando tarea:', error);
            toast.error('No se pudo actualizar la tarea.');
        }
    };

    const handleDeleteTask = async (task) => {
        if (!window.confirm('¿Eliminar esta tarea?')) return;
        try {
            await deleteProjectTask(user.uid, id, task.id, task.status === 'done');
            toast.success('Tarea eliminada');
            loadProject();
        } catch (error) {
            console.error('Error eliminando tarea:', error);
            toast.error('No se pudo eliminar la tarea.');
        }
    };

    const handleProjectStatusChange = async (newStatus) => {
        try {
            await setProjectStatusManually(user.uid, id, newStatus);
            setProject((prev) => ({ ...prev, status: newStatus, statusOverride: true }));
            toast.success('Status actualizado');
        } catch (error) {
            console.error('Error actualizando status:', error);
            toast.error('No se pudo actualizar el status.');
        }
    };

    const handleDeleteProject = async () => {
        if (!window.confirm('¿Eliminar este proyecto? Esta acción no borra las tareas automáticamente.')) return;
        try {
            await deleteProject(user.uid, id);
            toast.success('Proyecto eliminado');
            navigate('/projects');
        } catch (error) {
            console.error('Error eliminando proyecto:', error);
            toast.error('No se pudo eliminar el proyecto.');
        }
    };

    if (loading) return <p className="Home-Loading">Cargando proyecto...</p>;
    if (!project) return null;

    const progress = project.taskCount
        ? Math.round((project.completedTaskCount / project.taskCount) * 100)
        : 0;

    return (
        <div className="Project-Detail-Container">
            <Link to="/projects" className="Home-Link">← Volver a proyectos</Link>
            <Link to={`/projects/${id}/kanban`} className="Home-Link">Ver tablero Kanban</Link>

            <div className="Project-Detail-Header" style={{ borderTopColor: project.color }}>
                <div>
                    <h1 className="title">{project.name}</h1>
                    {project.description && <p className="Project-Description">{project.description}</p>}
                </div>

                <select
                    value={project.status}
                    onChange={(e) => handleProjectStatusChange(e.target.value)}
                    className="Project-StatusSelect"
                >
                    {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            <div className="Project-Progress">
                <div className="Project-Progress-Bar">
                    <div className="Project-Progress-Fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="Project-Progress-Label">
                    {project.completedTaskCount || 0}/{project.taskCount || 0} tareas · {progress}%
                </span>
            </div>

            <div className="Task-Header">
                <h2>Tareas</h2>
                <button className="Task-CreateButton" onClick={() => setShowModal(true)}>
                    + Nueva tarea
                </button>
            </div>

            {tasks.length === 0 ? (
                <p className="Home-Empty">Este proyecto todavía no tiene tareas.</p>
            ) : (
                <ul className="Task-List">
                    {tasks.map((task) => {
                        const due = toLocalDate(task.dueDate);
                        const otherStatuses = Object.keys(TASK_STATUS_LABELS).filter((s) => s !== task.status);

                        return (
                            <li key={task.id} className={`Task-Item ${task.status === 'done' ? 'completed' : ''}`}>
                                <div className="Task-Info">
                                    <Link to={`/projects/${id}/tasks/${task.id}`} className="Task-Title">{task.title}</Link>
                                    {task.description && <span className="Task-Description">{task.description}</span>}
                                    <div className="Task-Meta">
                                        {due && <span className="Task-DueDate">📅 {due.toLocaleDateString('es-AR')}</span>}
                                        <span className="Task-StatusBadge">{TASK_STATUS_LABELS[task.status]}</span>
                                    </div>
                                    <div className="Task-MoveRow">
                                        {otherStatuses.map((s) => (
                                            <button
                                                key={s}
                                                className="Task-MoveButton"
                                                onClick={() => handleStatusChange(task, s)}
                                            >
                                                {TASK_STATUS_LABELS[s]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button className="Task-DeleteButton" onClick={() => handleDeleteTask(task)}>
                                    Eliminar
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            <button className="Project-DeleteButton" onClick={handleDeleteProject}>
                Eliminar proyecto
            </button>

            {showModal && (
                <div className="Task-ModalOverlay" onClick={() => setShowModal(false)}>
                    <div className="Task-Modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Nueva tarea</h2>
                        <form onSubmit={handleSubmit(onCreateTask)}>
                            <div className="Task-FormGroup">
                                <label htmlFor="title">Título</label>
                                <input id="title" {...register('title', { required: true })} />
                            </div>
                            <div className="Task-FormGroup">
                                <label htmlFor="description">Descripción</label>
                                <textarea id="description" {...register('description')} />
                            </div>
                            <div className="Task-FormGroup">
                                <label htmlFor="dueDate">Fecha límite</label>
                                <input id="dueDate" type="date" {...register('dueDate')} />
                            </div>
                            <div className="Task-ModalActions">
                                <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creando...' : 'Crear tarea'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}