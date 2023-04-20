import React from 'react';
import Button from '../components/Buttons/Button';
import styled from 'styled-components/macro';
import { FaCoffee } from 'react-icons/fa';

const Wrapper = styled.div`
  width: 50%;
  margin: 50px auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export default function Component() {
  return (
    <Wrapper>
      <Button selected onClick={() => alert('featured')}>
        FEATURED
      </Button>
      <Button onClick={() => alert('normal')}>NORMAL</Button>
      <FaCoffee />
    </Wrapper>
  );
}
