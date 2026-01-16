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
import StateIcon from "@mui/icons-material/MonitorHeart";
import ReadIcon from "@mui/icons-material/Scale";





export default function PHMeterPage() {

const [thinking, setThinking] = useState(false);
const [log_text, setState] = useState("[INFO] Waiting for instructions...");
const get_method = (endpoint, payload = null) => {
    setThinking(true);
    fetch(`http://localhost:8080/api/v1/phmeter${endpoint}`, 
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
      setState(JSON.stringify(result.message));
    })
    .catch((error) => {
      console.error(error);
      setState(`[ERROR] ${error.message}`);
    })
    .finally(() => {
    setThinking(false);
    })
    
  };




return (
    <Paper style={{ padding: 30, maxWidth: 500, margin: "0px auto" }} elevation={0}>
      <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '5vh'}}>
            <Stack direction="column" spacing={2} marginBottom={2}>
              <h2>pH Meter Control</h2>
            </Stack>
          </div>
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
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => get_method("/read_status")}sx={{ width: 400, height: 50 }} color="success"> Status <StateIcon style={{ marginLeft: 11 }}/> </Button>
        <Button variant="contained" onClick={() => get_method("/read_ph")}sx={{ width: 400, height: 50 }}>  Read pH <ReadIcon style={{ marginLeft: 11 }}/></Button>
      </Stack>
    </Paper>
);
}