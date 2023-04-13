import { createContext, useState } from 'react';

const pie_cx = 200;
const pie_cy = 120;
const pie_r = 100;

export const ChartContext = createContext({
  allXYs: [{ x: pie_cx + pie_r, y: pie_cy, angle: 0 }],
  rawRecords: [],
  setAllXYs: () => {},
  setRawRecords: () => {},
});

export const ChartContexProvider = ({ children }) => {
  const [rawRecords, setRawRecords] = useState([]);
  const [allXYs, setAllXYs] = useState([
    { x: pie_cx + pie_r, y: pie_cy, angle: 0 },
  ]);
  return (
    <ChartContext.Provider
      value={{ allXYs, setAllXYs, rawRecords, setRawRecords }}
    >
      {children}
    </ChartContext.Provider>
  );
};
