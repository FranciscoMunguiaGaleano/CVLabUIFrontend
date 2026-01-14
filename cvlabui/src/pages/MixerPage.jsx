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
import OpenDoorIcon from "@mui/icons-material/ArrowCircleUp"; 
import CloseDoorIcon from "@mui/icons-material/ArrowCircleDown"; 
import OpenSideDoorsIcon from "@mui/icons-material/Vibration";
import CloseSideDoorsIcon from "@mui/icons-material/StopCircle";






export default function MixerPage() {

const [log_text, setState] = useState("[INFO] Waiting for instructions...");
const get_method = (endpoint, payload = null) => {
    fetch(`http://localhost:8080/api/v1/mixer${endpoint}`, 
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
      setState(JSON.stringify(result["message"]));
    })
    .catch((error) => {
      console.error(error);
      setState({ error: error.message });
    });
  };

const post_method = (endpoint, data) => {

  fetch(`http://localhost:8080/api/v1/mixer${endpoint}`, {
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
    <Paper style={{ padding: 30, maxWidth: 500, margin: "0px auto" }} elevation={0}>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => get_method("/raise_lift")}sx={{ width: 400, height: 50 }} > Lift Up <OpenDoorIcon style={{ marginLeft: 11 }}/> </Button>
        <Button variant="contained" onClick={() => get_method("/lower_lift")}sx={{ width: 400, height: 50 }}>Lift Down <CloseDoorIcon style={{ marginLeft: 11 }}/></Button>
      </Stack>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => get_method("/turn_ultrasound_bath_on")}sx={{ width: 400, height: 50 }} color="secondary">Ultrasound ON <OpenSideDoorsIcon style={{ marginLeft: 11 }}/></Button>
        <Button variant="contained" onClick={() => get_method("/turn_ultrasound_bath_off")}sx={{ width: 400, height: 50 }} color="secondary">Ultrasound OFF <CloseSideDoorsIcon style={{ marginLeft: 11 }}/></Button>
      </Stack>
      <Stack direction="column" spacing={2} marginBottom={2}>
              <TextField
                label=""
                value={log_text}
                fullWidth
              />
            </Stack>
    </Paper>
);
}