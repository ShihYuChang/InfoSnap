import React from 'react';
import styled from 'styled-components/macro';

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  height: 74px;
  margin-bottom: ${(props) => props.marginBottom ?? '75px'};
  cursor: pointer;
`;

const LogoImg = styled.div`
  width: ${(props) => props.width};
  height: ${(props) => props.width};
  border-radius: 50%;
  background-color: #3a6ff7;
  margin: 0 auto;
`;

const LogoTitle = styled.div`
  flex-grow: ${(props) => props.flexGrow ?? 1};
  text-align: ${(props) => props.textAlign ?? 'center'};
  line-height: 74px;
  font-size: ${(props) => props.fontSize ?? '40px'};
  font-weight: 800;
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
}) {
  return (
    <LogoWrapper onClick={onClick} marginBottom={marginBottom}>
      <LogoImg width={imgWidth} />
      <LogoTitle
        display={titleDisplay}
        fontSize={titleFontSize}
        flexGrow={flexGrow}
        textAlign={textAlign}
      >
        InfoSnap
      </LogoTitle>
    </LogoWrapper>
  );
}
