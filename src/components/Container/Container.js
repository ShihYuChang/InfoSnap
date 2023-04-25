import { useState } from 'react';
import styled from 'styled-components/macro';
import { FaQuestionCircle } from 'react-icons/fa';

const Wrapper = styled.div`
  display: ${(props) => props.display};
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
  overflow: visible;
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
  align-items: center;
  position: relative;
`;

const TitleIcon = styled.div`
  width: 40px;
  height: 40px;
  justify-content: center;
  display: flex;
  align-items: center;
  margin-left: auto;
  position: absolute;
  right: 30px;
`;

const Prompt = styled.div`
  display: ${(props) => props.display};
  box-sizing: border-box;
  width: 150px;
  min-height: 50px;
  background-color: #a4a4a3;
  position: absolute;
  top: ${(props) => props.top};
  right: ${(props) => props.right};
  z-index: 30;
  font-size: 12px;
  font-weight: 500;
  line-height: 30px;
  text-align: start;
  border-radius: 10px;
  padding: 10px;
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
  display,
  quesitonIcon,
  promptTop,
  promptRight,
  promptText,
}) {
  const [isHover, setIsHover] = useState(false);
  return (
    <Wrapper
      display={display}
      width={width}
      height={height}
      borderRaious={borderRaious}
      padding={padding}
      fontSize={fontSize}
    >
      {title ? (
        <TitleContainer titleHeight={titleHeight} fontSize={titleFontSize}>
          {title}
          {quesitonIcon && (
            <>
              <Prompt
                top={promptTop}
                right={promptRight}
                display={isHover ? 'block' : 'none'}
              >
                {promptText}
              </Prompt>
              <TitleIcon
                onMouseEnter={() => {
                  setTimeout(() => {
                    setIsHover(true);
                  }, '500');
                }}
                onMouseLeave={() => setIsHover(false)}
              >
                <FaQuestionCircle opacity='0.5' />
              </TitleIcon>
            </>
          )}
        </TitleContainer>
      ) : null}
      {children}
    </Wrapper>
  );
}
