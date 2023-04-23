import React from 'react';
import styled from 'styled-components/macro';
import search from './search.png';

const Wrapper = styled.form`
  max-width: 40vw;
  flex-grow: 1;
  height: 50px;
  position: relative;
  display: flex;
`;

const Input = styled.input`
  box-sizing: border-box;
  width: 100%;
  background-color: #1b2028;
  border-radius: 10px;
  padding: 15px 35px;
  color: #a4a4a3;
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
  top: 8px;
  right: 30px;
  border: 0;
  cursor: pointer;
`;

export default function SearchBar({
  width,
  display,
  onChange,
  onSubmit,
  placeholder,
}) {
  return (
    <Wrapper display={display} width={width} onSubmit={onSubmit}>
      <Input placeholder={placeholder ?? 'search...'} onChange={onChange} />
      <SearchIcon />
    </Wrapper>
  );
}
