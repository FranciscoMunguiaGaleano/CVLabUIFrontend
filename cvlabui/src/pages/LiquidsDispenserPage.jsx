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
import PistondispenseIcon from "@mui/icons-material/Opacity"; 
import PistonhomeIcon from "@mui/icons-material/InvertColorsOff"; 
import StateIcon from "@mui/icons-material/MonitorHeart";
import ReadIcon from "@mui/icons-material/Scale";
import FillIcon from "@mui/icons-material/LocalDrink";
import BinIcon from "@mui/icons-material/DeleteOutline";
import HomeIcon from "@mui/icons-material/Home"






export default function LiquidsDispenserPage() {
const [liquid_id, setLiquidid] = useState("Water");
const [volume, setVolume] = useState(1.0);
const [source_port, setSourceport] = useState("I1");
const [destination_port, setDestinationport] = useState("O2");
const [waste_port, setWasteport] = useState("O3");
const [thinking, setThinking] = useState(false);
const [dispense_flag, setDispenseflag] = useState(false);
const [log_text, setState] = useState("[INFO] Waiting for instructions...");
const get_method = (endpoint, payload = null) => {
    setThinking(true);
    fetch(`http://localhost:8080/api/v1/liquids_dispenser${endpoint}`, 
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

  fetch(`http://localhost:8080/api/v1/liquids_dispenser${endpoint}`, {
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
      setState(JSON.stringify(result.message));
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
        <h2>Liquids Dispenser Control</h2>
      </Stack>
      </div>
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => {get_method("/piston_to_dispense_position");setDispenseflag(true);}}sx={{ width: 400, height: 50 }} > Dispense Position <PistondispenseIcon style={{ marginLeft: 11 }}/> </Button>
        <Button variant="contained" onClick={() => {get_method("/piston_to_home_position");setDispenseflag(false);}}sx={{ width: 400, height: 50 }}>  Piston to Home <PistonhomeIcon style={{ marginLeft: 11 }}/></Button>
      </Stack>
    {dispense_flag && (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '5vh'}}>
      <Stack direction="column" spacing={2} marginBottom={2}>
        <h2>Dispensing Configuration</h2>
      </Stack>
    </div>)}
    {dispense_flag && (
      <Stack direction="column" spacing={2} marginBottom={2}>
        <TextField
            label="Liquid ID (e.g., Water)"
            value={liquid_id}
            onChange={(e) => setLiquidid(e.target.value)}
            fullWidth
        />
        <TextField
            label="Volume (mL)"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            fullWidth
        />
        <TextField
            label="Source Port (I1 to I6)"
            value={source_port}
            onChange={(e) => setSourceport(e.target.value)}
            fullWidth
        />
        <TextField
            label="Destination Port (O1 to O6)"
            value={destination_port}
            onChange={(e) => setDestinationport(e.target.value)}
            fullWidth
        />
        <TextField
            label="Liquid ID (O1 to O6)"
            value={waste_port}
            onChange={(e) => setWasteport(e.target.value)}
            fullWidth
        />
      </Stack>)}
    {dispense_flag && (
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => post_method("/dispense",
        {"liquid_id": liquid_id,
        "volume": volume,
        "source_port": source_port,
        "destination_port": destination_port,
        "waste_port": waste_port})}
        sx={{ width: 400, height: 50 }} color="secondary">Dispense <FillIcon style={{ marginLeft: 11 }}/></Button>
        <Button variant="contained" onClick={() => post_method("/set_waste_port",
        {"liquid_id": liquid_id,
        "volume": volume,
        "source_port": source_port,
        "destination_port": destination_port,
        "waste_port": waste_port})}
        sx={{ width: 400, height: 50 }} color="secondary">Set Waste Port <BinIcon style={{ marginLeft: 11 }}/></Button>
      </Stack>)}
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
      <Stack direction="row" spacing={2} marginBottom={2}>
        <Button variant="contained" onClick={() => get_method("/move_home")}sx={{ width: 500, height: 50 }} color="success"> Home <HomeIcon style={{ marginLeft: 11 }}/></Button>
        <Button variant="contained" onClick={() => get_method("/get_valve_pos")}sx={{ width: 500, height: 50 }} color="success"> Get Valve Position <ReadIcon style={{ marginLeft: 11 }}/></Button>
      </Stack>        
        <Button variant="contained" onClick={() => get_method("/status")}sx={{ width: 500, height: 50 }} color="success"> Status <StateIcon style={{ marginLeft: 11 }}/></Button>
      </Stack>
    </Paper>
);
}
