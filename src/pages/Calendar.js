import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 500px;
  height: 300px;
  margin: 100px auto 0;
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
  const [gapiInited, setGapiInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [accessToken, setAcessToken] = useState(null);
  const [response, setResponse] = useState(null);
  const [events, setEvents] = useState([]);
  const googleButton = useRef(null);

  async function initializeGapiClient() {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });

    setGapiInited(true);
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
          scope: SCOPES,
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
    const url = `https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/calendar&include_granted_scopes=true&response_type=token&redirect_uri=http://localhost:3000/calendar&client_id=${CLIENT_ID}`;
    window.location.href = url;
    // const client = google.accounts.oauth2.initTokenClient({
    //   client_id: CLIENT_ID,
    //   scope: SCOPES,
    //   callback: saveCode,
    // });
    // client.requestAcessToken();
    // client.requestCode();
  }

  function saveCode(response) {
    console.log(response);
    setAcessToken(response.code);
    localStorage.setItem('acessToken', JSON.stringify(response.code));
  }

  async function listUpcomingEvents() {
    try {
      const request = {
        calendarId:
          'c_395fefd24199863a7108d75920de380358178afa4a8d9e20354b14f7aa39e16c@group.calendar.google.com',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime',
      };
      setResponse(await gapi.client.calendar.events.list(request));
    } catch (err) {
      console.log(err.message);
      return;
    }
  }

  async function getCalenders() {
    const accessToken =
      'ya29.a0Ael9sCPYNIiEixr4i0-CdhI1E5esQRKHHjHtvGKSsIauPeOFqLd7APsF3qDopyuOTE0vSv8yFcAnQd037uihnYukXTAHVn0gdy9tcBM_ngH5axlw38JjItNXdLS5DmpEXGKkQjbKq7i7HEqTaqnx7zYaDo1yaCgYKAdwSARESFQF4udJh8RJ_gIn7FNqVLR9623-Mrw0163';
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
      .then((data) => console.log(data.items))
      .catch((err) => console.log(err.message));
  }

  useEffect(() => {
    if (!response) {
      return;
    }
    const events = response.result.items;
    !events || (events.length === 0 && alert('No events found.'));
    setEvents(events);
    // setEvents(output);
  }, [response]);

  async function showEvents() {
    await listUpcomingEvents();
  }

  function getLoacalStorageCredential() {
    const credential = localStorage.getItem('loginToken');
    credential && setIsLogin(true);
  }

  useEffect(() => {
    getLoacalStorageCredential();
  }, [isLogin]);

  return (
    <>
      <Wrapper>
        <LoginButton
          ref={googleButton}
          display={isLogin ? 'none' : 'block'}
        ></LoginButton>
        <Button
          onClick={showEvents}
          display={isLogin && gisInited ? 'block' : 'none'}
        >
          Show Events
        </Button>
        <Button
          onClick={() => {
            handleOAuth();
          }}
        >
          Auth
        </Button>
        <Button onClick={getCalenders}>Get Calendars</Button>
      </Wrapper>
      {events.map((event, index) => (
        <div key={index}>
          <p>
            {`${event.summary} | from ${event.start.date} to ${event.end.date}`}
          </p>
        </div>
      ))}
    </>
  );
}
