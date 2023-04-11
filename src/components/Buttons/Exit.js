import React from 'react';
import styled from 'styled-components';

const ExitBtn = styled.button`
  position: absolute;
  top: ${(props) => props.top};
  right: ${(props) => props.right};
  z-index: 200;
  cursor: pointer;
  display: ${(props) => props.display};
  background: none;
  border: 0;
  font-size: 20px;
  font-weight: 700;
`;

export default function Exit({ children, top, right, handleClick }) {
  return (
    <ExitBtn top={top} right={right} onClick={handleClick}>
      {children}
    </ExitBtn>
  );
}