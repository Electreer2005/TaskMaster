import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStatsData } from '../../hooks/useStatsData';
import './Sub.css';

const STATUS_LABELS = { todo: 'Pendiente', in_progress: 'En progreso', done: 'Listo' };
const STATUS_COLORS = { todo: '#94A3B8', in_progress: '#3B82F6', done: '#22C55E' };
const PRIORITY_LABELS = { low: 'Baja', medium: 'Media', high: 'Alta' };
const PRIORITY_COLORS = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444' };

export default function StatsScreen() {
    const { loading, allTasks, projects, byStatus, byPriority } = useStatsData();

    if (loading) return <p className="Home-Loading">Cargando estadísticas...</p>;

    const totalTasks = allTasks.length;
    const doneCount = byStatus.find((s) => s.status === 'done')?.count || 0;
    const completionRate = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0;

    const pieData = byStatus.map((s) => ({ name: STATUS_LABELS[s.status], value: s.count, key: s.status }));
    const barData = byPriority.map((p) => ({ name: PRIORITY_LABELS[p.priority], value: p.count, key: p.priority }));

    return (
        <div className="Stats-Container">
            <Link to="/profile" className="Home-Link">← Volver al perfil</Link>
            <h1 className="title">Estadísticas</h1>

            <section className="Home-Stats">
                <div className="Stat-Card">
                    <span className="Stat-Number">{totalTasks}</span>
                    <span className="Stat-Label">Tareas totales</span>
                </div>
                <div className="Stat-Card">
                    <span className="Stat-Number">{completionRate}%</span>
                    <span className="Stat-Label">Completado</span>
                </div>
                <div className="Stat-Card">
                    <span className="Stat-Number">{projects.length}</span>
                    <span className="Stat-Label">Proyectos</span>
                </div>
            </section>

            {totalTasks === 0 ? (
                <p className="Home-Empty">Todavía no tenés tareas para mostrar estadísticas.</p>
            ) : (
                <>
                    <section className="Stats-ChartSection">
                        <h2>Tareas por status</h2>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                                    {pieData.map((entry) => (
                                        <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </section>

                    <section className="Stats-ChartSection">
                        <h2>Tareas por prioridad</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={barData}>
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="value">
                                    {barData.map((entry) => (
                                        <Cell key={entry.key} fill={PRIORITY_COLORS[entry.key]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </section>

                    <section className="Stats-ChartSection">
                        <h2>Progreso por proyecto</h2>
                        {projects.length === 0 ? (
                            <p className="Home-Empty">No tenés proyectos todavía.</p>
                        ) : (
                            <ul className="Stats-ProjectList">
                                {projects.map((p) => {
                                    const progress = p.taskCount ? Math.round((p.completedTaskCount / p.taskCount) * 100) : 0;
                                    return (
                                        <li key={p.id} className="Stats-ProjectItem">
                                            <div className="Stats-ProjectHeader">
                                                <span>{p.name}</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="Project-Progress-Bar">
                                                <div
                                                    className="Project-Progress-Fill"
                                                    style={{ width: `${progress}%`, backgroundColor: p.color }}
                                                />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}