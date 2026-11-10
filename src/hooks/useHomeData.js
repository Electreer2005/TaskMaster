import { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { getIndependentTasks, getProjectTasks } from '../Api/Services/taskService';
import { getProjects } from '../Api/Services/projectService';
import { toLocalDate, isSameDay } from '../utils/dateUtils';

export function useHomeData() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ pending: 0, done: 0, activeProjects: 0 });
    const [todayTasks, setTodayTasks] = useState([]);
    const [activeProjects, setActiveProjects] = useState([]);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                const [independentTasks, projects] = await Promise.all([
                    getIndependentTasks(user.uid),
                    getProjects(user.uid),
                ]);

                const activeProjectsList = projects.filter((p) => p.status !== 'completed');
                const projectTasksArrays = await Promise.all(
                    activeProjectsList.map((p) => getProjectTasks(user.uid, p.id))
                );
                const allTasks = [...independentTasks, ...projectTasksArrays.flat()];

                const today = new Date();
                const dueToday = allTasks.filter((t) => {
                    const due = toLocalDate(t.dueDate);
                    return due && isSameDay(due, today) && t.status !== 'done';
                });

                const pending = allTasks.filter((t) => t.status !== 'done').length;
                const done = allTasks.filter((t) => t.status === 'done').length;

                if (!cancelled) {
                    setStats({ pending, done, activeProjects: activeProjectsList.length });
                    setTodayTasks(dueToday);
                    setActiveProjects(activeProjectsList.slice(0, 4));
                }
            } catch (err) {
                if (!cancelled) setError(err);
                console.error('Error cargando datos del Home:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadData();
        return () => { cancelled = true; };
    }, [user]);

    return { loading, error, stats, todayTasks, activeProjects };
}