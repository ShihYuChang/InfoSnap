import React from 'react';
import styled from 'styled-components/macro';
import Header from './Header';
import Main from './Main';

const Wrapper = styled.div`
  background-color: #181818;
  display: ${(props) => props.display};
`;

export default function LandingPage({ display }) {
  return (
    <Wrapper display={display}>
      <Header />
      <Main></Main>
    </Wrapper>
  );
}
