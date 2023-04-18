import { useEffect, useState, useContext } from 'react';
import {
  onSnapshot,
  collection,
  orderBy,
  startAfter,
  endBefore,
  query,
  Timestamp,
  doc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { extensionDb } from '../firebase';
import { PageContext } from '../context/pageContext';
import styled from 'styled-components/macro';

export default function Task({ display }) {
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
        <TaskText>Expire Date</TaskText>
      </Header>
      {todayToDo.map((task, index) => (
        <TaskContainer key={index}>
          <CheckBox onClick={() => handleCheck(task)}>Done</CheckBox>
          <TaskText marginRight='auto'>{task.summary}</TaskText>
          <DateText>{task.end.date}</DateText>
        </TaskContainer>
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: ${(props) => props.display};
  width: 90%;
  margin: 0 auto;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 30px;
  min-height: 300px;
`;

const TaskContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 0 0 0 30px;
`;

const TaskText = styled.h2`
  margin-right: ${(props) => props.marginRight};
`;

const DateText = styled.h3``;

const CheckBox = styled.button`
  width: 50px;
  height: 30px;
  margin-right: 30px;
  cursor: pointer;
  background-color: green;
  color: white;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: end;
`;
