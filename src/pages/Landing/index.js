import React from 'react';
import Main from './Main';
import Header from './Header';
import styled from 'styled-components/macro';

const Wrapper = styled.div`
  background-color: #181818;
`;

export default function LandingPage() {
  return (
    <Wrapper>
      <Header />
      <Main></Main>
    </Wrapper>
  );
}
