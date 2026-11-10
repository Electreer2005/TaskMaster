import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    runTransaction,
    increment,
    getDoc
} from 'firebase/firestore';
import { db } from '../Firebase/Config';

// ---- Independientes: users/{uid}/independentTasks ----

export function subscribeToIndependentTasks(uid, callback) {
    const q = query(collection(db, 'users', uid, 'independentTasks'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data(), source: 'independent' })));
    });
}

export async function getIndependentTasks(uid) {
    const q = query(collection(db, 'users', uid, 'independentTasks'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data(), source: 'independent' }));
}

export async function createIndependentTask(uid, { title, description, dueDate, priority, tags }) {
    return addDoc(collection(db, 'users', uid, 'independentTasks'), {
        title,
        description: description || '',
        dueDate: dueDate || null,
        priority: priority || 'medium',
        tags: tags || [],
        status: 'todo',
        createdAt: serverTimestamp(),
    });
}

export async function updateIndependentTaskStatus(uid, taskId, newStatus) {
    return updateDoc(doc(db, 'users', uid, 'independentTasks', taskId), { status: newStatus });
}

export async function updateIndependentTask(uid, taskId, data) {
    return updateDoc(doc(db, 'users', uid, 'independentTasks', taskId), data);
}

export async function deleteIndependentTask(uid, taskId) {
    return deleteDoc(doc(db, 'users', uid, 'independentTasks', taskId));
}

// ---- Proyectos: users/{uid}/projects/{projectId}/tasks ----

export async function getProjectTasks(uid, projectId) {
    const snap = await getDocs(collection(db, 'users', uid, 'projects', projectId, 'tasks'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data(), source: 'project', projectId }));
}

export function subscribeToProjectTasks(uid, projectId, callback) {
    const q = query(
        collection(db, 'users', uid, 'projects', projectId, 'tasks'),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data(), source: 'project', projectId })));
    });
}

export async function createProjectTask(uid, projectId, { title, description, dueDate, priority, tags }) {
    const projectRef = doc(db, 'users', uid, 'projects', projectId);
    const taskRef = doc(collection(db, 'users', uid, 'projects', projectId, 'tasks'));

    await runTransaction(db, async (tx) => {
        tx.set(taskRef, {
            title,
            description: description || '',
            dueDate: dueDate || null,
            priority: priority || 'medium',
            tags: tags || [],
            status: 'todo',
            createdAt: serverTimestamp(),
        });
        tx.update(projectRef, { taskCount: increment(1) });
    });

    return taskRef.id;
}

export async function updateProjectTaskStatus(uid, projectId, taskId, newStatus) {
    const projectRef = doc(db, 'users', uid, 'projects', projectId);
    const taskRef = doc(db, 'users', uid, 'projects', projectId, 'tasks', taskId);

    await runTransaction(db, async (tx) => {
        const [projectSnap, taskSnap] = await Promise.all([tx.get(projectRef), tx.get(taskRef)]);
        if (!projectSnap.exists() || !taskSnap.exists()) {
            throw new Error('El proyecto o la tarea ya no existen.');
        }

        const project = projectSnap.data();
        const oldStatus = taskSnap.data().status;
        if (oldStatus === newStatus) return;

        const wasDone = oldStatus === 'done';
        const isDone = newStatus === 'done';
        const newCompletedCount = (project.completedTaskCount || 0) + ((isDone ? 1 : 0) - (wasDone ? 1 : 0));

        tx.update(taskRef, { status: newStatus });

        const projectUpdate = { completedTaskCount: newCompletedCount };
        if (!project.statusOverride) {
            const allDone = project.taskCount > 0 && newCompletedCount === project.taskCount;
            projectUpdate.status = allDone ? 'completed' : 'active';
        }
        tx.update(projectRef, projectUpdate);
    });
}

export async function deleteProjectTask(uid, projectId, taskId, wasDone) {
    const projectRef = doc(db, 'users', uid, 'projects', projectId);
    const taskRef = doc(db, 'users', uid, 'projects', projectId, 'tasks', taskId);

    await runTransaction(db, async (tx) => {
        tx.delete(taskRef);
        tx.update(projectRef, {
            taskCount: increment(-1),
            completedTaskCount: increment(wasDone ? -1 : 0),
        });
    });
}

export async function getIndependentTask(uid, taskId) {
    const snap = await getDoc(doc(db, 'users', uid, 'independentTasks', taskId));
    return snap.exists() ? { id: snap.id, ...snap.data(), source: 'independent' } : null;
}

export async function getProjectTask(uid, projectId, taskId) {
    const snap = await getDoc(doc(db, 'users', uid, 'projects', projectId, 'tasks', taskId));
    return snap.exists() ? { id: snap.id, ...snap.data(), source: 'project', projectId } : null;
}

// Solo campos "de contenido". El status de tareas de proyecto NUNCA
// se toca acá — pasa siempre por updateProjectTaskStatus (mantiene
// sincronizados taskCount/completedTaskCount).
export async function updateProjectTask(uid, projectId, taskId, data) {
    const { status, ...rest } = data; // por las dudas, nunca dejamos que status se cuele
    return updateDoc(doc(db, 'users', uid, 'projects', projectId, 'tasks', taskId), rest);
}