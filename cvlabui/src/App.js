import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText
} from "@mui/material";

import theme from "./theme";
import AIScientistPage from "./pages/AIScientistPage";
import ReasypePage from  "./pages/REasypePage"
import CarouselsPage from "./pages/CarouselsPage";
import SolidsDispenserPage from "./pages/SolidsDispenserPage";
import LiquidsDispenserPage from "./pages/LiquidsDispenserPage";
import MixerPage from "./pages/MixerPage";
import PHMeterPage from "./pages/PHMeterPage";
import WorkflowsPage from "./pages/WorkflowsPage";
import ArmPage from "./pages/ArmPage";
import EchemPage from "./pages/EchemPage";
import CapperPage from "./pages/CapperPage";
import PotenciostatsPage from "./pages/PotenciostatsPage";
import CoreDocsPage from "./pages/CoreDocsPage";

import logo from "./imgs/logo/CVLab.png";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { Typography, IconButton } from "@mui/material";
import { ListItemIcon } from "@mui/material";
import EmojiObjectsIcon from "@mui/icons-material/Psychology"; // AI Scientist
import ScienceIcon from "@mui/icons-material/Science"; // rEasype
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing"; // Arm
import EchemIcon from "@mui/icons-material/FlashOn"; // Echem
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel"; // Carousels
import StorageIcon from "@mui/icons-material/Grain"; // Solids Dispenser
import OpacityIcon from "@mui/icons-material/Opacity"; // Liquids Dispenser
import CapperIcon from "@mui/icons-material/TakeoutDining"; // Capper 
import MixerIcon from "@mui/icons-material/Blender"; // Capper / Mixer
import WaterIcon from "@mui/icons-material/Water"; // pH Meter
import PlaylistAddCheckIcon from "@mui/icons-material/Description"; // Workflows
import PotenciostatIcon from "@mui/icons-material/Troubleshoot"; // Potentiostats



const drawerWidth = 240;

const navItems = [
  { label: "AI Scientist", path: "/aiscientist", icon: <EmojiObjectsIcon /> },
  { label: "rEasype", path: "/reasype", icon: <ScienceIcon /> },
  { label: "Arm", path: "/arm", icon: <PrecisionManufacturingIcon /> },
  { label: "Echem", path: "/echem", icon: <EchemIcon /> },
  { label: "Carousels", path: "/carousels", icon: <ViewCarouselIcon /> },
  { label: "Solids Dispenser", path: "/solids_dispenser", icon: <StorageIcon /> },
  { label: "Liquids Dispenser", path: "/liquids_dispenser", icon: <OpacityIcon /> },
  { label: "Capper", path: "/capper", icon: <CapperIcon /> },
  { label: "Mixer", path: "/mixer", icon: <MixerIcon /> },
  { label: "pH Meter", path: "/phmeter", icon: <WaterIcon /> },
  { label: "Potenciostats", path: "/potenciostats", icon: <PotenciostatIcon /> },
  { label: "Workflows", path: "/workflows", icon: <PlaylistAddCheckIcon /> }
  
];

function Layout() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: theme.palette.background.default_clear,
            borderRight: "1px solid #ffffff",
            padding: 2
          }
        }}
      >
        {/* Home Link */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            mb: 2,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            "&:hover": {
              backgroundColor: theme.palette.action.hover
            }
          }}
          onClick={() => navigate("/core")}
        >
          <IconButton size="small" sx={{ color: "inherit" }}>
            <HomeOutlinedIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" fontWeight={600}>
            Home
          </Typography>
        </Box>

        {/* Logo (Docs / Core) */}
        <Box
          component="img"
          src={logo}
          alt="CVLab logo"
          sx={{
            height: 180,
            mx: "auto",
            mb: 2,
            cursor: "pointer"
          }}
          onClick={() => navigate("/core")}
        />
        {/* Navigation */}
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&.active": {
                  backgroundColor: theme.palette.secondary.main,
                  color: "#fff"
                }
              }}
            >
              {item.icon && <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: theme.palette.background.default
        }}
      >
        <Routes>
          <Route path="/" element={<ArmPage />} />
          <Route path="/aiscientist" element={<AIScientistPage />} />
          <Route path="/reasype" element={<ReasypePage />} />
          <Route path="/arm" element={<ArmPage />} />
          <Route path="/echem" element={<EchemPage />} />
          <Route path="/carousels" element={<CarouselsPage />} />
          <Route path="/solids_dispenser" element={<SolidsDispenserPage />} />
          <Route path="/liquids_dispenser" element={<LiquidsDispenserPage />} />
          <Route path="/capper" element={<CapperPage />} />
          <Route path="/mixer" element={<MixerPage />} />
          <Route path="/phmeter" element={<PHMeterPage />} />
          <Route path="/potenciostats" element={<PotenciostatsPage/>}/>
          <Route path="/workflows" element={<WorkflowsPage />} />
          <Route path="/core" element={<CoreDocsPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout />
      </Router>
    </ThemeProvider>
  );
}

export default App;
