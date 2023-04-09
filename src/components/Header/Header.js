import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  background-color: black;
  color: white;
  display: flex;
  justify-content: center;
  gap: 70px;
`;

const Option = styled.h3`
  cursor: pointer;
`;

export default function Header() {
  const navigate = useNavigate();
  return (
    <Wrapper>
      <Option onClick={() => navigate('/chart')}>Chart</Option>
      <Option onClick={() => navigate('/note')}>Note</Option>
      <Option onClick={() => navigate('/export')}>Export</Option>
      <Option onClick={() => navigate('/calendar')}>Calendar</Option>
    </Wrapper>
  );
}
