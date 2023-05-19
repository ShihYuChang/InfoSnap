// import React, { useContext, useState } from 'react';
// import { AuthContext } from '../../context/AuthContext';
// import {
//   Button,
//   ContentWrapper,
//   Input,
//   InputLabel,
//   InputWrapper,
//   SignUpPrompt,
//   SignUpPromptWrapper,
// } from './SignIn';

// const questions = [
//   { label: 'Email', value: 'email', type: 'text' },
//   { label: 'Password', value: 'password', type: 'password' },
// ];

// export default function SignUp() {
//   const { isSignUp } = useContext(AuthContext);
//   const [userInput, setUserInput] = useState({});

//   function handleInput(value, e) {
//     const inputs = { ...userInput, [value]: e.target.value };
//     setUserInput(inputs);
//   }

//   function signUp(e) {
//     e.preventDefault();
//     const auth = getAuth();
//     createUserWithEmailAndPassword(auth, userInput.email, userInput.password)
//       .then((userCredential) => {
//         const userEmail = userCredential.user.email;
//         setEmail(userEmail);
//         initUserDb(userEmail);
//         alert('Register Success!');
//       })
//       .catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         if (errorCode === 'auth/email-already-in-use') {
//           alert('Email already in use. Please sign in instead.');
//           goToSignIn();
//         } else if (errorCode === 'auth/weak-password') {
//           alert('Password is too weak. Please choose a stronger password.');
//         } else {
//           console.log(errorMessage);
//           alert('Something went wrong. Please try again later.');
//         }
//         console.log(`Error Code: ${errorCode}
//           Error Message: ${errorMessage}`);
//       });
//   }
//   return (
//     <ContentWrapper
//       display={isSignUp ? 'flex' : 'none'}
//       onSubmit={signIn}
//       id='signUp'
//     >
//       {questions.map((question, index) => (
//         <InputWrapper key={index}>
//           <InputLabel>{question.label}</InputLabel>
//           <Input
//             type={question.type}
//             onChange={(e) => {
//               handleInput(question.value, e);
//             }}
//           />
//         </InputWrapper>
//       ))}
//       <Button onClick={signUp}>SIGN UP</Button>
//       <SignUpPromptWrapper onClick={goToSignIn}>
//         <SignUpPrompt>Already Have an Account?</SignUpPrompt>
//         <SignUpPrompt color='#4285f4'>Sign In</SignUpPrompt>
//       </SignUpPromptWrapper>
//     </ContentWrapper>
//   );
// }
