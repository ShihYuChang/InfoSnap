import styled from 'styled-components/macro';

const FixedMenuWrapper = styled.div`
  display: flex;
  width: 200px;
  box-sizing: border-box;
  background-color: #a4a4a3;
  position: ${({ position }) => position ?? 'fixed'};
  bottom: ${({ bottom }) => bottom};
  right: ${({ right }) => right};
  top: ${({ top }) => top};
  border-radius: 10px;
  flex-direction: column;
  transition: all, 0.5s;
  visibility: ${(props) => props.vilble};
  z-index: 100;
  overflow: ${({ overflow }) => overflow ?? 'hidden'};
  transform: ${({ transform }) => transform};
  transform-origin: top;
`;

const FixedMenuText = styled.div`
  display: ${({ display }) => display};
  padding: 30px;
  font-size: 20px;
  line-height: 25px;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background-color: #3a6ff7;
  }
`;

export default function FixedMenu({
  options,
  height,
  optionIsVisible,
  bottom,
  right,
  top,
  transform,
  positionAbsolute,
  overflow,
  children,
}) {
  return (
    <FixedMenuWrapper
      height={height}
      bottom={bottom}
      top={top}
      right={right}
      transform={transform}
      overflow={overflow}
      position={positionAbsolute && 'absolute'}
    >
      {options.map((option, index) =>
        optionIsVisible ? (
          <FixedMenuText
            key={index}
            onClick={option.onClick}
            display={option.display}
          >
            {option.label}
          </FixedMenuText>
        ) : null
      )}
      {children}
    </FixedMenuWrapper>
  );
}
