import { useContext } from 'react';
import { StateContext } from '../../context/stateContext';
import styled from 'styled-components/macro';
import search from './search.png';

const Wrapper = styled.form`
  flex-grow: 1;
  height: 50px;
  position: relative;
  z-index: ${(props) => props.zIndex ?? 200};
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
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
  background-color: #38373b;
  border-radius: 10px;
  margin-top: 5px;
  padding: 20px;
  display: ${(props) => props.display};
  flex-direction: column;
  gap: 20px;
  max-height: 500px;
  overflow: scroll;
  z-index: ${(props) => props.zIndex};
  position: relative;
`;

const SearchTab = styled.div`
  display: ${(props) => props.display ?? 'none'};
  box-sizing: border-box;
  width: 100px;
  height: 35px;
  background-color: ${(props) => props.backgroundColor};
  border-radius: 10px;
  position: absolute;
  top: 10px;
  right: 90px;
  padding: 10px;
  text-align: center;
`;

export default function SearchBar({
  width,
  display,
  onChange,
  onSubmit,
  placeholder,
  hasSearchIcon,
  children,
  autocompleteDisplay,
  onFocus,
  onBlur,
  zIndex,
  inputValue,
  tabText,
  tabDisplay,
  tabColor,
  inputRef,
}) {
  const { isAdding, isSearching } = useContext(StateContext);
  return (
    <Wrapper
      display={display}
      width={width}
      onSubmit={onSubmit}
      zIndex={zIndex}
    >
      <Input
        placeholder={placeholder ?? 'search...'}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        value={inputValue}
        ref={inputRef}
      />
      <SearchTab display={tabDisplay} backgroundColor={tabColor}>
        {tabText}
      </SearchTab>
      {hasSearchIcon ? <SearchIcon /> : null}
      <AutocompleteWrapper
        display={autocompleteDisplay}
        zIndex={isAdding || isSearching ? '10' : '200'}
      >
        {children}
      </AutocompleteWrapper>
    </Wrapper>
  );
}
