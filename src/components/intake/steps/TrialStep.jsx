import { Stack, Typography, TextField } from "@mui/material";
import StudentTrialInfo from "../../student/StudentTrialInfo";

const TrialStep = ({
  formData,
  setFormData,
  trialAvailability,
  setTrialAvailability,
}) => {
  const handleNotesChange = (event) => {
    setFormData({ ...formData, trialNotes: event.target.value });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight="bold">
        Trial Session
      </Typography>
      <StudentTrialInfo
        formData={formData}
        setFormData={setFormData}
        isEdit={true}
        trialAvailability={trialAvailability}
        setTrialAvailability={setTrialAvailability}
      />
      <TextField
        label="Trial session notes (optional)"
        multiline
        minRows={3}
        value={formData.trialNotes}
        onChange={handleNotesChange}
      />
    </Stack>
  );
};

export default TrialStep;
