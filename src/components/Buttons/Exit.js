import React from 'react';
import styled from 'styled-components/macro';

const ExitBtn = styled.div`
  position: absolute;
  top: ${(props) => props.top};
  right: ${(props) => props.right};
  cursor: pointer;
  display: ${(props) => props.display};
  background: none;
  border: 0;
  font-size: 24px;
  font-weight: 200;
  color: #a4a4a3;
  /* font-weight: 700; */
`;

export default function Exit({ children, top, right, handleClick, display }) {
  return (
    <ExitBtn top={top} right={right} onClick={handleClick} display={display}>
      {children}
    </ExitBtn>
  );
}
