import styled from 'styled-components/macro';

const Btn = styled.button`
  box-sizing: border-box;
  width: 100%;
  height: 70px;
  background-color: ${(props) => (props.featured ? '#3A6FF7' : '#A4A4A3')};
  color: white;
  opacity: ${(props) => (props.featured ? 1 : 0.5)};
  font-size: 24px;
  font-weight: 800;
  text-align: center;
  line-height: 60px;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 0 40px;
  justify-content: ${(props) => props.textAlignment};
`;

export default function Button({ children, featured, onClick, textAlignment }) {
  return (
    <Btn featured={featured} onClick={onClick} textAlignment={textAlignment}>
      {children}
    </Btn>
  );
}
