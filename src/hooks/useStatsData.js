import { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { getIndependentTasks, getProjectTasks } from '../Api/Services/taskService';
import { getProjects } from '../Api/Services/projectService';

export function useStatsData() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [allTasks, setAllTasks] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const [independentTasks, projectsList] = await Promise.all([
                    getIndependentTasks(user.uid),
                    getProjects(user.uid),
                ]);

                const projectTasksArrays = await Promise.all(
                    projectsList.map((p) => getProjectTasks(user.uid, p.id))
                );

                if (!cancelled) {
                    setAllTasks([...independentTasks, ...projectTasksArrays.flat()]);
                    setProjects(projectsList);
                }
            } catch (error) {
                console.error('Error cargando estadísticas:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [user]);

    const byStatus = ['todo', 'in_progress', 'done'].map((status) => ({
        status,
        count: allTasks.filter((t) => t.status === status).length,
    }));

    const byPriority = ['low', 'medium', 'high'].map((priority) => ({
        priority,
        count: allTasks.filter((t) => t.priority === priority).length,
    }));

    return { loading, allTasks, projects, byStatus, byPriority };
}