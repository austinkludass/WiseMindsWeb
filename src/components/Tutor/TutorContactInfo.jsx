import React from "react";
import {
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const TutorContactInfo = ( {formData, setFormData} ) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h4">Contact Information</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <TextField
            name="personalEmail"
            label="Personal Email"
            value={formData.personalEmail}
            onChange={handleChange}
          />
          <TextField
            name="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />
          <TextField
            name="address"
            label="Address"
            value={formData.address}
            onChange={handleChange}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default TutorContactInfo;
