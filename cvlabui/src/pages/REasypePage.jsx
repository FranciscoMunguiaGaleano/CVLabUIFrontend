import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Tabs,
  Tab,
  TextField,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import Editor from "@monaco-editor/react";
import { useLocation } from "react-router-dom";

// ============================================================
// API CONFIGURATION
// ============================================================
//192.168.0.142
const API_BASE_URL = "http://localhost:8080";

const API_PATHS = {
  health: `${API_BASE_URL}/api/v1/aiscientist/health`,
  save: `${API_BASE_URL}/api/v1/aiscientist/save`,
  run: `${API_BASE_URL}/api/v1/aiscientist/run`,
  report: `${API_BASE_URL}/api/v1/aiscientist/report`,
};

// ============================================================
// COMPONENT
// ============================================================

export default function ReasypePage() {
  const location = useLocation();

  // ============================================================
  // INITIAL EXPERIMENT
  // ============================================================

  const initialExperiment =
    location.state?.experiment || {};

  // ============================================================
  // JSON STATE
  // ============================================================

  const [jsonText, setJsonText] = useState(
    JSON.stringify(
      initialExperiment,
      null,
      2
    )
  );

  // ============================================================
  // UI STATE
  // ============================================================

  const [tabIndex, setTabIndex] = useState(0);

  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [reportLoading, setReportLoading] =
    useState(false);

  const [workflowFinished, setWorkflowFinished] =
    useState(false);

  const [message, setMessage] = useState("");
  const [messageSeverity, setMessageSeverity] =
    useState("info");

  const [report, setReport] = useState(null);

  // ============================================================
  // PARSE JSON
  // ============================================================

  const parsedExperiment = useMemo(() => {
    try {
      return JSON.parse(jsonText);
    } catch {
      return null;
    }
  }, [jsonText]);

  const isValidJson =
    parsedExperiment !== null &&
    typeof parsedExperiment === "object";

  // ============================================================
  // SHOW MESSAGE
  // ============================================================

  const showMessage = (
    text,
    severity = "info"
  ) => {
    setMessage(text);
    setMessageSeverity(severity);
  };

  // ============================================================
  // NETWORK HELPER
  //
  // This is intentionally verbose so that browser/network
  // problems are distinguishable from Flask errors.
  // ============================================================

  const postJson = async (
    url,
    payload
  ) => {
    console.log(
      "[rEasype] POST:",
      url
    );

    console.log(
      "[rEasype] Payload:",
      payload
    );

    let response;

    try {
      response = await fetch(
        url,
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
          body: JSON.stringify(
            payload
          ),
        }
      );
    } catch (error) {
      console.error(
        "[rEasype] NETWORK ERROR:",
        error
      );

      throw new Error(
        `Could not reach Flask at ${url}. ` +
          `The browser blocked or failed the network request. ` +
          `Original error: ${error.message}`
      );
    }

    console.log(
      "[rEasype] HTTP status:",
      response.status
    );

    console.log(
      "[rEasype] HTTP ok:",
      response.ok
    );

    // Read text first rather than immediately calling
    // response.json(). This lets us see HTML error pages,
    // empty responses, proxy errors, etc.
    const responseText =
      await response.text();

    console.log(
      "[rEasype] Raw response:",
      responseText
    );

    let data = {};

    if (responseText) {
      try {
        data =
          JSON.parse(responseText);
      } catch (error) {
        console.error(
          "[rEasype] Response was not JSON:",
          error
        );

        throw new Error(
          `Flask returned HTTP ${response.status}, ` +
            `but the response was not valid JSON: ` +
            responseText.slice(0, 500)
        );
      }
    }

    if (
      !response.ok ||
      data.ok === false
    ) {
      const validationErrors =
        Array.isArray(
          data.validation_errors
        )
          ? `\n${data.validation_errors.join(
              "\n"
            )}`
          : "";

      throw new Error(
        (
          data.error ||
          `HTTP ${response.status}`
        ) +
          validationErrors
      );
    }

    return data;
  };

  // ============================================================
  // UPDATE NESTED JSON PROPERTY
  // ============================================================

  const updateField = (
    path,
    value
  ) => {
    if (!parsedExperiment) {
      return;
    }

    const updated =
      structuredClone(
        parsedExperiment
      );

    let current = updated;

    for (
      let i = 0;
      i < path.length - 1;
      i++
    ) {
      const key = path[i];

      if (
        current[key] === undefined ||
        current[key] === null
      ) {
        current[key] = {};
      }

      current = current[key];
    }

    current[
      path[path.length - 1]
    ] = value;

    setJsonText(
      JSON.stringify(
        updated,
        null,
        2
      )
    );
  };

  // ============================================================
  // TEST BACKEND CONNECTION
  // ============================================================

  const testBackend = async () => {
    try {
      showMessage(
        "Testing Flask connection...",
        "info"
      );

      console.log(
        "[rEasype] Testing:",
        API_PATHS.ping
      );

      const response =
        await fetch(
          API_PATHS.ping,
          {
            method: "GET",
            mode: "cors",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const text =
        await response.text();

      console.log(
        "[rEasype] Ping status:",
        response.status
      );

      console.log(
        "[rEasype] Ping response:",
        text
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${text}`
        );
      }

      showMessage(
        "Flask backend is reachable from this page.",
        "success"
      );
    } catch (error) {
      console.error(
        "[rEasype] Backend ping failed:",
        error
      );

      showMessage(
        `Backend connection failed: ${error.message}`,
        "error"
      );
    }
  };

  // ============================================================
  // SAVE
  // ============================================================

  const saveJson = async () => {
    if (!parsedExperiment) {
      showMessage(
        "Cannot save because the JSON is invalid.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);
      showMessage("");

      const experimentName =
        parsedExperiment
          .metadata
          ?.experiment_name ||
        "rEasype_experiment";

      console.log(
        "[rEasype] Saving experiment:",
        experimentName
      );

      const data =
        await postJson(
          API_PATHS.save,
          {
            filename:
              experimentName,
            experiment:
              parsedExperiment,
          }
        );

      console.log(
        "[rEasype] Save result:",
        data
      );

      showMessage(
        `Experiment saved successfully as ${data.filename}`,
        "success"
      );
    } catch (error) {
      console.error(
        "[rEasype] Save error:",
        error
      );

      showMessage(
        `Save failed: ${error.message}`,
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RUN EXPERIMENT
  // ============================================================

  const runExperiment = async () => {
    if (!parsedExperiment) {
      showMessage(
        "Cannot run because the JSON is invalid.",
        "error"
      );
      return;
    }

    try {
      setRunning(true);
      setWorkflowFinished(false);
      setReport(null);

      showMessage(
        "Workflow is executing...",
        "info"
      );

      const data =
        await postJson(
          API_PATHS.run,
          {
            experiment:
              parsedExperiment,
          }
        );

      console.log(
        "[rEasype] Run result:",
        data
      );

      setWorkflowFinished(true);

      showMessage(
        "Workflow was executed successfully.",
        "success"
      );
    } catch (error) {
      console.error(
        "[rEasype] Run error:",
        error
      );

      setWorkflowFinished(false);

      showMessage(
        `Workflow failed: ${error.message}`,
        "error"
      );
    } finally {
      setRunning(false);
    }
  };

  // ============================================================
  // GET REPORT
  // ============================================================

  const getReport = async () => {
    if (!parsedExperiment) {
      showMessage(
        "Cannot get report because the JSON is invalid.",
        "error"
      );
      return;
    }

    try {
      setReportLoading(true);

      showMessage(
        "Getting report...",
        "info"
      );

      const data =
        await postJson(
          API_PATHS.report,
          {
            experiment:
              parsedExperiment,
          }
        );

      console.log(
        "[rEasype] Report result:",
        data
      );

      setReport(data.report);

      showMessage(
        "Report retrieved successfully.",
        "success"
      );
    } catch (error) {
      console.error(
        "[rEasype] Report error:",
        error
      );

      showMessage(
        `Report failed: ${error.message}`,
        "error"
      );
    } finally {
      setReportLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Paper
      sx={{
        p: 3,
        maxWidth: 1000,
        mx: "auto",
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
      >
        rEasype – Experiment Editor
      </Typography>

      {/* ======================================================
          TABS
          ====================================================== */}

      <Tabs
        value={tabIndex}
        onChange={(_, index) =>
          setTabIndex(index)
        }
        sx={{ mb: 2 }}
      >
        <Tab label="Full JSON" />
        <Tab label="Info" />
        <Tab label="CV Parameters" />
        <Tab label="Recipe" />
        <Tab label="Platform Checklist" />
        <Tab label="Safety Assessment" />
      </Tabs>

      {/* ======================================================
          FULL JSON
          ====================================================== */}

      {tabIndex === 0 && (
        <Box
          sx={{
            height: "60vh",
            border: "1px solid #333",
          }}
        >
          <Editor
            height="100%"
            language="json"
            theme="vs-dark"
            value={jsonText}
            onChange={(value) =>
              setJsonText(
                value ?? ""
              )
            }
            options={{
              fontSize: 14,
              minimap: {
                enabled: false,
              },
              formatOnPaste: true,
              formatOnType: true,
              automaticLayout: true,
            }}
          />
        </Box>
      )}

      {/* ======================================================
          INFO
          ====================================================== */}

      {tabIndex === 1 &&
        parsedExperiment && (
          <Stack spacing={2}>
            <TextField
              label="File Name"
              value={
                parsedExperiment
                  .metadata
                  ?.experiment_name
                  ? `${parsedExperiment.metadata.experiment_name}.json`
                  : "rEasype_experiment.json"
              }
              disabled
            />

            <TextField
              label="Experiment Name"
              value={
                parsedExperiment
                  .metadata
                  ?.experiment_name ||
                ""
              }
              onChange={(e) =>
                updateField(
                  [
                    "metadata",
                    "experiment_name",
                  ],
                  e.target.value
                )
              }
            />

            <TextField
              label="Experimenter"
              value={
                parsedExperiment
                  .metadata
                  ?.experimenter ||
                ""
              }
              onChange={(e) =>
                updateField(
                  [
                    "metadata",
                    "experimenter",
                  ],
                  e.target.value
                )
              }
            />

            <TextField
              label="Description"
              multiline
              rows={3}
              value={
                parsedExperiment
                  .metadata
                  ?.description ||
                ""
              }
              onChange={(e) =>
                updateField(
                  [
                    "metadata",
                    "description",
                  ],
                  e.target.value
                )
              }
            />

            <TextField
              label="Experiment Mode"
              value={
                parsedExperiment
                  .experiment_mode ||
                ""
              }
              onChange={(e) =>
                updateField(
                  ["experiment_mode"],
                  e.target.value
                )
              }
            />

            <TextField
              label="Number of Samples"
              type="number"
              value={
                parsedExperiment
                  .num_samples ?? 0
              }
              onChange={(e) =>
                updateField(
                  ["num_samples"],
                  Number(
                    e.target.value
                  )
                )
              }
            />

            <TextField
              label="Parallel CV Slots"
              type="number"
              value={
                parsedExperiment
                  .parallel_echem_slots ??
                1
              }
              onChange={(e) =>
                updateField(
                  [
                    "parallel_echem_slots",
                  ],
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </Stack>
        )}

      {/* ======================================================
          INVALID JSON MESSAGE
          ====================================================== */}

      {tabIndex !== 0 &&
        !parsedExperiment && (
          <Alert severity="error">
            The JSON is invalid. Please fix it
            in the Full JSON tab before editing
            the experiment.
          </Alert>
        )}

      {/* ======================================================
          CV PARAMETERS
          ====================================================== */}

      {tabIndex === 2 &&
        parsedExperiment?.cv_parameters && (
          <Stack spacing={2}>
            {Object.entries(
              parsedExperiment.cv_parameters
            ).map(
              ([key, value]) => {
                const isArray =
                  Array.isArray(
                    value
                  );

                return (
                  <TextField
                    key={key}
                    label={key.replaceAll(
                      "_",
                      " "
                    )}
                    value={
                      isArray
                        ? value.join(
                            ", "
                          )
                        : value ?? ""
                    }
                    onChange={(e) => {
                      let newValue =
                        e.target.value;

                      if (isArray) {
                        newValue =
                          newValue
                            .split(",")
                            .map(
                              (item) =>
                                Number(
                                  item.trim()
                                )
                            );
                      } else if (
                        typeof value ===
                        "number"
                      ) {
                        newValue =
                          Number(
                            e.target.value
                          );
                      } else if (
                        typeof value ===
                        "boolean"
                      ) {
                        newValue =
                          e.target.value ===
                          "true";
                      }

                      updateField(
                        [
                          "cv_parameters",
                          key,
                        ],
                        newValue
                      );
                    }}
                  />
                );
              }
            )}
          </Stack>
        )}

      {/* ======================================================
          RECIPE
          ====================================================== */}

      {tabIndex === 3 &&
        parsedExperiment?.recipe && (
          <Stack spacing={2}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight:
                  "bold",
              }}
            >
              Solids
            </Typography>

            {parsedExperiment
              .recipe.solids
              ?.length > 0 ? (
              parsedExperiment.recipe.solids.map(
                (solid, index) => (
                  <Typography
                    key={index}
                  >
                    {solid.name} –{" "}
                    {solid.mass_mg} mg{" "}
                    (Cartridge{" "}
                    {
                      solid.cartridge_position
                    })
                  </Typography>
                )
              )
            ) : (
              <Typography>
                No solids specified.
              </Typography>
            )}

            <Typography
              variant="subtitle1"
              sx={{
                fontWeight:
                  "bold",
              }}
            >
              Liquids
            </Typography>

            {parsedExperiment
              .recipe.liquids
              ?.length > 0 ? (
              parsedExperiment.recipe.liquids.map(
                (liquid, index) => (
                  <Typography
                    key={index}
                  >
                    {liquid.name} –{" "}
                    {liquid.volume_ml} mL{" "}
                    (Channel{" "}
                    {
                      liquid.channel
                    })
                  </Typography>
                )
              )
            ) : (
              <Typography>
                No liquids specified.
              </Typography>
            )}

            <Typography>
              Final Volume:{" "}
              {
                parsedExperiment
                  .recipe
                  .final_volume_ml
              }{" "}
              mL
            </Typography>

            <Typography>
              Mixing Method:{" "}
              {
                parsedExperiment
                  .recipe
                  .mixing_method
              }
            </Typography>

            <Typography>
              Mixing Time:{" "}
              {
                parsedExperiment
                  .recipe
                  .mixing_time_seconds
              }{" "}
              seconds
            </Typography>

            <Typography>
              Purge:{" "}
              {parsedExperiment
                .recipe.purge
                ? "Yes"
                : "No"}
            </Typography>
          </Stack>
        )}

      {/* ======================================================
          PLATFORM CHECKLIST
          
          Solids/liquids are derived from recipe.
          The checklist itself only contains operational
          summary information.
          ====================================================== */}

      {tabIndex === 4 &&
        parsedExperiment && (
          <Stack spacing={1}>
            <Typography
              variant="h6"
            >
              Solids to Load:
            </Typography>

            {parsedExperiment
              .recipe?.solids
              ?.length > 0 ? (
              parsedExperiment.recipe.solids.map(
                (solid, index) => (
                  <Typography
                    key={index}
                  >
                    {solid.name} —{" "}
                    {solid.mass_mg} mg{" "}
                    ({solid.role},{" "}
                    Cartridge{" "}
                    {
                      solid.cartridge_position
                    })
                  </Typography>
                )
              )
            ) : (
              <Typography>
                No solids to load.
              </Typography>
            )}

            <Typography
              variant="h6"
              sx={{ mt: 2 }}
            >
              Liquids to Load:
            </Typography>

            {parsedExperiment
              .recipe?.liquids
              ?.length > 0 ? (
              parsedExperiment.recipe.liquids.map(
                (liquid, index) => (
                  <Typography
                    key={index}
                  >
                    {liquid.name} —{" "}
                    {
                      liquid.volume_ml
                    }{" "}
                    mL (Channel{" "}
                    {
                      liquid.channel
                    })
                  </Typography>
                )
              )
            ) : (
              <Typography>
                No liquids to load.
              </Typography>
            )}

            <Typography
              sx={{ mt: 2 }}
            >
              Experiment Vials Required:{" "}
              {parsedExperiment
                .platform_checklist
                ?.experiment_vials_required_per_batch ??
                1}
            </Typography>

            <Typography>
              Parallel Slots Used:{" "}
              {parsedExperiment
                .platform_checklist
                ?.parallel_echem_slots_used ??
                parsedExperiment
                  .parallel_echem_slots ??
                1}
            </Typography>
          </Stack>
        )}

      {/* ======================================================
          SAFETY ASSESSMENT
          ====================================================== */}

      {tabIndex === 5 &&
        parsedExperiment
          ?.safety_assessment && (
          <Stack spacing={2}>
            {Object.entries(
              parsedExperiment
                .safety_assessment
            ).map(
              ([key, value]) => (
                <Box key={key}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      textTransform:
                        "capitalize",
                      fontWeight:
                        "bold",
                    }}
                  >
                    {key.replaceAll(
                      "_",
                      " "
                    )}
                  </Typography>

                  <Divider
                    sx={{ mb: 1 }}
                  />

                  {Array.isArray(
                    value
                  ) ? (
                    value.map(
                      (
                        item,
                        index
                      ) => (
                        <Typography
                          key={
                            index
                          }
                          sx={{
                            pl: 2,
                            mb: 0.5,
                          }}
                        >
                          •{" "}
                          {item}
                        </Typography>
                      )
                    )
                  ) : (
                    <Typography>
                      {String(
                        value
                      )}
                    </Typography>
                  )}
                </Box>
              )
            )}
          </Stack>
        )}

      {/* ======================================================
          STATUS MESSAGE
          ====================================================== */}

      {message && (
        <Alert
          severity={
            messageSeverity
          }
          sx={{ mt: 3 }}
        >
          {message}
        </Alert>
      )}

      {/* ======================================================
          REPORT
          ====================================================== */}

      {report && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
          >
            Workflow Report
          </Typography>

          <Paper
            variant="outlined"
            sx={{ p: 2 }}
          >
            <Typography
              sx={{
                whiteSpace:
                  "pre-wrap",
              }}
            >
              {report}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* ======================================================
          BUTTONS
          ====================================================== */}

      <Stack
        direction="row"
        spacing={2}
        sx={{
          mt: 3,
          alignItems:
            "center",
          flexWrap:
            "wrap",
        }}
      >

        {/* SAVE */}

        <Button
          variant="contained"
          disabled={
            !isValidJson ||
            saving ||
            running
          }
          onClick={
            saveJson
          }
        >
          {saving ? (
            <>
              <CircularProgress
                size={20}
                color="inherit"
                sx={{
                  mr: 1,
                }}
              />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>

        {/* RUN */}

        <Button
          variant="contained"
          color="success"
          disabled={
            !isValidJson ||
            running ||
            saving
          }
          onClick={
            runExperiment
          }
        >
          {running ? (
            <>
              <CircularProgress
                size={20}
                color="inherit"
                sx={{
                  mr: 1,
                }}
              />
              Running...
            </>
          ) : (
            "Run Experiment"
          )}
        </Button>

        {/* REPORT */}

        <Button
          variant="outlined"
          disabled={
            !workflowFinished ||
            reportLoading
          }
          onClick={
            getReport
          }
        >
          {reportLoading ? (
            <>
              <CircularProgress
                size={20}
                sx={{
                  mr: 1,
                }}
              />
              Getting Report...
            </>
          ) : (
            "Get Report"
          )}
        </Button>

        {/* JSON STATUS */}

        <Typography
          variant="body2"
          color={
            isValidJson
              ? "success.main"
              : "error.main"
          }
          sx={{
            alignSelf:
              "center",
          }}
        >
          {isValidJson
            ? "Valid JSON"
            : "Invalid JSON"}
        </Typography>
      </Stack>
    </Paper>
  );
}

