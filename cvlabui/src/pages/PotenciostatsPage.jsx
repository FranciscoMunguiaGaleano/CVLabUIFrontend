import React, { useState } from "react";
import {
  Paper, Tabs, Tab, Box, Grid, Typography, TextField,
  Button, MenuItem, FormControl, InputLabel, Select, Stack, Divider
} from "@mui/material";

const API_BASE = "http://192.168.0.142:8080/api/v1/potentiostat";

function PotentiostatPanel({ id }) {
  const [mode, setMode] = useState("CV");

  // Shared
  const [iRange, setIRange] = useState(5);

  // CV / LV
  const [startVoltage, setStartVoltage] = useState(0);
  const [endVoltage, setEndVoltage] = useState(1);
  const [scanRate, setScanRate] = useState(100);
  const [cycles, setCycles] = useState(1);

  // Time-based
  const [duration, setDuration] = useState(10);
  const [samplingPeriod, setSamplingPeriod] = useState(0.1);

const handleStart = async () => {
  let endpoint = "";
  let params = {};

  if (mode === "CV") {
    endpoint = `${API_BASE}/${id}/cyclic_voltammetry`;
    params = {
      i_range: iRange,
      start_potential: startVoltage,
      potential_vertex: endVoltage,
      scan_rate: scanRate,
      cycles: cycles,
      increment: 0.01
    };
  }

  if (mode === "LV") {
    endpoint = `${API_BASE}/${id}/linear_voltammetry`;
    params = {
      i_range: iRange,
      start_potential: startVoltage,
      end_potential: endVoltage,
      scan_rate: scanRate,
      increment: 0.01
    };
  }

  if (mode === "OC") {
    endpoint = `${API_BASE}/${id}/open_circuit`;
    params = {
      duration: duration,
      sampling_period: samplingPeriod
    };
  }

  if (mode === "EL") {
    endpoint = `${API_BASE}/${id}/electrolysis`;
    params = {
      i_range: iRange,
      potential: startVoltage,
      duration: duration,
      sampling_period: samplingPeriod
    };
  }

  try {
    // 🔥 IMPORTANT: use query params (NOT JSON)
    const query = new URLSearchParams(params).toString();

    const response = await fetch(`${endpoint}?${query}`, {
      method: "POST"
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    const csvText = await response.text();

    const blob = new Blob([csvText], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `p${id}_${mode}.csv`;
    a.click();

    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error(err);
    alert("Request failed: " + err.message);
  }
};
  return (
    <Grid container spacing={3}>
      {/* Plot */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6">
            Live Plot – Potentiostat {id}
          </Typography>
          <Box sx={{
            height: 300,
            border: "2px dashed #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            Plot will appear here
          </Box>
        </Paper>
      </Grid>

      {/* Controls */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Controls</Typography>

          <Stack spacing={2}>

            <FormControl fullWidth>
              <InputLabel>Mode</InputLabel>
              <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                <MenuItem value="CV">Cyclic Voltammetry</MenuItem>
                <MenuItem value="LV">Linear Voltammetry</MenuItem>
                <MenuItem value="OC">Open Circuit</MenuItem>
                <MenuItem value="EL">Electrolysis</MenuItem>
              </Select>
            </FormControl>

            {/* CV + LV */}
            {(mode === "CV" || mode === "LV") && (
              <>
                <TextField
                  label="Current Range (i_range)"
                  type="number"
                  value={iRange}
                  onChange={(e) => setIRange(Number(e.target.value))}
                />

                <TextField
                  label="Start Potential (V)"
                  type="number"
                  value={startVoltage}
                  onChange={(e) => setStartVoltage(Number(e.target.value))}
                />

                <TextField
                  label={mode === "CV" ? "Vertex Potential (V)" : "End Potential (V)"}
                  type="number"
                  value={endVoltage}
                  onChange={(e) => setEndVoltage(Number(e.target.value))}
                />

                <TextField
                  label="Scan Rate (mV/s)"
                  type="number"
                  value={scanRate}
                  onChange={(e) => setScanRate(Number(e.target.value))}
                />

                {mode === "CV" && (
                  <TextField
                    label="Cycles"
                    type="number"
                    value={cycles}
                    onChange={(e) => setCycles(Number(e.target.value))}
                  />
                )}
              </>
            )}

            {/* OC */}
            {mode === "OC" && (
              <>
                <TextField
                  label="Duration (s)"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />

                <TextField
                  label="Sampling Period (s)"
                  type="number"
                  value={samplingPeriod}
                  onChange={(e) => setSamplingPeriod(Number(e.target.value))}
                />
              </>
            )}

            {/* EL */}
            {mode === "EL" && (
              <>
                <TextField
                  label="Current Range (i_range)"
                  type="number"
                  value={iRange}
                  onChange={(e) => setIRange(Number(e.target.value))}
                />

                <TextField
                  label="Potential (V)"
                  type="number"
                  value={startVoltage}
                  onChange={(e) => setStartVoltage(Number(e.target.value))}
                />

                <TextField
                  label="Duration (s)"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />

                <TextField
                  label="Sampling Period (s)"
                  type="number"
                  value={samplingPeriod}
                  onChange={(e) => setSamplingPeriod(Number(e.target.value))}
                />
              </>
            )}

            <Divider />

            <Button variant="contained" color="success" onClick={handleStart}>
              Start
            </Button>

          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default function PotentiostatsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, margin: "0 auto" }}>
      <Typography variant="h4">Potentiostats</Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)}>
        <Tab label="P1" />
        <Tab label="P2" />
        <Tab label="P3" />
      </Tabs>

      {tab === 0 && <PotentiostatPanel id={1} />}
      {tab === 1 && <PotentiostatPanel id={2} />}
      {tab === 2 && <PotentiostatPanel id={3} />}
    </Paper>
  );
}