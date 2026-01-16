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
import CapIcon from "@mui/icons-material/ArrowCircleDown"; 
import UncapIcon from "@mui/icons-material/ArrowCircleUp"; 
import HoldIcon from "@mui/icons-material/CompareArrows";
import ReleaseIcon from "@mui/icons-material/OpenInFull";
import HomeIcon from "@mui/icons-material/Home"






export default function CapperPage() {

const [thinking, setThinking] = useState(false);
const [log_text, setState] = useState("[INFO] Waiting for instructions...");
const get_method = (endpoint, payload = null) => {
    setThinking(true);
    fetch(`http://localhost:8080/api/v1/capper${endpoint}`, 
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

  fetch(`http://localhost:8080/api/v1/capper${endpoint}`, {
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
      <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '5vh'}}>
      <Stack direction="column" spacing={2} marginBottom={2}>
        <h2>Capper Control</h2>
      </Stack>
    </div>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => get_method("/uncap")}sx={{ width: 400, height: 50 }} > Decap <UncapIcon style={{ marginLeft: 11 }}/> </Button>
        <Button variant="contained" onClick={() => get_method("/cap")}sx={{ width: 400, height: 50 }}>  Cap <CapIcon style={{ marginLeft: 11 }}/></Button>
      </Stack>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => get_method("/hold_vial")}sx={{ width: 400, height: 50 }} color="secondary">Hold Vial <HoldIcon style={{ marginLeft: 11 }}/></Button>
        <Button variant="contained" onClick={() => get_method("/release_vial")}sx={{ width: 400, height: 50 }} color="secondary">Release Vial <ReleaseIcon style={{ marginLeft: 11 }}/></Button>
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
      <Button variant="contained" onClick={() => get_method("/home")}sx={{ width: 500, height: 50 }} color="success"> Home <HomeIcon style={{ marginLeft: 11 }}/></Button>
      </Stack>
    </Paper>
);
}