import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Button = styled.button`
  width: 150px;
  height: 50px;
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
    'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar';
  const [response, setResponse] = useState(null);
  const [gapiInited, setGapiInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [credential, setCredential] = useState(null);
  const [tokenClient, setTokenClient] = useState(null);
  const googleButton = useRef(null);

  async function handleAuthClick() {}

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
          scope: SCOPES,
          callback: handleCredentialResponse,
        });
        google.accounts.id.renderButton(googleButton.current, {
          theme: 'outline',
          size: 'large',
        });
        setGisInited(true);
      })
      .then(console.log('login success!'))
      .catch(console.error);

    loadScript(apiSrc)
      .then(() => {
        gapi.load('client', initializeGapiClient);
      })
      .catch((err) => console.log(err.messages));
  }, []);

  function handleCredentialResponse(response) {
    setCredential(response.credential);
    listUpcomingEvents();
    localStorage.setItem('loginToken', JSON.stringify(response.credential));
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

  useEffect(() => {
    const events = response.result.items;
    !events || (events.length === 0 && alert('No events found.'));
    const output = events.reduce(
      (str, event) =>
        `${str}${event.summary} (${
          event.start.dateTime || event.start.date
        })\n`,
      'Events:\n'
    );
    console.log(output);
  }, [response]);

  return (
    <>
      <div ref={googleButton}></div>
      <Button
        onClick={handleAuthClick}
        display={gapiInited && gisInited ? 'block' : 'none'}
      >
        Authorize
      </Button>
    </>
  );
}
