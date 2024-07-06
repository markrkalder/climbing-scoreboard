import './App.css';
import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import TrackComponent from "./TrackComponent";

export default function App() {
  return (
    <Box sx={{ width: '100%' }}>
      <Grid container rowSpacing={1.5} columnSpacing={1.5}>
        <Grid xs={6}>
          <TrackComponent
              trackLabel={'Rada 1'}
              shortTrackFilename={'rada1short.json'}
              longTrackFilename={'rada1long.json'}
              startKey={'1'}
              shortStopKey={'3'}
              longStopKey={'5'}
          ></TrackComponent>
        </Grid>
        <Grid xs={6}>
          <TrackComponent
              trackLabel={'Rada 2'}
              shortTrackFilename={'rada2short.json'}
              longTrackFilename={'rada2long.json'}
              startKey={'2'}
              shortStopKey={'4'}
              longStopKey={'6'}
          ></TrackComponent>
        </Grid>
      </Grid>
    </Box>
  );
}