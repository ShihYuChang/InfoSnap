import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { alerts } from '../sweetAlert';
import { initUserDb } from './firebase';

export async function googleLogin(setUserInfo) {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (result._tokenResponse.isNewUser) {
      await initUserDb(user.email, user.displayName, user.photoURL);
    }
    setUserInfo({
      name: user.displayName,
      email: user.email,
      avatar: user.photoURL,
    });
  } catch (err) {
    alert('Something went wrong, please try again');
  }
}

export async function nativeSignUp(e, setUserInfo, userInput, handleNoAccount) {
  e.preventDefault();
  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userInput.email,
      userInput.password
    );
    await updateProfile(auth.currentUser, {
      displayName: `${userInput.first_name} ${userInput.last_name}`,
      photoURL:
        'https://lh3.googleusercontent.com/a/AGNmyxbw9C1PmtHQtUli_AJrtNFT1KWnF0lzXtCSANOk=s96-c',
    });
    const userEmail = userCredential.user.email;
    await initUserDb(
      userEmail,
      `${userInput.first_name} ${userInput.last_name}`,
      'https://lh3.googleusercontent.com/a/AGNmyxbw9C1PmtHQtUli_AJrtNFT1KWnF0lzXtCSANOk=s96-c'
    );
    setUserInfo({
      name: `${userInput.first_name} ${userInput.last_name}`,
      email: userInput.email,
      avatar:
        'https://lh3.googleusercontent.com/a/AGNmyxbw9C1PmtHQtUli_AJrtNFT1KWnF0lzXtCSANOk=s96-c',
    });
  } catch (error) {
    const errorCode = error.code;
    if (errorCode === 'auth/email-already-in-use') {
      alert('Email already in use. Please sign in instead.');
      handleNoAccount();
    } else if (errorCode === 'auth/weak-password') {
      alert('Password is too weak. Please choose a stronger password.');
    } else {
      alert('Something went wrong. Please try again later.');
    }
  }
}

export async function nativeSignIn(e, email, password) {
  e.preventDefault();
  try {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const errorCode = error.code;
    if (errorCode === 'auth/user-not-found') {
      alert('User not found. Please sign up first.');
    } else if (errorCode === 'auth/wrong-password') {
      alert('Wrong password. Please try again.');
    } else {
      alert('Something went wrong. Please try again later.');
    }
  }
}

export async function getUserInfo(setUserInfo, setIsLoading) {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUserInfo({
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL,
      });
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  });
}

export async function changeUserName(newName, callback) {
  callback();
  const auth = getAuth();
  await updateProfile(auth.currentUser, {
    displayName: newName,
  });
}

export async function handleSignOut() {
  const auth = getAuth();
  try {
    await signOut(auth);
    await alerts.titleOnly('Sign Out Successfully!', 'success');
    window.location.href = '/';
  } catch (err) {
    alerts.titleOnly('Something went wrong. Please try again later', 'error');
  }
}
