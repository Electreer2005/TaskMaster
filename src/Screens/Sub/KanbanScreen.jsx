import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';
import { getProject } from '../../Api/Services/projectService';
import { subscribeToProjectTasks, updateProjectTaskStatus } from '../../Api/Services/taskService';
import { toLocalDate } from '../../utils/dateUtils';
import TaskMasterLoader from '../../Components/Loader/TaskMasterLoader';
import './Sub.css';

const COLUMNS = [
    { id: 'todo', label: 'Pendiente' },
    { id: 'in_progress', label: 'En progreso' },
    { id: 'done', label: 'Listo' },
];

const PRIORITY_LABELS = { low: 'Baja', medium: 'Media', high: 'Alta' };

export default function KanbanScreen() {
    const { id: projectId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        getProject(user.uid, projectId).then((data) => {
            if (!data) {
                toast.error('El proyecto no existe.');
                navigate('/projects');
                return;
            }
            setProject(data);
        });

        // Suscripción en tiempo real: cualquier cambio de status se refleja solo
        const unsubscribe = subscribeToProjectTasks(user.uid, projectId, (data) => {
            setTasks(data);
            setLoading(false);
        });

        return unsubscribe;
    }, [user, projectId]);

    const tasksByColumn = (columnId) =>
        tasks
            .filter((t) => t.status === columnId)
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;

        try {
            await updateProjectTaskStatus(user.uid, projectId, draggableId, destination.droppableId);
        } catch (error) {
            console.error('Error moviendo la tarea:', error);
            toast.error('No se pudo mover la tarea.');
        }
    };

    if (loading) return <TaskMasterLoader message="Cargando tablero..." />;
    if (!project) return null;

    return (
        <div className="Kanban-Container">
            <div className="Kanban-Header">
                <Link to={`/projects/${projectId}`} className="Home-Link">← {project.name}</Link>
                <span className="Kanban-HeaderDot" style={{ backgroundColor: project.color }} />
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="Kanban-Board">
                    {COLUMNS.map((col) => {
                        const columnTasks = tasksByColumn(col.id);

                        return (
                            <Droppable key={col.id} droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        className={`Kanban-Column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        <div className="Kanban-ColumnHeader">
                                            <span>{col.label}</span>
                                            <span className="Kanban-ColumnCount">{columnTasks.length}</span>
                                        </div>

                                        {columnTasks.length === 0 && (
                                            <p className="Kanban-EmptyColumn">Sin tareas acá</p>
                                        )}

                                        {columnTasks.map((task, index) => {
                                            const due = toLocalDate(task.dueDate);

                                            return (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(dragProvided, dragSnapshot) => (
                                                        <div
                                                            className={`Kanban-Card Kanban-Priority-${task.priority} ${dragSnapshot.isDragging ? 'dragging' : ''}`}
                                                            ref={dragProvided.innerRef}
                                                            {...dragProvided.draggableProps}
                                                            {...dragProvided.dragHandleProps}
                                                        >
                                                            <span className="Kanban-CardTitle">{task.title}</span>
                                                            <button
                                                                className="Kanban-CardDetailButton"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/projects/${projectId}/tasks/${task.id}`);
                                                                }}
                                                            >
                                                                Ver detalle
                                                            </button>
                                                            {task.description && (
                                                                <span className="Kanban-CardDescription">{task.description}</span>
                                                            )}
                                                            {task.tags?.length > 0 && (
                                                                <div className="Kanban-Tags">
                                                                    {task.tags.slice(0, 3).map((tag) => (
                                                                        <span key={tag} className="Kanban-Tag">#{tag}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="Kanban-CardFooter">
                                                                <span className={`Kanban-PriorityBadge Kanban-Priority-${task.priority}`}>
                                                                    {PRIORITY_LABELS[task.priority]}
                                                                </span>
                                                                {due && (
                                                                    <span className="Kanban-DueDate">
                                                                        📅 {due.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
    );
}