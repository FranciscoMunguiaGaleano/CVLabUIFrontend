import React, { useState } from "react";
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
    { role: "ai", text: "Hello! I am the CVLab AI Scientist 🤖 🧪" }
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

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

    // Animate word-by-word
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const words = text.split(/\s+/);
    let idx = 0;

    setMessages((prev) => [...prev, { role: "ai", text: "" }]);

    intervalRef.current = setInterval(() => {
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = { ...newMessages[newMessages.length - 1] };

        lastMsg.text += (lastMsg.text ? " " : "") + words[idx];
        newMessages[newMessages.length - 1] = lastMsg;

        return newMessages;
      });

      idx++;

      if (idx >= words.length) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        resolve();
      }
    }, 150);
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
                maxWidth: "70%"
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
        <Button variant="contained" onClick={sendMessage}>
          Send
        </Button>
      </Stack>
    </Paper>
  );
}
