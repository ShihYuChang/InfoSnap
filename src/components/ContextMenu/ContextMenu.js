import { useContext } from 'react';
import styled from 'styled-components/macro';
import { StateContext } from '../../context/stateContext';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 160px;
  display: ${(props) => props.display};
  position: absolute;
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  z-index: 200;
  border-radius: 10px;
  overflow: hidden;
`;

const Option = styled.button`
  box-sizing: border-box;
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  text-align: start;
  cursor: pointer;
  border: 0;
  border-bottom: ${({ borderBottom }) => borderBottom};
  background-color: #a4a4a3;
  letter-spacing: 2px;
  color: white;

  &:hover {
    background-color: #1b2028;
    color: white;
  }
`;

export default function ContextMenu({
  options,
  display,
  top,
  left,
  optionBgColor,
  optionColor,
}) {
  const { setSelectedContextMenu } = useContext(StateContext);
  return (
    <Wrapper display={display} top={top} left={left}>
      {options &&
        options.map((option, index) => (
          <Option
            key={index}
            bgColor={optionBgColor}
            color={optionColor}
            onClick={() => setSelectedContextMenu(option.value)}
            borderBottom={index === options.length - 1 ? 0 : '1px solid white'}
          >
            {option.label}
          </Option>
        ))}
    </Wrapper>
  );
}
