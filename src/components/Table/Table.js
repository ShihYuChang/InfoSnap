import React from 'react';
import styled from 'styled-components/macro';
import { FiDownload } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: ${(props) => props.width};
  min-height: ${(props) => props.height};
  background-color: ${(props) => props.bgColor};
  display: flex;
  flex-direction: column;
  gap: 50px;
  /* padding: 40px 70px; */
`;

const Title = styled.div`
  color: white;
  font-size: 32px;
  font-weight: 500;
`;

const TableWrapper = styled.div`
  width: 100%;
  border-spacing: 0 30px;
  display: flex;
  flex-direction: column;
`;

const TableHeader = styled.div`
  color: #a4a4a3;
  font-size: 24px;
  font-weight: 500;
`;

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  font-size: 20px;
  gap: 20px;
`;

const Row = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
`;

const SplitLine = styled.hr`
  width: 500px;
  border: 1px solid #a4a4a3;
`;

const TableTitle = styled.div`
  width: 100%;
  text-align: ${({ textAlign }) => textAlign ?? 'center'};
`;

const HeaderIcon = styled.div`
  color: #a4a4a3;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const ExportBtn = styled.a`
  color: #a4a4a3;
  text-decoration: none;
`;

const Header = styled.div`
  display: flex;
  gap: 50px;
`;

export default function Table({
  width,
  height,
  bgColor,
  title,
  tableTitles,
  children,
  fileUrl,
  addIntake,
}) {
  return (
    <Wrapper width={width} height={height} bgColor={bgColor}>
      <Header>
        <Title>{title}</Title>
        <HeaderIcon>
          <ExportBtn href={fileUrl} download='nutrition.csv'>
            <FiDownload size={30} />
          </ExportBtn>
        </HeaderIcon>
        <HeaderIcon>
          <FaPlus size={30} onClick={addIntake} />
        </HeaderIcon>
      </Header>
      <TableWrapper>
        <TableHeader>
          <Row style={{ borderBottom: '1px solid black' }}>
            {tableTitles.map((title, index) => (
              <TableTitle
                key={index}
                textAlign={index === 0 ? 'start' : 'center'}
              >
                {title}
              </TableTitle>
            ))}
          </Row>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </TableWrapper>
    </Wrapper>
  );
}
