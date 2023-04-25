import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components/macro';
import { UserContext } from '../../context/userContext';

const Wrapper = styled.div`
  width: 100%;
  padding-top: 90px;
`;

const Title = styled.div`
  width: 100%;
  font-size: 24px;
  font-weight: 500;
`;

const SplitLine = styled.hr`
  width: 100%;
  border: 1px solid #a4a4a3;
`;

const Results = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 50px;
`;

const ResultContainer = styled.div`
  box-sizing: border-box;
  height: 250px;
  background-color: #1b2028;
  border-radius: 10px;
  padding: 20px;
  overflow: scroll;
`;

const ResultTitle = styled.div`
  width: 100%;
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 20px;
`;

const ResultContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

export default function Search() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword');
  const tags = ['Finance', 'Notes', 'Tasks', 'Health'];
  const { allData, hasSearch, setHasSearch } = useContext(UserContext);
  const [matchedData, setMatchedData] = useState({
    finance: null,
    notes: null,
    tasks: null,
    health: null,
  });

  useEffect(() => {
    const newData = { ...matchedData };
    const financeMatch = allData.finance?.filter((item) =>
      item.content.note.toLowerCase().includes(keyword.toLowerCase())
    );
    const notesMatch = allData.notes?.filter(
      (item) =>
        item.content.context.toLowerCase().includes(keyword.toLowerCase()) ||
        item.content.title.toLowerCase().includes(keyword.toLowerCase())
    );
    const tasksMatch = allData.tasks?.filter((item) =>
      item.content.task.toLowerCase().includes(keyword.toLowerCase())
    );
    const healthMatch = allData.health?.filter((item) =>
      item.content.note.toLowerCase().includes(keyword.toLowerCase())
    );
    newData.finance = financeMatch;
    newData.notes = notesMatch;
    newData.tasks = tasksMatch;
    newData.health = healthMatch;
    setMatchedData(newData);
    setHasSearch(false);
  }, [allData, hasSearch]);

  //   console.log(matchedData);
  console.log(allData);

  return (
    <Wrapper>
      <Title>Search Result</Title>
      <SplitLine />
      <Results>
        {tags.map((tag, index) => (
          <ResultContainer key={index}>
            <ResultTitle>{tag}</ResultTitle>
            <ResultContent>
              {matchedData[tag.toLowerCase()]?.map((data, index) => (
                <Row key={index}>
                  {data.content.note ?? data.content.task ?? data.content.title}
                </Row>
              ))}
            </ResultContent>
          </ResultContainer>
        ))}
      </Results>
    </Wrapper>
  );
}
