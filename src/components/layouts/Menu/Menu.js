import React from 'react';
import styled from 'styled-components/macro';
import Button from '../../Buttons/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Icon from '../../Icon';
import Title from '../../Title/Title';
import DashboardGrey from './dashboard-grey.png';
import DashboardWhite from './dashboard-white.png';
import FinanceGrey from './finance-grey.png';
import NotesGrey from './notes-grey.png';
import TasksGrey from './tasks-grey.png';
import HealthGrey from './health-grey.png';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 386px;
  height: 100vh;
  background-color: #1b2028;
  padding: 48px 42px 56px;
`;

const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  height: 74px;
  margin-bottom: 75px;
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
  margin-bottom: 200px;
`;

const LogOut = styled.div`
  width: 100%;
  height: 42px;
  background-color: green;
`;

export default function Menu() {
  return (
    <Wrapper>
      <ContentWrapper>
        <Logo>
          <LogoImg />
          <LogoTitle>InfoSnap</LogoTitle>
        </Logo>
        <OptionContainer>
          <Button selected>
            <Icon width='30px' imgUrl={DashboardWhite} />
            DASHBOARD
          </Button>
          <Title height='42px'>
            <Icon width='30px' imgUrl={FinanceGrey} />
            FINANCE
          </Title>
          <Title height='42px'>
            <Icon width='30px' imgUrl={NotesGrey} />
            NOTES
          </Title>
          <Title height='42px'>
            <Icon width='30px' imgUrl={TasksGrey} />
            TASKS
          </Title>
          <Title height='42px'>
            <Icon width='30px' imgUrl={HealthGrey} />
            HEALTH
          </Title>
        </OptionContainer>
        <LogOut></LogOut>
      </ContentWrapper>
    </Wrapper>
  );
}
