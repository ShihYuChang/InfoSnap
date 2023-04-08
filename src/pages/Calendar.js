import React, { useState, useEffect, useRef } from 'react';

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
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const DISCOVERY_DOC =
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

  const googleButton = useRef(null);

  useEffect(() => {
    const src = 'https://accounts.google.com/gsi/client';
    const id = CLIENT_ID;
    loadScript(src)
      .then(() => {
        /*global google*/
        console.log(google);
        google.accounts.id.initialize({
          client_id: id,
          callback: handleCredentialResponse,
        });
        google.accounts.id.renderButton(googleButton.current, {
          theme: 'outline',
          size: 'large',
        });
      })
      .catch(console.error);
  }, []);

  function handleCredentialResponse(response) {
    localStorage.setItem('loginToken', JSON.stringify(response.credential));
  }

  return <div ref={googleButton}></div>;
}
