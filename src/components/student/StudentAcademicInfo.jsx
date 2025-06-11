import {
  TextField,
  Typography,
  Box,
  Paper,
  IconButton,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { tokens } from "../../theme";

const StudentAcademicInfo = ({
  formData,
  setFormData,
  isEdit,
  subjects,
  setSubjects,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: "", hours: "" }]);
  };

  const removeSubject = (index) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  return (
    <Stack spacing={2}>
      {isEdit ? (
        <>
          <TextField
            fullWidth
            label="School"
            name="school"
            value={formData.school}
            onChange={handleInputChange}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Year Level"
            name="yearLevel"
            value={formData.yearLevel}
            onChange={handleInputChange}
            variant="outlined"
          />
          <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
            Please list all subjects being undertaken and tick which subjects
            you would like tutoring for:
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={addSubject}
          >
            Add Subject
          </Button>
          {subjects.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, fontStyle: "italic" }}
            >
              No subjects added yet. Click the button above to add subjects.
            </Typography>
          )}
          <Box sx={{ mb: 2 }}>
            {subjects.map((subject, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{
                  p: 2,
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <TextField
                  size="small"
                  label="Subject name"
                  value={subject.name}
                  onChange={(e) =>
                    handleSubjectChange(index, "name", e.target.value)
                  }
                  sx={{ flex: 2 }}
                />
                <TextField
                  size="small"
                  label="Hours/week"
                  type="number"
                  inputProps={{ min: 0, step: 1 }}
                  value={subject.hours}
                  onChange={(e) =>
                    handleSubjectChange(index, "hours", e.target.value)
                  }
                  sx={{ width: 120 }}
                />
                <IconButton
                  color="error"
                  onClick={() => removeSubject(index)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Paper>
            ))}
          </Box>
          <TextField
            fullWidth
            label="Additional notes about tutoring hours (optional)"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            multiline
            rows={2}
            variant="outlined"
          />
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: "10px" }}>
            <Typography
              variant="h5"
              color={colors.orangeAccent[400]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              School
            </Typography>
            <Typography variant="h6" color={colors.grey[100]}>
              {formData.school}
            </Typography>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Typography
              variant="h5"
              color={colors.orangeAccent[400]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              Year Level
            </Typography>
            <Typography variant="h6" color={colors.grey[100]}>
              {formData.yearLevel}
            </Typography>
          </div>
          <div
            style={{ display: "flex", gap: "10px", flexDirection: "column" }}
          >
            <Typography
              variant="h5"
              color={colors.orangeAccent[400]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              Subject Tutor Hours (subject / hours)
            </Typography>
            {subjects.map((subject, index) => {
              return (
                <Paper
                  key={index}
                  elevation={1}
                  sx={{
                    p: 2,
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography sx={{ flex: 2 }}>{subject.name}</Typography>
                  <Typography sx={{ width: 120 }}>{subject.hours}</Typography>
                </Paper>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Typography
              variant="h5"
              color={colors.orangeAccent[400]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              Additional Notes
            </Typography>
            <Typography variant="h6" color={colors.grey[100]}>
              {formData.notes}
            </Typography>
          </div>
        </>
      )}
    </Stack>
  );
};

export default StudentAcademicInfo;
