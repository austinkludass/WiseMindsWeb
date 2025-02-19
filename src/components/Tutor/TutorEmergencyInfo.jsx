import React from "react";
import {
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const TutorEmergencyInfo = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h4">Emergency Contact</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <TextField
            name="emergencyName"
            label="Full Name"
            value={formData.emergencyName}
            onChange={handleChange}
          />
          <FormControl fullWidth>
            <InputLabel id="relationship-select-label">Relationship</InputLabel>
            <Select
              name="emergencyRelationship"
              label="Relationship"
              labelId="relationship-select-label"
              value={formData.emergencyRelationship}
              onChange={handleChange}
            >
              <MenuItem value={"daughter"}>Daughter</MenuItem>
              <MenuItem value={"father"}>Father</MenuItem>
              <MenuItem value={"friend"}>Friend</MenuItem>
              <MenuItem value={"husband"}>Husband</MenuItem>
              <MenuItem value={"mother"}>Mother</MenuItem>
              <MenuItem value={"partner"}>Partner</MenuItem>
              <MenuItem value={"son"}>Son</MenuItem>
              <MenuItem value={"wife"}>Wife</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="emergencyPhone"
            label="Phone Number"
            value={formData.emergencyPhone}
            onChange={handleChange}
          />
          <TextField
            name="emergencyEmail"
            label="Email"
            value={formData.emergencyEmail}
            onChange={handleChange}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default TutorEmergencyInfo;
