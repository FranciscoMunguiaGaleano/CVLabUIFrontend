import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

// ============================================================
// CONSTANTS
// ============================================================

const API_BASE_URL =
  "http://localhost:8080/api/v1/aiscientist";

const INITIAL_MESSAGE = {
  role: "ai",
  text: "Hello! I am 'Electro' the CVLab AI Scientist 🤖 🧪",
};

const INITIAL_INPUT =
  "Perform a cyclic voltammetry experiment to characterize Vitamin C as an analyte dissolved in the electrolyte. The Vitamin C should be prepared in the electrolyte and measured using the electrochemical substation. Use the available gold working electrode, platinum counter electrode, and Ag/AgCl reference electrode. Select appropriate electrolyte composition, Vitamin C concentration, CV parameters, mixing/preparation steps, and safety precautions based on the capabilities and constraints provided in the system context. The resulting experiment must be directly executable by the CVLab platform.";

// ============================================================
// COMPONENT
// ============================================================

export default function AIScientistPage() {
  // ----------------------------------------------------------
  // CHAT STATE
  // ----------------------------------------------------------

  const [messages, setMessages] = useState([
    INITIAL_MESSAGE,
  ]);

  const [input, setInput] = useState(INITIAL_INPUT);

  const [thinking, setThinking] = useState(false);

  const [experimentJson, setExperimentJson] = useState(null);

  // ----------------------------------------------------------
  // MODEL STATE
  // ----------------------------------------------------------

  const [models, setModels] = useState([]);

  const [selectedModel, setSelectedModel] = useState("");

  const [loadingModels, setLoadingModels] = useState(true);

  const [changingModel, setChangingModel] = useState(false);

  // ----------------------------------------------------------
  // REFS
  // ----------------------------------------------------------

  const intervalRef = useRef(null);

  // ----------------------------------------------------------
  // NAVIGATION
  // ----------------------------------------------------------

  const navigate = useNavigate();

  // ==========================================================
  // LOAD AVAILABLE MODELS
  // ==========================================================

  useEffect(() => {
    loadModels();

    // Cleanup typing animation when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const loadModels = async () => {
    setLoadingModels(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/models`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load models: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.ok) {
        throw new Error(
          data.error || "Failed to load AI models."
        );
      }

      setModels(data.models || []);

      // Backend tells us which model is currently selected.
      if (data.current_model) {
        setSelectedModel(data.current_model);
      }
    } catch (error) {
      console.error(
        "[AI Scientist] Failed to load models:",
        error
      );
    } finally {
      setLoadingModels(false);
    }
  };

  // ==========================================================
  // CHANGE MODEL
  // ==========================================================

  const handleModelChange = async (modelKey) => {
    if (!modelKey || changingModel) {
      return;
    }

    setChangingModel(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/model`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelKey,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || "Failed to change AI model."
        );
      }

      // Update the selected model using the value
      // confirmed by the backend.
      setSelectedModel(data.model);

      console.log(
        `[AI Scientist] Model changed to ${data.model_name}`
      );
    } catch (error) {
      console.error(
        "[AI Scientist] Failed to change model:",
        error
      );

      // Reload the backend state so the UI remains
      // consistent with the actual selected model.
      await loadModels();
    } finally {
      setChangingModel(false);
    }
  };

  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  const sendMessage = async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput || thinking) {
      return;
    }

    const userMessage = {
      role: "user",
      text: trimmedInput,
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setInput("");
    setThinking(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: trimmedInput,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.ok) {
        throw new Error(
          data.error || "AI Scientist request failed."
        );
      }

      const responseText =
        data.response || "Error from AI Scientist.";

      // Store generated experiment.
      if (data.experiment_json) {
        setExperimentJson(data.experiment_json);
      }

      // Display the response with typing animation.
      await addMessageWordByWord(responseText);
    } catch (error) {
      console.error(
        "[AI Scientist] Request error:",
        error
      );

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "ai",
          text: "⚠️ Failed to contact AI Scientist.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  // ==========================================================
  // TYPE AI RESPONSE WORD BY WORD
  // ==========================================================

  const addMessageWordByWord = (text) => {
    return new Promise((resolve) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Keep whitespace and newlines.
      const words = text.split(/(\s+)/);

      let index = 0;

      // Add empty AI message first.
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "ai",
          text: "",
        },
      ]);

      intervalRef.current = setInterval(() => {
        if (index >= words.length) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;

          resolve();
          return;
        }

        const word = words[index];

        if (word !== undefined) {
          setMessages((previousMessages) => {
            const updatedMessages = [
              ...previousMessages,
            ];

            const lastMessage = {
              ...updatedMessages[
                updatedMessages.length - 1
              ],
            };

            lastMessage.text += word;

            updatedMessages[
              updatedMessages.length - 1
            ] = lastMessage;

            return updatedMessages;
          });
        }

        index += 1;
      }, 50);
    });
  };

  // ==========================================================
  // RESTART CHAT
  // ==========================================================

  const restartChat = () => {
    // Stop current typing animation.
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Reset chat only.
    //
    // IMPORTANT:
    // We intentionally DO NOT reset selectedModel.
    // Restarting a chat should not change the AI model.
    setMessages([INITIAL_MESSAGE]);
    setInput(INITIAL_INPUT);
    setThinking(false);
    setExperimentJson(null);
  };

  // ==========================================================
  // KEYBOARD HANDLER
  // ==========================================================

  const handleKeyDown = (event) => {
    // Enter sends the message.
    //
    // Shift + Enter can still be used for a newline.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // ==========================================================
  // FIND CURRENT MODEL DETAILS
  // ==========================================================

  const currentModel = models.find(
    (model) => model.id === selectedModel
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Paper
      sx={{
        p: 3,
        maxWidth: 900,
        mx: "auto",
        height: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        {/* Title */}

        <Typography variant="h4">
          🧠 AI Scientist
        </Typography>

        {/* Model + Restart */}

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          {/* ============================================== */}
          {/* MODEL SELECTOR */}
          {/* ============================================== */}

          <FormControl
            size="small"
            sx={{
              minWidth: 200,
            }}
          >
            <InputLabel id="ai-model-select-label">
              AI Model
            </InputLabel>

            <Select
              labelId="ai-model-select-label"
              id="ai-model-select"
              value={selectedModel}
              label="AI Model"
              onChange={(event) =>
                handleModelChange(event.target.value)
              }
              disabled={
                loadingModels ||
                changingModel ||
                thinking
              }
            >
              {models.map((model) => (
                <MenuItem
                  key={model.id}
                  value={model.id}
                >
                  {model.name}
                  {model.selected ? " ✓" : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* ============================================== */}
          {/* RESTART BUTTON */}
          {/* ============================================== */}

          <Button
            variant="outlined"
            color="error"
            onClick={restartChat}
            disabled={thinking}
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              whiteSpace: "nowrap",
            }}
          >
            ↻ Restart Chat
          </Button>
        </Stack>
      </Stack>

      {/* ================================================== */}
      {/* CURRENT MODEL INFO */}
      {/* ================================================== */}

      {currentModel && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mb: 1,
          }}
        >
          Using: <strong>{currentModel.name}</strong>
        </Typography>
      )}

      {/* ================================================== */}
      {/* CHAT AREA */}
      {/* ================================================== */}

      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: 2,
          p: 2,
          mb: 2,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          backgroundColor: "#fafafa",
        }}
      >
        <Stack spacing={1}>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                alignSelf:
                  message.role === "user"
                    ? "flex-end"
                    : "flex-start",

                backgroundColor:
                  message.role === "user"
                    ? "primary.main"
                    : "#e0e0e0",

                color:
                  message.role === "user"
                    ? "#fff"
                    : "#000",

                px: 2,
                py: 1,
                borderRadius: 2,
                maxWidth: "70%",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {message.text}
            </Box>
          ))}

          {/* ================================================= */}
          {/* THINKING INDICATOR */}
          {/* ================================================= */}

          {thinking && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CircularProgress size={18} />

              <Typography variant="body2">
                Thinking…
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* ================================================== */}
      {/* INPUT + BUTTONS */}
      {/* ================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
      >
        {/* Input */}

        <TextField
          fullWidth
          placeholder="Ask the AI Scientist..."
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          onKeyDown={handleKeyDown}
          disabled={thinking}
        />

        {/* Send */}

        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={
            thinking ||
            changingModel ||
            !input.trim() ||
            !selectedModel
          }
          sx={{
            minWidth: 100,
            textTransform: "none",
          }}
        >
          Send
        </Button>

        {/* ================================================= */}
        {/* rEasype */}
        {/* ================================================= */}

        {experimentJson && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() =>
              navigate("/reasype", {
                state: {
                  experiment: experimentJson,
                },
              })
            }
            sx={{
              minWidth: 100,
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            rEasype
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
