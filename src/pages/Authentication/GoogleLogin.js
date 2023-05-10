import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { Timestamp, addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { useContext } from 'react';
import { FcGoogle } from 'react-icons/fc';
import styled from 'styled-components';
import { UserContext } from '../../context/UserContext';
import { db } from '../../utils/firebase';

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
      carbs: 20,
      protein: 5,
      fat: 6,
      note: 'Template',
      created_time: Timestamp.fromDate(now),
    });
    addDoc(collection(db, 'Users', email, 'Health-Goal'), {
      carbs: 200,
      protein: 50,
      fat: 60,
      name: 'My Plan',
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
        carbs: 200,
        fat: 50,
        protein: 60,
        name: 'My Plan',
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
