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
import { useRef } from "react";
import { ThemeProvider } from "@mui/material/styles";

import OpenDoorIcon from "@mui/icons-material/MeetingRoom"; 
import CloseDoorIcon from "@mui/icons-material/NoMeetingRoom"; 
import OpenSideDoorsIcon from "@mui/icons-material/DriveFileMoveRtl";
import CloseSideDoorsIcon from "@mui/icons-material/DriveFileMove";
import LockIcon from "@mui/icons-material/LockOutline";
import UnlockIcon from "@mui/icons-material/LockOpen";
import BalanceIcon from "@mui/icons-material/Balance";
import StateIcon from "@mui/icons-material/MonitorHeart";
import InfoIcon from "@mui/icons-material/InfoOutline";
import TareIcon from "@mui/icons-material/Adjust";
import DispenseIcon from "@mui/icons-material/Grain";






export default function SolidsDispenserPage() {

const [mass, setMass] = useState("");
const [log_text, setState] = useState("[INFO] Waiting for instructions...");
const get_method = (endpoint, payload = null) => {
    fetch(`http://localhost:8080/api/v1/quantos${endpoint}`, 
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : null,
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((result) => {
      setState(JSON.stringify(result));
    })
    .catch((error) => {
      console.error(error);
      setState({ error: error.message });
    });
  };

const post_method = (endpoint, data) => {

  fetch(`http://localhost:8080/api/v1/quantos${endpoint}`, {
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
      setState(JSON.stringify(result));
    })
    .catch((error) => {
      console.error(error);
      setState({ error: error.message });
    });
};


return (
    <Paper style={{ padding: 30, maxWidth: 350, margin: "0px auto" }} elevation={0}>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => get_method("/open_front_door")}sx={{ width: 250, height: 60 }} > Open Front Door <OpenDoorIcon/> </Button>
        <Button variant="contained" onClick={() => get_method("/close_front_door")}sx={{ width: 250, height: 60 }}>Close Front Door <CloseDoorIcon/></Button>
      </Stack>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => get_method("/open_side_door")}sx={{ width: 250, height: 60 }}>Open Side Doors <OpenSideDoorsIcon/></Button>
        <Button variant="contained" onClick={() => get_method("/close_side_door")}sx={{ width: 250, height: 60 }}>Close Side Doors <CloseSideDoorsIcon/></Button>
      </Stack>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => get_method("/lock_dosing_head")}sx={{ width: 250, height: 60 }}>Lock Cartridge <LockIcon/></Button>
        <Button variant="contained" onClick={() => get_method("/unlock_dosing_head")}sx={{ width: 250, height: 60 }}>Unlock Cartridge <UnlockIcon/></Button>
      </Stack>
      <Stack direction="column" spacing={2} marginBottom={2}>
        <TextField
          label="Mass in mg e.g., 1.0"
          value={mass}
          onChange={(e) => setMass(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={()=> post_method("/set_target_mass", {"mass": mass})} color="secondary"> Set Target Mass <BalanceIcon style={{ marginLeft: 11 }}/></Button>
        
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => get_method("/tare_balance")} sx={{ width: 250, height: 60 }} color = "secondary"> TARE <TareIcon style={{ marginLeft: 11 }}/></Button>
        <Button variant="contained" onClick={() => post_method("/dispense", {"mass": mass})} sx={{ width: 250, height: 60 }} color = "secondary"> DISPENSE <DispenseIcon style={{ marginLeft: 11 }}/></Button>
      </Stack>
      <Stack direction="column" spacing={2} marginBottom={2}>
        <TextField
          label=""
          value={log_text}
          fullWidth
        />
      </Stack>

      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={()=> get_method("/get_sample_data")} color="secondary"> Get Sample Data<InfoIcon style={{ marginLeft: 11 }}/></Button>
        <Button variant="contained" onClick={()=> get_method("/status")} color="success" > State <StateIcon style={{ marginLeft: 11 }}/></Button>
      </Stack>
      </Stack>
    </Paper>
);
}