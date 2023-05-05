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
  /* padding: 0 30px; */
  margin-left: ${(props) => props.marginLeft};
  margin-bottom: ${(props) => props.marginBottom ?? '75px'};
  cursor: pointer;
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
`;

const LogoTitle = styled.div`
  /* font-family: 'Libre Baskerville', serif; */
  flex-grow: ${(props) => props.flexGrow ?? 1};
  text-align: ${(props) => props.textAlign ?? 'center'};
  line-height: 74px;
  font-size: ${(props) => props.fontSize ?? '28px'};
  font-weight: 500;
  color: white;
  display: ${(props) => props.display};
`;

export default function Logo({
  onClick,
  imgWidth,
  titleDisplay,
  titleFontSize,
  marginBottom,
  flexGrow,
  textAlign,
  imgFontSize,
  marginLeft,
}) {
  return (
    <LogoWrapper
      onClick={onClick}
      marginBottom={marginBottom}
      marginLeft={marginLeft}
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
