import React from 'react';
import styled from 'styled-components/macro';

const Wrapper = styled.div`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: #1b2028;
  border-radius: 10px;
`;

const TitleContainer = styled.div`
  display: ${(props) => (props.display ? 'flex' : 'none')};
  width: 100%;
  height: 80px;
  border-radius: 10px;
  background-color: #3a6ff7;
  gap: 30px;
  color: white;
`;

export default function Container({ children, height, width, hasTitle }) {
  return (
    <Wrapper width={width} height={height}>
      <TitleContainer display={hasTitle}>{children}</TitleContainer>
    </Wrapper>
  );
}
