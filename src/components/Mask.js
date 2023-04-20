import styled from 'styled-components';

const MaskContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #1b2028;
  opacity: 0.8;
  position: fixed;
  top: 0;
  display: ${(props) => props.display};
  z-index: 10;
`;

export default function Mask({ display }) {
  return <MaskContainer display={display} />;
}
