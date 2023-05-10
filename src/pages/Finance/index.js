import { ChartContexProvider } from '../../components/Charts/ChartContext';
import Analytics from './Analytics';
import Dashboard from './Dashboard';

export default function Finance() {
  return (
    <ChartContexProvider>
      <Dashboard />
      <Analytics display='none' />
    </ChartContexProvider>
  );
}
