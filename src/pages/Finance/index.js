import Dashboard from './Dashboard';
import { ChartContexProvider } from '../../components/Charts/chartContex';
import Analytics from './Analytics';

export default function Finance() {
  return (
    <ChartContexProvider>
      <Dashboard />
      <Analytics display='none' />
    </ChartContexProvider>
  );
}
