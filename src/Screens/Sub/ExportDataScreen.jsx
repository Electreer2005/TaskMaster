import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../Context/AuthContext';
import { getIndependentTasks, getProjectTasks } from '../../Api/Services/taskService';
import { getProjects } from '../../Api/Services/projectService';
import { downloadFile, buildExportData, buildCSV } from '../../utils/exportUtils';
import './Sub.css';

export default function ExportDataScreen() {
    const { user } = useAuth();
    const [exporting, setExporting] = useState(null); // 'json' | 'csv' | null

    async function gatherData() {
        const [independentTasks, projects] = await Promise.all([
            getIndependentTasks(user.uid),
            getProjects(user.uid),
        ]);

        const projectTasksArrays = await Promise.all(
            projects.map((p) => getProjectTasks(user.uid, p.id))
        );

        const projectTasksByProject = {};
        projects.forEach((p, i) => {
            projectTasksByProject[p.id] = projectTasksArrays[i];
        });

        return { independentTasks, projects, projectTasksByProject };
    }

    const handleExport = async (format) => {
        setExporting(format);
        try {
            const { independentTasks, projects, projectTasksByProject } = await gatherData();
            const dateStr = new Date().toISOString().slice(0, 10);

            if (format === 'json') {
                const data = buildExportData(independentTasks, projects, projectTasksByProject);
                downloadFile(JSON.stringify(data, null, 2), `taskmaster-export-${dateStr}.json`, 'application/json');
            } else {
                const csv = buildCSV(independentTasks, projects, projectTasksByProject);
                downloadFile(csv, `taskmaster-export-${dateStr}.csv`, 'text/csv');
            }

            toast.success('Exportación lista, revisá tus descargas');
        } catch (error) {
            console.error('Error exportando datos:', error);
            toast.error('No se pudo exportar la información.');
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="Profile-Container">
            <Link to="/profile" className="Home-Link">← Volver al perfil</Link>

            <div className="Profile-Card">
                <h1 className="title-profile">Exportar datos</h1>
                <p className="Profile-ExportDescription">
                    Descargá todas tus tareas y proyectos en el formato que prefieras.
                </p>

                <div className="Profile-ExportActions">
                    <button
                        className="Profile-ExportButton"
                        onClick={() => handleExport('json')}
                        disabled={exporting !== null}
                    >
                        <i className="fa-solid fa-file-code"></i>
                        {exporting === 'json' ? 'Generando...' : 'Exportar como JSON'}
                    </button>

                    <button
                        className="Profile-ExportButton"
                        onClick={() => handleExport('csv')}
                        disabled={exporting !== null}
                    >
                        <i className="fa-solid fa-file-csv"></i>
                        {exporting === 'csv' ? 'Generando...' : 'Exportar como CSV'}
                    </button>
                </div>
            </div>
        </div>
    );
}