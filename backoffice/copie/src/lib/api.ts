import { db } from "./firebaseServices";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// ==========================
// 🌍 BACKEND API (inchangé)
// ==========================
export const apiBaseUrl =
  (import.meta as ImportMeta).env?.VITE_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

export async function apiGet(path: string, options: RequestInit = {}) {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost(path: string, body: unknown, options: RequestInit = {}) {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPatch(path: string, body: unknown, options: RequestInit = {}) {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: "PATCH",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiDelete(path: string, options: RequestInit = {}) {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: "DELETE",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    credentials: "include",
  });
  if (!res.ok && res.status !== 204)
    throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.status === 204 ? { ok: true } : res.json();
}

export function withAdminKey(adminKey: string) {
  return {
    headers: {
      "x-admin-key": adminKey,
    },
  } as RequestInit;
}

// ==========================
// 🔥 FIREBASE CRUD (AJOUT)
// ==========================

// ➕ CREATE
export const addDocument = async (collectionName: string, data: any) => {
  const docRef = await addDoc(collection(db, collectionName), data);
  return { id: docRef.id };
};

// 📥 READ ALL
export const getDocuments = async (collectionName: string) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// 📄 READ ONE
export const getDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) throw new Error("Document not found");

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

// ✏️ UPDATE
export const updateDocument = async (
  collectionName: string,
  id: string,
  data: any
) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
  return { id };
};

// ❌ DELETE
export const deleteDocument = async (
  collectionName: string,
  id: string
) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
  return { id };
};