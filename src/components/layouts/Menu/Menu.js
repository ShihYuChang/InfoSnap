import { useContext } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { StateContext } from '../../../context/stateContext';
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
  width: 386px;
  min-height: 100vh;
  background-color: #1b2028;
  padding: 48px 42px 56px;
`;

const ContentWrapper = styled.div`
  width: 100%;
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
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #3a6ff7;
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
  height: 560px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: auto;
`;

const LogOut = styled.div`
  width: 100%;
  height: 42px;
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
  const { selectedOption, setSelectedOption } = useContext(StateContext);

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
    <Wrapper>
      <ContentWrapper>
        <Logo onClick={() => navigate('/')}>
          <LogoImg />
          <LogoTitle>InfoSnap</LogoTitle>
        </Logo>
        <OptionContainer>
          {options.map((option, index) =>
            option.label === selectedOption ? (
              <Button key={index} featured>
                <Icon width='30px' imgUrl={option.selectedImg} withBackground />
                {option.label}
              </Button>
            ) : (
              <Title
                key={index}
                height='70px'
                onClick={() => {
                  selectOption(option.label);
                  navigate(`./${option.label.toLowerCase()}`);
                }}
              >
                <Icon width='30px' imgUrl={option.img} />
                {option.label}
              </Title>
            )
          )}
        </OptionContainer>
        <LogOut onClick={handleSignOut}>
          <Title height='42px'>
            <Icon width='30px' imgUrl={LogOutIcon} />
            LOG OUT
          </Title>
        </LogOut>
      </ContentWrapper>
    </Wrapper>
  );
}
