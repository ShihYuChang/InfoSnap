import React from 'react';
import styled from 'styled-components';
import search from './search.png';

const Wrapper = styled.form`
  flex-grow: 1;
  height: 74px;
  position: relative;
`;

const Input = styled.input`
  box-sizing: border-box;
  width: 100%;
  height: 60px;
  background-color: #1b2028;
  border-radius: 10px;
  padding: 15px 35px;
  color: white;
  border: 0;
  outline: 0;
  font-size: 20px;
`;

const SearchIcon = styled.button`
  width: 35px;
  height: 35px;
  background-color: #1b2028;
  background-image: url(${search});
  background-size: contain;
  position: absolute;
  z-index: 10;
  top: 15px;
  right: 30px;
  border: 0;
  cursor: pointer;
`;

export default function SearchBar({ width, display }) {
  return (
    <Wrapper display={display} width={width}>
      <Input placeholder='search...' />
      <SearchIcon />;
    </Wrapper>
  );
}
