import { useState } from 'react';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';

export default function Login() {
  const localStorageUserData = JSON.parse(localStorage.getItem('user'));
  console.log(localStorageUserData);
  const [user, setUser] = useState(localStorageUserData);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  function saveLoginToken(user) {
    const strinifyUser = JSON.stringify(user);
    localStorage.setItem('user', strinifyUser);
  }

  function login() {
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        setUser(user);
        saveLoginToken(user);
        console.log(user, token);
      })
      .catch((err) => {
        const errorCode = err.code;
        const errorMessage = err.message;
        const email = err.customData.email;
        console.log(errorCode, errorMessage, email);
      });
  }

  function logOut() {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        localStorage.removeItem('user');
        setUser(null);
        alert('Sign Out Successfully!');
      })
      .catch((err) => console.log(err));
  }

  return (
    <>
      {localStorageUserData ? (
        <>
          <button onClick={logOut}>Log Out</button>
          <div>{user.displayName}</div>
          <div>{user.email}</div>
          <img src={user.photoURL} alt='user avatar'></img>
        </>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </>
  );
}
