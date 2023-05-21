import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import FixMenu from '../../components/FixedMenu';
import Mask from '../../components/Mask';
import { StateContext } from '../../context/StateContext';
import { UserContext } from '../../context/UserContext';
import { storeMultipleTasks } from '../../utils/firebase/firebase';
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
  const { userInfo } = useContext(UserContext);
  const email = userInfo.email;
  const { isEditing, setIsEditing } = useContext(StateContext);
  const gapi = window.gapi;
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const DISCOVERY_DOC =
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES =
    'https://www.googleapis.com/auth/calendar.events.readonly  https://www.googleapis.com/auth/calendar.readonly';
  const [isLogin, setIsLogin] = useState(false);
  const [accessToken, setAcessToken] = useState(null);
  const [response, setResponse] = useState(null);
  const [calendars, setCalendars] = useState(null);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [isImport, setIsImoprt] = useState(false);
  const [fixedMenuVisible, setFixedMenuVisible] = useState(false);
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
    const url = `https://accounts.google.com/o/oauth2/v2/auth?scope=${SCOPES}&include_granted_scopes=true&response_type=token&redirect_uri=https://infosnap-4f11e.web.app/tasks&client_id=${CLIENT_ID}`;
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
      const events = await gapi.client.calendar.events.list(request);
      setResponse(events);
      alerts.titleOnly('Events Imported!', 'success');
    } catch (err) {
      const errorMessage = {
        401: 'Authorization error: Please authenticate and try again.',
        403: 'Access denied: You do not have permission to access the calendar.',
        404: 'Calendar not found: The specified calendar could not be found.',
        default: 'An error occurred, please try again later',
      };
      alerts.titleOnly(errorMessage[err.status], 'error');
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
    setIsEditing(false);
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
    storeMultipleTasks(eventsWithStatus, email);
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

    const calendarAccessToken = JSON.parse(localStorage.getItem('gcAT'));
    calendarAccessToken && setAcessToken(calendarAccessToken);
  }, []);

  useEffect(() => {
    if (accessToken || fixedMenuVisible) {
      setIsEditing(true);
      setFixedMenuVisible(true);
    }
    return;
  }, [accessToken, fixedMenuVisible]);

  return (
    <Wrapper>
      <Mask display={isEditing ? 'block' : 'none'} />
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
          display={calendars && isEditing ? 'block' : 'none'}
          zIndex={calendars && isEditing && 200}
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
          // setIsEditing((prev) => !prev);
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
