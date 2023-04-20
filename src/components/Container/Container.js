import React from 'react';
import styled from 'styled-components/macro';

const Wrapper = styled.div`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: #1b2028;
  flex-grow: 1;
  border-radius: ${(props) => (props.borderRaious ? '10px' : 0)};
`;

// const TitleContainer = styled.div`
//   display: ${(props) => (props.display ? 'flex' : 'none')};
//   box-sizing: border-box;
//   width: 100%;
//   height: 80px;
//   border-radius: 10px;
//   background-color: #3a6ff7;
//   justify-content: space-around;
//   color: white;
//   padding: 23px 36px;
// `;

export default function Container({ children, height, width, borderRaious }) {
  return (
    <Wrapper width={width} height={height} borderRaious={borderRaious}>
      {children}
    </Wrapper>
  );
}
