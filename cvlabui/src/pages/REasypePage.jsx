import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Tabs,
  Tab,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider
} from "@mui/material";
import Editor from "@monaco-editor/react";
import { useLocation } from "react-router-dom";

export default function ReasypePage() {
  const location = useLocation();
  const experiment = location.state?.experiment || {};

  // Full JSON editor state
  const [jsonText, setJsonText] = useState(JSON.stringify(experiment, null, 2));

  // Tab state
  const [tabIndex, setTabIndex] = useState(0);

  // Simplified form state
  const [simplifiedForm, setSimplifiedForm] = useState({
    file_name: "dummy_rEasype.json",
    experiment_name: experiment.metadata?.experiment_name || "",
    experiment_mode: experiment.experiment_mode || "",
    objective: experiment.optimizer?.objective?.metric || "",
    num_samples: experiment.num_samples || 0,
    parallel_echem_slots: experiment.parallel_echem_slots || 1
  });

  // Platform checklist tick state
  const [platformChecklist, setPlatformChecklist] = useState(
    experiment.platform_checklist?.solids_to_load?.map(s => ({ ...s, checked: true })) || []
  );

  const isValidJson = (() => {
    try {
      JSON.parse(jsonText);
      return true;
    } catch {
      return false;
    }
  })();

  // Sync simplified form changes to full JSON
  useEffect(() => {
    const updated = { ...experiment };
    updated.metadata = updated.metadata || {};
    updated.metadata.experiment_name = simplifiedForm.experiment_name;
    updated.experiment_mode = simplifiedForm.experiment_mode;
    updated.optimizer = updated.optimizer || {};
    updated.optimizer.objective = updated.optimizer.objective || {};
    updated.optimizer.objective.metric = simplifiedForm.objective;
    updated.num_samples = simplifiedForm.num_samples;
    updated.parallel_echem_slots = simplifiedForm.parallel_echem_slots;

    setJsonText(JSON.stringify(updated, null, 2));
  }, [simplifiedForm, experiment]);

  return (
    <Paper sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        rEasype – Experiment Editor
      </Typography>

      {/* Tabs */}
      <Tabs value={tabIndex} onChange={(_, i) => setTabIndex(i)} sx={{ mb: 2 }}>
        <Tab label="Full JSON" />
        <Tab label="Info" />
        <Tab label="CV Parameters" />
        <Tab label="Recipe" />
        <Tab label="Platform Checklist" />
        <Tab label="Safety Assessment" />
      </Tabs>

      {/* Full JSON */}
      {tabIndex === 0 && (
        <Box sx={{ height: "60vh", border: "1px solid #333" }}>
          <Editor
            height="100%"
            language="json"
            theme="vs-dark"
            value={jsonText}
            onChange={(value) => setJsonText(value ?? "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              formatOnPaste: true,
              formatOnType: true,
              automaticLayout: true
            }}
          />
        </Box>
      )}

      {/* Simplified Form */}
      {tabIndex === 1 && (
        <Stack spacing={2}>
          <TextField label="File Name" value={simplifiedForm.file_name} disabled />
          <TextField
            label="Experiment Name"
            value={simplifiedForm.experiment_name}
            onChange={(e) =>
              setSimplifiedForm(prev => ({ ...prev, experiment_name: e.target.value }))
            }
          />
          <TextField
            label="Experiment Mode"
            value={simplifiedForm.experiment_mode}
            onChange={(e) =>
              setSimplifiedForm(prev => ({ ...prev, experiment_mode: e.target.value }))
            }
          />
          <TextField
            label="Objective Metric"
            value={simplifiedForm.objective}
            onChange={(e) =>
              setSimplifiedForm(prev => ({ ...prev, objective: e.target.value }))
            }
          />
          <TextField
            label="Number of Samples"
            type="number"
            value={simplifiedForm.num_samples}
            onChange={(e) =>
              setSimplifiedForm(prev => ({ ...prev, num_samples: Number(e.target.value) }))
            }
          />
          <TextField
            label="Parallel CV Slots"
            type="number"
            value={simplifiedForm.parallel_echem_slots}
            onChange={(e) =>
              setSimplifiedForm(prev => ({ ...prev, parallel_echem_slots: Number(e.target.value) }))
            }
          />
        </Stack>
      )}

      {/* CV Parameters */}
      {tabIndex === 2 && experiment.cv_parameters && (
        <Stack spacing={2}>
          {Object.entries(experiment.cv_parameters).map(([key, value]) => (
            <TextField
              key={key}
              label={key.replaceAll("_", " ")}
              value={Array.isArray(value) ? value.join(", ") : value}
              onChange={() => {}}
              
            />
          ))}
        </Stack>
      )}

      {/* Recipe */}
      {tabIndex === 3 && experiment.recipe && (
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Solids</Typography>
          {experiment.recipe.solids?.map((s, idx) => (
            <Typography key={idx}>
              {s.name} – {s.mass_mg} mg (Cartridge {s.cartridge_position})
            </Typography>
          ))}
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Liquids</Typography>
          {experiment.recipe.liquids?.map((l, idx) => (
            <Typography key={idx}>
              {l.name} – {l.volume_ml} mL (Channel {l.channel})
            </Typography>
          ))}
          <Typography>Final Volume: {experiment.recipe.final_volume_ml} mL</Typography>
          <Typography>Ultrasound Mixing: {experiment.recipe.ultrasound_mixing_time_min} min</Typography>
          <Typography>Purge: {experiment.recipe.purge ? "Yes" : "No"}</Typography>
        </Stack>
      )}

{/* Platform Checklist */}
{tabIndex === 4 && experiment.platform_checklist && (
  <Stack spacing={1}>
    {/* Solids */}
    <Typography sx={{ fontWeight: 'bold' }}>Solids to Load:</Typography>
    {platformChecklist.map((s, idx) => (
      <FormControlLabel
        key={idx}
        control={
          <Checkbox
            checked={s.checked}
            onChange={(e) => {
              const newList = [...platformChecklist];
              newList[idx].checked = e.target.checked;
              setPlatformChecklist(newList);
            }}
          />
        }
        label={`${s.name} (Cartridge ${s.cartridge_position})`}
      />
    ))}

    {/* Liquids */}
    <Typography sx={{ fontWeight: 'bold' }} >Liquids to Load:</Typography>
    {experiment.platform_checklist.liquids_to_load?.map((l, idx) => (
      <FormControlLabel
        key={idx}
        control={
          <Checkbox
            checked={l.checked ?? true}
            onChange={(e) => {
              const newLiquids = [...experiment.platform_checklist.liquids_to_load];
              newLiquids[idx] = { ...newLiquids[idx], checked: e.target.checked };
              experiment.platform_checklist.liquids_to_load = newLiquids;
              // Force re-render by updating JSON text (or another state)
              setJsonText(JSON.stringify(experiment, null, 2));
            }}
          />
        }
        label={`${l.name} (Channel ${l.channel})`}
      />
    ))}

    {/* Vials */}
    <Typography sx={{ fontWeight: 'bold' }} >Experiment Vials Required:</Typography>
    <FormControlLabel
      control={
        <Checkbox
          checked={experiment.platform_checklist.vials_checked ?? true}
          onChange={(e) => {
            experiment.platform_checklist.vials_checked = e.target.checked;
            setJsonText(JSON.stringify(experiment, null, 2));
          }}
        />
      }
      label={`${experiment.platform_checklist.experiment_vials_required} vials`}
    />

    <Typography>Parallel Slots Used: {experiment.platform_checklist.parallel_echem_slots_used}</Typography>
  </Stack>
)}

      {/* Safety Assessment */}
      {tabIndex === 5 && experiment.safety_assessment && (
        <Stack spacing={2}>
          {Object.entries(experiment.safety_assessment).map(([key, arr]) => (
            <Box key={key}>
              <Typography variant="subtitle1" sx={{ textTransform: "capitalize",  fontWeight: 'bold' }}>
                {key.replaceAll("_", " ")}
              </Typography>
              <Divider sx={{ mb: 1 }} />
              {arr.map((item, idx) => (
                <Typography key={idx} sx={{ pl: 2, mb: 0.5 }}>
                  • {item}
                </Typography>
              ))}
            </Box>
          ))}
        </Stack>
      )}

      {/* Buttons */}
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          disabled={!isValidJson}
          onClick={() => console.log("Saved JSON:", JSON.parse(jsonText))}
        >
          Save
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => console.log("Running experiment...")}
        >
          Run Experiment
        </Button>
        <Typography
          variant="body2"
          color={isValidJson ? "success.main" : "error.main"}
          sx={{ alignSelf: "center" }}
        >
          {isValidJson ? "Valid JSON" : "Invalid JSON"}
        </Typography>
      </Stack>
    </Paper>
  );
}