import { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { getIndependentTasks, getProjectTasks } from '../Api/Services/taskService';
import { getProjects } from '../Api/Services/projectService';
import { toLocalDate } from '../utils/dateUtils';

export function useCalendarData() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        async function loadAll() {
            setLoading(true);
            try {
                const [independentTasks, projects] = await Promise.all([
                    getIndependentTasks(user.uid),
                    getProjects(user.uid),
                ]);

                const activeProjects = projects.filter((p) => p.status !== 'completed');
                const projectTasksArrays = await Promise.all(
                    activeProjects.map((p) => getProjectTasks(user.uid, p.id))
                );

                const allTasks = [...independentTasks, ...projectTasksArrays.flat()]
                    .filter((t) => t.dueDate)
                    .map((t) => ({ ...t, dueDateObj: toLocalDate(t.dueDate) }))
                    .filter((t) => t.dueDateObj); // descarta fechas que no se pudieron parsear

                if (!cancelled) setTasks(allTasks);
            } catch (error) {
                console.error('Error cargando tareas del calendario:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadAll();
        return () => { cancelled = true; };
    }, [user]);

    return { tasks, loading };
}