import { Timestamp } from 'firebase/firestore';
import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components/macro';
import FixMenu from '../../components/FixedMenu';
import Mask from '../../components/Mask';
import { EventContext } from '../../context/EventContext';
import { StateContext } from '../../context/StateContext';
import { UserContext } from '../../context/UserContext';
import { storeMutipleTasks } from '../../utils/firebase';
import { alerts } from '../../utils/sweetAlert';
import Board from './Board';
import calendarIcon from './img/google_calendar.png';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  margin: 0 auto;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
`;

const CalendarSelect = styled.select`
  display: ${({ display }) => display};
  box-sizing: border-box;
  width: 200px;
  height: 50px;
  position: absolute;
  right: 220px;
  top: 40px;
  border-radius: 10px;
  background-color: #a4a4a3;
  color: white;
  padding-left: 10px;
  outline: none;
  position: absolute;
  z-index: ${({ zIndex }) => zIndex ?? 0};
`;

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });

export default function Tasks() {
  const { email } = useContext(UserContext);
  const { cardDb } = useContext(EventContext);
  const { isAdding, setIsAdding } = useContext(StateContext);
  const gapi = window.gapi;
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const DISCOVERY_DOC =
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES =
    'https://www.googleapis.com/auth/calendar.tasks.readonly  https://www.googleapis.com/auth/calendar.readonly';
  const [isLogin, setIsLogin] = useState(false);
  const [accessToken, setAcessToken] = useState(null);
  const [response, setResponse] = useState(null);
  const [calendars, setCalendars] = useState(null);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [isImport, setIsImoprt] = useState(false);
  const [fixedMenuVisible, setFixedMenuVisible] = useState(false);
  const googleButton = useRef(null);
  const contextMenuOptions = [
    {
      label: 'Choose Account',
      value: 'account',
      onClick: handleOAuth,
      display: accessToken ? 'none' : 'block',
    },
    {
      label: 'Choose Calendars',
      value: 'calendar',
      onClick: getCalenders,
      display: accessToken ? 'block' : 'none',
    },
    {
      label: 'Import Events',
      value: 'tasks',
      onClick: showEvents,
      display: calendars ? 'block' : 'none',
    },
  ];

  async function initializeGapiClient() {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
  }

  useEffect(() => {
    const apiSrc = 'https://apis.google.com/js/api.js';

    loadScript(apiSrc)
      .then(() => {
        gapi.load('client', initializeGapiClient);
      })
      .catch((err) => console.log(err.messages));
  }, []);

  function handleOAuth() {
    // const url = `https://accounts.google.com/o/oauth2/v2/auth?scope=${SCOPES}&include_granted_scopes=true&response_type=token&redirect_uri=https://infosnap.xyz/tasks&client_id=${CLIENT_ID}`;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?scope=${SCOPES}&include_granted_scopes=true&response_type=token&redirect_uri=http://localhost:3000/tasks&client_id=${CLIENT_ID}`;
    window.location.href = url;
  }

  async function listUpcomingEvents() {
    try {
      const request = {
        calendarId: selectedCalendarId,
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime',
      };
      setResponse(await gapi.client.calendar.tasks.list(request));
      alert('Events Imported!');
    } catch (err) {
      console.log(err.message);
      return;
    }
  }

  function storeCalendars(data) {
    const calendars = data.items;
    const calendarData = calendars.map((calendar) => {
      return { title: calendar.summary, id: calendar.id };
    });
    setCalendars(calendarData);
  }

  async function getCalenders() {
    if (accessToken) {
      fetch(
        `https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=10&key=${API_KEY}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          storeCalendars(data);
        })
        .catch((err) => console.log(err.message));
    } else {
      alerts.titleOnly('Please choose a account first!', 'error');
    }
  }

  async function showEvents() {
    await listUpcomingEvents();
    setIsAdding(false);
    setFixedMenuVisible(false);
  }

  function getLoacalStorageCredential() {
    const credential = localStorage.getItem('loginToken');
    credential && setIsLogin(true);
  }

  function getAccessToken() {
    const searchParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = searchParams.get('access_token');
    localStorage.setItem('gcAT', JSON.stringify(accessToken));
    setAcessToken(accessToken);
  }

  function saveSelectedCalendar(data) {
    setSelectedCalendarId(data);
  }

  function getTimestamp(date) {
    const now = new Date(date);
    const timestamp = Timestamp.fromDate(now);
    return timestamp;
  }

  function getDbFormatData(obj) {
    const data = JSON.parse(JSON.stringify(obj));
    const startDate_timestamp = data.start.date
      ? getTimestamp(data.start.date)
      : getTimestamp(data.start.dateTime);
    const expireDate_timestamp = data.end.date
      ? getTimestamp(data.end.date)
      : getTimestamp(data.end.dateTime);
    data.start.date = startDate_timestamp;
    data.end.date = expireDate_timestamp;
    const dbFormatCard = {
      task: data.summary,
      status: data.status,
      startDate: data.start.date,
      expireDate: data.end.date,
      index:
        cardDb.length > 0 ? Number(cardDb[cardDb.length - 1].index) + 1 : 0,
      visible: true,
    };

    return dbFormatCard;
  }

  useEffect(() => {
    if (!response) {
      return;
    }
    const calendarEvent = response.result.items;
    !calendarEvent || (calendarEvent.length === 0 && alert('No event found.'));
    const eventsWithStatus = calendarEvent.map((event) => {
      const date = new Date(event.start.date).getTime();
      const now = new Date().getTime();
      return {
        ...event,
        status: date < now ? 'doing' : 'to-do',
        visible: true,
      };
    });
    storeMutipleTasks(eventsWithStatus, email);
  }, [response]);

  useEffect(() => {
    getLoacalStorageCredential();
    getAccessToken();
  }, [isLogin]);

  useEffect(() => {
    const currentUrl = window.location.href;
    if (currentUrl.length > 500) {
      setIsImoprt(true);
    }

    function handleKeyDown(e) {
      switch (e.key) {
        case 'Shift':
          if (e.ctrlKey) {
            setIsAdding((prev) => !prev);
            setFixedMenuVisible((prev) => !prev);
          }
          break;
        default:
          break;
      }
    }

    const calendarAccessToken = JSON.parse(localStorage.getItem('gcAT'));
    calendarAccessToken && setAcessToken(calendarAccessToken);

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (accessToken) {
      setIsAdding(true);
      setFixedMenuVisible(true);
    }
    return;
  }, [accessToken]);

  return (
    <Wrapper>
      <Mask display={isAdding ? 'block' : 'none'} />
      <FixMenu
        options={contextMenuOptions}
        optionIsVisible={fixedMenuVisible}
        top='250px'
        right='50px'
        transform={fixedMenuVisible ? 'scaleY(1)' : 'scaleY(0)'}
        overflow='visible'
        positionAbsolute
      >
        <CalendarSelect
          onChange={(e) => {
            saveSelectedCalendar(e.target.value);
          }}
          display={calendars && isAdding ? 'block' : 'none'}
          zIndex={calendars && isAdding && 200}
        >
          {calendars
            ? calendars.map((calendar, index) => (
                <option value={calendar.id} key={index}>
                  {calendar.title}
                </option>
              ))
            : null}
        </CalendarSelect>
      </FixMenu>
      <ImportTrigger
        onClick={() => {
          setIsAdding((prev) => !prev);
          setFixedMenuVisible((prev) => !prev);
        }}
      >
        <CalendarIcon />
        <ImportTriggerText>Import Google Calendar</ImportTriggerText>
      </ImportTrigger>
      <Board
        onClick={() => {
          setIsImoprt(!isImport);
        }}
        sharedStates={setFixedMenuVisible}
      />
    </Wrapper>
  );
}

const ImportTriggerText = styled.div`
  white-space: nowrap;
`;

const CalendarIcon = styled.div`
  width: ${({ width }) => width ?? '30px'};
  height: ${({ width }) => width ?? '30px'};
  background-image: url(${calendarIcon});
  background-size: contain;
  background-repeat: no-repeat;
`;

const ImportTrigger = styled.div`
  width: 300px;
  height: 40px;
  border-radius: 10px;
  background-color: #3a6ff7;
  margin-left: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: width 0.5s;
  overflow: hidden;
  margin-bottom: 10px;
  z-index: 20;
  position: relative;
`;
