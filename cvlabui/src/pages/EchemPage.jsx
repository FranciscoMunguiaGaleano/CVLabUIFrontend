import React, { useState, useEffect, useCallback } from "react";
import { Button, Stack, Typography, TextField, Paper, Grid, Box , MenuItem , FormControlLabel, Switch} from "@mui/material";
import instruction from "../imgs/instructions/gantry.png";
import instructionImg from "../imgs/instructions/echem.png";
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
import UndoIcon from "@mui/icons-material/OpenInFull"
import RedoIcon from "@mui/icons-material/CloseFullscreen"
import PlayIcon from "@mui/icons-material/PlayArrow"
import FFIcon from "@mui/icons-material/SkipNext"
import FRIcon from "@mui/icons-material/SkipPrevious"
import StopIcon from "@mui/icons-material/RestartAlt"
import PauseIcon from "@mui/icons-material/Pause"

export default function EchemPage() {
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
  const [isPlaying, setIsPlaying] = useState(false); 
  const [playInterval, setPlayInterval] = useState(null); 
  const [playSpeed, setPlaySpeed] = useState(1000); 
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [instruction, setInstruction] = useState(instructionImg);
const controlButtonSx = {
  height: 70,
  fontWeight: 700,
  fontSize: "0.8rem",
  letterSpacing: "0.6px",
  textTransform: "none",
  lineHeight: 1.2,
  fontFamily: "'Inter', 'Roboto', sans-serif",
  borderRadius: 2,
  };

  const wideButton = {
    ...controlButtonSx,
    width: 105,
  };

  const normalButton = {
    ...controlButtonSx,
    width: 100,
  };




  
  // Keep selectionModel always in sync with selectedRowId

useEffect(() => {
  if (selectedRowId !== null) {
    setSelectionModel([selectedRowId]);
  } else {
    setSelectionModel([]);
  }
}, [selectedRowId]);


const jog = useCallback(async (axis, direction) => {
  const signedStep = direction === "+" ? step : -step;
  setThinking(true);
  return fetch(`http://192.168.0.142:8080/api/v1/echem/jog_${axis}`, {
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
    return fetch(`http://192.168.0.142:8080/api/v1/echem${endpoint}`, {
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
  return fetch(`http://192.168.0.142:8080/api/v1/echem${endpoint}`, {
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
  if (!teachMode) return;

  fetch("http://192.168.0.142:8080/api/v1/echem/routines")
    .then((res) => res.json())
    .then((data) => setRoutines(data.routines || []))
    .catch(console.error);
}, [teachMode]);

const loadRoutine = (name) => {
  setSelectedRoutine(name);
  fetch(`http://192.168.0.142:8080/api/v1/echem/routines/load/${name}`)
    .then((res) => res.json())
    .then((data) => {
        setState(JSON.stringify(data["message"]));
        const parsedRows = data.gcodes.map((g, idx) => {
        const x = /X(-?\d+\.?\d*)/.exec(g);
        const y = /Y(-?\d+\.?\d*)/.exec(g);
        const z = /Z(-?\d+\.?\d*)/.exec(g);
        const inst = /([GM])(\d+)/i.exec(g);
        return {
          id: idx,
          instruction: inst ? `${inst[1]}${inst[2]}` : g,
          type: inst ? inst[1] : "",
          code: inst ? parseInt(inst[2], 10) : null,
          x: x ? parseFloat(x[1]) : null,
          y: y ? parseFloat(y[1]) : null,
          z: z ? parseFloat(z[1]) : null
        };
      });

      setRows(parsedRows);
    })
    .catch(console.error);
};

const saveRoutine = (name, rows) => {
  // extract the instruction + coordinates as G-code lines
  const gcodes = rows.map(row => {
    let line = row.instruction;
    if (row.x !== null && row.x !== "") line += ` X${row.x}`;
    if (row.y !== null && row.y !== "") line += ` Y${row.y}`;
    if (row.z !== null && row.z !== "") line += ` Z${row.z}`;
    return line;
  });

  fetch(`http://192.168.0.142:8080/api/v1/echem/routines/save/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gcodes })
  })
    .then(res => res.json())
    .then(data => {console.log(data);
      setState(JSON.stringify(data["message"]));
    })
    .catch(console.error);
};

const columns = [
  {
    field: "current",
    headerName: "",      
    width: 30,           
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) =>
      params.id === selectedRowId ? "➡️" : "" 
  },
  { field: "id", headerName: "#", width: 60 },
  { field: "instruction", headerName: "G-code", editable: false, width: 120 },
  { field: "x", headerName: "X (mm)", editable: false, width: 100 },
  { field: "y", headerName: "Y (mm)", editable: false, width: 100 },
  { field: "z", headerName: "Z (mm)", editable: false, width: 100 }
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
        instruction: "G1",
        x: X_axis,
        y: Y_axis,
        z: Z_axis
      }
    ];
  });
};

const addGripperCode = (code) => {
  setRows(prevRows => {
    setState(`[INFO] Added ${code} gripper instruction to ${selectedRoutine}`);
    const nextId =
      prevRows.length === 0
        ? 0
        : Math.max(...prevRows.map(r => r.id)) + 1;

    return [
      ...prevRows,
      {
        id: nextId,
        instruction: code,
        x: null,
        y: null,
        z: null
      }
    ];
  });
};

const removeSelectedRow = () => {
  setRows(prevRows => prevRows.length ? prevRows.slice(0, -1) : prevRows);
};


const rowToGcode = (row) => {
  if (!row) return null;

  let gcode = row.instruction;

  if (row.x !== null && row.x !== "") gcode += ` X${row.x}`;
  if (row.y !== null && row.y !== "") gcode += ` Y${row.y}`;
  if (row.z !== null && row.z !== "") gcode += ` Z${row.z}`;

  return gcode;
};


const stepForward = async () => {
  if (selectedRowId === null) {
    setState("[WARN] No row selected");
    return;
  }

  const currentIndex = rows.findIndex(r => r.id === selectedRowId);
  if (currentIndex === -1) return;

  const currentRow = rows[currentIndex];
  const gcode = rowToGcode(currentRow);
  if (!gcode) return;

  const oldId = selectedRowId;
  const nextIndex = Math.min(currentIndex + 1, rows.length - 1);
  const nextId = rows[nextIndex].id;


  setSelectedRowId(nextId);
  await call("/gcode", { gcode });
  await call("/status");

  setState(`[INFO] Executed [${oldId} => ${nextId}]: ${gcode}`);
};

const stepBackward = async () => {
  if (selectedRowId === null) {
    setState("[WARN] No row selected");
    return;
  }

  const currentIndex = rows.findIndex(r => r.id === selectedRowId);
  if (currentIndex === -1) return;

  const currentRow = rows[currentIndex];
  const gcode = rowToGcode(currentRow);
  if (!gcode) return;

  const oldId = selectedRowId;
  const prevIndex = Math.max(currentIndex - 1, 0); // move backward, not before first row
  const prevId = rows[prevIndex].id;

  // Update selected row first
  setSelectedRowId(prevId);

  // Send G-code
  await call("/gcode", { gcode });
  await call("/status");

  setState(`[INFO] Executed [${oldId} => ${prevId}]: ${gcode}`);
};

const play = async () => {
  if (selectedRowId === null || rows.length === 0) return;

  setIsPlaying(true);

  let currentIndex = rows.findIndex(r => r.id === selectedRowId);

  while (currentIndex < rows.length - 1 && isPlaying) {
    await stepForward(); // updates selectedRowId and setState
    currentIndex = rows.findIndex(r => r.id === selectedRowId);
  }

  setIsPlaying(false);
};

const pause = () => {
  setIsPlaying(false);
  if (playInterval) clearInterval(playInterval);
  setState("[INFO] Playback paused");
};

const stop = () => {
  pause();
  if (rows.length > 0) setSelectedRowId(rows[0].id);
  setState("[INFO] Playback stopped");
};

useEffect(() => {
  if (!teachPendant) return;

  const handler = async (e) => {
    if (e.repeat) return;

    switch (e.key) {
      // XY jog
      case "ArrowUp":
        jogAndUpdate("z", "+");
        break;
      case "ArrowDown":
        jogAndUpdate("z", "-");
        break;
      case "ArrowRight":
        jogAndUpdate("x", "+");
        break;
      case "ArrowLeft":
        jogAndUpdate("x", "-");
        break;

      // Z jog
      case "p":
        jogAndUpdate("y", "-");
        break;
      case "l":
        jogAndUpdate("y", "+");
        break;

      // Step size
      case "=":
        setStep((s) => s + stepIncrease);
        break;
      case "-":
        setStep((s) => Math.max(0, s - stepIncrease));
        break;

      // Navigation / status
      case "h":
        await call("/home");
        await state("/status");
        break;
      case "u":
        state("/status");
        break;
      // Routine table
      case "q":
        addRow();
        break;
      case "w":
        removeSelectedRow();
        break;
      // Save
      case "t":
        saveRoutine(selectedRoutine, rows);
        break;

      // Stepping
      case "a":
        stepBackward();
        break;
      case "s":
        stepForward();
        break;

      // Stop
      case "d":
        stop();
        break;

      default:
        break;
    }
  };

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, [
  teachPendant,
  jogAndUpdate,
  call,
  state,
  addRow,
  removeSelectedRow,
  addGripperCode,
  saveRoutine,
  selectedRoutine,
  rows,
  stepBackward,
  stepForward,
  stop,
  stepIncrease,
  setStep
]);

const fetchCameraImage = async () => {
  try {
    setThinking(true);

    const response = await fetch(
      "http://192.168.0.142:8080/api/v1/echem/capture",
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    setInstruction(imageUrl); // replaces the image
  } catch (error) {
    console.error(error);
    setState({ error: error.message });
  } finally {
    setThinking(false);
  }
};
const toggleCamera = () => {
  if (!cameraEnabled) {
    fetchCameraImage();
  } else {
    setInstruction(instructionImg);
  }
  setCameraEnabled(!cameraEnabled);
};


  return (
  <Paper style={{ padding: 50, maxWidth: 1000, margin: "0px auto" }} elevation={3}>
  <Grid container spacing={4}>

    {/* LEFT: Jog Control Panel */}
    <Grid item xs={12} md={8}>
      <Typography variant="h4" gutterBottom>
        Echem Jog Controls 
      </Typography>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={async () => {await jog("z", "+"); await state("/status")}} sx={{ width: 80, height: 80 }}>Z<NorthIcon style={{ marginLeft: 11 }}/></Button>
        <Button variant="contained" onClick={async () => {await jog("y", "-"); await state("/status")}} sx={{ width: 80, height: 80 }}>Y<NortheastIcon style={{ marginLeft: 11 }}/></Button>
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
        <Button variant="contained" onClick={async () => {await call("/echem_arm_home"); await state("/status")}}sx={{ width: 80, height: 80 }}><HomeIcon/></Button>
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
        <Button variant="contained" onClick={async () => {await jog("z", "-"); await state("/status")}} sx={{ width: 80, height: 80 }}>Z<SouthIcon style={{ marginLeft: 11 }}/></Button>
        <Button variant="contained" onClick={async () => {await jog("y", "+"); await state("/status")}}>Y<SouthwestIcon style={{ marginLeft: 11 }}/></Button>
        <Button variant="contained" onClick={() => setStep = ((prev) => Math.max(0, prev - stepIncrease))} sx={{ width: 80, height: 80, fontSize: 22 }} color="inherit"><MinusIcon/></Button>
      </Stack>

       <Stack direction="row" spacing={1} marginBottom={2}>
        <Button variant="contained" onClick={() => {state("/status")}}sx={{ width: 100, height: 50 }}><StateIcon/></Button>
        <Button variant="contained" color="warning" onClick={toggleCamera}>{cameraEnabled ? "Show Instructions" : "Show Camera"}</Button>
       </Stack>
      
<Stack direction="row" spacing={1} marginBottom={2}>
  <Button
    variant="contained"
    color="secondary"
    onClick={() => {call("/echem_raise_electrodes"); setGripper(1)}}
    sx={wideButton}
  >
    Lower Electrodes
  </Button>

  <Button
    variant="contained"
    color="secondary"
    onClick={() => {call("/echem_polisher_on")}}
    sx={normalButton}
  >
    Polisher ON
  </Button>

  <Button
    variant="contained"
    color="secondary"
    onClick={() => {call("/echem_polisher_dropper_on"); setGripper(0)}}
    sx={normalButton}
  >
    Dropper ON
  </Button>

  <Button
    variant="contained"
    color="secondary"
    onClick={() => {call("/echem_purger_on"); setGripper(0)}}
    sx={normalButton}
  >
    Purger ON
  </Button>
</Stack>

<Stack direction="row" spacing={1} marginBottom={2}>
  <Button
    variant="contained"
    color="secondary"
    onClick={() => {call("/echem_lower_electrodes"); setGripper(1)}}
    sx={wideButton}
  >
    Raise Electrodes
  </Button>

  <Button
    variant="contained"
    color="secondary"
    onClick={() => {call("/echem_polisher_off")}}
    sx={normalButton}
  >
    Polisher OFF
  </Button>

  <Button
    variant="contained"
    color="secondary"
    onClick={() => {call("/echem_polisher_dropper_off"); setGripper(0)}}
    sx={normalButton}
  >
    Dropper OFF
  </Button>

  <Button
    variant="contained"
    color="secondary"
    onClick={() => {call("/echem_purger_off"); setGripper(0)}}
    sx={normalButton}
  >
    Purger OFF
  </Button>
</Stack>


      <Stack direction="row" spacing={2}>
        <TextField
          label="G-Code e.g., G1 X30"
          value={gcode}
          onChange={(e) => setGcode(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={async () => {await call("/echem_arm_send_gcode",{"gcode": gcode}); await state("/status")}} color="success">Send</Button>
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
    <Grid item xs={12} md={4} sx={{ alignSelf: "flex-start" }}>

      <Box
        component="img"
        src={instruction}
        alt="Jog Control Instructions"
        sx={{
          width: cameraEnabled ? "90%" : "90%",
          maxHeight: 500,
          objectFit: "contain",
          borderRadius: 10,
          boxShadow: 0,
          transition: "width 0.3s ease" // optional, looks nice
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
            selectionModel={[]} 
            onRowClick={(params) => setSelectedRowId(params.id)}
            processRowUpdate={(newRow) => {
              setRows(prev => prev.map(r => (r.id === newRow.id ? newRow : r)));
              return newRow;
            }}
            rowClassName={(params) =>
              params.id === selectedRowId ? "highlighted-row" : ""
            }
          />
          </div>
        <Stack direction="row" spacing={1} marginBottom={2}>
          <Button variant="contained"  sx={{ width: 50, height: 70 }} onClick={addRow}> <PlusIcon/> </Button>
          <Button variant="contained"  sx={{ width: 50, height: 70 }} onClick={removeSelectedRow}> <MinusIcon/></Button>
          <Button variant="contained"  sx={{ width: 50, height: 70 }} onClick={() => saveRoutine(selectedRoutine, rows)} color="error"> <SaveIcon/> </Button>
       </Stack>
       <Stack direction="row" spacing={1} marginBottom={2}>
          <Button variant="contained"  sx={{ width: 112, height: 50 }} onClick={stepBackward} color="secondary"> <FRIcon/> </Button>
          <Button variant="contained"  sx={{ width: 112, height: 50 }} onClick={stepForward} color="secondary"> <FFIcon/> </Button>
          <Button variant="contained"  sx={{ width: 112, height: 50 }} onClick={stop} color="secondary"> <StopIcon/> </Button>
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
              {/*Position monitor*/ }
          <Stack direction="column" spacing={2} marginBottom={2}>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body3">X: {X_axis} Y: {Y_axis} Z: {Z_axis} Gripper: {GRIPPER}</Typography>
            </Box>
            {thinking && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2">Executing Instruction…</Typography>
                    </Box>
                  )}
          </Stack>
</Paper>

  );
}
