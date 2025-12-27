import { useEffect } from "react";
import {
  Stack,
  Typography,
  TextField,
  Grid2 as Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
} from "@mui/material";

const relationshipOptions = [
  "Mother",
  "Father",
  "Guardian",
  "Sibling",
  "Grandparent",
  "Friend",
  "Other",
];

const splitName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
};

const FamilyEmergencyStep = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUsePrimaryChange = (event) => {
    const checked = event.target.checked;
    setFormData((prev) => {
      if (!checked) {
        return { ...prev, usePrimaryAsEmergency: false };
      }

      const { first, last } = splitName(prev.parentName);
      return {
        ...prev,
        usePrimaryAsEmergency: true,
        emergencyFirst: first,
        emergencyLast: last,
        emergencyPhone: prev.familyPhone,
        emergencyRelationship: "Guardian",
        emergencyRelationshipOther: "",
      };
    });
  };

  useEffect(() => {
    if (!formData.usePrimaryAsEmergency) return;
    setFormData((prev) => {
      if (!prev.usePrimaryAsEmergency) return prev;

      const { first, last } = splitName(prev.parentName);
      if (
        prev.emergencyFirst === first &&
        prev.emergencyLast === last &&
        prev.emergencyPhone === prev.familyPhone
      ) {
        return prev;
      }

      return {
        ...prev,
        emergencyFirst: first,
        emergencyLast: last,
        emergencyPhone: prev.familyPhone,
      };
    });
  }, [formData.parentName, formData.familyPhone, formData.usePrimaryAsEmergency, setFormData]);

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight="bold">
          Parent or Guardian Details
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="parentName"
              label="Primary Guardian Full Name"
              value={formData.parentName}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="familyEmail"
              label="Primary Guardian Email"
              value={formData.familyEmail}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="familyPhone"
              label="Primary Guardian Phone"
              value={formData.familyPhone}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="familyAddress"
              label="Home Address"
              value={formData.familyAddress}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
        </Grid>

        <Typography variant="subtitle1" color="text.secondary">
          Optional secondary contact
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="secondaryContactName"
              label="Secondary Guardian Name"
              value={formData.secondaryContactName}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="secondaryContactEmail"
              label="Secondary Guardian Email"
              value={formData.secondaryContactEmail}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="secondaryContactPhone"
              label="Secondary Guardian Phone"
              value={formData.secondaryContactPhone}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="h6">Family Scheduling Preference</Typography>
            <Typography variant="body2" color="text.secondary">
              Let us know if siblings should be scheduled together or if you are
              flexible.
            </Typography>
            <RadioGroup
              name="schedulePreference"
              value={formData.schedulePreference}
              onChange={handleChange}
            >
              <FormControlLabel
                value="same_time_within_hour"
                control={<Radio />}
                label="Prefer siblings at the same time (±1 hour)"
              />
              <FormControlLabel
                value="same_day"
                control={<Radio />}
                label="Prefer siblings on the same day"
              />
              <FormControlLabel
                value="no_preference"
                control={<Radio />}
                label="No preference"
              />
            </RadioGroup>
          </Stack>
        </Paper>
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h5" fontWeight="bold">
          Emergency Contact
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.usePrimaryAsEmergency}
              onChange={handleUsePrimaryChange}
            />
          }
          label="Use primary guardian as the emergency contact"
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="emergencyFirst"
              label="First Name"
              value={formData.emergencyFirst}
              onChange={handleChange}
              required
              fullWidth
              disabled={formData.usePrimaryAsEmergency}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="emergencyLast"
              label="Last Name"
              value={formData.emergencyLast}
              onChange={handleChange}
              required
              fullWidth
              disabled={formData.usePrimaryAsEmergency}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth required>
              <InputLabel id="emergency-relationship-label">
                Relationship
              </InputLabel>
              <Select
                labelId="emergency-relationship-label"
                name="emergencyRelationship"
                value={formData.emergencyRelationship}
                label="Relationship"
                onChange={handleChange}
                disabled={formData.usePrimaryAsEmergency}
              >
                {relationshipOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="emergencyPhone"
              label="Phone"
              value={formData.emergencyPhone}
              onChange={handleChange}
              required
              fullWidth
              disabled={formData.usePrimaryAsEmergency}
            />
          </Grid>
          {!formData.usePrimaryAsEmergency &&
            formData.emergencyRelationship === "Other" && (
            <Grid size={{ xs: 12 }}>
              <TextField
                name="emergencyRelationshipOther"
                label="Please specify relationship"
                value={formData.emergencyRelationshipOther}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          )}
        </Grid>
      </Stack>
    </Stack>
  );
};

export default FamilyEmergencyStep;
