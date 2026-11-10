import {Link} from 'react-router-dom';
import Logo from '../../assets/Logo.png';
import './Auth.css';

export default function SplashScreen(){
    return(
        <div className="Splash-container">
            <img src={Logo} alt="Logo" className="Splash-logo" />
            <h1 className="Splash-title">Bienvenido a Task Master</h1>
            <p className="Splash-subtitle">Tu aplicación de gestión de tareas definitiva</p>
            <Link to="/login" className="Splash-button">Comenzar</Link>
        </div>
    )
}
