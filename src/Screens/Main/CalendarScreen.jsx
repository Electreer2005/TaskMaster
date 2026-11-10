import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addMonths, subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getMonthGrid, isSameDay } from '../../utils/calendarUtils';
import { useCalendarData } from '../../hooks/useCalendarData';
import TaskMasterLoader from '../../Components/Loader/TaskMasterLoader';
import './Main.css';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarScreen() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());

    const { tasks, loading } = useCalendarData();

    const monthGrid = useMemo(() => getMonthGrid(currentMonth), [currentMonth]);

    const tasksByDay = (day) => tasks.filter((t) => isSameDay(t.dueDateObj, day));

    const selectedDayTasks = useMemo(() => tasksByDay(selectedDay), [tasks, selectedDay]);

    return (
        <div className="Calendar-Container">
            <h1 className="title">Calendario</h1>

            <div className="Calendar-Header">
                <button onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>‹</button>
                <span className="Calendar-MonthLabel">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </span>
                <button onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>›</button>
            </div>

            {loading ? (
                <TaskMasterLoader message="Cargando calendario..."/>
            ) : (
                <>
                    <div className="Calendar-Weekdays">
                        {WEEKDAYS.map((d) => (
                            <span key={d} className="Calendar-Weekday">{d}</span>
                        ))}
                    </div>

                    <div className="Calendar-Grid">
                        {monthGrid.map(({ date, inCurrentMonth, isToday }) => {
                            const dayTasks = tasksByDay(date);
                            const isSelected = isSameDay(date, selectedDay);

                            return (
                                <button
                                    key={date.toISOString()}
                                    className={[
                                        'Calendar-Day',
                                        !inCurrentMonth && 'Calendar-Day-outside',
                                        isToday && 'Calendar-Day-today',
                                        isSelected && 'Calendar-Day-selected',
                                    ].filter(Boolean).join(' ')}
                                    onClick={() => setSelectedDay(date)}
                                >
                                    <span className="Calendar-DayNumber">{date.getDate()}</span>
                                    {dayTasks.length > 0 && (
                                        <span className="Calendar-DayDot">{dayTasks.length}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <section className="Calendar-DayDetail">
                        <h2>{format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}</h2>
                        {selectedDayTasks.length === 0 ? (
                            <p className="Home-Empty">No hay tareas para este día.</p>
                        ) : (
                            <ul className="Task-List">
                                {selectedDayTasks.map((task) => {
                                    const detailLink = task.source === 'project'
                                        ? `/projects/${task.projectId}/tasks/${task.id}`
                                        : `/tasks/${task.id}`;

                                    return (
                                        <li key={task.id} className={`Task-Item ${task.status === 'done' ? 'completed' : ''}`}>
                                            <div className="Task-Info">
                                                <Link to={detailLink} className="Task-Title">{task.title}</Link>
                                                {task.source === 'project' && (
                                                    <span className="Home-TaskBadge">Proyecto</span>
                                                )}
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