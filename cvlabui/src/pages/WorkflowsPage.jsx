import { useState } from "react";
import { Box, Button, Typography, Paper, Stack } from "@mui/material";
import Editor from "@monaco-editor/react";

export default function WorkflowsPage() {
  const [code, setCode] = useState(`import time
from pathlib import Path
from cvlab.devices import (
    Arm, Echem, Capper, SyringePump, SolidDispenser, Mixer,
    TopCarousel, BottomCarousel, BottomCarousel, PHMeter
)
from cvlab.utils.config import load_config

import logging
import os

# ---------------------------
# Logging configuration
# ---------------------------
logging.basicConfig(
    level=logging.INFO,  # Show INFO, WARNING, ERROR, CRITICAL
    format='[%(levelname)s][%(name)s] %(message)s'
)

logger = logging.getLogger("TestAllDevices")


# ------------------------ Paths ------------------------
CWD_PATH = os.getcwd()
print(CWD_PATH)

CONF_PATH =  CWD_PATH +'/data/conf/conf_dummy.json'
ROUTINES_PATH = CWD_PATH + '/data/routines/'
TOP_CAROUSEL_CONF = ROUTINES_PATH + 'top_carousel/top_carousel.json'
BOTTOM_CAROUSEL_CONF = ROUTINES_PATH + 'bottom_carousel/bottom_carousel.json'
PHMETER_CALIBRATION_CONF = CWD_PATH + 'data/calibration/ph_calibration.json'

# ------------------------ Sample Data ------------------------
sample = {
    "sample_id": "Carbon",
    "mass": 50.0,
    "tolerance": 1.0,
    "algorithm": "standard",
    "tapper_intensity": 50,
    "tapper_duration": 3
}

liquid = {
    "liquid_id": "water",
    "volume": 2,
    "source_port": "I1",
    "destination_port": "O1",
    "waste_port": "O3"
}

# ------------------------ Device Initialization ------------------------
def init_devices(config):
    arm = Arm(
        name="Arm",
        arm_url=config.ARM_URL,
        arm_aux_url=config.PLC_URL,
        arm_aux_port=config.PLC_PORT
    )

    echem = Echem(
        name="Echem",
        echem_url=config.ECHEM_URL,
        echem_aux_url=config.ECHEM_AUX_URL,
        echem_aux_port=config.ECHEM_AUX_PORT,
        pipette_url=config.PIPETTE_URL,
        pipette_aux_url=config.PIPETTE_AUX_URL,
        pipette_aux_port=config.PIPETTE_AUX_PORT,
        plc_url=config.PLC_URL,
        plc_port=config.PLC_PORT
    )

    capper = Capper(
        name="Capper",
        capper_url=config.PLC_URL,
        capper_port=config.PLC_PORT
    )

    mixer = Mixer(
        name="Mixer",
        mixer_url=config.PLC_URL,
        mixer_port=config.PLC_PORT,
        mixer_aux_url=config.PUMPS_URL,
        mixer_aux_port=config.PUMPS_PORT
    )

    solids_dispenser = SolidDispenser(
        name="Quantos",
        solid_dispenser_url=config.SOLIDS_URL,
        solid_dispenser_aux_url=config.PLC_URL,
        solid_dispenser_aux_port=config.PLC_PORT
    )

    liquids_dispenser = SyringePump(
        name="Liquids Pump",
        syringe_pump_url=config.LIQUIDS_URL,
        syringe_pump_aux_url=config.PLC_URL,
        syringe_pump_aux_port=config.PLC_PORT
    )

    top_carousel = TopCarousel(
        name="Top Carousel",
        carousel_url=config.TOP_CAROUSEL_URL,
        carousel_port=config.TOP_CAROUSEL_PORT,
        conf_file=TOP_CAROUSEL_CONF
    )

    bottom_carousel = BottomCarousel(
        name="Bottom Carousel",
        carousel_url=config.BOTTOM_CAROUSEL_URL,
        carousel_port=config.BOTTOM_CAROUSEL_PORT,
        aux_carousel_pump_url=config.PUMPS_URL,
        aux_carousel_pump_port=config.PUMPS_PORT,
        aux_carousel_purger_url=config.PLC_URL,
        aux_carousel_purger_port=config.PLC_PORT,
        conf_file=BOTTOM_CAROUSEL_CONF
    )

    ph_meter = PHMeter(
        name="pH Meter",
        phmeter_url=config.PH_PROBE_URL,
        phmeter_port=config.PH_PROBE_PORT,
        calibration_conf=PHMETER_CALIBRATION_CONF
    )

    return arm, echem, capper, mixer, solids_dispenser, liquids_dispenser, top_carousel, bottom_carousel, ph_meter

# ------------------------ Device Test Functions ------------------------
def test_ph_meter(ph_meter):
    print("<---- Testing pH Meter ---->")
    print(ph_meter.read_status())
    ph_meter.read_ph()
    time.sleep(0.3)

def test_carousels(top_carousel, bottom_carousel):
    print("<---- Testing Top Carousel ---->")
    top_carousel.home(); time.sleep(0.5)
    top_carousel.move_absolute(4); time.sleep(0.5)
    top_carousel.move_absolute(8); time.sleep(0.5)
    top_carousel.move_absolute(18); time.sleep(0.5)
    top_carousel.move_incremental(); time.sleep(0.5)

    print("<---- Testing Bottom Carousel ---->")
    bottom_carousel.home(); time.sleep(0.5)
    bottom_carousel.move_absolute(2); time.sleep(0.5)
    bottom_carousel.turn_pumps_on(); time.sleep(0.5)
    bottom_carousel.turn_pumps_off(); time.sleep(0.5)
    bottom_carousel.turn_purger_on(); time.sleep(0.5)
    bottom_carousel.turn_purger_off(); time.sleep(0.5)

def test_liquid_dispenser(liquids_dispenser):
    print("<---- Testing Liquid Dispenser ---->")
    liquids_dispenser.piston_to_dispense_position(); time.sleep(0.3)
    liquids_dispenser.piston_to_home_position(); time.sleep(0.3)
    liquids_dispenser.status(); time.sleep(0.3)
    liquids_dispenser.get_valve_pos(); time.sleep(0.3)
    liquids_dispenser.dispense(liquid); time.sleep(0.3)
    liquids_dispenser.move_home(); time.sleep(0.3)
    liquids_dispenser.set_waste_port(liquid); time.sleep(0.3)

def test_solid_dispenser(solids_dispenser):
    print("<---- Testing Solid Dispenser ---->")
    solids_dispenser.set_cartridge_tower_position(1); time.sleep(0.3)
    solids_dispenser.set_cartridge_tower_position(2); time.sleep(0.3)
    solids_dispenser.status(); time.sleep(0.3)
    solids_dispenser.open_front_door(); time.sleep(0.3)
    solids_dispenser.close_front_door(); time.sleep(0.3)
    solids_dispenser.open_side_doors(); time.sleep(0.3)
    solids_dispenser.close_side_doors(); time.sleep(0.3)
    solids_dispenser.unlock_dosing_head(); time.sleep(0.3)
    solids_dispenser.lock_dosing_head(); time.sleep(0.3)
    solids_dispenser.get_sample_data(); time.sleep(0.3)
    solids_dispenser.tare_balance(); time.sleep(0.3)
    solids_dispenser.set_target_mass(sample); time.sleep(0.3)
    solids_dispenser.dispense(sample); time.sleep(0.3)

def test_mixer(mixer):
    print("<---- Testing Mixer ---->")
    mixer.raise_lift(); time.sleep(0.5)
    mixer.lower_lift(); time.sleep(0.5)
    mixer.turn_ultrasound_bath_on(); time.sleep(0.5)
    mixer.turn_ultrasound_bath_off(); time.sleep(0.5)
    mixer.raise_lift(); time.sleep(0.5)

def test_arm(arm):
    print("<---- Testing Arm ---->")
    arm.close_gripper(); time.sleep(0.3)
    arm.open_gripper(); time.sleep(0.3)
    arm.send_gcode('G1 X10'); time.sleep(0.3)
    arm.unlock(); time.sleep(0.3)
    arm.home(); time.sleep(0.3)
    arm.settings(); time.sleep(0.3)
    arm.sleep(); time.sleep(0.3)
    arm.get_position(); time.sleep(0.3)
    arm.status(); time.sleep(0.3)
    arm.reset(); time.sleep(0.3)
    arm.wait_until_idle(); time.sleep(0.3)

def test_echem(echem):
    print("<---- Testing Echem ---->")
    echem.send_gcode('G1 X10'); time.sleep(0.3)
    echem.unlock(); time.sleep(0.3)
    echem.home(); time.sleep(0.3)
    echem.settings(); time.sleep(0.3)
    echem.sleep(); time.sleep(0.3)
    echem.get_position(); time.sleep(0.3)
    echem.reset(); time.sleep(0.3)
    echem.wait_until_idle(); time.sleep(0.3)
    # Example routines
    echem.execute_routine(file=ROUTINES_PATH+'echem\\pre_submerge_in_row_1.json'); time.sleep(0.3)
    echem.polisher_on(); time.sleep(0.3)
    echem.polisher_off(); time.sleep(0.3)
    echem.polisher_dropper_on(); time.sleep(0.3)
    echem.polisher_dropper_off(); time.sleep(0.3)
    echem.dryer_on(); time.sleep(0.3)
    echem.dryer_off(); time.sleep(0.3)
    echem.purger_on(); time.sleep(0.3)
    echem.purger_off(); time.sleep(0.3)
    echem.polisher_set_speed('slow'); time.sleep(0.3)

def test_capper(capper):
    print("<---- Testing Capper ---->")
    capper.hold_vial(); time.sleep(0.3)
    capper.uncap(); time.sleep(0.3)
    capper.cap(); time.sleep(0.3)
    capper.release_vial(); time.sleep(0.3)

# ------------------------ Main Execution ------------------------
def main():
    config = load_config(CONF_PATH)
    if not config:
        print("Error loading configuration. Exiting.")
        return

    devices = init_devices(config)
    arm, echem, capper, mixer, solids_dispenser, liquids_dispenser, top_carousel, bottom_carousel, ph_meter = devices

    test_ph_meter(ph_meter)
    test_carousels(top_carousel, bottom_carousel)
    test_liquid_dispenser(liquids_dispenser)
    test_solid_dispenser(solids_dispenser)
    test_mixer(mixer)
    test_capper(capper)
    test_arm(arm)
    test_echem(echem)
    

if __name__ == "__main__":
    main()
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
