export function toLocalDate(value) {
    if (!value) return null;
    // Firestore Timestamp trae .toDate(); si ya es Date la devolvemos tal cual
    return typeof value.toDate === 'function' ? value.toDate() : new Date(value);
}

export function isSameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}