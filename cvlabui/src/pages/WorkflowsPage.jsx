import Editor from "@monaco-editor/react";
import { Box, Button } from "@mui/material";
import { useState } from "react";

export default function WorkflowsPage() {
  const [code, setCode] = useState(`# Example workflow
def run():
    print("Hello electrochemistry")
`);

  return (
    <Box sx={{ height: "80vh" }}>
      <Editor
        height="100%"
        language="python"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value)}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => console.log(code)}
      >
        Save Workflow
      </Button>
    </Box>
  );
}
