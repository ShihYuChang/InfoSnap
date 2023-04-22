import React from 'react';
import Button from '../components/Buttons/Button';
import Question from '../components/Inputs/Question';
import Title from '../components/Title/Title';
import styled from 'styled-components/macro';
import Menu from '../components/layouts/Menu/Menu';
import Header from '../components/layouts/Header/Header';
import PopUp from '../components/layouts/PopUp/PopUp';
import Mask from '../components/Mask';
import Container from '../components/Container/Container';
import Table from '../components/Table/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
`;

const ContentContainer = styled.div`
  background-color: #31353f;
  width: 80%;
  margin: 0 auto;
  padding: 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export default function Component() {
  const tableData = {
    titles: ['title1', 'title2', 'title3', 'title4'],
  };
  return (
    <Wrapper>
      {/* <Mask /> */}
      <Menu />
      <ContentContainer>
        <Header />
        <Button featured onClick={() => alert('featured')} icon>
          <FontAwesomeIcon icon={faEnvelope} size='1x' />
          FEATURED
        </Button>
        <Button onClick={() => alert('normal')}>NORMAL</Button>
        <Question wrapperWidth='100%' height='50px' labelWidth='150px'>
          Title
        </Question>
        <Title width='100%' height='50px'>
          <FontAwesomeIcon icon={faEnvelope} size='1x' />
          Title
        </Title>
        <Container width='500px' height='300px' hasTitle />
        <Table
          width={'100%'}
          height={'300px'}
          bgColor={'black'}
          title={'TITLE'}
          data={tableData}
        >
          <tr>
            <td>123</td>
            <td>123</td>
            <td>123</td>
            <td>123</td>
          </tr>
        </Table>
        {/* <PopUp /> */}
      </ContentContainer>
    </Wrapper>
  );
}
