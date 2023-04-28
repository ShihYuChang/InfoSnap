import { useContext, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { IoIosArrowForward } from 'react-icons/io';
import { getAuth, signOut } from 'firebase/auth';
import { UserContext } from '../../../context/userContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import Button from '../../Buttons/Button';
import Icon from '../../Icon';
import Title from '../../Title/Title';
import DashboardGrey from './img/dashboard-grey.png';
import DashboardWhite from './img/dashboard-white.png';
import FinanceGrey from './img/finance-grey.png';
import FinanceWhite from './img/finance-white.png';
import NotesGrey from './img/notes-grey.png';
import NotesWhite from './img/notes-white.png';
import TasksGrey from './img/tasks-grey.png';
import TasksWhite from './img/tasks-white.png';
import HealthGrey from './img/health-grey.png';
import HealthWhite from './img/health-white.png';
import LogOutIcon from './img/logout.png';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: ${(props) => props.width};
  height: 100vh;
  background-color: #1b2028;
  padding: ${(props) => props.padding};
  position: sticky;
  left: 0;
  top: 0;
  transition: all 0.5s;
  flex-shrink: 0;
`;

const ContentWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  height: 74px;
  margin-bottom: 75px;
  cursor: pointer;
`;

const LogoImg = styled.div`
  width: ${(props) => props.width};
  height: ${(props) => props.width};
  border-radius: 50%;
  background-color: #3a6ff7;
  margin: 0 auto;
`;

const LogoTitle = styled.div`
  flex-grow: 1;
  text-align: center;
  line-height: 74px;
  font-size: 40px;
  font-weight: 800;
  color: white;
`;

const OptionContainer = styled.div`
  height: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: auto;
`;

const BottomWrapper = styled.div`
  width: 100%;
`;

const LogOut = styled.div`
  width: 100%;
  height: 42px;
  margin-bottom: 30px;
`;

const CollapseBtn = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: ${(props) => props.align};
  padding-top: 20px;
  cursor: pointer;
  border-top: 2px solid #6c6c6c;
  color: #a4a4a3;
`;

function CollapsedMenu() {}

export default function Menu() {
  const navigate = useNavigate();
  const options = [
    { label: 'DASHBOARD', selectedImg: DashboardWhite, img: DashboardGrey },
    { label: 'FINANCE', selectedImg: FinanceWhite, img: FinanceGrey },
    { label: 'NOTES', selectedImg: NotesWhite, img: NotesGrey },
    { label: 'TASKS', selectedImg: TasksWhite, img: TasksGrey },
    { label: 'HEALTH', selectedImg: HealthWhite, img: HealthGrey },
  ];
  const {
    selectedOption,
    setSelectedOption,
    email,
    isCollapsed,
    setIsCollapsed,
  } = useContext(UserContext);

  function selectOption(label) {
    setSelectedOption(label);
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

  return (
    <Wrapper
      width={isCollapsed ? '68px' : '386px'}
      padding={isCollapsed ? '48px 0 42px' : '48px 42px 20px'}
    >
      <ContentWrapper>
        <Logo
          onClick={() => {
            navigate('/dashboard');
            setSelectedOption('DASHBOARD');
          }}
        >
          <LogoImg width={isCollapsed ? '40px' : '56px'} />
          {isCollapsed ? null : <LogoTitle>InfoSnap</LogoTitle>}
        </Logo>
        <OptionContainer>
          {options.map((option, index) =>
            option.label === selectedOption ? (
              <Button
                key={index}
                featured
                padding={isCollapsed ? 0 : '0 40px'}
                width={isCollapsed ? '50px' : null}
                height={isCollapsed ? '50px' : null}
              >
                <Icon
                  width='30px'
                  imgUrl={option.selectedImg}
                  withBackground
                  margin={isCollapsed ? '0 auto' : null}
                />
                {isCollapsed ? null : option.label}
              </Button>
            ) : (
              <Title
                key={index}
                isCollapsed={isCollapsed ? true : false}
                height='70px'
                onClick={() => {
                  selectOption(option.label);
                  navigate(`./${option.label.toLowerCase()}`);
                }}
              >
                <Icon width='30px' imgUrl={option.img} />
                {isCollapsed ? null : option.label}
              </Title>
            )
          )}
        </OptionContainer>
        <LogOut onClick={handleSignOut}>
          <Title height='42px' isCollapsed={isCollapsed ? true : false}>
            <Icon
              width='30px'
              imgUrl={LogOutIcon}
              margin={isCollapsed ? '0 auto' : null}
            />
            {isCollapsed ? null : email ? 'LOG OUT' : 'LOG IN'}
          </Title>
        </LogOut>
        <CollapseBtn
          onClick={() => setIsCollapsed((prev) => !prev)}
          align={isCollapsed ? 'center' : 'end'}
        >
          {isCollapsed ? (
            <IoIosArrowForward size={35} />
          ) : (
            <IoIosArrowBack size={35} />
          )}
        </CollapseBtn>
      </ContentWrapper>
    </Wrapper>
  );
}
