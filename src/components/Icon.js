import React from 'react';
import styled from 'styled-components/macro';

const Regular = styled.div`
  box-sizing: border-box;
  width: ${(props) => props.width};
  height: ${(props) => props.width};
  background-image: url(${(props) => props.imgUrl});
  background-size: contain;
  background-repeat: no-repeat;
  cursor: pointer;
  margin: ${(props) => props.margin};
  flex-shrink: 0;
`;

const AddBtn = styled.button`
  width: ${(props) => props.width};
  height: ${(props) => props.width};
  background-color: #3a6ff7;
  font-size: 30px;
  font-weight: 700;
  color: white;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
`;

export default function Icon({ width, imgUrl, type, onClick, margin }) {
  return type === 'add' ? (
    <AddBtn width={width} onClick={onClick}>
      +
    </AddBtn>
  ) : (
    <Regular width={width} imgUrl={imgUrl} onClick={onClick} margin={margin} />
  );
}
