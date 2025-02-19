import { React, useState } from "react";
import {
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const TutorWWVPInfo = ({ formData, setFormData, wwvpFile, setWwvpFile }) => {
  const [openWwvp, setOpenWwvp] = useState(false);
  const [wwvpUrl, setWwvpUrl] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name) => (date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleWwvpFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const fileUrl = URL.createObjectURL(file);
      setWwvpFile(file);
      setWwvpUrl(fileUrl);
    }
  };

  const handleOpenWwvpPDF = () => {
    setOpenWwvp(true);
  };

  const handleCloseWwvpPDF = () => {
    setOpenWwvp(false);
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h4">Working With Vulnerable People</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <TextField
            name="wwvpName"
            label="Name"
            value={formData.wwvpName}
            onChange={handleChange}
          />
          <TextField
            name="wwvpRegNumber"
            label="Registration Number"
            value={formData.wwvpRegNumber}
            onChange={handleChange}
          />
          <TextField
            name="wwvpCardNumber"
            label="Card Number"
            value={formData.wwvpCardNumber}
            onChange={handleChange}
          />
          <DatePicker
            label="Expiry"
            onChange={handleDateChange("wwvpExpiry")}
            value={formData.wwvpExpiry}
          />
          <Button variant="contained" component="label">
            UPLOAD WORKING WITH VULNERABLE PEOPLE DOCUMENT
            <input
              type="file"
              id="wwvpFileInput"
              hidden
              accept="application/pdf"
              onChange={handleWwvpFileChange}
            />
          </Button>
          <Button
            disabled={!wwvpFile}
            variant="outlined"
            onClick={handleOpenWwvpPDF}
          >
            VIEW
          </Button>
        </Stack>
      </AccordionDetails>
      <Dialog
        open={openWwvp}
        onClose={handleCloseWwvpPDF}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h3">Working With Vulnerable People</Typography>
        </DialogTitle>
        <DialogContent>
          {wwvpUrl && (
            <iframe
              src={wwvpUrl}
              width="100%"
              height="500px"
              title="Working With Vulnerable People"
            />
          )}
        </DialogContent>
      </Dialog>
    </Accordion>
  );
};

export default TutorWWVPInfo;
