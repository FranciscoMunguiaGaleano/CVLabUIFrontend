import React, { useState , useEffect, useCallback} from "react";
import { Button, Stack, Typography, TextField, Paper, Grid, Box , MenuItem , FormControlLabel, Switch} from "@mui/material";
import instruction from "../imgs/instructions/gantry.png";
import { DataGrid } from "@mui/x-data-grid";
import {
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import EastIcon from "@mui/icons-material/East"
import WestIcon from "@mui/icons-material/West"
import NortheastIcon from "@mui/icons-material/NorthEast"
import SouthwestIcon from "@mui/icons-material/SouthWest"
import PlusIcon from "@mui/icons-material/AddCircleOutline"
import MinusIcon from "@mui/icons-material/RemoveCircleOutline"
import StateIcon from "@mui/icons-material/MonitorHeart"
import Icon from "@mui/icons-material/Home"
import SaveIcon from "@mui/icons-material/Save"
import UndoIcon from "@mui/icons-material/Undo"
import RedoIcon from "@mui/icons-material/Redo"
import PlayIcon from "@mui/icons-material/PlayArrow"
import FFIcon from "@mui/icons-material/SkipNext"
import FRIcon from "@mui/icons-material/SkipPrevious"
import StopIcon from "@mui/icons-material/Stop"
import PauseIcon from "@mui/icons-material/Pause"

export default function ArmPage() {
  const [thinking, setThinking] = useState(false);
  const [X_axis, setXaxis] =useState(0.0);
  const [Y_axis, setYaxis] =useState(0.0);
  const [Z_axis, setZaxis] =useState(0.0);
  const [GRIPPER, setGripper] =useState(0);
  const [gcode, setGcode] = useState("");
  const STEP_OPTIONS = [0.1, 0.5, 1, 5, 10, 50, 100];
  const [step, setStep] = useState(0.1);
  const [stepIncrease, setStepIncrease] = useState(0.1);
  const [teachMode, setTeachMode] = useState(false);
  const [teachPendant, setTeachPendant] = useState(false);
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState("");
  const [rows, setRows] = useState([]);
  const [log_text, setState] = useState("[INFO] Waiting for instructions...");
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectionModel, setSelectionModel] = useState([]);




const jog = useCallback(async (axis, direction) => {
  const signedStep = direction === "+" ? step : -step;
  setThinking(true);
  return fetch(`http://localhost:8080/api/v1/robot/arm/jog_${axis}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step: signedStep }),
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
      setState(JSON.stringify({error: error.message}));
    }).finally(() => {setThinking(false)})
  
}, [step]);

  const call = async (endpoint, payload = null) => {
    setThinking(true);
    return fetch(`http://localhost:8080/api/v1/robot/arm${endpoint}`, {
      method: "POST",
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
    }).finally(() => {
    setThinking(false);
    })
  };

const state = async (endpoint, payload = null) => {
  setThinking(true);
  return fetch(`http://localhost:8080/api/v1/robot/arm${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : null,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((result) => {
      setState(JSON.stringify(result["message"]));
      setXaxis(result["X"]);
      setYaxis(result["Y"]);
      setZaxis(result["Z"]);
      return result;
    })
    .finally(() => {setThinking(false);});
};
const jogAndUpdate = async (axis, dir) => {
  await jog(axis, dir);
  await state("/status");
};
  
useEffect(() => {
  if (!teachPendant) return;

  const handler = (e) => {
    if (e.repeat) return;

    switch (e.key) {
      case "ArrowUp":
        jogAndUpdate("y", "-");
        break;

      case "ArrowDown":
        jogAndUpdate("y", "+");
        break;

      case "ArrowRight":
        jogAndUpdate("x", "+");
        break;

      case "ArrowLeft":
        jogAndUpdate("x", "-");
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
}, [teachPendant, stepIncrease, jog, state]);


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
  { field: "x", headerName: "X (mm)", editable: true, width: 100 },
  { field: "y", headerName: "Y (mm)", editable: true, width: 100 },
  { field: "z", headerName: "Z (mm)", editable: true, width: 100 }
];

const addRow = () => {
  setRows(prevRows => {
    const nextId =
      prevRows.length === 0
        ? 0
        : Math.max(...prevRows.map(r => r.id)) + 1;

    return [
      ...prevRows,
      {
        id: nextId,
        x: X_axis,
        y: Y_axis,
        z: Z_axis
      }
    ];
  });
};

const removeSelectedRow = () => {
  setRows(prevRows => prevRows.length ? prevRows.slice(0, -1) : prevRows);
};




  return (
  <Paper style={{ padding: 50, maxWidth: 1000, margin: "0px auto" }} elevation={3}>
  <Grid container spacing={4}>

    {/* LEFT: Jog Control Panel */}
    <Grid item xs={12} md={8}>
      <Typography variant="h4" gutterBottom>
        Jog Controls Arm
      </Typography>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={async () => {await jog("y", "-"); await state("/status")}} sx={{ width: 80, height: 80 }}>Y<NorthIcon style={{ marginLeft: 11 }}/></Button>
        <Button variant="contained" onClick={async () => {await jog("z", "+"); await state("/status")}} sx={{ width: 80, height: 80 }}>Z<NortheastIcon style={{ marginLeft: 11 }}/></Button>
        <Button variant="contained" onClick={() => setStep((prev) => prev + stepIncrease)} sx={{ width: 80, height: 80, fontSize: 22 }} color= "inherit"><PlusIcon/></Button>
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
        <Button variant="contained" onClick={async () => {await jog("x", "-"); await state("/status")}} sx={{ width: 80, height: 80 }}>X<WestIcon style={{ marginLeft: 11 }}/></Button>
        <Button variant="contained" onClick={async () => {await call("/home"); await state("/status")}}sx={{ width: 80, height: 80 }}><HomeIcon/></Button>
        <Button variant="contained" onClick={async () => {await jog("x", "+"); await state("/status")}} sx={{ width: 80, height: 80 }}>X<EastIcon style={{ marginLeft: 11 }}/></Button>
        <TextField
          label="Current Step (mm)"
          type="number"
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          sx={{ width: 150 }}
        />
      </Stack>

      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={async () => {await jog("y", "+"); await state("/status")}} sx={{ width: 80, height: 80 }}>Y<SouthIcon style={{ marginLeft: 11 }}/></Button>
        <Button variant="contained" onClick={async () => {await jog("z", "-"); await state("/status")}}>Z<SouthwestIcon style={{ marginLeft: 11 }}/></Button>
        <Button variant="contained" onClick={() => setStep = ((prev) => Math.max(0, prev - stepIncrease))} sx={{ width: 80, height: 80, fontSize: 22 }} color="inherit"><MinusIcon/></Button>
        
      </Stack>
      
      {/*Position monitor*/ }
      <Stack direction="column" spacing={2} marginBottom={2}>
        {thinking && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={18} />
                <Typography variant="body2">Executing Instruction…</Typography>
                </Box>
              )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="body3">X: {X_axis} Y: {Y_axis} Z: {Z_axis} Gripper: {GRIPPER}</Typography>
        </Box>
      </Stack>
      
      <Stack direction="row" spacing={1} marginBottom={2}>
        <Button variant="contained" onClick={() => {call("/open_gripper"); setGripper(1)}} sx={{ width: 160, height: 50 }}>Open Gripper</Button>
        <Button variant="contained" onClick={() => {state("/status")}}sx={{ width: 100, height: 50 }}><StateIcon/></Button>
        <Button variant="contained" onClick={() => {call("/close_gripper"); setGripper(0)}} sx={{ width: 160, height: 50 }}>Close Gripper</Button>
      </Stack>

      <Stack direction="row" spacing={2}>
        <TextField
          label="G-Code e.g., G1 X30"
          value={gcode}
          onChange={(e) => setGcode(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={async () => {await call("/gcode",{"gcode": gcode}); await state("/status")}} color="success">Send</Button>
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
              disableSelectionOnClick // prevents cell click from trying to select
              processRowUpdate={(newRow) => {
                setRows(prev =>
                  prev.map(r => (r.id === newRow.id ? newRow : r))
                );
                return newRow;
              }}
            />
          </div>
        <Stack direction="row" spacing={1} marginBottom={2}>
          <Button variant="contained"  sx={{ width: 50, height: 70 }} onClick={addRow}> <PlusIcon/> </Button>
          <Button variant="contained"  sx={{ width: 50, height: 70 }} onClick={removeSelectedRow}> <MinusIcon/></Button>
          <Button variant="contained"  sx={{ width: 50, height: 70 }}> <UndoIcon/> </Button>
          <Button variant="contained"  sx={{ width: 50, height: 70 }}> <RedoIcon/> </Button>
          <Button variant="contained"  sx={{ width: 50, height: 70 }} color="error"> <SaveIcon/> </Button>
       </Stack>
       <Stack direction="row" spacing={1} marginBottom={2}>
          <Button variant="contained"  sx={{ width: 50, height: 50 }} color="secondary"> <FRIcon/> </Button>
          <Button variant="contained"  sx={{ width: 50, height: 50 }} color="secondary"> <FFIcon/> </Button>
          <Button variant="contained"  sx={{ width: 50, height: 50 }} color="secondary"> <PlayIcon/> </Button>
          <Button variant="contained"  sx={{ width: 50, height: 50 }} color="secondary"> <PauseIcon/> </Button>
          <Button variant="contained"  sx={{ width: 50, height: 50 }} color="secondary"> <StopIcon/> </Button>
       </Stack>
          </Paper>
        )}
        
        {/*INFO text box*/}
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
