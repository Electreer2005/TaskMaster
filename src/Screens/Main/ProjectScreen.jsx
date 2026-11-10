import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';
import { getProjects, createProject, deleteProject } from '../../Api/Services/projectService';
import './Main.css';
import TaskMasterLoader from '../../Components/Loader/TaskMasterLoader';

const FILTERS = [
    { key: 'active', label: 'Activos' },
    { key: 'completed', label: 'Completados' },
    { key: 'all', label: 'Todos' },
];

export default function ProjectScreen() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('active');
    const [showModal, setShowModal] = useState(false);

    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

    useEffect(() => {
        if (!user) return;
        loadProjects();
    }, [user]);

    async function loadProjects() {
        setLoading(true);
        try {
            const data = await getProjects(user.uid);
            setProjects(data);
        } catch (error) {
            console.error('Error cargando proyectos:', error);
            toast.error('No pudimos cargar tus proyectos.');
        } finally {
            setLoading(false);
        }
    }

    const onCreate = async (formData) => {
        try {
            await createProject(user.uid, formData);
            toast.success('Proyecto creado');
            reset();
            setShowModal(false);
            loadProjects();
        } catch (error) {
            console.error('Error creando proyecto:', error);
            toast.error('No se pudo crear el proyecto.');
        }
    };

    const handleDelete = async (e, projectId) => {
        e.stopPropagation();
        if (!window.confirm('¿Eliminar este proyecto y todas sus tareas?')) return;

        try {
            await deleteProject(user.uid, projectId);
            toast.success('Proyecto eliminado');
            setProjects((prev) => prev.filter((p) => p.id !== projectId));
        } catch (error) {
            console.error('Error eliminando proyecto:', error);
            toast.error('No se pudo eliminar el proyecto.');
        }
    };

    const filteredProjects = projects.filter((p) => {
        if (filter === 'all') return true;
        return p.status === filter;
    });

    return (
        <div className="Project-Container">
            <div className="Project-Header">
                <h1 className="title">Mis Proyectos</h1>
                <button className="Project-CreateButton" onClick={() => setShowModal(true)}>
                    + Nuevo proyecto
                </button>
            </div>

            <div className="Project-Filters">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        className={`Project-FilterTab ${filter === f.key ? 'active' : ''}`}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <TaskMasterLoader message="Cargando tus proyectos..."/>
            ) : filteredProjects.length === 0 ? (
                <p className="Home-Empty">No hay proyectos en esta categoría.</p>
            ) : (
                <div className="Project-Grid">
                    {filteredProjects.map((project) => {
                        const progress = project.taskCount
                            ? Math.round((project.completedTaskCount / project.taskCount) * 100)
                            : 0;

                        return (
                            <div
                                key={project.id}
                                className="Project-Card"
                                style={{ borderTopColor: project.color }}
                                onClick={() => navigate(`/projects/${project.id}`)}
                            >
                                <div className="Project-Card-Header">
                                    <h3>{project.name}</h3>
                                    <span className={`Project-StatusBadge Project-Status-${project.status}`}>
                                        {project.status === 'active' ? 'Activo' : project.status === 'completed' ? 'Completado' : 'Archivado'}
                                    </span>
                                </div>
                                {project.description && <p className="Project-Description">{project.description}</p>}
                                <div className="Project-Progress">
                                    <div className="Project-Progress-Bar">
                                        <div className="Project-Progress-Fill" style={{ width: `${progress}%` }} />
                                    </div>
                                    <span className="Project-Progress-Label">
                                        {project.completedTaskCount || 0}/{project.taskCount || 0} tareas
                                    </span>
                                </div>
                                <button
                                    className="Project-DeleteButton"
                                    onClick={(e) => handleDelete(e, project.id)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="Project-ModalOverlay" onClick={() => setShowModal(false)}>
                    <div className="Project-Modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Nuevo proyecto</h2>
                        <form onSubmit={handleSubmit(onCreate)}>
                            <div className="Project-FormGroup">
                                <label htmlFor="name">Nombre</label>
                                <input id="name" {...register('name', { required: true })} />
                            </div>
                            <div className="Project-FormGroup">
                                <label htmlFor="description">Descripción</label>
                                <textarea id="description" {...register('description')} />
                            </div>
                            <div className="Project-FormGroup">
                                <label htmlFor="color">Color</label>
                                <input id="color" type="color" defaultValue="#4A90D9" {...register('color')} />
                            </div>
                            <div className="Project-ModalActions">
                                <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creando...' : 'Crear proyecto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}