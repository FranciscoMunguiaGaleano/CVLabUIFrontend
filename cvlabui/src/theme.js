import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#141d52ff" },   // deep blue
    secondary: { main: "#2facffff" }, // bright green
    error: { main: "#E53935" },     // red for errors
    background: { default: "#ecececff", default_clear:  "#fff"}, // light gray/white
    text: { primary: "#0A0A0A", secondary: "#555" },
  },
});

export default theme;
