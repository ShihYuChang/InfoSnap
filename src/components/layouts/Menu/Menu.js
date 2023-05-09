import { getAuth, signOut } from 'firebase/auth';
import { useContext } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { UserContext } from '../../../context/userContext';
import Button from '../../Buttons/Button';
import Icon from '../../Icon';
import Logo from '../../Logo/Logo';
import Title from '../../Title/Title';
import DashboardGrey from './img/dashboard-grey.png';
import DashboardWhite from './img/dashboard-white.png';
import FinanceGrey from './img/finance-grey.png';
import FinanceWhite from './img/finance-white.png';
import HealthGrey from './img/health-grey.png';
import HealthWhite from './img/health-white.png';
import NotesGrey from './img/notes-grey.png';
import NotesWhite from './img/notes-white.png';
import TasksGrey from './img/tasks-grey.png';
import TasksWhite from './img/tasks-white.png';

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
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const OptionContainer = styled.div`
  height: 420px;
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

const PromptWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 40px;
  margin-bottom: 20px;
`;

const PromptMessage = styled.div`
  color: #a4a4a3;
  line-height: 28px;
  letter-spacing: 2.5px;
`;

const PromptIcon = styled.div`
  box-sizing: border-box;
  display: inline-flex;
  margin: 0 5px;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  border: 1px solid #aaa;
  border-radius: 5px;
  background-color: #f5f5f5;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  color: #333;
  box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.3);
  background-image: linear-gradient(to bottom, #e8e8e8, #d2d2d2);
`;

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
          imgWidth={isCollapsed ? '40px' : '40px'}
          titleDisplay={isCollapsed ? 'none' : 'block'}
          imgFontSize={isCollapsed ? '30px' : '30px'}
          marginLeft={isCollapsed ? '12px' : '20px'}
          textAlign='start'
        />
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
                  width={option.label === 'DASHBOARD' ? '25px' : '30px'}
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
                <Icon
                  width={option.label === 'DASHBOARD' ? '25px' : '30px'}
                  imgUrl={option.img}
                />
                {isCollapsed ? null : option.label}
              </Title>
            )
          )}
        </OptionContainer>
        {/* <LogOut onClick={handleSignOut}>
          <Title height='42px' isCollapsed={isCollapsed ? true : false}>
            <Icon
              width='30px'
              imgUrl={LogOutIcon}
              margin={isCollapsed ? '0 auto' : null}
            />
            {isCollapsed ? null : email ? 'LOG OUT' : 'LOG IN'}
          </Title>
        </LogOut> */}
        {isCollapsed ? null : (
          <PromptWrapper>
            <PromptMessage>
              Press {<PromptIcon>~</PromptIcon>} to see the shortcut list
            </PromptMessage>
          </PromptWrapper>
        )}
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
