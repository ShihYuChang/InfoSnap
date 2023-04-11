import React from 'react';
import HealthDashboard from './HealthDashboard';
import { HealthContextProvider } from './healthContext';

export default function Health() {
  return (
    <HealthContextProvider>
      <HealthDashboard />
    </HealthContextProvider>
  );
}
