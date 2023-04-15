import React, { useState, useEffect, useRef, useContext } from 'react';
import styled from 'styled-components';
import { EventContext } from '../../context/eventContext';
import Board from './Board';

const Wrapper = styled.div`
  width: 1200px;
  display: flex;
  margin: 0 auto;
  flex-direction: column;
  align-items: center;
`;

const CalendarWrapper = styled.div`
  width: 500px;
  height: 300px;
  margin: 50px auto 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
  gap: 20px;
`;

const Button = styled.button`
  width: 150px;
  height: 50px;
  display: ${(props) => props.display};
`;

const LoginButton = styled.div`
  display: ${(props) => props.display};
`;

const CalendarSelect = styled.select`
  margin: 0 auto;
  width: 300px;
  height: 50px;
  margin: 30px;
`;

const Events = styled.div`
  margin-left: 30px;
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

export default function Calendar() {
  const gapi = window.gapi;
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const DISCOVERY_DOC =
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES =
    'https://www.googleapis.com/auth/calendar.events  https://www.googleapis.com/auth/calendar';
  const [gisInited, setGisInited] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [accessToken, setAcessToken] = useState(null);
  const [response, setResponse] = useState(null);
  //   const [events, setEvents] = useState([]);
  const { events, setEvents } = useContext(EventContext);
  const [calendars, setCalendars] = useState(null);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const googleButton = useRef(null);

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
        setGisInited(true);
      })
      .catch(console.error);

    loadScript(apiSrc)
      .then(() => {
        gapi.load('client', initializeGapiClient);
      })
      .catch((err) => console.log(err.messages));
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

  async function listUpcomingEvents() {
    try {
      console.log(selectedCalendarId);
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
    const mergedEventList = [...eventsWithStatus, ...events];
    setEvents(mergedEventList);
    // setEvents(output);
  }, [response]);

  useEffect(() => {
    getLoacalStorageCredential();
    getAccessToken();
  }, [isLogin]);

  return (
    <Wrapper>
      <CalendarWrapper>
        <LoginButton
          ref={googleButton}
          display={isLogin ? 'none' : 'block'}
        ></LoginButton>
        <Button
          onClick={() => {
            handleOAuth();
          }}
        >
          Sign-in
        </Button>
        <Button onClick={getCalenders}>Import Calendars</Button>
        <Button onClick={showEvents}>Import Events</Button>
      </CalendarWrapper>
      <CalendarSelect
        onChange={(e) => {
          saveSelectedCalendar(e.target.value);
        }}
      >
        {calendars
          ? calendars.map((calendar, index) => (
              <option value={calendar.id} key={index}>
                {calendar.title}
              </option>
            ))
          : null}
      </CalendarSelect>
      {/* {events.map((event, index) => (
        <Events key={index}>
          <p>
            {`${event.summary} | from ${event.start.date} to ${event.end.date}`}
          </p>
        </Events>
      ))} */}
      <Board />
    </Wrapper>
  );
}
