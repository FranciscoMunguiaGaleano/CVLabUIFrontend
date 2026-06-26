import React, { useState } from "react";
import {
  Paper, Grid, Typography, TextField,
  Button, MenuItem, FormControl, InputLabel, Select,
  Stack, Divider, CircularProgress, Box, Tabs, Tab
} from "@mui/material";

const API_BASE = "http://192.168.0.142:8080/api/v1/potentiostat";

/* =========================================
   PANEL (ONE DEVICE)
========================================= */
function PotentiostatPanel({ id }) {
  const [mode, setMode] = useState("CV");

  const [iRange, setIRange] = useState(5);
  const [startVoltage, setStartVoltage] = useState(0);
  const [endVoltage, setEndVoltage] = useState(1);
  const [scanRate, setScanRate] = useState(100);
  const [cycles, setCycles] = useState(1);
  const [duration, setDuration] = useState(10);
  const [samplingPeriod, setSamplingPeriod] = useState(0.1);

  const [plotUrl, setPlotUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    let endpoint = "";
    let plotEndpoint = "";
    let params = {};

    if (mode === "CV") {
      endpoint = `${API_BASE}/${id}/cyclic_voltammetry`;
      plotEndpoint = `${API_BASE}/${id}/cyclic_voltammetry/plot`;
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
      plotEndpoint = `${API_BASE}/${id}/linear_voltammetry/plot`;
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
      plotEndpoint = `${API_BASE}/${id}/open_circuit/plot`;
      params = {
        duration: duration,
        sampling_period: samplingPeriod
      };
    }

    if (mode === "EL") {
      endpoint = `${API_BASE}/${id}/electrolysis`;
      plotEndpoint = `${API_BASE}/${id}/electrolysis/plot`;
      params = {
        i_range: iRange,
        potential: startVoltage,
        duration: duration,
        sampling_period: samplingPeriod
      };
    }

    try {
      setLoading(true);

      // clean old image to avoid memory leaks
      if (plotUrl) URL.revokeObjectURL(plotUrl);
      setPlotUrl(null);

      const query = new URLSearchParams(params).toString();

      // 1️⃣ Run experiment
      const response = await fetch(`${endpoint}?${query}`, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const csvText = await response.text();

      // download CSV
      const blob = new Blob([csvText], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `p${id}_${mode}.csv`;
      a.click();

      window.URL.revokeObjectURL(url);

      // 2️⃣ Get plot
      const plotResponse = await fetch(plotEndpoint);

      if (!plotResponse.ok) {
        throw new Error("Plot failed");
      }

      const imageBlob = await plotResponse.blob();
      const imageUrl = URL.createObjectURL(imageBlob);

      setPlotUrl(imageUrl);

    } catch (err) {
      console.error(err);
      alert("Request failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={3}>

      {/* LEFT: Plot */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6">
            Result Plot – Potentiostat {id}
          </Typography>

          <Box sx={{
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #ccc"
          }}>

            {loading ? (
              <Stack alignItems="center" spacing={2}>
                <CircularProgress />
                <Typography>Executing...</Typography>
              </Stack>
            ) : plotUrl ? (
              <img
                src={plotUrl}
                alt="plot"
                style={{ maxHeight: "100%", maxWidth: "100%" }}
              />
            ) : (
              <Typography color="text.secondary">
                Plot will appear here
              </Typography>
            )}

          </Box>
        </Paper>
      </Grid>

      {/* RIGHT: Controls */}
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

            {(mode === "CV" || mode === "LV") && (
              <>
                <TextField label="Current Range" type="number" value={iRange} onChange={(e) => setIRange(Number(e.target.value))} />
                <TextField label="Start Potential" type="number" value={startVoltage} onChange={(e) => setStartVoltage(Number(e.target.value))} />
                <TextField label={mode === "CV" ? "Vertex Potential" : "End Potential"} type="number" value={endVoltage} onChange={(e) => setEndVoltage(Number(e.target.value))} />
                <TextField label="Scan Rate" type="number" value={scanRate} onChange={(e) => setScanRate(Number(e.target.value))} />

                {mode === "CV" && (
                  <TextField label="Cycles" type="number" value={cycles} onChange={(e) => setCycles(Number(e.target.value))} />
                )}
              </>
            )}

            {mode === "OC" && (
              <>
                <TextField label="Duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                <TextField label="Sampling Period" type="number" value={samplingPeriod} onChange={(e) => setSamplingPeriod(Number(e.target.value))} />
              </>
            )}

            {mode === "EL" && (
              <>
                <TextField label="Current Range" type="number" value={iRange} onChange={(e) => setIRange(Number(e.target.value))} />
                <TextField label="Potential" type="number" value={startVoltage} onChange={(e) => setStartVoltage(Number(e.target.value))} />
                <TextField label="Duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                <TextField label="Sampling Period" type="number" value={samplingPeriod} onChange={(e) => setSamplingPeriod(Number(e.target.value))} />
              </>
            )}

            <Divider />

            <Button
              variant="contained"
              color="success"
              onClick={handleStart}
              disabled={loading}
            >
              {loading ? "Running..." : "Start"}
            </Button>

          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}

/* =========================================
   PAGE (TABS)
========================================= */
function PotentiostatsPage() {
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

export default PotentiostatsPage;