import {
  Stack,
  Grid2 as Grid,
  Typography,
  TextField,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { tokens } from "../../theme";

const StudentEmergencyInfo = ({ formData, isEdit, setFormData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item size={8}>
        <Stack spacing={2}>
          {isEdit ? (
            <>
              <TextField
                name="emergencyFirst"
                value={formData.emergencyFirst}
                onChange={handleChange}
                label="First Name"
              />
              <TextField
                name="emergencyLast"
                value={formData.emergencyLast}
                onChange={handleChange}
                label="Last Name"
              />
              <FormControl fullWidth>
                <InputLabel id="relationship-select-label">
                  Relationship
                </InputLabel>
                <Select
                  name="emergencyRelationship"
                  label="Relationship"
                  labelId="relationship-select-label"
                  value={formData.emergencyRelationship}
                  onChange={handleChange}
                >
                  <MenuItem value={"daughter"}>Daughter</MenuItem>
                  <MenuItem value={"father"}>Father</MenuItem>
                  <MenuItem value={"friend"}>Friend</MenuItem>
                  <MenuItem value={"husband"}>Husband</MenuItem>
                  <MenuItem value={"mother"}>Mother</MenuItem>
                  <MenuItem value={"partner"}>Partner</MenuItem>
                  <MenuItem value={"son"}>Son</MenuItem>
                  <MenuItem value={"wife"}>Wife</MenuItem>
                </Select>
              </FormControl>
              <TextField
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                label="Phone"
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
                  Phone
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.familyPhone}
                </Typography>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Typography
                  variant="h5"
                  color={colors.orangeAccent[400]}
                  fontWeight="bold"
                  sx={{ mb: "5px" }}
                >
                  Email
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.familyEmail}
                </Typography>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Typography
                  variant="h5"
                  color={colors.orangeAccent[400]}
                  fontWeight="bold"
                  sx={{ mb: "5px" }}
                >
                  Address
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.familyAddress}
                </Typography>
              </div>
            </>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default StudentEmergencyInfo;
