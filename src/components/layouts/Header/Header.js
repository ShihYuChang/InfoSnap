import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { StateContext } from '../../../context/StateContext';
import { UserContext } from '../../../context/UserContext';
import { useShortcuts } from '../../../hooks/useShortcuts';
import { changeUserName, handleSignOut } from '../../../utils/firebaseAuth';
import Mask from '../../Mask/Mask';
import SearchBar from '../../SearchBar';

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

const menuTabs = [
  { name: 'dashboard', color: null },
  { name: 'finance', color: '#003D79' },
  { name: 'notes', color: '#01B468' },
  { name: 'tasks', color: '#FFA042' },
  { name: 'health', color: '#C48888' },
];

export default function Header() {
  const navigate = useNavigate();
  const {
    setSelectedTask,
    isEditing,
    fixedMenuVisible,
    isAddingPlan,
    hoverIndex,
    setHoverIndex,
    isEditingNote,
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
    setUserInfo,
    isDisplaySheet,
  } = useContext(UserContext);
  const [allMatchedData, setAllMatchedData] = useState([]);
  const [hasClickProfile, setHasClickProfile] = useState(false);
  const [hasClickNameChange, setHasClickNameChange] = useState(false);
  const [inputName, setInputName] = useState(userInfo.name);
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

  const searchBarRef = useRef(null);
  const autoCompleteRef = useRef(null);

  function sortDataByLength(data) {
    const newData = [...data];
    newData.sort((a, b) => {
      const aContent = a.content.note || a.content.task || a.content.title;
      const bContent = b.content.note || b.content.task || b.content.title;
      const aWords = aContent.split(' ');
      const bWords = bContent.split(' ');
      const aLength = aWords.reduce((acc, word) => acc + word.length, 0);
      const bLength = bWords.reduce((acc, word) => acc + word.length, 0);
      return aLength - bLength || aWords.length - bWords.length;
    });
    return newData;
  }

  function generateSearchOptions() {
    const newData = [];
    const newAllData = JSON.parse(JSON.stringify(allData));

    const tags = ['finance', 'notes', 'tasks', 'health'];
    tags.forEach((tag) => {
      const matchKey =
        tag === 'notes'
          ? ['context', 'title']
          : tag === 'finance' || tag === 'health'
          ? ['note']
          : ['task'];
      const match = newAllData[tag]?.filter((item) =>
        matchKey.some((key) =>
          item.content[key]?.toLowerCase().includes(userInput.toLowerCase())
        )
      );

      match?.forEach((item) => {
        item.dataTag = tag;
        newData.push({ ...item });
      });
    });

    const concattedData = newData.filter(Boolean).map((item) => ({ ...item }));
    const sortedData = sortDataByLength(concattedData);
    setAllMatchedData(sortedData);
  }

  function onAutocompleteSelect(data, destination) {
    setSelectedTask(data);
    setUserInput(data.content.note || data.content.title || data.content.task);
    navigate(`/${destination}`);
    console.log(data.dataTag);
    setSelectedOption(data.dataTag);
    handleEsc();
  }

  function editName(e) {
    setInputName(e.target.value);
  }

  function handleFocus() {
    setIsSearching(true);
  }

  function handleEsc() {
    !isSearching && setUserInput('');
    setIsSearching(false);
    setHoverIndex(0);
    setTabWord(null);
    setHasTab(false);
    setAllMatchedData(allData);
    searchBarRef.current.blur();
    autoCompleteRef.current.blur();
    setHasClickProfile(false);
    setHasClickNameChange(false);
  }

  function handleArrowDown(e) {
    if (isSearching) {
      e.preventDefault();
      setHoverIndex((prev) => (prev + 1) % allMatchedData.length);
    } else if (hasClickProfile) {
      e.preventDefault();
      setHoverIndex((prev) => (prev + 1) % profileMenu.length);
    }
  }

  function handleArrowUp(e) {
    if (isSearching && hoverIndex > 0) {
      e.preventDefault();
      setHoverIndex((prev) => (prev - 1) % allMatchedData.length);
    } else if (isSearching && hoverIndex === 0) {
      e.preventDefault();
      searchBarRef.current.focus();
    } else if (hasClickProfile & (hoverIndex > 0)) {
      e.preventDefault();
      setHoverIndex((prev) => (prev - 1) % profileMenu.length);
    }
  }

  function handleEnter(e) {
    if (isSearching) {
      e.preventDefault();
      const target = allMatchedData[hoverIndex];
      onAutocompleteSelect(target, target.dataTag);
    } else if (hasClickProfile) {
      profileMenu[hoverIndex].onClick();
    } else if (hasClickNameChange) {
      changeUserName(inputName, () =>
        setUserInfo({ ...userInfo, name: inputName })
      );
      setHasClickNameChange(false);
      setHasClickProfile(false);
    }
  }

  function handleTab(e) {
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
    } else if (isEditing) {
      return;
    } else {
      e.preventDefault();
      const tabIndex = menuTabs.findIndex(
        (tab) => tab.name === selectedOption.toLowerCase()
      );
      navigate(`./${menuTabs[(tabIndex + 1) % 5].name}`);
      setSelectedOption(menuTabs[(tabIndex + 1) % 5].name);
    }
  }

  function handleBackspace(e) {
    if (hasTab && userInput.length === 0) {
      e.preventDefault();
      setHasTab(false);
      setAllMatchedData(allData);
    }
  }

  useEffect(() => {
    generateSearchOptions();
    setHoverIndex(0);
    userInput !== '' &&
      document.activeElement === searchBarRef.current &&
      setIsSearching(true);
  }, [userInput, isSearching]);

  useShortcuts({
    Escape: handleEsc,
    ArrowDown: handleArrowDown,
    ArrowUp: handleArrowUp,
    Enter: handleEnter,
    Tab: handleTab,
    Backspace: handleBackspace,
  });

  useEffect(() => {
    function handleKeydown(e) {
      switch (e.key) {
        case 's':
          if (e.ctrlKey) {
            e.preventDefault();
            if (isSearching) {
              handleEsc();
              searchBarRef.current.blur();
            } else {
              searchBarRef.current.focus();
            }
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

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [
    isSearching,
    allMatchedData,
    hoverIndex,
    hasTab,
    userInput,
    selectedOption,
    isEditing,
    hasClickNameChange,
    inputName,
    hasClickProfile,
    isEditingNote,
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
      const matchedData =
        tabWord[0] === 'notes'
          ? matchedCategory.filter(
              (item) =>
                item.content.context
                  .toLowerCase()
                  .includes(userInput.toLowerCase()) ||
                item.content.title
                  .toLowerCase()
                  .includes(userInput.toLowerCase())
            )
          : matchedCategory.filter((item) =>
              getContentByCategory(item)
                [tabWord].toLowerCase()
                .includes(userInput.toLowerCase())
            );
      for (let i = 0; i < matchedData.length; i++) {
        matchedData[i].dataTag = tabWord[0];
      }
      matchedData.sort((a, b) => {
        const aLength = (
          a.content.note ||
          a.content.task ||
          a.content.context ||
          ''
        ).length;
        const bLength = (
          b.content.note ||
          b.content.task ||
          b.content.context ||
          ''
        ).length;
        return aLength - bLength;
      });
      setAllMatchedData(matchedData);
    }
  }, [tabWord, allData, userInput]);

  useEffect(() => {
    if (autoCompleteRef.current.children && hoverIndex) {
      autoCompleteRef.current.children[hoverIndex]?.focus();
    }
  }, [hoverIndex]);

  return (
    <Wrapper
      zIndex={
        isEditing || isAddingPlan || fixedMenuVisible || isDisplaySheet
          ? 0
          : 100
      }
    >
      <Mask
        display={isSearching ? 'block' : 'none'}
        onClick={() => setIsSearching(false)}
      />
      <HeaderTitle>
        {menuTabs
          .find((tab) => tab.name === selectedOption.toLowerCase())
          .name.toUpperCase()}
      </HeaderTitle>
      <SearchBar
        hasSearchIcon
        autocompleteDisplay={isSearching ? 'flex' : 'none'}
        onChange={(e) => setUserInput(e.target.value)}
        onFocus={handleFocus}
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
                  onAutocompleteSelect(item, item.dataTag);
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
      <Profile>
        <ProfileImgAndName>
          <ProfilePic
            img={userInfo.avatar}
            onClick={() => {
              setHasClickNameChange(false);
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
            <div
              onClick={
                hasClickNameChange
                  ? null
                  : () => {
                      setHasClickProfile((prev) => !prev);
                      setHoverIndex(0);
                    }
              }
            >
              {userInfo.name}
            </div>
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
