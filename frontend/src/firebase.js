import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, onDisconnect } from 'firebase/database';

// Replace these with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let app, database;
try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (error) {
  console.log("Firebase initialization failed or missing config. Mocking realtime DB.");
}

export const subscribeToCourseViewers = (courseId, callback) => {
  if (!database) {
    // Mock random viewer count if Firebase isn't configured
    const mockCount = Math.floor(Math.random() * 50) + 1;
    callback(mockCount);
    return () => {};
  }

  const viewersRef = ref(database, `course_viewers/${courseId}`);
  const listener = onValue(viewersRef, (snapshot) => {
    const data = snapshot.val();
    const count = data ? Object.keys(data).length : 0;
    callback(count);
  });
  
  return () => listener();
};

export const joinCourseRoom = (courseId, userId) => {
  if (!database) return;
  const userRef = ref(database, `course_viewers/${courseId}/${userId}`);
  set(userRef, true);
  onDisconnect(userRef).remove();
};

export const leaveCourseRoom = (courseId, userId) => {
  if (!database) return;
  const userRef = ref(database, `course_viewers/${courseId}/${userId}`);
  set(userRef, null);
};
