import { useAuth } from '../Context/AuthContext';
import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';
import TaskMasterProgressLoader from '../Components/Loader/TaskmasterMasterProgressLoader';

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return <TaskMasterProgressLoader message="Cargando..."/>;
    }

    return user ? <MainNavigator /> : <AuthNavigator />;
}