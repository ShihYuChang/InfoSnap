import React from 'react';
import Main from './Main';
import Header from './Header';
import styled from 'styled-components/macro';

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
