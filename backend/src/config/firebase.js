import admin from 'firebase-admin';
import serviceAccountKey from './serviceAccountKey.js';

admin.initializeApp({
credential:admin.credential.cert(serviceAccountKey),
    // databaseURL:"https://console.firebase.google.com/project/classroom-management-app-3d659"
})

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
export  {db,FieldValue,admin};