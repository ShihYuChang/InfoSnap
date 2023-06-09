import { useContext } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { StateContext } from '../../../context/StateContext';
import { UserContext } from '../../../context/UserContext';
import Icon from '../../Icon/Icon';
import Logo from '../../Logo/Logo';
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
  width: ${({ isCollapsed }) => (isCollapsed ? '68px' : '400px')};
  height: 100vh;
  background-color: #1b2028;
  padding: ${({ isCollapsed }) =>
    isCollapsed ? '48px 0 42px' : '48px 42px 20px'};
  position: sticky;
  left: 0;
  top: 0;
  transition: all 0.5s;
  flex-shrink: 0;
  overflow: hidden;
  z-index: 200;

  @media screen and (max-width: 1600px) {
    width: ${({ isCollapsed }) => (isCollapsed ? '68px' : '300px')};
    padding: 48px 20px;
  }
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

  @media screen and (max-width: 1600px) {
    justify-content: start;
    gap: 20px;
  }
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
  margin-bottom: 20px;
  padding: 0 40px;
`;

const PromptMessage = styled.div`
  color: #a4a4a3;
  line-height: 28px;
  letter-spacing: 2.5px;

  @media screen and (max-width: 1600px) {
    font-size: 14px;
  }
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

const Button = styled.button`
  box-sizing: border-box;
  width: 100%;
  height: 70px;
  background-color: ${({ featured }) => (featured ? '#3A6FF7' : '#1b1f28')};
  font-size: 24px;
  font-weight: 500;
  text-align: center;
  line-height: 60px;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  gap: 20px;
  align-items: center;
  padding: ${({ isCollpase }) => (isCollpase ? '0' : '0 40px')};
  outline: none;
  color: ${({ featured }) => (featured ? 'white' : '#a4a4a3')};
  letter-spacing: 4px;

  @media screen and (max-width: 1600px) {
    height: 50px;
    font-size: 20px;
  }
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
  const { setIsEditing } = useContext(StateContext);
  const { selectedOption, setSelectedOption, isCollapsed, setIsCollapsed } =
    useContext(UserContext);

  function selectOption(label) {
    setSelectedOption(label);
  }

  function clickMenuOptions(option) {
    setIsEditing(false);
    selectOption(option.label);
    navigate(`./${option.label.toLowerCase()}`);
    window.scrollTo(0, 0);
  }

  return (
    <Wrapper isCollapsed={isCollapsed}>
      <ContentWrapper>
        <Logo
          onClick={() => {
            setIsEditing(false);
            navigate('/dashboard');
            setSelectedOption('DASHBOARD');
          }}
          imgWidth={isCollapsed ? '40px' : '40px'}
          titleDisplay={isCollapsed ? 'none' : 'block'}
          imgFontSize={isCollapsed ? '30px' : '30px'}
          marginLeft={isCollapsed ? '0' : '40px'}
          textAlign='start'
          isCollapsed={isCollapsed}
        />
        <OptionContainer>
          {options.map((option, index) => (
            <Button
              key={index}
              featured={option.label === selectedOption}
              isCollpase={isCollapsed}
              onClick={() => {
                clickMenuOptions(option);
              }}
            >
              <Icon
                width={option.label === 'DASHBOARD' ? '25px' : '30px'}
                imgUrl={
                  option.label === selectedOption
                    ? option.selectedImg
                    : option.img
                }
                withBackground
                margin={isCollapsed ? '0 auto' : null}
              />
              {isCollapsed ? null : option.label}
            </Button>
          ))}
        </OptionContainer>
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
            <IoIosArrowForward size={25} />
          ) : (
            <IoIosArrowBack size={25} />
          )}
        </CollapseBtn>
      </ContentWrapper>
    </Wrapper>
  );
}
