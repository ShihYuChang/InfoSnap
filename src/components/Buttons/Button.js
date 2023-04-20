import styled from 'styled-components/macro';
import { FaStickyNote } from 'react-icons/fa';

const Btn = styled.button`
  box-sizing: border-box;
  height: 70px;
  padding: 0 40px;
  background-color: ${(props) => (props.selected ? '#3A6FF7' : '#A4A4A3')};
  color: white;
  opacity: ${(props) => (props.selected ? 1 : 0.5)};
  font-size: 24px;
  font-weight: 800;
  text-align: center;
  line-height: 60px;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
`;

const Icon = styled.div`
  display: ${(props) => (props.icon ? 'block' : 'none')};
  width: 30px;
  height: 30px;
`;

export default function Button({ children, selected, onClick }) {
  return (
    <Btn selected={selected} onClick={onClick}>
      <FaStickyNote />
      {children}
    </Btn>
  );
}
