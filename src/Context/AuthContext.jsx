import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../Api/Firebase/Config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
                const profileData = profileSnap.exists() ? profileSnap.data() : {};
                setUser({ ...firebaseUser, ...profileData });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

    const register = async (name, email, password) => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(credential.user, { displayName: name });

        await setDoc(doc(db, 'users', credential.user.uid), {
            displayName: name,
            email,
            createdAt: serverTimestamp(),
        });

        return credential;
    };

    const logout = () => signOut(auth);

    const resetPassword = (email) => sendPasswordResetEmail(auth, email);

    const updateProfilePhoto = async (file) => {
        if (!auth.currentUser) return;

        const photoRef = ref(storage, `profilePhotos/${auth.currentUser.uid}`);
        await uploadBytes(photoRef, file);
        const photoURL = await getDownloadURL(photoRef);

        await updateProfile(auth.currentUser, { photoURL });
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL });

        setUser((prev) => ({ ...prev, photoURL }));
        return photoURL;
    };

    const updateDisplayName = async (name) => {
        if (!auth.currentUser) return;

        await updateProfile(auth.currentUser, { displayName: name });
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { displayName: name });

        setUser((prev) => ({ ...prev, displayName: name }));
    };

    // Firebase exige reautenticar antes de cambiar la contraseña
    const changePassword = async (currentPassword, newPassword) => {
        if (!auth.currentUser) return;

        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        resetPassword,
        updateProfilePhoto,
        updateDisplayName,
        changePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}