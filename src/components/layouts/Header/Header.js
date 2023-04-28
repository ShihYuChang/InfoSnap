import { useContext, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components/macro';
import { StateContext } from '../../../context/stateContext';
import { UserContext } from '../../../context/userContext';
import SearchBar from '../../SearchBar/SearchBar';
import calendar from './calendar.png';
import Button from '../../Buttons/Button';
import { Calendar, theme, ConfigProvider } from 'antd';
import Icon from '../../Icon';
import { useEffect } from 'react';
import Mask from '../../Mask';
import { has } from 'lodash';

const Wrapper = styled.div`
  width: 100%;
  height: 74px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  background-color: #31353f;
  top: 0;
  position: relative;
  z-index: ${(props) => props.zIndex ?? 100};
`;

const Title = styled.h1`
  width: 260px;
  line-height: 74px;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
`;

const Profile = styled.div`
  display: flex;
  gap: 20px;
  width: 200px;
  height: 100%;
  align-items: center;
  justify-content: end;
  color: white;
  cursor: pointer;
`;

const ProfilePic = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #9e9e9e;
`;

const IconWrapper = styled.div`
  box-sizing: border-box;
  width: 50px;
  height: 50px;
  background-color: #1b2028;
  border-radius: 10px;
  position: relative;
  flex-shrink: 0;
  /* margin-left: 50px; */
  cursor: pointer;
`;

const BlackBgIcon = styled.div`
  background-image: url(${(props) => props.imgUrl});
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-size: contain;
  width: 35px;
  height: 35px;
`;

const CalendarWrapper = styled.div`
  display: ${({ display }) => display};
  position: absolute;
  z-index: 10;
  top: 120px;
`;

const DateContainer = styled.div`
  width: 220px;
  display: flex;
  gap: 10px;
  align-items: center;
  margin-right: 20px;
`;

const Icons = styled.div`
  display: flex;
  justify-content: space-around;
  flex-grow: 1;
  align-items: center;
`;

const AutocompleteRow = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  cursor: pointer;
  border-radius: 10px;
  padding: 10px;
  background-color: ${(props) => props.backgourndColor};

  &:hover {
    background-color: #3a6ff7;
  }
`;

const AutocompleteText = styled.div`
  flex-grow: 1;
`;

const AutocompleteTag = styled.div`
  height: 35px;
  background-color: ${(props) => props.backgourndColor};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  width: 100px;
`;

const HeaderTitle = styled.div`
  font-size: 40px;
  font-weight: 800;
`;

const tagColor = {
  finance: '#003D79',
  notes: '#01B468',
  tasks: '#FFA042',
  health: '#C48888',
};

export default function Header({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    headerIcons,
    selectedDate,
    setSelectedDate,
    setSelectedTask,
    isAdding,
    fixedMenuVisible,
    isAddingPlan,
  } = useContext(StateContext);
  const { token } = theme.useToken();
  const [isSelectingDate, setIsSelectingDate] = useState(false);
  const [hasTab, setHasTab] = useState(false);
  const [userInput, setUserInput] = useState('');
  const {
    setHasSearch,
    allData,
    setSelectedOption,
    isSearching,
    setIsSearching,
    selectedOption,
  } = useContext(UserContext);
  const [allMatchedData, setAllMatchedData] = useState([]);
  const [hoverIndex, setHoverIndex] = useState(0);
  const [tabWord, setTabWord] = useState(null);
  const searchBarRef = useRef(null);

  function clickResult(data, destination) {
    setSelectedTask(data);
    navigate(`/${destination}`);
    setSelectedOption(data.dataTag);
    setIsSearching(false);
    searchBarRef.current.blur();
  }

  function handleBlur() {
    setTimeout(() => {
      setIsSearching(false);
      setHoverIndex(0);
      setTabWord(null);
      setHasTab(false);
      setAllMatchedData(allData);
    }, '100');
  }

  useEffect(() => {
    const newData = [];
    const newAllData = JSON.parse(JSON.stringify(allData));
    const financeMatch = newAllData.finance?.filter((item) =>
      item.content.note
        .toLowerCase()
        .replace(' ', '')
        .includes(userInput.toLowerCase())
    );
    const notesMatch = newAllData.notes?.filter(
      (item) =>
        item.content.context.toLowerCase().includes(userInput.toLowerCase()) ||
        item.content.title
          .toLowerCase()
          .replace(' ', '')
          .includes(userInput.toLowerCase())
    );
    const tasksMatch = newAllData.tasks?.filter((item) =>
      item.content.task
        .toLowerCase()
        .replace(' ', '')
        .includes(userInput.toLowerCase())
    );
    const healthMatch = newAllData.health?.filter((item) =>
      item.content.note
        .toLowerCase()
        .replace(' ', '')
        .includes(userInput.toLowerCase())
    );
    for (let i = 0; i < financeMatch?.length; i++) {
      financeMatch[i].dataTag = 'finance';
      newData.push({ ...financeMatch[i] });
    }
    for (let i = 0; i < notesMatch?.length; i++) {
      notesMatch[i].dataTag = 'notes';
      newData.push({ ...notesMatch[i] });
    }
    for (let i = 0; i < tasksMatch?.length; i++) {
      tasksMatch[i].dataTag = 'tasks';
      newData.push({ ...tasksMatch[i] });
    }
    for (let i = 0; i < healthMatch?.length; i++) {
      healthMatch[i].dataTag = 'health';
      newData.push({ ...healthMatch[i] });
    }
    const concattedData = [];
    for (let i = 0; i < newData.length; i++) {
      if (newData[i]) {
        concattedData.push({ ...newData[i] });
      }
    }
    setAllMatchedData(concattedData);
    setHoverIndex(0);
    userInput !== '' && setIsSearching(true);
  }, [userInput]);

  useEffect(() => {
    function handleKeydown(e) {
      switch (e.key) {
        case 'Escape':
          e.target.blur();
          break;
        case 'ArrowDown':
          if (isSearching) {
            setHoverIndex((prev) => (prev + 1) % allMatchedData.length);
            break;
          }
          break;
        case 'ArrowUp':
          if (isSearching && hoverIndex > 0) {
            setHoverIndex((prev) => (prev - 1) % allMatchedData.length);
            break;
          }
          break;
        case 'Enter':
          if (isSearching) {
            e.preventDefault();
            const target = allMatchedData[hoverIndex];
            clickResult(target, target.dataTag);
          }
          break;
        case 'Tab':
          if (isSearching) {
            e.preventDefault();
            const categories = Object.keys(tagColor);
            const matchedCategory = categories.filter(
              (item) => item[0] === userInput[0]
            );
            setTabWord(matchedCategory);
            setUserInput('');
            matchedCategory.length > 0 && setHasTab(true);
          }
          break;
        case 'Backspace':
          if (hasTab && userInput.length === 0) {
            e.preventDefault();
            setHasTab(false);
            setAllMatchedData(allData);
          }
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeydown);

    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isSearching, allMatchedData, hoverIndex, hasTab, userInput]);

  useEffect(() => {
    if (allData && hasTab) {
      function getContentByCategory(data) {
        const contentByCategory = {
          finance: data.content.note,
          notes: data.content.context,
          tasks: data.content.task,
          health: data.content.note,
        };
        return contentByCategory;
      }
      const category = tabWord[0];
      const matchedCategory = allData[category];
      const matchedData = matchedCategory.filter((item) =>
        getContentByCategory(item)
          [tabWord].toLowerCase()
          .includes(userInput.toLowerCase().replace(' ', ''))
      );
      for (let i = 0; i < matchedData.length; i++) {
        matchedData[i].dataTag = tabWord;
      }
      setAllMatchedData(matchedData);
    }
  }, [tabWord, allData, userInput]);
  return (
    <Wrapper zIndex={isAdding || isAddingPlan || fixedMenuVisible ? 0 : 100}>
      <Mask display={isSearching ? 'block' : 'none'} />
      <HeaderTitle>{selectedOption}</HeaderTitle>
      <SearchBar
        hasSearchIcon
        autocompleteDisplay={isSearching ? 'flex' : 'none'}
        onChange={(e) => setUserInput(e.target.value)}
        onFocus={() => setIsSearching(true)}
        onBlur={handleBlur}
        tabDisplay={hasTab ? 'block' : 'none'}
        tabText={tabWord}
        inputValue={userInput}
        tabColor={tabWord?.length > 0 ? tagColor[tabWord[0]] : null}
        inputRef={searchBarRef}
      >
        {allMatchedData.length > 0
          ? allMatchedData.map((item, index) => (
              <AutocompleteRow
                key={index}
                backgourndColor={
                  item?.id === allMatchedData[hoverIndex].id ? '#3a6ff7' : null
                }
                onClick={() => {
                  clickResult(item, item.dataTag);
                }}
              >
                <AutocompleteText>
                  {item.content.note ?? item.content.task ?? item.content.title}
                </AutocompleteText>
                <AutocompleteTag backgourndColor={tagColor[item.dataTag]}>
                  {item.dataTag}
                </AutocompleteTag>
              </AutocompleteRow>
            ))
          : null}
      </SearchBar>
      {headerIcons.length > 0 ? (
        <Icons>
          {headerIcons.map((icon, index) =>
            icon.button ? (
              <Button
                featured
                width={icon.width}
                textAlignment='center'
                height='50px'
                onClick={icon.onClick}
              >
                {icon.text}
              </Button>
            ) : icon.type === 'add' ? (
              <Icon type={icon.type} width='40px' onClick={icon.onClick} />
            ) : (
              <IconWrapper key={index} onClick={icon.onClick}>
                <BlackBgIcon imgUrl={icon.imgUrl} type={icon.type} />
              </IconWrapper>
            )
          )}
        </Icons>
      ) : null}
      {children}
      <Profile>
        <ProfilePic />
        Samuel Chang
      </Profile>
    </Wrapper>
  );
}
