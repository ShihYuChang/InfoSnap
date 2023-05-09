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

export default function EmptyPopUp({ display, children }) {
  return <Wrapper display={display}>{children}</Wrapper>;
}
