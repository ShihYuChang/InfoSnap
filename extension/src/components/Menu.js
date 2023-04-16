import { useContext } from 'react';
import styled from 'styled-components/macro';
import { PageContext } from '../context/pageContext';

export default function Menu() {
  const { setPage } = useContext(PageContext);
  const pages = [
    { label: 'Finance', value: 'finance' },
    { label: 'Health', value: 'health' },
    { label: 'Note', value: 'note' },
    { label: 'Tasks', value: 'tasks' },
  ];

  return (
    <MenuWrapper>
      {pages.map((page, index) => (
        <Title
          key={index}
          onClick={() => {
            setPage(page.value);
          }}
        >
          {page.label}
        </Title>
      ))}
    </MenuWrapper>
  );
}

const MenuWrapper = styled.div`
  box-sizing: border-box;
  padding: 0 20px;
  width: 100%;
  height: 80px;
  background-color: black;
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  cursor: pointer;
`;
