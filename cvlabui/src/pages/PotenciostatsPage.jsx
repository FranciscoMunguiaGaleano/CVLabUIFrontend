import React, { useState } from "react";
import {
  Paper,
  Tabs,
  Tab,
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Divider
} from "@mui/material";

function PotentiostatPanel({ id }) {
  const [mode, setMode] = useState("CV");
  const [scanRate, setScanRate] = useState(100);
  const [startVoltage, setStartVoltage] = useState(-0.5);
  const [endVoltage, setEndVoltage] = useState(0.5);
  const [cycles, setCycles] = useState(1);
  const [samplingInterval, setSamplingInterval] = useState(10);
  const [gain, setGain] = useState(1);

  return (
    <Grid container spacing={3}>
      {/* Plot Area */}
      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Live Plot – Potentiostat {id}
          </Typography>

          {/* Placeholder plot area */}
          <Box
            sx={{
              height: 300,
              border: "2px dashed #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Plot will appear here (Voltage vs Current)
            </Typography>
          </Box>
        </Paper>
      </Grid>

      {/* Controls */}
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Controls
          </Typography>

          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Mode</InputLabel>
              <Select
                value={mode}
                label="Mode"
                onChange={(e) => setMode(e.target.value)}
              >
                <MenuItem value="CV">Cyclic Voltammetry (CV)</MenuItem>
                <MenuItem value="CA">Chronoamperometry (CA)</MenuItem>
                <MenuItem value="LSV">Linear Sweep Voltammetry (LSV)</MenuItem>
                <MenuItem value="EIS">Electrochemical Impedance (EIS)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Scan Rate (mV/s)"
              type="number"
              value={scanRate}
              onChange={(e) => setScanRate(Number(e.target.value))}
              fullWidth
            />

            <TextField
              label="Start Voltage (V)"
              type="number"
              inputProps={{ step: 0.01 }}
              value={startVoltage}
              onChange={(e) => setStartVoltage(Number(e.target.value))}
              fullWidth
            />

            <TextField
              label="End Voltage (V)"
              type="number"
              inputProps={{ step: 0.01 }}
              value={endVoltage}
              onChange={(e) => setEndVoltage(Number(e.target.value))}
              fullWidth
            />

            <TextField
              label="Cycles"
              type="number"
              inputProps={{ min: 1 }}
              value={cycles}
              onChange={(e) => setCycles(Number(e.target.value))}
              fullWidth
            />

            <Divider />

            <TextField
              label="Sampling Interval (ms)"
              type="number"
              value={samplingInterval}
              onChange={(e) => setSamplingInterval(Number(e.target.value))}
              fullWidth
            />

            <TextField
              label="Gain"
              type="number"
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="success" fullWidth>
                Start
              </Button>
              <Button variant="contained" color="error" fullWidth>
                Stop
              </Button>
            </Stack>

            <Button variant="outlined" fullWidth>
              Export Data
            </Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default function PotenciostatsPage() {
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, margin: "0 auto" }} elevation={3}>
      <Typography variant="h4" gutterBottom>
        Potentiostats Control
      </Typography>

      <Tabs value={tab} onChange={handleChange} sx={{ mb: 3 }}>
        <Tab label="Potentiostat 1" />
        <Tab label="Potentiostat 2" />
        <Tab label="Potentiostat 3" />
      </Tabs>

      {tab === 0 && <PotentiostatPanel id={1} />}
      {tab === 1 && <PotentiostatPanel id={2} />}
      {tab === 2 && <PotentiostatPanel id={3} />}
    </Paper>
  );
}