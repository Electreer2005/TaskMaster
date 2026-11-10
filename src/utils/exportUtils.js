export function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

export function buildExportData(independentTasks, projects, projectTasksByProject) {
    return {
        exportedAt: new Date().toISOString(),
        independentTasks: independentTasks.map(({ source, ...t }) => t),
        projects: projects.map((p) => ({
            ...p,
            tasks: (projectTasksByProject[p.id] || []).map(({ source, projectId, ...t }) => t),
        })),
    };
}

export function buildCSV(independentTasks, projects, projectTasksByProject) {
    const headers = ['Tipo', 'Proyecto', 'Título', 'Descripción', 'Status', 'Prioridad', 'Fecha límite', 'Tags'];
    const rows = [headers];

    independentTasks.forEach((t) => {
        rows.push([
            'Independiente', '', t.title, t.description || '', t.status, t.priority,
            t.dueDate || '', (t.tags || []).join(' | '),
        ]);
    });

    projects.forEach((p) => {
        (projectTasksByProject[p.id] || []).forEach((t) => {
            rows.push([
                'Proyecto', p.name, t.title, t.description || '', t.status, t.priority,
                t.dueDate || '', (t.tags || []).join(' | '),
            ]);
        });
    });

    // Escapamos comillas y comas envolviendo cada celda en comillas dobles
    return rows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
}