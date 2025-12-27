
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSpSL9wAfpXF52YALB6fSzItOOx3bnito",
  authDomain: "healthflow-6256b.firebaseapp.com",
  projectId: "healthflow-6256b",
  storageBucket: "healthflow-6256b.firebasestorage.app",
  messagingSenderId: "57094495814",
  appId: "1:57094495814:web:9ab21937a5afaae16a7447",
  measurementId: "G-CF5B22D14M"
};

// Singleton para garantir que o app não seja inicializado múltiplas vezes
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Ativando persistência offline para Firestore
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Múltiplas abas abertas
    } else if (err.code === 'unimplemented') {
      // Navegador sem suporte
    }
  });
}
