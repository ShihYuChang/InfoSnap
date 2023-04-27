import { useState, useContext } from 'react';
import styled from 'styled-components/macro';
import search from './search.png';
import { UserContext } from '../../context/userContext';

const Wrapper = styled.form`
  max-width: 40vw;
  flex-grow: 1;
  height: 50px;
  position: relative;
  /* display: flex; */
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

const AutocompleteWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  min-height: 100px;
  background-color: #1b2028;
  border-radius: 10px;
  margin-top: 3px;
  padding: 20px;
  display: ${(props) => props.display};
`;

const AutocompleteRow = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 10px;
  padding: 10px;

  &:hover {
    background-color: #3a6ff7;
  }
`;

const AutocompleteText = styled.div``;

export default function SearchBar({
  width,
  display,
  onChange,
  onSubmit,
  placeholder,
  hasSearchIcon,
  children,
  autocomplete,
}) {
  const { allData } = useContext(UserContext);
  const [userInput, setUserInput] = useState(null);

  return (
    <Wrapper display={display} width={width} onSubmit={onSubmit}>
      <Input placeholder={placeholder ?? 'search...'} onChange={onChange} />
      {hasSearchIcon ? <SearchIcon /> : null}
      <AutocompleteWrapper display={autocomplete ? 'block' : 'none'}>
        <AutocompleteRow>{children}</AutocompleteRow>
      </AutocompleteWrapper>
    </Wrapper>
  );
}
