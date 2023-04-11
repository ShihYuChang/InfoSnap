import styled from 'styled-components';
import { useContext } from 'react';
import { StateContext } from '../context/stateContext';

const MaskContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  opacity: 1;
  position: fixed;
  top: 0;
  display: ${(props) => props.display};
`;

export default function Mask() {
  const { isAdding } = useContext(StateContext);
  return <MaskContainer display={isAdding ? 'block' : 'none'} />;
}
