import styled from 'styled-components';
import { useContext } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { db } from '../../firebase';
import { addDoc, collection, Timestamp, setDoc, doc } from 'firebase/firestore';
import { UserContext } from '../../context/userContext';
import { FcGoogle } from 'react-icons/fc';

const Button = styled.button`
  width: 100%;
  height: 50px;
  background-color: #4285f4;
  color: white;
  border: 0;
  border-radius: 10px;
  letter-spacing: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
`;

export default function GoogleLogin() {
  const { setEmail, setUserInfo } = useContext(UserContext);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  async function initUserDb(email, userInfo) {
    const now = new Date();
    const currenYear = new Date().getFullYear();
    addDoc(collection(db, 'Users', email, 'Health-Food'), {
      carbs: 0,
      protein: 0,
      fat: 0,
      note: 'Template',
      created_time: Timestamp.fromDate(now),
    });
    addDoc(collection(db, 'Users', email, 'Health-Goal'), {
      carbs: 0,
      protein: 0,
      fat: 0,
      name: 'Template',
    });
    addDoc(collection(db, 'Users', email, 'Finance'), {
      amount: 0,
      categoty: 'food',
      note: 'Template',
      date: Timestamp.fromDate(now),
      tag: 'expense',
    });
    addDoc(collection(db, 'Users', email, 'Notes'), {
      archived: false,
      title: 'Template',
      context: 'Template',
      created_time: Timestamp.fromDate(now),
      image_url: null,
      pinned: true,
    });
    await addDoc(collection(db, 'Users', email, 'Tasks'), {
      expireDate: Timestamp.fromDate(now),
      status: 'to-do',
      startDate: Timestamp.fromDate(now),
      task: 'Template',
      index: 0,
    });
    setDoc(doc(db, 'Users', email), {
      Name: userInfo.displayName,
      photoURL: userInfo.photoURL,
      savgingsGoal: 0,
      monthlyIncome: 0,
      currentHealthGoal: {
        carbs: 0,
        fat: 0,
        protein: 0,
        name: 'Template',
      },
      monthlyNetIncome: {
        [currenYear]: Array(12).fill(0),
      },
    });
  }

  function login() {
    // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        result._tokenResponse.isNewUser &&
          initUserDb(user.email, user).then(() => {
            setUserInfo({
              name: user.displayName,
              email: user.email,
              avatar: user.photoURL,
            });
            setEmail(user.email);
          });
      })
      .catch((err) => {
        const errorCode = err.code;
        const errorMessage = err.message;
        const email = err.customData.email;
        console.log(errorCode, errorMessage, email);
      });
  }

  return (
    <Button onClick={login}>
      Sign in with Google
      <IconWrapper>
        <FcGoogle size={25} />
      </IconWrapper>
    </Button>
  );
}
