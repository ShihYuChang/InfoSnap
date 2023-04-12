import React, { useContext } from 'react';
import styled from 'styled-components/macro';
import { DashboardContext } from '../../context/dashboardContext';

const Wrapper = styled.div`
  width: 50%;
  margin: 50px auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
`;

const PinnedNote = styled.div`
  border: 1px solid black;
  height: 200px;
  cursor: pointer;
`;

export default function Dashboard() {
  const { pinnedNote } = useContext(DashboardContext);
  return (
    <Wrapper>
      <PinnedNote
        dangerouslySetInnerHTML={{ __html: pinnedNote }}
        suppressContentEditableWarning
      />
    </Wrapper>
  );
}
