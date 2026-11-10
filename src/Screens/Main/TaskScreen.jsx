import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // agregar al import existente de react-router-dom
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';
import {
    subscribeToIndependentTasks,
    createIndependentTask,
    updateIndependentTaskStatus,
    deleteIndependentTask,
} from '../../Api/Services/taskService';
import { toLocalDate } from '../../utils/dateUtils';
import TaskMasterLoader from '../../Components/Loader/TaskMasterLoader';
import './Main.css';

const STATUS_LABELS = { todo: 'Pendiente', in_progress: 'En progreso', done: 'Listo' };
const FILTERS = [
    { key: 'pending', label: 'Pendientes' },
    { key: 'done', label: 'Completadas' },
    { key: 'all', label: 'Todas' },
];

export default function TaskScreen() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [showModal, setShowModal] = useState(false);

    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToIndependentTasks(user.uid, (data) => {
            setTasks(data);
            setLoading(false);
        });
        return unsubscribe;
    }, [user]);

    const onCreate = async (formData) => {
        try {
            await createIndependentTask(user.uid, formData);
            toast.success('Tarea creada');
            reset();
            setShowModal(false);
        } catch (error) {
            console.error('Error creando tarea:', error);
            toast.error('No se pudo crear la tarea.');
        }
    };

    const handleStatusChange = async (task, newStatus) => {
        try {
            await updateIndependentTaskStatus(user.uid, task.id, newStatus);
        } catch (error) {
            console.error('Error actualizando tarea:', error);
            toast.error('No se pudo actualizar la tarea.');
        }
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('¿Eliminar esta tarea?')) return;
        try {
            await deleteIndependentTask(user.uid, taskId);
            toast.success('Tarea eliminada');
        } catch (error) {
            console.error('Error eliminando tarea:', error);
            toast.error('No se pudo eliminar la tarea.');
        }
    };

    const filteredTasks = tasks.filter((t) => {
        if (filter === 'all') return true;
        if (filter === 'pending') return t.status !== 'done';
        return t.status === 'done';
    });

    return (
        <div className="Task-Container">
            <div className="Task-Header">
                <h1 className="title">Mis Tareas</h1>
                <button className="Task-CreateButton" onClick={() => setShowModal(true)}>
                    + Nueva tarea
                </button>
            </div>

            <div className="Task-Filters">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        className={`Task-FilterTab ${filter === f.key ? 'active' : ''}`}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <TaskMasterLoader message="Cargando tus tareas..."/>
            ) : filteredTasks.length === 0 ? (
                <p className="Home-Empty">No hay tareas en esta categoría.</p>
            ) : (
                <ul className="Task-List">
                    {filteredTasks.map((task) => {
                        const due = toLocalDate(task.dueDate);
                        const otherStatuses = Object.keys(STATUS_LABELS).filter((s) => s !== task.status);

                        return (
                            <li key={task.id} className={`Task-Item ${task.status === 'done' ? 'completed' : ''}`}>
                                <div className="Task-Info">
                                    <Link to={`/tasks/${task.id}`} className="Task-Title">{task.title}</Link>
                                    {task.description && <span className="Task-Description">{task.description}</span>}
                                    <div className="Task-Meta">
                                        {due && <span className="Task-DueDate">📅 {due.toLocaleDateString('es-AR')}</span>}
                                        <span className={`Task-Priority Task-Priority-${task.priority}`}>
                                            {task.priority === 'high' ? 'Alta' : task.priority === 'low' ? 'Baja' : 'Media'}
                                        </span>
                                        <span className="Task-StatusBadge">{STATUS_LABELS[task.status]}</span>
                                    </div>
                                    <div className="Task-MoveRow">
                                        {otherStatuses.map((s) => (
                                            <button
                                                key={s}
                                                className="Task-MoveButton"
                                                onClick={() => handleStatusChange(task, s)}
                                            >
                                                {STATUS_LABELS[s]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button className="Task-DeleteButton" onClick={() => handleDelete(task.id)}>
                                    Eliminar
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            {showModal && (
                <div className="Task-ModalOverlay" onClick={() => setShowModal(false)}>
                    <div className="Task-Modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Nueva tarea</h2>
                        <form onSubmit={handleSubmit(onCreate)}>
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
                            <div className="Task-FormGroup">
                                <label htmlFor="priority">Prioridad</label>
                                <select id="priority" {...register('priority')} defaultValue="medium">
                                    <option value="low">Baja</option>
                                    <option value="medium">Media</option>
                                    <option value="high">Alta</option>
                                </select>
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