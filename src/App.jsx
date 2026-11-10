import { AuthProvider } from './Context/AuthContext';
import { ThemeProvider } from './Context/ThemeContext';
import AppNavigator from './Screens/AppNavigator';
import './App.css';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App-container">
          <AppNavigator />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}