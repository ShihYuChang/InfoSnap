import React from 'react';
import styled from 'styled-components';
import Exit from '../Buttons/Exit';

const Wrapper = styled.div``;

const PopUpWindow = styled.form`
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

export default function PopUp({ display, exitClick, children }) {
  return (
    <Wrapper>
      <PopUpWindow display={display}>
        <Exit top='20px' right='30px' display={display} handleClick={exitClick}>
          X
        </Exit>
        {children}
        <SubmitBtn type='submit'>Submit</SubmitBtn>
      </PopUpWindow>
    </Wrapper>
  );
}
