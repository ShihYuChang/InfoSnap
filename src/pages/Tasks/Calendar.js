import React, { useState, useEffect, useRef, useContext } from 'react';
import styled from 'styled-components/macro';
import { EventContext } from '../../context/eventContext';
import { Timestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserContext } from '../../context/userContext';
import Board from './Board';
import { StateContext } from '../../context/stateContext';
import calendarIcon from './google_calendar.png';
import FixMenu from '../../components/ContextMenu/FixMenu';
import Mask from '../../components/Mask';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  margin: 0 auto;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
`;

const ImportWrapper = styled.div`
  display: ${(props) => props.display};
  width: 100%;
  flex-direction: column;
  align-items: center;
`;

const CalendarWrapper = styled.div`
  box-sizing: border-box;
  width: 500px;
  height: 300px;
  margin: 50px auto 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background-color: #1b2028;
  border-radius: 10px;
  padding: 0 70px;
`;

const Button = styled.button`
  width: 150px;
  height: 50px;
  display: ${(props) => props.display};
  border: 0;
  outline: none;
  background-color: #a4a4a3;
  color: white;
  width: 100%;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 800;

  &:hover {
    background-color: #3a6ff7;
    color: white;
  }
`;

const LoginButton = styled.div`
  display: ${(props) => props.display};
`;

const CalendarSelect = styled.select`
  display: ${({ display }) => display};
  box-sizing: border-box;
  width: 200px;
  height: 50px;
  position: absolute;
  right: 280px;
  bottom: 250px;
  border-radius: 10px;
  background-color: #a4a4a3;
  color: white;
  padding-left: 10px;
  outline: none;
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

export default function Calendar({ sharedState }) {
  const { email } = useContext(UserContext);
  const { cardDb } = useContext(EventContext);
  const { setHeaderIcons, isAdding, setIsAdding } = useContext(StateContext);
  const gapi = window.gapi;
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const DISCOVERY_DOC =
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES =
    'https://www.googleapis.com/auth/calendar.events  https://www.googleapis.com/auth/calendar';
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
    },
    { label: 'Choose Calendars', value: 'calendar', onClick: getCalenders },
    { label: 'Import Event', value: 'events', onClick: showEvents },
  ];

  async function initializeGapiClient() {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
  }

  useEffect(() => {
    const src = 'https://accounts.google.com/gsi/client';
    const apiSrc = 'https://apis.google.com/js/api.js';
    const id = CLIENT_ID;
    loadScript(src)
      .then(() => {
        /*global google*/
        google.accounts.id.initialize({
          client_id: id,
          callback: handleCredentialResponse,
        });
        google.accounts.id.renderButton(googleButton.current, {
          theme: 'filled_blue',
          size: 'large',
          width: 200,
        });
      })
      .catch(console.error);

    loadScript(apiSrc)
      .then(() => {
        gapi.load('client', initializeGapiClient);
      })
      .catch((err) => console.log(err.messages));

    setHeaderIcons([]);
  }, []);

  function handleCredentialResponse(response) {
    localStorage.setItem('loginToken', JSON.stringify(response.credential));
    setIsLogin(true);
    alert('Login Successfully!');
  }

  function handleOAuth() {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?scope=${SCOPES}&include_granted_scopes=true&response_type=token&redirect_uri=http://localhost:3000/calendar&client_id=${CLIENT_ID}`;
    window.location.href = url;
  }

  // function handleOAuth() {
  //   const url = `https://accounts.google.com/o/oauth2/v2/auth?scope=${SCOPES}&include_granted_scopes=true&response_type=token&redirect_uri=https://infosnap-4f11e.web.app/calendar&client_id=${CLIENT_ID}`;
  //   window.location.href = url;
  // }

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
      setResponse(await gapi.client.calendar.events.list(request));
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

          alert('Calendars Loaded!');
        })
        .catch((err) => console.log(err.message));
    } else {
      alert('Please authorize first!');
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
    eventsWithStatus.forEach((event, index) => {
      const dbFormatEvent = getDbFormatData(event);
      dbFormatEvent.index += index;
      addDoc(collection(db, 'Users', email, 'Tasks'), dbFormatEvent);
    });

    // const mergedEventList = [...eventsWithStatus, ...events];
    // setEvents(mergedEventList);
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
  }, []);

  return (
    <Wrapper>
      <Mask display={isAdding ? 'block' : 'none'} />
      <ImportBtnWrapper>
        <ImportBtn
          onClick={() => {
            setIsAdding((prev) => !prev);
            setFixedMenuVisible((prev) => !prev);
          }}
        >
          <CalendarIcon />
        </ImportBtn>
        <FixMenu
          options={contextMenuOptions}
          optionIsVisible={fixedMenuVisible}
          bottom='130px'
          right='70px'
          height={fixedMenuVisible ? '320px' : 0}
        />
        <CalendarSelect
          onChange={(e) => {
            saveSelectedCalendar(e.target.value);
          }}
          display={calendars && isAdding ? 'block' : 'none'}
        >
          {calendars
            ? calendars.map((calendar, index) => (
                <option value={calendar.id} key={index}>
                  {calendar.title}
                </option>
              ))
            : null}
        </CalendarSelect>
      </ImportBtnWrapper>

      <Board
        onClick={() => {
          setIsImoprt(!isImport);
        }}
        sharedStates={setFixedMenuVisible}
      />
    </Wrapper>
  );
}

const ImportBtn = styled.div`
  box-sizing: border-box;
  width: 100px;
  height: 100px;
  margin-top: 30px;
  background-color: #3a6ff7;
  color: white;
  border: 0;
  font-size: 20px;
  font-weight: 500;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const ImportBtnWrapper = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
  position: fixed;
  right: 20px;
  bottom: 20px;
  cursor: pointer;
  z-index: 100;
`;

const CalendarIcon = styled.div`
  width: 50px;
  height: 50px;
  background-image: url(${calendarIcon});
  background-size: contain;
  background-repeat: no-repeat;
`;
