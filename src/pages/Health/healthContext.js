import { useState, createContext, useEffect, useContext } from 'react';
import {
  Timestamp,
  onSnapshot,
  query,
  collection,
  orderBy,
  startAfter,
  endBefore,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { UserContext } from '../../context/userContext';

const initialNutrition = [
  { title: 'Protein', total: 0, goal: 170 },
  { title: 'Carbs', total: 0, goal: 347 },
  { title: 'Fat', total: 0, goal: 69 },
];

export const HealthContext = createContext({
  intakeRecords: [],
  searchedFood: [],
  selectedFood: null,
  nutritions: initialNutrition,
  hasSearched: false,
  setSearchedFood: () => {},
  setSelectedFood: () => {},
  setNutritions: () => {},
  setIntakeRecords: () => {},
  setHasSearched: () => {},
});

function getTimestamp(hr, min, sec, nanosec) {
  const now = new Date();
  now.setHours(hr, min, sec, nanosec);
  const timestamp = Timestamp.fromDate(now);
  return timestamp;
}

function getNutritionTotal(data) {
  const contents = [];
  data.forEach((obj) => contents.push(obj.content));
  const totals = contents.reduce(
    (acc, cur) => {
      return {
        protein: Number(acc.protein) + Number(cur.protein),
        carbs: Number(acc.carbs) + Number(cur.carbs),
        fat: Number(acc.fat) + Number(cur.fat),
      };
    },
    { protein: 0, carbs: 0, fat: 0 }
  );
  return totals;
}

export const HealthContextProvider = ({ children }) => {
  const { email } = useContext(UserContext);
  const [intakeRecords, setIntakeRecords] = useState([]);
  const [nutritions, setNutritions] = useState(initialNutrition);
  const [searchedFood, setSearchedFood] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  function updateData(rawData) {
    const newData = [...rawData];
    const intakeToday = getNutritionTotal(intakeRecords);
    newData.forEach((data) => {
      const name = data.title.toLowerCase();
      data.total = intakeToday[name];
    });
    return newData;
  }

  // useEffect(() => {
  //   const startOfToday = getTimestamp(0, 0, 0, 0);
  //   const endOfToday = getTimestamp(23, 59, 59, 59);
  //   const foodSnap = onSnapshot(
  //     query(
  //       collection(db, 'Users', email, 'Health-Food'),
  //       orderBy('created_time', 'asc'),
  //       startAfter(startOfToday),
  //       endBefore(endOfToday)
  //     ),
  //     (querySnapshot) => {
  //       const records = [];
  //       querySnapshot.forEach((doc) => {
  //         records.push({ content: doc.data(), id: doc.id });
  //       });
  //       setIntakeRecords(records);
  //     }
  //   );
  //   return foodSnap;
  // }, []);

  useEffect(() => {
    if (intakeRecords) {
      setNutritions(updateData(nutritions));
    }
  }, [intakeRecords]);

  return (
    <HealthContext.Provider
      value={{
        searchedFood,
        setSearchedFood,
        selectedFood,
        setSelectedFood,
        nutritions,
        setNutritions,
        intakeRecords,
        setIntakeRecords,
        hasSearched,
        setHasSearched,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};
