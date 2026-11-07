import * as admin from 'firebase-admin';

export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_PROJECT_ID !== 'your_project_id' &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY
);

export function getFirebaseAdminApp() {
  if (!isFirebaseAdminConfigured) {
    return null;
  }

  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  try {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    return null;
  }
}

export function getAdminFirestore() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return null;
  return adminApp.firestore();
}

export function getAdminAuth() {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return null;
  return adminApp.auth();
}

