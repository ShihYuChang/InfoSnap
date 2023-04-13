import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const getUserEmail = (callback) => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user.email);
    } else {
    }
  });
};
