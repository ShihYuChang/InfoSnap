import { useContext } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { UserContext } from '../context/userContext';

export default function Login() {
  const { setEmail } = useContext(UserContext);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  function login() {
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        setEmail(user.email);
      })
      .catch((err) => {
        const errorCode = err.code;
        const errorMessage = err.message;
        const email = err.customData.email;
        console.log(errorCode, errorMessage, email);
      });
  }

  return <button onClick={login}>Login</button>;
}
