import React from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function Login() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  function saveLoginToken(user) {
    const strinifyUser = JSON.stringify(user);
    localStorage.setItem('user', strinifyUser);
  }

  function handleLogin() {
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
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
  return <button onClick={handleLogin}>Login</button>;
}
