import { useContext } from 'react';
import styled from 'styled-components/macro';
import { PageContext } from '../context/pageContext';
import Icon from './Icon/Icon';
import financeGrey from './img/finance-grey.png';
import financeWhite from './img/finance-white.png';
import tasksGrey from './img/tasks-grey.png';
import tasksWhite from './img/tasks-white.png';
import healthGrey from './img/health-grey.png';
import healthWhite from './img/health-white.png';
import noteGrey from './img/notes-grey.png';
import noteWhite from './img/notes-white.png';
import { useEffect } from 'react';

export default function Menu() {
  const { setPage, page } = useContext(PageContext);
  const pages = [
    {
      label: 'Tasks',
      value: 'tasks',
      regularImg: tasksGrey,
      featImg: tasksWhite,
    },
    {
      label: 'Finance',
      value: 'finance',
      regularImg: financeGrey,
      featImg: financeWhite,
    },
    {
      label: 'Health',
      value: 'health',
      regularImg: healthGrey,
      featImg: healthWhite,
    },
    { label: 'Note', value: 'note', regularImg: noteGrey, featImg: noteWhite },
  ];

  // useEffect(() => {
  //   function handleTab(e) {
  //     if (e.key === 'Tab') {
  //       e.preventDefault();
  //       const newPages = [];
  //       pages.forEach((page) => newPages.push(page.value));
  //       const currentPageIndex = newPages.indexOf(page);
  //       setPage(pages[(currentPageIndex + 1) % 4].value);
  //     }
  //   }

  //   window.addEventListener('keydown', handleTab);

  //   return () => window.removeEventListener('keydown', handleTab);
  // }, [page]);

  return (
    <MenuWrapper>
      {pages.map((item, index) => (
        <Icon
          width='40px'
          imgUrl={item.value === page ? item.featImg : item.regularImg}
          onClick={() => setPage(item.value)}
          key={index}
        />
      ))}
    </MenuWrapper>
  );
}

const MenuWrapper = styled.div`
  box-sizing: border-box;
  padding: 0 30px;
  width: 100%;
  height: 80px;
  background-color: #1b2028;
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  cursor: pointer;
`;
