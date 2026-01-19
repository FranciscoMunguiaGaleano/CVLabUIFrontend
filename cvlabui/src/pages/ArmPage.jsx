import React, { useState , useEffect, useCallback} from "react";
import { Button, Stack, Typography, TextField, Paper, Grid, Box , MenuItem , FormControlLabel, Switch} from "@mui/material";
import instruction from "../imgs/instructions/gantry.png";
import { DataGrid } from "@mui/x-data-grid";
import {
  Select,
  FormControl,
  InputLabel
} from "@mui/material";


export default function ArmPage() {
  const [gcode, setGcode] = useState("");
  const STEP_OPTIONS = [0.1, 0.5, 1, 5, 10, 50, 100];
  const [step, setStep] = useState(0.1);
  const [stepIncrease, setStepIncrease] = useState(0.1);
  const [teachMode, setTeachMode] = useState(false);
  const [teachPendant, setTeachPendant] = useState(false);
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState("");
  const [rows, setRows] = useState([]);


  const jog = useCallback((axis, direction) => {
  const signedStep = direction === "+" ? step : -step;

  fetch(`http://localhost:8080/api/v1/robot/arm/jog_${axis}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step: signedStep }),
  }).catch(console.error);
}, [step]);

  const call = (endpoint, payload = null) => {
    fetch(`http://localhost:8080/api/v1/robot/arm${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : null,
    }).catch(console.error);
  };
  
useEffect(() => {
  if (!teachPendant) return;

  const handler = (e) => {
    if (e.repeat) return;

    switch (e.key) {
      case "ArrowUp":
        jog("y", "+");
        break;
      case "ArrowDown":
        jog("y", "-");
        break;
      case "ArrowRight":
        jog("x", "+");
        break;
      case "ArrowLeft":
        jog("x", "-");
        break;
      case "+":
        setStep((s) => s + stepIncrease);
        break;
      case "-":
        setStep((s) => Math.max(0, s - stepIncrease));
        break;
      default:
        break;
    }
  };

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, [teachPendant, stepIncrease, jog]);

useEffect(() => {
  if (!teachMode) return;

  fetch("http://localhost:8080/api/v1/robot/arm/routines")
    .then((res) => res.json())
    .then((data) => setRoutines(data.routines || []))
    .catch(console.error);
}, [teachMode]);

const loadRoutine = (name) => {
  setSelectedRoutine(name);

  fetch(`http://localhost:8080/api/v1/robot/arm/routines/${name}`)
    .then((res) => res.json())
    .then((data) => {
      const parsedRows = data.gcodes.map((g, idx) => {
        const x = /X(-?\d+\.?\d*)/.exec(g);
        const y = /Y(-?\d+\.?\d*)/.exec(g);
        const z = /Z(-?\d+\.?\d*)/.exec(g);

        return {
          id: idx,
          x: x ? parseFloat(x[1]) : "",
          y: y ? parseFloat(y[1]) : "",
          z: z ? parseFloat(z[1]) : ""
        };
      });

      setRows(parsedRows);
    })
    .catch(console.error);
};

const columns = [
  { field: "id", headerName: "#", width: 60 },
  { field: "x", headerName: "X (mm)", editable: true, width: 120 },
  { field: "y", headerName: "Y (mm)", editable: true, width: 120 },
  { field: "z", headerName: "Z (mm)", editable: true, width: 120 }
];


  return (
    <Paper style={{ padding: 50, maxWidth: 1000, margin: "0px auto" }} elevation={3}>
  <Grid container spacing={4}>

    {/* LEFT: Jog Control Panel */}
    <Grid item xs={12} md={8}>
      <Typography variant="h4" gutterBottom>
        Jog Controls Arm
      </Typography>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => jog("y", "+")} sx={{ width: 100, height: 100 }}>
          Y+
        </Button>
        <Button variant="contained" onClick={() => jog("z", "+")} sx={{ width: 100, height: 100 }}>
          Z+
        </Button>
        <Button variant="outlined" onClick={() => setStep((prev) => prev + stepIncrease)} sx={{ width: 100, height: 100, fontSize: 22 }}>+</Button>
        <TextField
          select
          label="Step Increment"
          value={stepIncrease}
          onChange={(e) => setStepIncrease(Number(e.target.value))}
          sx={{ width: 150 }}>
          {STEP_OPTIONS.map((v) => (
            <MenuItem key={v} value={v}>
              {v} mm
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => jog("x", "-")} sx={{ width: 100, height: 100 }}>X-</Button>
        <Button variant="contained" onClick={() => call("/home")}sx={{ width: 100, height: 100 }}>Home</Button>
        <Button variant="contained" onClick={() => jog("x", "+")} sx={{ width: 100, height: 100 }}>X+</Button>
        <TextField
          label="Current Step (mm)"
          type="number"
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          sx={{ width: 150 }}
        />
      </Stack>

      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => jog("y", "-")} sx={{ width: 100, height: 100 }}>Y-</Button>
        <Button variant="contained" onClick={() => jog("z", "-")} sx={{ width: 100, height: 100 }}>Z-</Button>
        <Button variant="outlined" onClick={() => setStep((prev) => Math.max(0, prev - stepIncrease))} sx={{ width: 100, height: 100, fontSize: 22 }}>−</Button>
        
      </Stack>

      <Stack direction="row" spacing={7} marginBottom={2}>
        <Button variant="contained" sx={{ width: 138, height: 80 }}>Open Gripper</Button>
        <Button variant="contained" sx={{ width: 138, height: 80 }}>Close Gripper</Button>
      </Stack>

      <Stack direction="row" spacing={2}>
        <TextField
          label="G-Code e.g., G1 X30"
          value={gcode}
          onChange={(e) => setGcode(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="success">Send</Button>
      </Stack>

      <Stack direction="row" spacing={4} alignItems="center">
        <FormControlLabel
          control={
            <Switch
              checked={teachMode}
              onChange={(e) => setTeachMode(e.target.checked)}
            />
          }
          label="Teaching Mode"
        />

        <FormControlLabel
          control={
            <Switch
              checked={teachPendant}
              disabled={!teachMode}
              onChange={(e) => setTeachPendant(e.target.checked)}
            />
          }
          label="Teach Pendant"
        />
      </Stack>

    </Grid>

    {/* RIGHT: Instruction Image */}
    <Grid item xs={12} md={4}>
      <Box
        component="img"
        src={instruction}
        alt="Jog Control Instructions"
        sx={{
          width: "170%",
          maxHeight: 500,
          objectFit: "contain",
          borderRadius: 10,
          boxShadow: 0
        }}
      />
    </Grid>
  </Grid>
    {/* Routines visualiser */}
      {teachMode && (
          <Paper sx={{ mt: 4, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Teach Mode – Routines
            </Typography>

            {/* Routine selector */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Routine</InputLabel>
              <Select
                value={selectedRoutine}
                label="Routine"
                onChange={(e) => loadRoutine(e.target.value)}
              >
                {routines.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Excel-like grid */}
            <div style={{ height: 300, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                disableRowSelectionOnClick
                processRowUpdate={(newRow) => {
                  setRows((prev) =>
                    prev.map((r) => (r.id === newRow.id ? newRow : r))
                  );
                  return newRow;
                }}
              />
            </div>
          </Paper>
        )}
</Paper>

  );
}
