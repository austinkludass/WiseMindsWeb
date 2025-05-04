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

const TutorBankInfo = ({ formData, setFormData, isEdit }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h4">Banking and Tax</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {isEdit ? (
            <>
              <TextField
                name="bankName"
                label="Bank Name"
                value={formData.bankName}
                onChange={handleChange}
              />
              <TextField
                name="accountName"
                label="Account Name"
                value={formData.accountName}
                onChange={handleChange}
              />
              <TextField
                name="bsb"
                label="BSB"
                value={formData.bsb}
                onChange={handleChange}
              />
              <TextField
                name="accountNumber"
                label="Account Number"
                value={formData.accountNumber}
                onChange={handleChange}
              />
              <TextField
                name="tfn"
                label="Tax File Number"
                value={formData.tfn}
                onChange={handleChange}
              />
              <TextField
                name="superCompany"
                label="Super Company"
                value={formData.superCompany}
                onChange={handleChange}
              />
            </>
          ) : (
            <>
              <Typography variant="h6">
                Bank Name : {formData.bankName}
              </Typography>
              <Typography variant="h6">
                Account Name: {formData.accountName}
              </Typography>
              <Typography variant="h6">BSB: {formData.bsb}</Typography>
              <Typography variant="h6">
                accountNumber: {formData.accountNumber}
              </Typography>
              <Typography variant="h6">
                Tax File Number: {formData.tfn}
              </Typography>
              <Typography variant="h6">
                Super Company: {formData.superCompany}
              </Typography>
            </>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default TutorBankInfo;
