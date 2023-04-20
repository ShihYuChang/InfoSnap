import React from 'react';
import Button from '../components/Buttons/Button';
import Question from '../components/Inputs/Question';
import Title from '../components/Title/Title';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Wrapper = styled.div`
  background-color: #31353f;
  width: 80%;
  margin: 50px auto;
  padding: 100px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export default function Component() {
  return (
    <Wrapper>
      <Button selected onClick={() => alert('featured')} icon>
        <FontAwesomeIcon icon={faEnvelope} size='1x' />
        FEATURED
      </Button>
      <Button onClick={() => alert('normal')}>NORMAL</Button>
      <Question wrapperWidth='100%' height='50px' labelWidth='150px'>
        Title
      </Question>
      <Title width='100%' height='50px'>
        <FontAwesomeIcon icon={faEnvelope} size='1x' />
        Title
      </Title>
    </Wrapper>
  );
}
