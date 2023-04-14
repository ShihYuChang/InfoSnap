import React from 'react';
import styled from 'styled-components';
import Exit from '../Buttons/Exit';

const Wrapper = styled.form``;

const PopUpWindow = styled.div`
  width: 800px;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: absolute;
  z-index: 100;
  background-color: white;
  top: 15%;
  left: 50%;
  transform: translate(-50%, 0);
  height: 400px;
  display: ${(props) => props.display};
`;

const SubmitBtn = styled.button`
  width: 150px;
  height: 50px;
`;

export default function PopUp({ onSubmit, display, exitClick, children }) {
  return (
    <Wrapper onSubmit={onSubmit}>
      <PopUpWindow display={display}>
        {children}
        <SubmitBtn type='submit'>Submit</SubmitBtn>
        <Exit top='20px' right='30px' display={display} handleClick={exitClick}>
          X
        </Exit>
      </PopUpWindow>
    </Wrapper>
  );
}
