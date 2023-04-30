import React from 'react';
import styled from 'styled-components/macro';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: ${(props) => props.width};
  min-height: ${(props) => props.height};
  background-color: ${(props) => props.bgColor};
  /* padding: 40px 70px; */
`;

const Title = styled.div`
  color: white;
  font-size: 32px;
  font-weight: 500;
`;

const TableWrapper = styled.table`
  width: 100%;
  border-spacing: 0 30px;
`;

const TableHeader = styled.thead`
  color: #a4a4a3;
  font-size: 24px;
  font-weight: 500;
`;

const TableBody = styled.tbody`
  color: white;
  font-size: 20px;
`;

const Row = styled.tr``;

const SplitLine = styled.hr`
  width: 500px;
  border: 1px solid #a4a4a3;
`;

export default function Table({
  width,
  height,
  bgColor,
  title,
  tableTitles,
  children,
}) {
  return (
    <Wrapper width={width} height={height} bgColor={bgColor}>
      <Title>{title}</Title>
      <TableWrapper>
        <TableHeader>
          <Row style={{ borderBottom: '1px solid black' }}>
            {tableTitles.map((title, index) => (
              <td key={index}>{title}</td>
            ))}
          </Row>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </TableWrapper>
    </Wrapper>
  );
}
