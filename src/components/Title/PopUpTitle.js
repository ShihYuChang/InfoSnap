import styled from 'styled-components/macro';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: ${(props) => props.height};
  background-color: #3a6ff7;
  color: white;
  font-size: ${(props) => props.fontSize};
  font-weight: 800;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 0 50px;
  justify-content: space-between;
`;

const ExitIcon = styled.div`
  font-size: 30px;
  font-weight: 300;
  cursor: pointer;
`;

export default function PopUpTitle({ height, fontSize, children, onExit }) {
  return (
    <Wrapper height={height} fontSize={fontSize}>
      {children}
      <ExitIcon onClick={onExit}>×</ExitIcon>
    </Wrapper>
  );
}
