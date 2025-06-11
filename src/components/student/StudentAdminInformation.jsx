import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";

const StudentAdminInformation = ({ formData, setFormData, isEdit }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
    <Stack spacing={2}>
      {isEdit ? (
        <>
          <FormControl fullWidth>
            <InputLabel id="homelocation-select-label">
              Home Location
            </InputLabel>
            <Select
              name="homeLocation"
              label="Home Location"
              labelId="homelocation-select-label"
              value={formData.homeLocation}
              onChange={handleChange}
            >
              <MenuItem selected value={"belconnen"}>
                Belconnen
              </MenuItem>
            </Select>
          </FormControl>
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
              Home Location
            </Typography>
            <Typography variant="h6" color={colors.grey[100]}>
              {formData.homeLocation}
            </Typography>
          </div>
        </>
      )}
    </Stack>
  );
};

export default StudentAdminInformation;
