import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // wait, it may need the database ID

async function run() {
  const users = await getDocs(collection(db, 'users'));
  users.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}
run().catch(console.error);
