import { useState } from "react";
import {
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
} from "@mui/material";
import StudentAcademicInfo from "../../student/StudentAcademicInfo";

const AcademicNeedsStep = ({ formData, setFormData, subjects, setSubjects }) => {
  const [reportFile, setReportFile] = useState(null);
  const [reportStatus, setReportStatus] = useState("");

  const handleReportFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setReportFile(file);
    setReportStatus("");
  };

  const handleReportUpload = () => {
    if (!reportFile) {
      setReportStatus("Select a report file to upload (coming soon).");
      return;
    }
    setReportStatus("Report upload is not enabled yet. We'll add this soon.");
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight="bold">
        Academic Information
      </Typography>
      <StudentAcademicInfo
        formData={formData}
        setFormData={setFormData}
        isEdit={true}
        subjects={subjects}
        setSubjects={setSubjects}
      />

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6">School Report (optional)</Typography>
          <Typography variant="body2" color="text.secondary">
            Uploading reports is coming soon. For now, please skip this step.
          </Typography>
          <TextField
            type="file"
            inputProps={{ accept: ".pdf" }}
            onChange={handleReportFileChange}
          />
          <Button variant="outlined" onClick={handleReportUpload}>
            Upload Report (stub)
          </Button>
          {reportStatus && (
            <Typography variant="body2" color="text.secondary">
              {reportStatus}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default AcademicNeedsStep;
