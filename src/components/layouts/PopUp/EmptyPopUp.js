import styled from 'styled-components/macro';

const Wrapper = styled.form`
  display: ${(props) => props.display};
  box-sizing: border-box;
  width: 800px;
  min-height: 600px;
  background-color: #38373b;
  border-radius: 10px;
  position: absolute;
  z-index: 30;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Title = styled.div`
  box-sizing: border-box;
  width: 100%;
  border-radius: 10px;
  background-color: #3a6ff7;
  color: white;
  font-size: 36px;
  font-weight: 800;
  padding: 38px 60px;
`;

export default function EmptyPopUp({ display, children }) {
  return (
    <Wrapper display={display}>
      {/* <Title>TITLE</Title> */}
      {children}
    </Wrapper>
  );
}
