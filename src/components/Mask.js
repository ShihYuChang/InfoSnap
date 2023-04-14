import styled from 'styled-components';

const MaskContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  opacity: 1;
  position: fixed;
  top: 0;
  display: ${(props) => props.display};
  z-index: 10;
`;

export default function Mask({ display }) {
  return <MaskContainer display={display} />;
}
