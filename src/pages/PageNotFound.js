import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { StateContext } from '../context/StateContext';

const Wrapper = styled.div`
  display: flex;
  width: 50%;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding-top: 300px;
  margin: 0 auto;
`;

const Title = styled.div`
  font-size: 150px;
`;

const SubTitle = styled.div`
  font-size: 30px;
`;

const Button = styled.button`
  width: 250px;
  height: 50px;
  border: 0;
  outline: none;
  border-radius: 20px;
  background-color: #3a6ff7;
  color: white;
  font-size: 20px;
  cursor: pointer;
`;

export default function PageNotFound() {
  const navigate = useNavigate();
  const { setIsPageNotFound } = useContext(StateContext);

  useEffect(() => {
    setIsPageNotFound(true);
  }, []);

  return (
    <Wrapper>
      <Title>404</Title>
      <SubTitle>Page Not Found</SubTitle>
      <Button
        onClick={() => {
          navigate('/');
        }}
      >
        Go Home
      </Button>
    </Wrapper>
  );
}
