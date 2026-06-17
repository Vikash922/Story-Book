import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// Zero-config fallbacks for instant deployment anywhere (e.g. Vercel)
const firebaseConfig = {
  apiKey: "AIzaSyDWjNinft2YJyRZVRWZ_mGbBCvfoWOtyeg",
  authDomain: "beaming-dryad-xzc62.firebaseapp.com",
  projectId: "beaming-dryad-xzc62",
  storageBucket: "beaming-dryad-xzc62.firebasestorage.app",
  messagingSenderId: "279343468785",
  appId: "1:279343468785:web:30571a454c01db89d75950"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with local persistent caching so messages work instantly, even when offline or recovering
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { db };
