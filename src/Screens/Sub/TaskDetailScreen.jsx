import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';
import {
    getIndependentTask,
    updateIndependentTask,
    updateIndependentTaskStatus,
    deleteIndependentTask,
    getProjectTask,
    updateProjectTask,
    updateProjectTaskStatus,
    deleteProjectTask,
} from '../../Api/Services/taskService';
import './Sub.css';

const STATUS_LABELS = { todo: 'Pendiente', in_progress: 'En progreso', done: 'Listo' };
const PRIORITY_LABELS = { low: 'Baja', medium: 'Media', high: 'Alta' };

export default function TaskDetailScreen() {
    const { taskId, projectId } = useParams(); // projectId solo existe en la ruta de proyecto
    const isProjectTask = Boolean(projectId);
    const { user } = useAuth();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm();

    useEffect(() => {
        if (!user) return;
        loadTask();
    }, [user, taskId, projectId]);

    async function loadTask() {
        setLoading(true);
        try {
            const data = isProjectTask
                ? await getProjectTask(user.uid, projectId, taskId)
                : await getIndependentTask(user.uid, taskId);

            if (!data) {
                toast.error('La tarea no existe.');
                navigate(isProjectTask ? `/projects/${projectId}` : '/tasks');
                return;
            }

            setTask(data);
            reset({
                title: data.title,
                description: data.description || '',
                dueDate: data.dueDate || '',
                priority: data.priority || 'medium',
                tags: (data.tags || []).join(', '),
            });
        } catch (error) {
            console.error('Error cargando la tarea:', error);
            toast.error('No pudimos cargar la tarea.');
        } finally {
            setLoading(false);
        }
    }

    const onSave = async (formData) => {
        const payload = {
            title: formData.title,
            description: formData.description,
            dueDate: formData.dueDate || null,
            priority: formData.priority,
            tags: formData.tags
                ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
                : [],
        };

        try {
            if (isProjectTask) {
                await updateProjectTask(user.uid, projectId, taskId, payload);
            } else {
                await updateIndependentTask(user.uid, taskId, payload);
            }

            toast.success('Tarea actualizada');
            setTask((prev) => ({ ...prev, ...payload }));
            reset(formData); // limpia isDirty
        } catch (error) {
            console.error('Error guardando la tarea:', error);
            toast.error('No se pudo guardar la tarea.');
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            if (isProjectTask) {
                await updateProjectTaskStatus(user.uid, projectId, taskId, newStatus);
            } else {
                await updateIndependentTaskStatus(user.uid, taskId, newStatus);
            }
            setTask((prev) => ({ ...prev, status: newStatus }));
        } catch (error) {
            console.error('Error actualizando el status:', error);
            toast.error('No se pudo actualizar el status.');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Eliminar esta tarea? Esta acción no se puede deshacer.')) return;

        try {
            if (isProjectTask) {
                await deleteProjectTask(user.uid, projectId, taskId, task.status === 'done');
            } else {
                await deleteIndependentTask(user.uid, taskId);
            }
            toast.success('Tarea eliminada');
            navigate(isProjectTask ? `/projects/${projectId}` : '/tasks');
        } catch (error) {
            console.error('Error eliminando la tarea:', error);
            toast.error('No se pudo eliminar la tarea.');
        }
    };

    if (loading) return <p className="Home-Loading">Cargando tarea...</p>;
    if (!task) return null;

    const backLink = isProjectTask ? `/projects/${projectId}` : '/tasks';
    const backLabel = isProjectTask ? '← Volver al proyecto' : '← Volver a mis tareas';

    return (
        <div className="TaskDetail-Container">
            <Link to={backLink} className="Home-Link">{backLabel}</Link>

            <div className="TaskDetail-Card">
                <div className="TaskDetail-Header">
                    <h1 className="title">Detalle de tarea</h1>
                    <span className="Task-StatusBadge">{STATUS_LABELS[task.status]}</span>
                </div>

                <div className="TaskDetail-StatusRow">
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <button
                            key={value}
                            className={`Task-MoveButton ${task.status === value ? 'active' : ''}`}
                            onClick={() => handleStatusChange(value)}
                            disabled={task.status === value}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit(onSave)} className="TaskDetail-Form">
                    <div className="Task-FormGroup">
                        <label htmlFor="title">Título</label>
                        <input id="title" {...register('title', { required: true })} />
                    </div>

                    <div className="Task-FormGroup">
                        <label htmlFor="description">Descripción</label>
                        <textarea id="description" rows={4} {...register('description')} />
                    </div>

                    <div className="TaskDetail-Row">
                        <div className="Task-FormGroup">
                            <label htmlFor="dueDate">Fecha límite</label>
                            <input id="dueDate" type="date" {...register('dueDate')} />
                        </div>

                        <div className="Task-FormGroup">
                            <label htmlFor="priority">Prioridad</label>
                            <select id="priority" {...register('priority')}>
                                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="Task-FormGroup">
                        <label htmlFor="tags">Tags (separados por coma)</label>
                        <input id="tags" placeholder="urgente, cliente, revisión" {...register('tags')} />
                    </div>

                    <div className="TaskDetail-Actions">
                        <button type="button" className="Project-DeleteButton" onClick={handleDelete}>
                            Eliminar tarea
                        </button>
                        <button type="submit" disabled={isSubmitting || !isDirty}>
                            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}