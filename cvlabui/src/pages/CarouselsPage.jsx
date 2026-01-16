import React, { useState , useEffect, useCallback} from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  iconButtonClasses,
  Icon
} from "@mui/material";

import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useRef } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CWIcon from "@mui/icons-material/RotateRight"; 
import CCWIcon from "@mui/icons-material/RotateLeft"; 
import HomeIcon from "@mui/icons-material/Home"

export default function CarouselsPage() {
const [liquid_id, setLiquidid] = useState("Water");
const [volume, setVolume] = useState(1.0);
const [source_port, setSourceport] = useState("I1");
const [destination_port, setDestinationport] = useState("O2");
const [waste_port, setWasteport] = useState("O3");
const [thinking, setThinking] = useState(false);
const [dispense_flag, setDispenseflag] = useState(false);
const [log_text, setState] = useState("[INFO] Waiting for instructions...");
const STEP_OPTIONS = [0.1, 0.5, 1 , 5 , 10];
const positions_top_carousel = {
  sampling: 31.2,
  offset: 1.81,
  "0": 0,
  "1": 18,
  "2": 36,
  "3": 54,
  "4": 72,
  "5": 90,
  "6": 108,
  "7": 126,
  "8": 144,
  "9": 162,
  "10": 180,
  "11": 198,
  "12": 216,
  "13": 234,
  "14": 252,
  "15": 270,
  "16": 288,
  "17": 306,
  "18": 324,
  "19": 342
};
const positions_bottom_carousel = {
    offset : 3.1416,
    filling : 60,
    "0": 0,
    "1": 30,
    "2": 60,
    "3": 90,
    "4": 120,
    "5": 150,
    "6": 180,
    "7": 210,
    "8": 240,
    "9": 270,
    "10": 300,
    "11": 330 
}
const [selectedKeyTop, setSelectedKey] = useState("0");
const [selectedKeyNottom, setSelectedKeyBottom] = useState("0");
const [stepTop, setStepIncreaseTop] = useState(0.1);
const [stepBottom, setStepIncreaseBottom] = useState(0.1);
const get_method = (endpoint, payload = null) => {
    setThinking(true);
    fetch(`http://localhost:8080/api/v1${endpoint}`, 
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((result) => {
      setState(JSON.stringify(result["message"]));
    })
    .catch((error) => {
      console.error(error);
      setState(`[ERROR] ${error.message}`);
    })
    .finally(() => {
    setThinking(false);
    })
    
  };

const post_method = (endpoint, data) => {
  setThinking(true);
  fetch(`http://localhost:8080/api/v1${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((result) => {
      setState(JSON.stringify(result.message));
    })
    .catch((error) => {
      console.error(error);
      setState({ error: error.message });
    })
    .finally(() => {
    setThinking(false);
    })
};


return (
    <Stack direction="column" spacing={2} marginBottom={2}>
      <Paper style={{ padding: 30, maxWidth: 500, margin: "10px auto" }} elevation={0}>
        <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '5vh'}}>
        <Stack direction="column" spacing={2} marginBottom={2}>
          <h2>Top Carousel Control</h2>
        </Stack>
        </div>
      <Stack direction="row" spacing={2} marginBottom={2}>
      <FormControl sx={{ minWidth: 200 }}>
      <InputLabel id="position-label">Position</InputLabel>
      <Select
        labelId="position-label"
        value={selectedKeyTop}
        label="Position"
        onChange={(e) => setSelectedKey(e.target.value)}>
        {Object.keys(positions_top_carousel).map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
        </Select>
        </FormControl>
      <Button variant="contained" onClick={() => post_method("/top_carousel/move_absolute",{pos:selectedKeyTop})}sx={{ width: 500, height: 50 }} color="secondary"> Go </Button>
      </Stack>


      <Stack direction="row" spacing={2} marginBottom={2}>
         <Button variant="contained" onClick={() => post_method("/top_carousel/move_incremental",{"step":stepTop})}sx={{ width: 200, height: 50 }} > <CWIcon/> </Button>
         <TextField
                select
                label="Step Increment"
                value={stepTop}
                onChange={(e) => setStepIncreaseTop(Number(e.target.value))}
                sx={{ width: 150 }}>
                {STEP_OPTIONS.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v} deg
                  </MenuItem>
                ))}
          </TextField>
          <Button variant="contained" onClick={() => post_method("/top_carousel/move_incremental",{"step":-stepTop})}sx={{ width: 200, height: 50 }} > <CCWIcon/> </Button>
      </Stack>
     
      <Stack direction="column" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => get_method("/top_carousel/home")}sx={{ width: 500, height: 50 }} color="success"> Home <HomeIcon style={{ marginLeft: 11 }}/></Button>
      </Stack>
        <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '5vh'}}>
        <Stack direction="column" spacing={2} marginBottom={2}>
          <h2>Bottom Carousel Control</h2>
        </Stack>
        </div>
      <Stack direction="row" spacing={2} marginBottom={2}>
      <FormControl sx={{ minWidth: 200 }}>
      <InputLabel id="position-label">Position</InputLabel>
      <Select
        labelId="position-label"
        value={selectedKeyNottom}
        label="Position"
        onChange={(e) => setSelectedKeyBottom(e.target.value)}>
        {Object.keys(positions_bottom_carousel).map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
        </Select>
        </FormControl>
      <Button variant="contained" onClick={() => post_method("/bottom_carousel/move_absolute",{pos:selectedKeyNottom})}sx={{ width: 500, height: 50 }} color="secondary"> Go </Button>
      </Stack>
      
      <Stack direction="row" spacing={2} marginBottom={2}>
         <Button variant="contained" onClick={() => post_method("/bottom_carousel/move_incremental",{"step":stepBottom})}sx={{ width: 200, height: 50 }} > <CWIcon/> </Button>
         <TextField
                select
                label="Step Increment"
                value={stepBottom}
                onChange={(e) => setStepIncreaseBottom(Number(e.target.value))}
                sx={{ width: 150 }}>
                {STEP_OPTIONS.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v} deg
                  </MenuItem>
                ))}
          </TextField>
          <Button variant="contained" onClick={() => post_method("/bottom_carousel/move_incremental",{"step":-stepBottom})}sx={{ width: 200, height: 50 }} > <CCWIcon/> </Button>
      </Stack>
      
      <Stack direction="column" spacing={2} marginBottom={2}>
          <Button variant="contained" onClick={() => get_method("/bottom_carousel/home")}sx={{ width: 500, height: 50 }} color="success"> Home <HomeIcon style={{ marginLeft: 11 }}/></Button>
      </Stack>
      <Stack direction="row" spacing={2} marginBottom={2}>
          <Button variant="contained" onClick={() => get_method("/bottom_carousel/turn_pumps_on")}sx={{ width: 500, height: 50 }} color="secondary"> Pumps ON </Button>
          <Button variant="contained" onClick={() => get_method("/bottom_carousel/turn_pumps_off")}sx={{ width: 500, height: 50 }} color="secondary"> Pumps OFF </Button>
      </Stack>
      
      <Stack direction="row" spacing={2} marginBottom={2}>
          <Button variant="contained" onClick={() => get_method("/bottom_carousel/turn_purger_on")}sx={{ width: 500, height: 50 }} color="secondary"> Purger ON </Button>
          <Button variant="contained" onClick={() => get_method("/bottom_carousel/turn_purger_off")}sx={{ width: 500, height: 50 }} color="secondary"> Purger OFF </Button>
      </Stack>

      <Stack direction="column" spacing={2} marginBottom={2}>
        <TextField
            label=""
            value={log_text}
            fullWidth
          />
          {thinking && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={18} />
            <Typography variant="body2">Executing Instruction…</Typography>
            </Box>
          )}
      </Stack>
      </Paper>
    </Stack>
    
);
}
