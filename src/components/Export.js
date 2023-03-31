import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const firebaseConfig = {
  apiKey: 'AIzaSyCrg6sxxS6Drp-CAFHdmvoVkUaaCkunlu8',
  authDomain: 'infosnap-4f11e.firebaseapp.com',
  projectId: 'infosnap-4f11e',
  storageBucket: 'infosnap-4f11e.appspot.com',
  messagingSenderId: '112276311326',
  appId: '1:112276311326:web:0b279e4293298cce98cd0f',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userRef = collection(db, 'Users');
const userDocRef = doc(userRef, 'sam21323@gmail.com');
const healthFoodRef = collection(userDocRef, 'Health-Food');

function handleTimestamp(timestamp) {
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  const formattedDate = date.toLocaleString().replace(',', '');
  return formattedDate;
}

function Export() {
  const [data, setData] = useState([]);
  const [fileUrl, setFileUrl] = useState('');
  useEffect(() => {
    const csvString = [
      ['note', 'carbs', 'protein', 'fat', 'created_time'],
      ...data.map((item) => [
        item.note,
        item.carbs,
        item.protein,
        item.fat,
        handleTimestamp(item.created_time),
      ]),
    ]
      .map((e) => e.join(','))
      .join('\n');
    console.log(csvString);
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    setFileUrl(url);
  }, [data]);

  return (
    <div
      className='App'
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center',
      }}
    >
      <a href={fileUrl} download='nutrition.csv'>
        download file!
      </a>
      <button
        onClick={() => {
          getDocs(healthFoodRef)
            .then((querySnapshot) => {
              const records = [];
              querySnapshot.forEach((doc) => {
                records.push(doc.data());
              });
              setData(records);
            })
            .catch((error) => {
              console.error('Error getting documents:', error);
            });
        }}
      >
        Get Firebase Data!
      </button>
    </div>
  );
}

export default Export;
