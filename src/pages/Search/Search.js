import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { StateContext } from '../../context/StateContext';
import { UserContext } from '../../context/UserContext';

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
  box-sizing: border-box;
  width: 100%;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 20px;
  padding-left: 10px;
`;

const ResultContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Row = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 10px;
  padding-left: 10px;

  &:hover {
    background-color: #a4a4a3;
  }
`;
const RowTitleWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: grid;
  grid-template-columns: ${(props) => props.gridFr ?? '1fr 1fr 1fr'};
  padding-left: 10px;
`;

const RowTitle = styled.div`
  font-size: 20px;
  color: #a4a4a3;
`;

const RowInfos = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: ${(props) => props.gridFr ?? '1fr 1fr 1fr'};
  margin-top: 10px;
  gap: 20px;
`;

const InfoText = styled.div`
  overflow: hidden;
`;

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword');
  const tags = [
    { label: 'Finance', titles: ['Note', 'Amount', 'Date'] },
    { label: 'Notes', titles: ['Title', 'Note', 'Created time'] },
    { label: 'Tasks', titles: ['Task', 'Status', 'Expire Date'] },
    { label: 'Health', titles: ['Note', 'Created time'] },
  ];
  const { allData, hasSearch, setHasSearch } = useContext(UserContext);
  const { selectedTask, setSelectedTask } = useContext(StateContext);
  const [matchedData, setMatchedData] = useState({
    finance: null,
    notes: null,
    tasks: null,
    health: null,
  });

  useEffect(() => {
    const newData = { ...matchedData };
    const financeMatch = allData.finance?.filter((item) =>
      item.content.note
        .toLowerCase()
        .replace(' ', '')
        .includes(keyword.toLowerCase())
    );
    const notesMatch = allData.notes?.filter(
      (item) =>
        item.content.context.toLowerCase().includes(keyword.toLowerCase()) ||
        item.content.title
          .toLowerCase()
          .replace(' ', '')
          .includes(keyword.toLowerCase())
    );
    const tasksMatch = allData.tasks?.filter((item) =>
      item.content.task
        .toLowerCase()
        .replace(' ', '')
        .includes(keyword.toLowerCase())
    );
    const healthMatch = allData.health?.filter((item) =>
      item.content.note
        .toLowerCase()
        .replace(' ', '')
        .includes(keyword.toLowerCase())
    );
    newData.finance = financeMatch;
    newData.notes = notesMatch;
    newData.tasks = tasksMatch;
    newData.health = healthMatch;
    setMatchedData(newData);
    setHasSearch(false);
  }, [allData, hasSearch]);

  //   console.log(matchedData);
  //   console.log(allData);

  function stripeNote(note) {
    if (note) {
      const strippedNote = note.replace(
        /<\/?(h1|h2|h3|div|br)[^>]*>|&nbsp;|(\r\n|\n|\r|\t|\s+)/gi,
        ''
      );
      return strippedNote;
    }
  }

  function clickResult(data, destination) {
    setSelectedTask(data);
    navigate(`/${destination}`);
  }

  return (
    <Wrapper>
      <Title>Search Result</Title>
      <SplitLine />
      <Results>
        {tags.map((tag, index) => (
          <ResultContainer key={index}>
            <ResultTitle>{tag.label}</ResultTitle>
            <RowTitleWrapper gridFr={tag.label === 'Health' ? '1fr 1fr' : null}>
              {tag.titles?.map((title, index) => (
                <RowTitle key={index}>{title}</RowTitle>
              ))}
            </RowTitleWrapper>
            <SplitLine />
            <ResultContent>
              {matchedData[tag.label.toLowerCase()]?.map((data, index) => (
                <Row
                  key={index}
                  onClick={() => clickResult(data, tag.label.toLowerCase())}
                >
                  <RowInfos
                    gridFr={tag.label === 'Health' ? '1fr 1fr' : '1fr 1fr 1fr'}
                  >
                    <InfoText>
                      {data.content.note ??
                        data.content.task ??
                        data.content.title}
                    </InfoText>
                    {data.content.amount ||
                    data.content.status ||
                    stripeNote(data.content.context) ? (
                      <InfoText>
                        {data.content.amount ??
                          data.content.status ??
                          stripeNote(data.content.context)}
                      </InfoText>
                    ) : null}
                    <InfoText>
                      {data.content.created_time?.toDate().toLocaleString() ??
                        data.content.date?.toDate().toLocaleString() ??
                        data.content.expireDate?.toDate().toLocaleString()}
                    </InfoText>
                  </RowInfos>
                </Row>
              ))}
            </ResultContent>
          </ResultContainer>
        ))}
      </Results>
    </Wrapper>
  );
}
