import {
  Timestamp,
  collection,
  doc,
  endBefore,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  updateDoc,
} from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import Icon from '../../components/Icon/Icon';
import { PageContext } from '../../context/pageContext';
import { extensionDb } from '../../firebase';
import doneIcon from '../img/correct.png';

const Wrapper = styled.div`
  display: ${(props) => props.display};
  width: 85%;
  margin: 0 auto;
  flex-direction: column;
  gap: 15px;
  padding-bottom: 30px;
  height: 500px;
`;

const TaskContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const HeaderText = styled.div`
  font-size: 20px;
  color: #a4a4a3;
  font-weight: 500;
`;

const SplitLine = styled.hr`
  width: 100%;
  border: 1px solid #a4a4a3;
`;

const TaskText = styled.div`
  font-size: 18px;
  color: white;
  width: 100px;
  flex-shrink: 0;
`;

const TaskWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    background-color: #1b2028;
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #a4a4a3;
  }
`;

export default function Tasks({ display }) {
  const { email } = useContext(PageContext);
  const [todayToDo, setTodayTodo] = useState([]);

  function getTimestampwithTime(hr, min, sec, nanosec) {
    const now = new Date();
    now.setDate(now.getDate());
    now.setHours(hr, min, sec, nanosec);
    const timestamp = Timestamp.fromDate(now);
    return timestamp;
  }

  function getTimestamp(date) {
    const now = new Date(date);
    const timestamp = Timestamp.fromDate(now);
    return timestamp;
  }

  function parseTimestamp(timestamp) {
    const date = timestamp.toDate();
    const isoString = date.toISOString();
    const dateOnly = isoString.substring(0, 10);
    return dateOnly;
  }
  function handleCheck(task) {
    const docId = task.docId;
    const newTask = {
      task: task.summary,
      status: 'done',
      startDate: getTimestamp(task.start.date),
      expireDate: getTimestamp(task.end.date),
    };
    updateDoc(doc(extensionDb, 'Users', email, 'Tasks', docId), newTask);
    alert('Status Updated!');
  }

  useEffect(() => {
    const startOfToday = getTimestampwithTime(0, 0, 0, 0);
    const endOfToday = getTimestampwithTime(23, 59, 59, 59);
    const todayTasksQuery = query(
      collection(extensionDb, 'Users', email, 'Tasks'),
      orderBy('startDate', 'asc'),
      startAfter(startOfToday),
      endBefore(endOfToday)
    );

    const todayTaskSub = onSnapshot(todayTasksQuery, (snapshot) => {
      const tasks = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          start: { date: parseTimestamp(data.startDate) },
          end: { date: parseTimestamp(data.expireDate) },
          summary: data.task,
          visible: true,
          status: data.status,
          docId: doc.id,
        });
      });
      const todayTasks = tasks.filter(
        (task) => task.status === 'to-do' || task.status === 'doing'
      );
      setTodayTodo(todayTasks);
    });

    return todayTaskSub;
  }, []);

  return (
    <Wrapper display={display}>
      <Header>
        <HeaderText>Done</HeaderText>
        <HeaderText>Task</HeaderText>
        <HeaderText>Expire Date</HeaderText>
      </Header>
      <SplitLine />
      <TaskWrapper>
        {todayToDo.map((task, index) => (
          <TaskContainer key={index}>
            {/* <CheckBox onClick={() => handleCheck(task)}>Done</CheckBox> */}
            <Icon
              width='30px'
              imgUrl={doneIcon}
              onClick={() => handleCheck(task)}
            />
            <TaskText marginRight='auto'>{task.summary}</TaskText>
            <TaskText>{task.end.date.slice(5).replace('-', '/')}</TaskText>
          </TaskContainer>
        ))}
      </TaskWrapper>
    </Wrapper>
  );
}
