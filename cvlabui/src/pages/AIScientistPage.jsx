import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress
} from "@mui/material";
import { useRef } from "react";


export default function AIScientistPage() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I am 'el Toques' the CVLab AI Scientist 🤖 🧪" }
  ]);
  const [input, setInput] = useState("Find NaCl concentration that maximises anodic peak current at 0.3 V.");
  const [thinking, setThinking] = useState(false);
  const [experimentJson, setExperimentJson] = useState(null);
  const navigate = useNavigate(); 


  const sendMessage = async () => {
  if (!input.trim()) return;

  const userMessage = { role: "user", text: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setThinking(true);

  try {
    const res = await fetch("http://localhost:8080/api/v1/aiscientist/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input })
    });

    const data = await res.json();
    const responseText = data.response || "Error from AI.";

    if (data.experiment_json) {
      setExperimentJson(data.experiment_json);
    }

    await addMessageWordByWord(responseText);

    
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: "⚠️ Failed to contact AI Scientist." }
    ]);
  } finally {
    setThinking(false);
  }
};

const intervalRef = useRef(null);

const addMessageWordByWord = (text) => {
  return new Promise((resolve) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Split by space or newline, keep newlines as separate elements
    const words = text.split(/(\s+)/); // ✅ includes spaces and \n

    let idx = 0;

    setMessages((prev) => [...prev, { role: "ai", text: "" }]);

    intervalRef.current = setInterval(() => {
      if (idx >= words.length) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        resolve();
        return;
      }

      const word = words[idx];
      if (word !== undefined) {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = { ...newMessages[newMessages.length - 1] };

          lastMsg.text += word; // spaces/newlines preserved
          newMessages[newMessages.length - 1] = lastMsg;

          return newMessages;
        });
      }

      idx++;
    }, 50); // faster typing, adjust if you like
  });
};

  return (
    <Paper sx={{ p: 3, maxWidth: 900, mx: "auto", height: "80vh" }}>
      <Typography variant="h4" gutterBottom>
        🧠 AI Scientist
      </Typography>

      {/* Chat area */}
      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: 2,
          p: 2,
          mb: 2,
          height: "60vh",
          overflowY: "auto",
          backgroundColor: "#fafafa"
        }}
      >
        <Stack spacing={1}>
          {messages.map((m, idx) => (
            <Box
              key={idx}
              sx={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: m.role === "user" ? "primary.main" : "#e0e0e0",
                color: m.role === "user" ? "#fff" : "#000",
                px: 2,
                py: 1,
                borderRadius: 2,
                maxWidth: "70%",
                whiteSpace: "pre-wrap"   
              }}
            >
              {m.text}
            </Box>
          ))}

          {thinking && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="body2">Thinking…</Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Input */}
      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          placeholder="Ask the AI Scientist..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button variant="contained" onClick={sendMessage}>Send</Button>
        {experimentJson && (
        <Button
          variant="contained"
          color="secondary"
          sx={{ fontWeight: "bold", textTransform: "none" }}
          onClick={() =>
            navigate("/reasype", { state: { experiment: experimentJson } })
          }
        >
          rEasype
        </Button>
        )}
      </Stack>
      </Paper>
  );
}
