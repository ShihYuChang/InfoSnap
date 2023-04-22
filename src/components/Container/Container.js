import React from 'react';
import styled from 'styled-components/macro';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: #1b2028;
  flex-grow: 1;
  border-radius: ${(props) => (props.borderRaious ? '10px' : 0)};
  padding: ${(props) => props.padding};
  overflow: scroll;
  text-align: center;
  font-size: ${(props) => props.fontSize};
  font-weight: 700;
`;

const TitleContainer = styled.div`
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: ${(props) => props.titleHeight};
  border-radius: 10px;
  background-color: #3a6ff7;
  justify-content: space-around;
  color: white;
  padding: 0 36px;
  line-height: ${(props) => props.titleHeight};
  font-size: ${(props) => props.fontSize};
  font-weight: 800;
`;

export default function Container({
  children,
  height,
  width,
  borderRaious,
  padding,
  title,
  titleHeight,
  fontSize,
  titleFontSize,
}) {
  return (
    <Wrapper
      width={width}
      height={height}
      borderRaious={borderRaious}
      padding={padding}
      fontSize={fontSize}
    >
      {title ? (
        <TitleContainer titleHeight={titleHeight} fontSize={titleFontSize}>
          {title}
        </TitleContainer>
      ) : null}
      {children}
    </Wrapper>
  );
}
