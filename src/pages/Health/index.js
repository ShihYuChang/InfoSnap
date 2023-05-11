import React from 'react';
import { HealthContextProvider } from '../../context/HealthContext';
import HealthDashboard from './HealthDashboard';

export default function Health() {
  return (
    <HealthContextProvider>
      <HealthDashboard />
    </HealthContextProvider>
  );
}
