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
  Box,
  Slider,
  TextField,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";

const TutorPersonalInfo = ({ formData, setFormData, isEdit }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMinMaxChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) return;

    let updatedHours = [...newValue];

    if (activeThumb === 0) {
      updatedHours[0] = Math.min(newValue[0], updatedHours[1] - 3);
    } else {
      updatedHours[1] = Math.max(newValue[1], updatedHours[0] + 3);
    }

    setFormData({ ...formData, hours: updatedHours });
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h4">Personal Information</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {isEdit ? (
            <>
              <TextField
                name="career"
                label="Career"
                value={formData.career}
                onChange={handleChange}
              />
              <TextField
                name="degree"
                label="Degree"
                value={formData.degree}
                onChange={handleChange}
              />
              <TextField
                name="position"
                label="Position"
                value={formData.position}
                onChange={handleChange}
              />
              <FormControl disabled fullWidth>
                <InputLabel id="location-select-label">
                  Home Location
                </InputLabel>
                <Select
                  name="homeLocation"
                  label="Home Location"
                  labelId="location-select-label"
                  value={formData.homeLocation}
                  onChange={handleChange}
                ></Select>
              </FormControl>
              <FormControl disabled fullWidth>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  name="role"
                  label="Role"
                  labelId="role-select-label"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <MenuItem value={"tutor"}>Tutor</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ paddingLeft: 2, paddingRight: 2 }}>
                <Typography gutterBottom>Hours</Typography>
                <Slider
                  valueLabelDisplay="auto"
                  onChange={handleMinMaxChange}
                  value={formData.hours}
                  disableSwap
                  max={60}
                  min={0}
                />
              </Box>
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
                  Career
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.career}
                </Typography>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Typography
                  variant="h5"
                  color={colors.orangeAccent[400]}
                  fontWeight="bold"
                  sx={{ mb: "5px" }}
                >
                  Degree
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.degree}
                </Typography>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Typography
                  variant="h5"
                  color={colors.orangeAccent[400]}
                  fontWeight="bold"
                  sx={{ mb: "5px" }}
                >
                  Position
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.position}
                </Typography>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Typography
                  variant="h5"
                  color={colors.orangeAccent[400]}
                  fontWeight="bold"
                  sx={{ mb: "5px" }}
                >
                  Home Location
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.homeLocation}
                </Typography>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Typography
                  variant="h5"
                  color={colors.orangeAccent[400]}
                  fontWeight="bold"
                  sx={{ mb: "5px" }}
                >
                  Role
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.role}
                </Typography>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Typography
                  variant="h5"
                  color={colors.orangeAccent[400]}
                  fontWeight="bold"
                  sx={{ mb: "5px" }}
                >
                  Hours (Min - Max)
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                {formData.hours[0]} - {formData.hours[1]}
                </Typography>
              </div>
            </>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default TutorPersonalInfo;
