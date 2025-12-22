import {
  Stack,
  Typography,
  TextField,
  Grid2 as Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

const FamilyEmergencyStep = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight="bold">
          Parent or Guardian Details
        </Typography>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <TextField
              name="parentName"
              label="Primary Guardian Full Name"
              value={formData.parentName}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              name="familyEmail"
              label="Primary Guardian Email"
              value={formData.familyEmail}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              name="familyPhone"
              label="Primary Guardian Phone"
              value={formData.familyPhone}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={6}>
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
          <Grid xs={12} md={4}>
            <TextField
              name="secondaryContactName"
              label="Secondary Guardian Name"
              value={formData.secondaryContactName}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              name="secondaryContactEmail"
              label="Secondary Guardian Email"
              value={formData.secondaryContactEmail}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              name="secondaryContactPhone"
              label="Secondary Guardian Phone"
              value={formData.secondaryContactPhone}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h5" fontWeight="bold">
          Emergency Contact
        </Typography>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <TextField
              name="emergencyFirst"
              label="First Name"
              value={formData.emergencyFirst}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              name="emergencyLast"
              label="Last Name"
              value={formData.emergencyLast}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={6}>
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
              >
                {relationshipOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              name="emergencyPhone"
              label="Phone"
              value={formData.emergencyPhone}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          {formData.emergencyRelationship === "Other" && (
            <Grid xs={12}>
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
