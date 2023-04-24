import React from 'react';
import styled from 'styled-components/macro';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100px;
  border: 1px solid #1b2028;
  display: ${(props) => props.display};
  position: absolute;
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  z-index: 200;
`;

const Option = styled.button`
  width: 100%;
  height: 30px;
  text-align: center;
  cursor: pointer;
  border: 0;
  border-bottom: 1px solid #1b2028;
  background-color: white;
  color: #1b2028;
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
  return (
    <Wrapper display={display} top={top} left={left}>
      {options &&
        options.map((option, index) => (
          <Option key={index} bgColor={optionBgColor} color={optionColor}>
            {option}
          </Option>
        ))}
    </Wrapper>
  );
}
