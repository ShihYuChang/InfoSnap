import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import styled from 'styled-components/macro';

const Btn = styled.button`
  box-sizing: border-box;
  width: ${({ width }) => width ?? '100%'};
  height: ${({ height }) => height ?? '70px'};
  background-color: ${({ featured }) => (featured ? '#3A6FF7' : '#A4A4A3')};
  font-size: ${({ fontSize }) => fontSize ?? '24px'};
  font-weight: 500;
  text-align: center;
  line-height: 60px;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  gap: 20px;
  align-items: center;
  padding: ${({ isCollpase }) => (isCollpase ? '0' : '0 40px')};
  justify-content: ${({ textAlignment }) => textAlignment};
  outline: none;
  margin: ${(props) => props.margin ?? '0 auto'};
  color: white;
  letter-spacing: ${({ letterSpacing }) => letterSpacing ?? '4px'};

  &:hover {
    background-color: #3a6ff7;
  }

  @media screen and (max-width: 1600px) {
    height: 50px;
    font-size: 20px;
  }
`;

const CollapseIcon = styled.div`
  font-weight: 800;
  display: flex;
  align-items: center;
  color: #a4a4a3;
  height: 100%;
  line-height: 100%;
  font-size: 24px;
  cursor: pointer;
  position: absolute;
  top: ${(props) => props.top};
  right: ${(props) => props.right};
`;

const FixedAddButton = styled.div`
  box-sizing: border-box;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #3a6ff7;
  color: white;
  z-index: 100;
  cursor: pointer;
`;

const BtnText = styled.div`
  position: absolute;
  top: 9px;
  right: 17px;
  font-size: 50px;
`;

export const FixedAddBtn = ({ onClick }) => {
  return (
    <FixedAddButton onClick={onClick}>
      <BtnText>+</BtnText>
    </FixedAddButton>
  );
};

export default function Button({
  children,
  featured,
  onClick,
  textAlignment,
  width,
  height,
  fontSize,
  padding,
  type,
  top,
  right,
  target,
  data,
  margin,
  letterSpacing,
  isCollpase,
}) {
  return type === 'collapse' ? (
    <CollapseIcon onClick={onClick} top={top} right={right}>
      {data.includes(target) ? (
        <IoIosArrowDown strokeWidth='20px' />
      ) : (
        <IoIosArrowUp strokeWidth='20px' />
      )}
    </CollapseIcon>
  ) : (
    <Btn
      featured={featured}
      onClick={onClick}
      textAlignment={textAlignment}
      width={width}
      height={height}
      fontSize={fontSize}
      padding={padding}
      type={type}
      margin={margin}
      letterSpacing={letterSpacing}
      isCollpase={isCollpase}
    >
      {children}
    </Btn>
  );
}
