import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function checkReviews() {
  try {
    const snap = await getDocs(collection(db, 'reviews'));
    console.log(`Reviews count: ${snap.docs.length}`);
    for (const d of snap.docs) {
      console.log(`Doc ID: ${d.id}`, d.data());
    }
  } catch (err: any) {
    console.error('Error fetching reviews:', err.message);
  }
  process.exit(0);
}

checkReviews();
