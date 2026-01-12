import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress
} from "@mui/material";
import { useRef } from "react";
import { ThemeProvider } from "@mui/material/styles";

const call = (endpoint, payload = null) => {
    fetch(`http://localhost:8080/api/v1/robot/arm${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : null,
    }).catch(console.error);
  };

export default function SolidsDispenserPage() {

return (
    <Paper style={{ padding: 30, maxWidth: 500, margin: "0px auto" }} elevation={0}>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => call("/home")}sx={{ width: 250, height: 60 }}>Open Front Door</Button>
        <Button variant="contained" onClick={() => call("/home")}sx={{ width: 250, height: 60 }}>Close Front Door</Button>
      </Stack>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => call("/home")}sx={{ width: 250, height: 60 }}>Open Side Doors</Button>
        <Button variant="contained" onClick={() => call("/home")}sx={{ width: 250, height: 60 }}>Close Side Doors</Button>
      </Stack>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => call("/home")}sx={{ width: 250, height: 60 }}>Lock Pin</Button>
        <Button variant="contained" onClick={() => call("/home")}sx={{ width: 250, height: 60 }}>Unlock Pin</Button>
      </Stack>
    </Paper>
);
}