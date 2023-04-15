import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export const getUserEmail = (callback) => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user.email);
    } else {
    }
  });
};

export const getTimestamp = (daysAgo, hr, min, sec, nanosec) => {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  now.setHours(hr, min, sec, nanosec);
  const timestamp = Timestamp.fromDate(now);
  return timestamp;
};
