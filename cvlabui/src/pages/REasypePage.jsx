import { useState } from "react";
import { Box, Button, Typography, Paper, Stack } from "@mui/material";
import Editor from "@monaco-editor/react";

export default function ReasypePage() {
  const [jsonText, setJsonText] = useState(`{
  "experiment": "electrochemistry_test",
  "voltage": 1.2,
  "duration": 60,
  "steps": [
    { "action": "pipette", "volume": 10 },
    { "action": "measure", "channel": "A" }
  ]
}`);

  const isValidJson = (() => {
    try {
      JSON.parse(jsonText);
      return true;
    } catch {
      return false;
    }
  })();

  return (
    <Paper sx={{ p: 4, maxWidth: 1000, mx: "auto" }} elevation={3}>
      <Stack spacing={2}>
        <Typography variant="h5">
          rEasype – JSON Editor
        </Typography>

        {/* ✅ Give Monaco a fixed height */}
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
              automaticLayout: true,
            }}
          />
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            disabled={!isValidJson}
            onClick={() => console.log(JSON.parse(jsonText))}
          >
            Save
          </Button>

          <Typography
            variant="body2"
            color={isValidJson ? "success.main" : "error.main"}
          >
            {isValidJson ? "Valid JSON" : "Invalid JSON"}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
