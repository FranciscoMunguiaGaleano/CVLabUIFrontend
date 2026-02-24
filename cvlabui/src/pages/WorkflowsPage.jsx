import { useState } from "react";
import { Box, Button, Typography, Paper, Stack } from "@mui/material";
import Editor from "@monaco-editor/react";

export default function WorkflowsPage() {
  const [code, setCode] = useState(`# Example workflow
from cvlab import echem
def run():
    print("Hello electrochemistry")
`);

  return (
    <Paper sx={{ p: 4, maxWidth: 1100, mx: "auto" }} elevation={3}>
      <Stack spacing={2}>
        <Typography variant="h5">
          CVLab – Workflows Editor
        </Typography>

        {/* One fixed-height container */}
        <Box sx={{ height: "60vh", border: "1px solid #333" }}>
          <Editor
            height="100%"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value ?? "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
            }}
          />
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="contained" onClick={() => console.log(code)}> Save Workflow </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
