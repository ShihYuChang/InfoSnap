import styled from 'styled-components/macro';
import { IoIosArrowDown } from 'react-icons/io';
import { IoIosArrowUp } from 'react-icons/io';

const Btn = styled.button`
  box-sizing: border-box;
  width: ${(props) => props.width ?? '100%'};
  height: ${(props) => props.height ?? '70px'};
  background-color: ${(props) => (props.featured ? '#3A6FF7' : '#A4A4A3')};
  /* opacity: ${(props) => (props.featured ? 1 : 0.5)}; */
  font-size: ${(props) => props.fontSize ?? '24px'};
  font-weight: 800;
  text-align: center;
  line-height: 60px;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  gap: 20px;
  align-items: center;
  padding: ${(props) => props.padding};
  justify-content: ${(props) => props.textAlignment};
  outline: none;
  margin: ${(props) => props.margin ?? '0 auto'};
  color: white;
  letter-spacing: 2px;

  &:hover {
    background-color: #3a6ff7;
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
    >
      {children}
    </Btn>
  );
}
