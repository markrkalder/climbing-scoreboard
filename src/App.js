import './App.css';
import * as React from 'react';
import Button from '@mui/material/Button';
import StickyHeadTable from './StickyHeadTable';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import { Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

export const useKeyDown = (callback, keys) => {
  const onKeyDown = (event) => {
    const wasAnyKeyPressed = keys.some((key) => event.key === key);
    if (wasAnyKeyPressed) {
      event.preventDefault();
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);
};

export default function App() {

  const [trackValue, setTrackValue] = useState('00:00:000');
  const trackRef2 = useRef("00:00:000");
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const textField1Ref = useRef('');
  const [tableData, setTableData] = useState([]);

  const sortTableData = (loadedData) => {
    return loadedData.sort((a, b) => ('' + a.time).localeCompare(b.time));
  };

  useEffect(() => {
    const loadedData = window.loadDataFromFile('tableData.json');
    const sortedData = sortTableData(loadedData);
    setTableData(sortedData);
  }, []);


  useEffect(() => {
    const handleBeforeUnload = () => {
      window.saveDataToFile('tableData.json', tableData);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tableData]);


  const formatTime = (time) => {
    const minutes = Math.floor((time / 60000) % 60);
    const seconds = Math.floor((time / 1000) % 60);
    const milliseconds = Math.floor(time % 1000);

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(3, "0")}`;
  };

  // Update the time display
  const updateDisplay = () => {
    const elapsedTimeMillis = Date.now() - startTimeRef.current;
    setTrackValue(formatTime(elapsedTimeMillis));
  };

  const startTimer = () => {
    if (!timerIntervalRef.current) {
      startTimeRef.current = Date.now();
      timerIntervalRef.current = setInterval(() => {
        updateDisplay();
      }, 10);
    }
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      setTableData((prevTableData) => sortTableData([
        ...prevTableData,
        { index: prevTableData.length + 1, name: textField1Ref.current.value, time: trackValue },
      ]));
      timerIntervalRef.current = null;
    }
  };

  useKeyDown(() => {
    startTimer();
  }, ["a"]);

  useKeyDown(() => {
    stopTimer();
    console.log(textField1Ref.current.value);
  }, ["b"]);

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container rowSpacing={1.5} columnSpacing={1.5}>
        <Grid xs={6}>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', mx: 2 }}>
            <Typography variant="h2">
              Rada 1
            </Typography>
            <Typography variant="h2">
              {trackValue}
            </Typography>
            <TextField id="outlined-basic" label="Nimi" variant="outlined" inputRef={textField1Ref} />
            <Box sx={{ m: 0.5 }} />
            <Button variant="contained" size='large'>Kinnita nimi</Button>
          </Box>
        </Grid>
        <Grid xs={6}>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
            <Typography variant="h2">
              Rada 2
            </Typography>
            <Typography variant="h2">
              {trackRef2.current}
            </Typography>
            <TextField id="outlined-basic" label="Nimi" variant="outlined" />
            <Button variant="contained" size='large'>Kinnita nimi</Button>
          </Box>
        </Grid>

        <Grid xs={6}>
          <StickyHeadTable tableData={tableData} />
        </Grid>
        <Grid xs={6}>
          <StickyHeadTable tableData={tableData} />
        </Grid>
      </Grid>
    </Box>
  );
}