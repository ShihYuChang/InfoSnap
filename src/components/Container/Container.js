import { useEffect, useState } from 'react';
import { FaEdit, FaQuestionCircle } from 'react-icons/fa';
import styled from 'styled-components/macro';

const Wrapper = styled.div`
  display: ${(props) => props.display};
  box-sizing: border-box;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: #1b2028;
  flex-grow: ${(props) => props.flexGrow ?? 1};
  border-radius: ${(props) => (props.borderRaious ? '10px' : 0)};
  border-bottom-left-radius: ${(props) => (props.bottomRadius ? '20px' : 0)};
  border-bottom-right-radius: ${(props) => (props.bottomRadius ? '20px' : 0)};
  padding: ${(props) => props.padding};
  overflow: ${(props) => props.overflow ?? 'scroll'};
  text-align: center;
  font-size: ${(props) => props.fontSize};
  font-weight: 700;
  transition: all 0.5s;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;

  &::-webkit-scrollbar {
    background-color: #1b2028;
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #a4a4a3;
  }

  &::-webkit-scrollbar-track {
    background-color: #1b2028;
  }

  &::-webkit-scrollbar-corner {
    background-color: #1b2028;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: ${(props) => props.titleHeight};
  border-radius: 10px;
  background-color: #1b2028;
  justify-content: space-around;
  color: white;
  padding: 0 36px;
  line-height: ${(props) => props.titleHeight};
  font-size: ${(props) => props.fontSize};
  font-weight: 500;
  align-items: center;
  position: relative;
  transition: all 0.5s;
  color: ${(props) => props.color};
`;

const TitleIcon = styled.div`
  width: 40px;
  height: 40px;
  justify-content: center;
  display: flex;
  align-items: center;
  margin-left: auto;
  position: absolute;
  right: 0;
  top: 0;
  opacity: 0.5;

  &:hover {
    opacity: 1;
  }
`;

const EditIcon = styled.div`
  width: 40px;
  justify-content: center;
  display: flex;
  align-items: center;
  position: absolute;
  left: 30px;
  opacity: 0.5;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
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
  font-weight: 300;
  line-height: 30px;
  text-align: start;
  border-radius: 10px;
  padding: 10px;
  color: white;
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
  editBtn,
  onEdit,
  overflow,
  bottomRadius,
  flexGrow,
  titleColor,
}) {
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    function handleGlobalClick() {
      isHover && setIsHover(false);
    }

    window.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [isHover]);

  return (
    <Wrapper
      display={display}
      width={width}
      height={height}
      borderRaious={borderRaious}
      padding={padding}
      fontSize={fontSize}
      overflow={overflow}
      bottomRadius={bottomRadius}
      flexGrow={flexGrow}
    >
      {title ? (
        <TitleContainer
          titleHeight={titleHeight}
          fontSize={titleFontSize}
          color={titleColor}
        >
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
                onMouseLeave={() => {
                  setTimeout(() => {
                    setIsHover(false);
                  }, '300');
                }}
              >
                <FaQuestionCircle size={15} />
              </TitleIcon>
              {editBtn && (
                <EditIcon onClick={onEdit}>
                  <FaEdit />
                </EditIcon>
              )}
            </>
          )}
        </TitleContainer>
      ) : null}
      {children}
    </Wrapper>
  );
}
