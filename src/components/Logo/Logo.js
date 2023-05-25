import React from 'react';
import styled from 'styled-components/macro';
import logo from './logo.svg';

const LogoWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 25px;
  width: 100%;
  height: 74px;
  letter-spacing: 5px;
  margin-left: ${(props) => props.marginLeft ?? '25px'};
  margin-bottom: ${(props) => props.marginBottom ?? '75px'};
  cursor: pointer;

  @media screen and (max-width: 1600px) {
    gap: 10px;
    margin-left: ${({ isCollapsed }) => (isCollapsed ? 0 : '40px')};
  }
`;

const LogoImg = styled.div`
  width: ${(props) => props.width};
  height: ${(props) => props.width};
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url(${logo});
  background-size: contain;
  background-repeat: no-repeat;

  @media screen and (max-width: 1600px) {
    height: 30px;
  }
`;

const LogoTitle = styled.div`
  flex-grow: ${(props) => props.flexGrow ?? 1};
  text-align: ${(props) => props.textAlign ?? 'center'};
  line-height: 74px;
  font-size: ${(props) => props.fontSize ?? '28px'};
  font-weight: 500;
  color: white;
  display: ${(props) => props.display};

  @media screen and (max-width: 1600px) {
    font-size: ${(props) => props.fontSize ?? '24px'};
  }
`;

export default function Logo({
  onClick,
  imgWidth,
  titleDisplay,
  titleFontSize,
  marginBottom,
  flexGrow,
  textAlign,
  marginLeft,
  isCollapsed,
}) {
  return (
    <LogoWrapper
      onClick={onClick}
      marginBottom={marginBottom}
      marginLeft={marginLeft}
      isCollapsed={isCollapsed}
    >
      <LogoImg width={imgWidth} />
      <LogoTitle
        display={titleDisplay}
        fontSize={titleFontSize}
        flexGrow={flexGrow}
        textAlign={textAlign}
      >
        INFOSNAP
      </LogoTitle>
    </LogoWrapper>
  );
}
