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

const TutorFirstAidInfo = ({
  formData,
  setFormData,
  firstAidFile,
  setFirstAidFile,
  isEdit,
}) => {
  const [firstAidUrl, setFirstAidUrl] = useState(null);
  const [openFirstAid, setOpenFirstAid] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name) => (date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleFirstAidFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const fileUrl = URL.createObjectURL(file);
      setFirstAidFile(file);
      setFirstAidUrl(fileUrl);
    }
  };

  const handleOpenFirstAidPDF = () => {
    setOpenFirstAid(true);
  };

  const handleCloseFirstAidPDF = () => {
    setOpenFirstAid(false);
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h4">First Aid</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {isEdit ? (
            <>
              <DatePicker
                label="Course Date"
                onChange={handleDateChange("faCourseDate")}
                value={formData.faCourseDate}
              />
              <TextField
                name="faProvider"
                label="Provider"
                value={formData.faProvider}
                onChange={handleChange}
              />
              <TextField
                name="faNumber"
                label="Number"
                value={formData.faNumber}
                onChange={handleChange}
              />
              <TextField
                name="faCourseType"
                label="Course Type"
                value={formData.faCourseType}
                onChange={handleChange}
              />
              <TextField
                name="faCourseCode"
                label="Course Code"
                value={formData.faCourseCode}
                onChange={handleChange}
              />
              <DatePicker
                label="Expiry"
                onChange={handleDateChange("faExpiry")}
                value={formData.faExpiry}
              />
              <Button variant="contained" component="label">
                UPLOAD FIRST AID DOCUMENT
                <input
                  type="file"
                  id="firstAidFileInput"
                  hidden
                  accept="application/pdf"
                  onChange={handleFirstAidFileChange}
                />
              </Button>
              <Button
                disabled={!firstAidFile}
                variant="outlined"
                onClick={handleOpenFirstAidPDF}
              >
                VIEW
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6">
                Course Date: {formData.faCourseDate}
              </Typography>
              <Typography variant="h6">
                Provider: {formData.faProvider}
              </Typography>
              <Typography variant="h6">Number: {formData.faNumber}</Typography>
              <Typography variant="h6">
                Course Type: {formData.faCourseType}
              </Typography>
              <Typography variant="h6">
                Course Code: {formData.faCourseCode}
              </Typography>
              <Typography variant="h6">Expiry: {formData.faExpiry}</Typography>
            </>
          )}
        </Stack>
      </AccordionDetails>
      <Dialog
        open={openFirstAid}
        onClose={handleCloseFirstAidPDF}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h3">First Aid</Typography>
        </DialogTitle>
        <DialogContent>
          {firstAidUrl && (
            <iframe
              src={firstAidUrl}
              width="100%"
              height="500px"
              title="First Aid"
            />
          )}
        </DialogContent>
      </Dialog>
    </Accordion>
  );
};

export default TutorFirstAidInfo;
