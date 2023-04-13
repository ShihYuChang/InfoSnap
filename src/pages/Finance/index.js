import Dashboard from '../Finance/Dashboard';
import { ChartContexProvider } from '../../components/Charts/chartContex';

export default function Finance() {
  return (
    <ChartContexProvider>
      <Dashboard />
    </ChartContexProvider>
  );
}
