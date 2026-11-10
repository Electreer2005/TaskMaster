import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
} from 'date-fns';

// Genera la grilla de 6 semanas (42 días) para el mes de `date`,
// incluyendo los días de relleno del mes anterior/siguiente.
export function getMonthGrid(date) {
    const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 }); // lunes
    const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });

    return eachDayOfInterval({ start, end }).map((day) => ({
        date: day,
        inCurrentMonth: isSameMonth(day, date),
        isToday: isToday(day),
    }));
}

export { isSameDay };