import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy,
} from 'firebase/firestore';
import { db } from '../Firebase/Config';

export async function getProjects(uid) {
    const q = query(collection(db, 'users', uid, 'projects'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProject(uid, projectId) {
    const snap = await getDoc(doc(db, 'users', uid, 'projects', projectId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createProject(uid, { name, description, color }) {
    return addDoc(collection(db, 'users', uid, 'projects'), {
        name,
        description: description || '',
        color: color || '#4A90D9',
        status: 'active',
        statusOverride: false,
        taskCount: 0,
        completedTaskCount: 0,
        createdAt: serverTimestamp(),
    });
}

export async function setProjectStatusManually(uid, projectId, status) {
    return updateDoc(doc(db, 'users', uid, 'projects', projectId), {
        status,
        statusOverride: true,
    });
}

export async function updateProject(uid, projectId, data) {
    return updateDoc(doc(db, 'users', uid, 'projects', projectId), data);
}

export async function deleteProject(uid, projectId) {
    return deleteDoc(doc(db, 'users', uid, 'projects', projectId));
}