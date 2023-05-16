import React from 'react';
import { HealthContextProvider } from '../../context/HealthContext';
import Health from './Health';

export default function Index() {
  return (
    <HealthContextProvider>
      <Health />
    </HealthContextProvider>
  );
}
