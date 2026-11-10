import { Link } from 'react-router-dom';
import { useTheme } from '../../Context/ThemeContext';
import './Sub.css';

const OPTIONS = [
    { value: 'light', label: 'Claro', icon: 'fa-sun' },
    { value: 'dark', label: 'Oscuro', icon: 'fa-moon' },
    { value: 'system', label: 'Sistema', icon: 'fa-desktop' },
];

export default function ThemeSettingsScreen() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="Profile-Container">
            <Link to="/profile" className="Home-Link">← Volver al perfil</Link>

            <div className="Profile-Card">
                <h1 className="title-profile">Apariencia</h1>

                <div className="Theme-OptionList">
                    {OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            className={`Theme-Option ${theme === opt.value ? 'active' : ''}`}
                            onClick={() => setTheme(opt.value)}
                        >
                            <i className={`fa-solid ${opt.icon}`}></i>
                            <span>{opt.label}</span>
                            {theme === opt.value && <i className="fa-solid fa-check"></i>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}