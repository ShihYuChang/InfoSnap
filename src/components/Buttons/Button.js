import styled from 'styled-components/macro';

const Btn = styled.button`
  box-sizing: border-box;
  width: ${(props) => (props.width ? null : '100%')};
  height: ${(props) => props.height ?? '70px'};
  background-color: ${(props) => (props.featured ? '#3A6FF7' : '#A4A4A3')};
  color: white;
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
  padding: ${(props) => props.padding ?? '0 40px'};
  justify-content: ${(props) => props.textAlignment};
  outline: none;

  &:hover {
    background-color: #3a6ff7;
  }
`;

export default function Button({
  children,
  featured,
  onClick,
  textAlignment,
  width,
  height,
  fontSize,
  padding,
}) {
  return (
    <Btn
      featured={featured}
      onClick={onClick}
      textAlignment={textAlignment}
      width={width}
      height={height}
      fontSize={fontSize}
      padding={padding}
    >
      {children}
    </Btn>
  );
}
