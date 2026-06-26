import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#141d52ff" },   // deep blue
    secondary: { main: "#2facffff" }, // bright green
    error: { main: "#E53935" },     // red for errors
    state: { main: "#146264ff"},
    background: { default: "#ecececff", default_clear:  "#fff"}, // light gray/white
    text: { primary: "#0A0A0A", secondary: "#555" , state: "#ecececff"},
  },
});

export default theme;
