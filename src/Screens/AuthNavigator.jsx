import {Routes, Route } from 'react-router-dom';
import SplashScreen from './Auth/SplashScreen';
import LoginScreen from './Auth/LoginScreen';
import RegisterScreen from './Auth/RegisterScreen';
import ForgotPasswordScreen from './Auth/ForgotPasswordScreen';

export default function AuthNavigator({ setUser }){
    return(
        <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginScreen setUser={setUser} />} />
            <Route path="/register" element={<RegisterScreen setUser={setUser} />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        </Routes>
    )
}