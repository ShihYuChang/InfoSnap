import { useContext, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components/macro';
import { StateContext } from '../../../context/stateContext';
import { UserContext } from '../../../context/userContext';
import SearchBar from '../../SearchBar/SearchBar';
import Button from '../../Buttons/Button';
import Icon from '../../Icon';
import { useEffect } from 'react';
import Mask from '../../Mask';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { hover } from '@testing-library/user-event/dist/hover';

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
  gap: 40px;
`;

const Profile = styled.div`
  display: flex;
  gap: 10px;
  height: 100%;
  align-items: center;
  justify-content: end;
  color: white;
  cursor: pointer;
`;

const ProfileImgAndName = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const ProfilePic = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-image: url(${(props) => props.img});
  background-size: contain;
  background-repeat: no-repeat;
  background-color: ${({ img }) => (img ? null : '#a4a4a3')};
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
  align-items: center;
  gap: 20px;
  cursor: pointer;
  border-radius: 10px;
  padding: 10px;
  background-color: ${(props) => props.backgourndColor};

  &:focus {
    outline: none;
  }
  /* &:hover {
    background-color: #3a6ff7;
  } */
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
  font-size: 32px;
  font-weight: 500;
  letter-spacing: 5px;
`;

const ProfileMenu = styled.div`
  box-sizing: border-box;
  width: 170px;
  height: ${({ height }) => height};
  background-color: #a4a4a3;
  transition: height 0.4s;
  position: absolute;
  top: 70px;
  right: 0;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
`;

const ProfileMenuOption = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 18px 0;
  border-radius: 10px;
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

const NameEditInput = styled.input`
  width: 120px;
  height: 30px;
  background-color: #31353f;
  border: 0;
  outline: none;
  color: white;
  letter-spacing: 2px;
`;

const tagColor = {
  finance: '#003D79',
  notes: '#01B468',
  tasks: '#FFA042',
  health: '#C48888',
};

const menuTabs = ['dashboard', 'finance', 'notes', 'tasks', 'health'];

export default function Header({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    headerIcons,
    setSelectedTask,
    isAdding,
    fixedMenuVisible,
    isAddingPlan,
    hoverIndex,
    setHoverIndex,
  } = useContext(StateContext);
  const [hasTab, setHasTab] = useState(false);
  const [userInput, setUserInput] = useState('');
  const {
    allData,
    setSelectedOption,
    isSearching,
    setIsSearching,
    selectedOption,
    setIsCollapsed,
    userInfo,
    isDisplaySheet,
  } = useContext(UserContext);
  const [allMatchedData, setAllMatchedData] = useState([]);
  // const [hoverIndex, setHoverIndex] = useState(0);
  const [hasClickProfile, setHasClickProfile] = useState(false);
  const [hasClickNameChange, setHasClickNameChange] = useState(false);
  const [inputName, setInputName] = useState('');
  const profileMenu = [
    { label: 'Log Out', onClick: handleSignOut },
    {
      label: 'Change Name',
      onClick: () => {
        setHasClickProfile(false);
        setHasClickNameChange(true);
      },
    },
  ];
  const [tabWord, setTabWord] = useState(null);
  const [userName, setUserName] = useState('');

  const searchBarRef = useRef(null);
  const autoCompleteRef = useRef(null);

  function clickResult(data, destination) {
    setSelectedTask(data);
    navigate(`/${destination}`);
    setSelectedOption(data.dataTag);
    setIsSearching(false);
    searchBarRef.current.blur();
  }

  function handleEsc() {
    setUserInput('');
    setIsSearching(false);
    setHoverIndex(0);
    setTabWord(null);
    setHasTab(false);
    setAllMatchedData(allData);
  }

  function handleSignOut() {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        alert('Sign Out Success!');
        window.location.href = '/';
      })
      .catch((error) => {
        alert('Something went wrong. Please try again later');
        console.log(error);
      });
  }

  function editName(e) {
    setInputName(e.target.value);
  }

  // useEffect(() => {
  //   userInfo && setInputName(userInfo.name);
  // }, [userInfo]);

  useEffect(() => {
    const newData = [];
    const newAllData = JSON.parse(JSON.stringify(allData));
    const financeMatch = newAllData.finance
      ? newAllData.finance.filter((item) =>
          item.content.note
            .toLowerCase()
            .replace(' ', '')
            .includes(userInput.toLowerCase())
        )
      : [];

    const notesMatch = newAllData.notes
      ? newAllData.notes.filter(
          (item) =>
            item.content.context
              .toLowerCase()
              .includes(userInput.toLowerCase()) ||
            item.content.title
              .toLowerCase()
              .replace(' ', '')
              .includes(userInput.toLowerCase())
        )
      : [];

    const tasksMatch = newAllData.tasks
      ? newAllData.tasks.filter((item) =>
          item.content.task
            .toLowerCase()
            .replace(' ', '')
            .includes(userInput.toLowerCase())
        )
      : [];

    const healthMatch = newAllData.health
      ? newAllData.health &&
        newAllData.health.filter((item) =>
          item.content.note
            .toLowerCase()
            .replace(' ', '')
            .includes(userInput.toLowerCase())
        )
      : [];

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
    for (let i = 0; i < financeMatch?.length; i++) {
      financeMatch[i].dataTag = 'finance';
      newData.push({ ...financeMatch[i] });
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
  }, [userInput, isSearching]);

  useEffect(() => {
    function handleKeydown(e) {
      switch (e.key) {
        case 'Escape':
          handleEsc();
          searchBarRef.current.blur();
          autoCompleteRef.current.blur();
          setHasClickProfile(false);
          break;
        case 'ArrowDown':
          if (isSearching) {
            setHoverIndex((prev) => (prev + 1) % allMatchedData.length);
          } else if (hasClickProfile) {
            e.preventDefault();
            setHoverIndex((prev) => (prev + 1) % profileMenu.length);
          }
          break;
        case 'ArrowUp':
          if (isSearching && hoverIndex > 0) {
            setHoverIndex((prev) => (prev - 1) % allMatchedData.length);
          } else if (isSearching && hoverIndex === 0) {
            searchBarRef.current.focus();
          } else if (hasClickProfile & (hoverIndex > 0)) {
            e.preventDefault();
            setHoverIndex((prev) => (prev - 1) % profileMenu.length);
          }
          break;
        case 'Enter':
          if (isSearching) {
            e.preventDefault();
            const target = allMatchedData[hoverIndex];
            clickResult(target, target.dataTag);
          } else if (hasClickProfile) {
            profileMenu[hoverIndex].onClick();
          } else if (hasClickNameChange) {
            updateDoc(doc(db, 'Users', userInfo.email), { Name: inputName });
            setHasClickNameChange(false);
            setHasClickProfile(false);
          }
          break;
        case 'Tab':
          if (isSearching) {
            e.preventDefault();
            const categories = Object.keys(tagColor);
            const matchedCategory = categories.filter(
              (item) => item[0] === userInput[0]
            );
            if (matchedCategory.length > 0) {
              setHasTab(true);
              setTabWord(matchedCategory);
              setUserInput('');
            }
          } else if (isAdding) {
            break;
          } else {
            e.preventDefault();
            const tabIndex = menuTabs.indexOf(selectedOption.toLowerCase());
            navigate(`./${menuTabs[(tabIndex + 1) % 5]}`);
            setSelectedOption(menuTabs[(tabIndex + 1) % 5]);
          }
          break;
        case 'Backspace':
          if (hasTab && userInput.length === 0) {
            e.preventDefault();
            setHasTab(false);
            setAllMatchedData(allData);
          }
          break;
        case 's':
          if (e.ctrlKey) {
            e.preventDefault();
            isSearching
              ? searchBarRef.current.blur()
              : searchBarRef.current.focus();
          }
          break;
        case 'Shift':
          e.ctrlKey && setIsCollapsed((prev) => !prev);
          break;
        case 'p':
          if (e.ctrlKey) {
            e.preventDefault();
            setHasClickProfile((prev) => !prev);
          }
          break;
        default:
          if (isSearching) {
            searchBarRef.current.focus();
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeydown);

    return () => window.removeEventListener('keydown', handleKeydown);
  }, [
    isSearching,
    allMatchedData,
    hoverIndex,
    hasTab,
    userInput,
    selectedOption,
    isAdding,
    hasClickNameChange,
    inputName,
    hasClickProfile,
  ]);

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

  useEffect(() => {
    if (Object.keys(userInfo).length > 0) {
      onSnapshot(doc(db, 'Users', userInfo.email), (snapshot) => {
        const userData = snapshot.data();
        setUserName(userData.Name);
        setInputName(userData.Name);
      });
    }
  }, [userInfo]);

  useEffect(() => {
    if (autoCompleteRef.current.children && hoverIndex) {
      autoCompleteRef.current.children[hoverIndex].focus();
    }
  }, [hoverIndex]);

  return (
    <Wrapper
      zIndex={
        isAdding || isAddingPlan || fixedMenuVisible || isDisplaySheet ? 0 : 100
      }
    >
      <Mask display={isSearching ? 'block' : 'none'} />
      <HeaderTitle>
        {menuTabs.includes(
          typeof selectedOption === 'string'
            ? selectedOption.toLowerCase()
            : selectedOption[0]
        )
          ? selectedOption
          : null}
      </HeaderTitle>
      <SearchBar
        hasSearchIcon
        autocompleteDisplay={isSearching ? 'flex' : 'none'}
        onChange={(e) => setUserInput(e.target.value)}
        onFocus={() => setIsSearching(true)}
        // onBlur={handleBlur}
        tabDisplay={hasTab ? 'block' : 'none'}
        tabText={tabWord}
        inputValue={userInput}
        tabColor={tabWord?.length > 0 ? tagColor[tabWord[0]] : null}
        inputRef={searchBarRef}
        autoCompleteRef={autoCompleteRef}
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
                onMouseEnter={() => setHoverIndex(index)}
                tabIndex='-1'
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
                key={index}
              >
                {icon.text}
              </Button>
            ) : icon.type === 'add' ? (
              <Icon
                type={icon.type}
                width='40px'
                onClick={icon.onClick}
                key={index}
              />
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
        <ProfileImgAndName>
          <ProfilePic
            img={userInfo.avatar}
            onClick={() => {
              setHasClickProfile((prev) => !prev);
              setHoverIndex(0);
            }}
          />
          {hasClickNameChange ? (
            <NameEditInput
              autoFocus
              maxLength={15}
              onChange={editName}
              value={inputName}
            />
          ) : (
            userName
          )}
        </ProfileImgAndName>
        <ProfileMenu height={hasClickProfile ? '150px' : 0}>
          {hasClickProfile ? (
            <>
              {profileMenu.map((option, index) => (
                <ProfileMenuOption
                  key={index}
                  backgroundColor={index === hoverIndex ? '#3a6ff7' : null}
                  onClick={option.onClick}
                  onMouseEnter={() => setHoverIndex(index)}
                >
                  {option.label}
                </ProfileMenuOption>
              ))}
            </>
          ) : null}
        </ProfileMenu>
      </Profile>
    </Wrapper>
  );
}
