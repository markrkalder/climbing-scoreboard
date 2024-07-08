import React, {useRef, useState, useEffect, useCallback} from 'react';
import {Box, Typography, TextField, Button } from '@mui/material';
import StickyHeadTable from "./StickyHeadTable";
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';

const TrackComponent = ({ trackLabel, shortTrackFilename, longTrackFilename, startKey, shortStopKey, longStopKey}) => {

    const [trackValue, setTrackValue] = useState('00:00:000');
    const startTimeRef = useRef(null);
    const timerIntervalRef = useRef(null);
    const [shortTrackData, setShortTrackData] = useState([]);
    const [longTrackData, setLongTrackData] = useState([]);
    const [isNameConfirmed, setIsNameConfirmed] = useState(false);
    const initialDataLoaded = useRef(false);
    const soundPlayedRef = useRef(false);
    const doubleTapTimeoutRef = useRef(null);
    const [nameValue, setNameValue] = useState('');
    const buzzerCheckIntervalRef = useRef(null);

    useEffect(() => {
        const loadInitialData = () => {
            const loadedShortTrackData = window.loadDataFromFile(shortTrackFilename);
            const sortedShortTrackData = sortTableData(loadedShortTrackData);
            setShortTrackData(sortedShortTrackData);

            const loadedLongTrackData = window.loadDataFromFile(longTrackFilename);
            const sortedLongTrackData = sortTableData(loadedLongTrackData);
            setLongTrackData(sortedLongTrackData);

            initialDataLoaded.current = true;
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        if (initialDataLoaded && shortTrackData.length > 0){
            window.saveDataToFile(shortTrackFilename, shortTrackData);
        }
    }, [shortTrackData, shortTrackFilename]);

    useEffect(() => {
        if (initialDataLoaded && longTrackData.length > 0) {
            window.saveDataToFile(longTrackFilename, longTrackData);
        }
    }, [longTrackData, longTrackFilename]);

    const sortTableData = (loadedData) => {
        return loadedData
            .sort((a, b) => ('' + a.time).localeCompare(b.time))
            .map((item, index) => ({ ...item, index: index + 1 }));
    };

    const formatTime = (time) => {
        const minutes = Math.floor((time / 60000) % 60);
        const seconds = Math.floor((time / 1000) % 60);
        const milliseconds = Math.floor(time % 1000);

        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(3, "0")}`;
    };

    const updateDisplay = () => {
        const elapsedTimeMillis = Date.now() - startTimeRef.current;
        if (elapsedTimeMillis > 30000){
            setIsNameConfirmed(false);
        }
        setTrackValue(formatTime(elapsedTimeMillis));
    };

    const startTimer = () => {
        if (!timerIntervalRef.current){
            setIsNameConfirmed(true);
            startTimeRef.current = Date.now();
            timerIntervalRef.current = setInterval(() => {
                updateDisplay();
            }, 40);
        }
    };

    const stopTimer = (stateSetter) => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
                stateSetter((prevTableData) => sortTableData([
                    ...prevTableData,
                    {index: prevTableData.length + 1, name: nameValue, time: trackValue},
                ]));
            timerIntervalRef.current = null;
            setIsNameConfirmed(false);
            soundPlayedRef.current = false;
            clearTimeout(buzzerCheckIntervalRef.current);
            buzzerCheckIntervalRef.current = null;
            clearTimeout(doubleTapTimeoutRef.current);
            doubleTapTimeoutRef.current = null;
        }
    };

    const stopTimerWithoutFinish = () => {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        setIsNameConfirmed(false);
        soundPlayedRef.current = false;
        clearTimeout(buzzerCheckIntervalRef.current);
        buzzerCheckIntervalRef.current = null;
        clearTimeout(doubleTapTimeoutRef.current);
        doubleTapTimeoutRef.current = null;
    };

    const resetTimer = () => {
            clearInterval(timerIntervalRef.current);
            setTrackValue('00:00:000');
            timerIntervalRef.current = null;
            setIsNameConfirmed(false);
            setNameValue('');
            clearTimeout(buzzerCheckIntervalRef.current);
            buzzerCheckIntervalRef.current = null;
            soundPlayedRef.current = false;
            clearTimeout(doubleTapTimeoutRef.current);
            doubleTapTimeoutRef.current = null;
    };

    const playSound = () => {
        const audio = new Audio('buzzer.mp3');
        audio.play();
    };

    const useKeyDown = (callback, key) => {
        const onKeyDown = useCallback((event) => {
            if (event.key === key) {
                event.preventDefault();
                callback();
            }
        }, [callback, key]);

        useEffect(() => {
            document.addEventListener('keydown', onKeyDown);
            return () => {
                document.removeEventListener('keydown', onKeyDown);
            };
        }, [onKeyDown]);
    };

    const useKeyUp = (callback, key) => {
        const onKeyUp = useCallback((event) => {
            if (event.key === key) {
                event.preventDefault();
                if (timerIntervalRef.current || !nameValue) return;
                if (!doubleTapTimeoutRef.current) {
                    doubleTapTimeoutRef.current = setTimeout(() => {
                        clearTimeout(buzzerCheckIntervalRef.current);
                        buzzerCheckIntervalRef.current = null;
                        doubleTapTimeoutRef.current = null;
                        callback();
                    }, 400);
                }
            }
        }, [callback, key]);

        useEffect(() => {
            document.addEventListener('keyup', onKeyUp);
            return () => {
                document.removeEventListener('keyup', onKeyUp);
            };
        }, [onKeyUp]);
    };

    const handleStartKeyDown = (event) => {
        if (event.key === startKey) {
            event.preventDefault();
            if (timerIntervalRef.current) return;
            if (doubleTapTimeoutRef.current) {
                clearTimeout(doubleTapTimeoutRef.current);
                doubleTapTimeoutRef.current = null;
                return;
            }
            if (buzzerCheckIntervalRef.current) return;
                buzzerCheckIntervalRef.current = setTimeout(() => {
                    playSound();
                    clearTimeout(buzzerCheckIntervalRef.current);
                    buzzerCheckIntervalRef.current = null;
                }, 1000);
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleStartKeyDown);
        return () => {
            document.removeEventListener('keydown', handleStartKeyDown);
            clearTimeout(buzzerCheckIntervalRef.current);
            buzzerCheckIntervalRef.current = null;
            clearTimeout(doubleTapTimeoutRef.current);
            doubleTapTimeoutRef.current = null;
        };
    }, [startKey]);

    useKeyUp(() => startTimer(), startKey);
    useKeyDown(() => stopTimer(setShortTrackData), shortStopKey);
    useKeyDown(() => stopTimer(setLongTrackData), longStopKey);

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh', mx: 2}}>
            <Typography variant="h3">
                {trackLabel}
            </Typography>
            <Typography variant="h3">
                {trackValue}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1, width: '100%' }}>
            <TextField
                id="outlined-basic"
                label="Nimi"
                variant="outlined"
                disabled={isNameConfirmed}
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                sx={{
                    flexGrow: 1,
                    mr: 1.5,
                    '& .MuiOutlinedInput-root': {
                        '&.Mui-disabled': {
                            '& fieldset': {
                                borderColor: 'lightgreen'
                            }
                        }
                    }
            }}
            />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={stopTimerWithoutFinish}
                    sx={{
                        fontSize: '1.5em',
                        minWidth: '3em',
                        height: '100%'
                    }}
                >
                    <StopIcon sx={{ fontSize: '1.5em' }} />
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={resetTimer}
                    sx={{
                        fontSize: '1.5em',
                        minWidth: '3em',
                        height: '100%',
                        ml: 1.5
                    }}
                >
                    <ReplayIcon sx={{ fontSize: '1.5em' }} />
                </Button>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Lühem rada
                </Typography>
                <Box sx={{ flex: 0.75, overflow: 'auto' }}>
                    <StickyHeadTable tableData={shortTrackData} />
                </Box>
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Pikk rada
                </Typography>
                <Box sx={{ flex: 0.25, overflow: 'auto' }}>
                    <StickyHeadTable tableData={longTrackData} />
                </Box>
            </Box>
        </Box>
    );
};
export default TrackComponent;
