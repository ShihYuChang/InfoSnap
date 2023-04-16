import { useState } from 'react';
import { extensionDb } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import styled from 'styled-components';

const questions = ['carbs', 'protein', 'fat', 'note'];

const Wrapper = styled.form`
  width: 50%;
  margin: 0 auto;
  display: ${(props) => props.display};
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  padding-bottom: 30px;
`;

const Question = styled.div`
  width: 100%;
  display: flex;
  gap: 20px;
`;

const QuestionLabel = styled.label`
  width: 62px;
  font-size: 14px;
  line-height: 20px;
  flex-shrink: 0;
`;

const QuestionInput = styled.input`
  width: 50%;
  height: 20px;
`;

const SubmitBtn = styled.button`
  width: 90px;
  height: 40px;
  background-color: black;
  color: white;
  margin: 0 auto;
  margin-top: 20px;
`;

export default function Health({ display }) {
  const [userInput, setUserInput] = useState({});

  function handleChange(e, data) {
    e.target.name === 'note'
      ? setUserInput({
          ...userInput,
          [data]: e.target.value,
          created_time: serverTimestamp(),
        })
      : setUserInput({
          ...userInput,
          [data]: Number(e.target.value),
          created_time: serverTimestamp(),
        });
  }

  async function storeData() {
    await addDoc(
      collection(extensionDb, 'Users', 'sam21323@gmail.com', 'Health-Food'),
      userInput
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await storeData();
    alert('submit!');
  }

  return (
    <Wrapper onSubmit={handleSubmit} display={display}>
      {questions.map((item, index) => {
        return (
          <Question key={index}>
            <QuestionLabel>{item}</QuestionLabel>
            <QuestionInput
              onChange={(e) => {
                handleChange(e, item);
              }}
              type={item === 'note' ? 'text' : 'number'}
              name={item}
            />
          </Question>
        );
      })}
      <SubmitBtn type='submit'>Submit</SubmitBtn>
    </Wrapper>
  );
}
