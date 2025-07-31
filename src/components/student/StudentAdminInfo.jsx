import { useState, useEffect } from "react";
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
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../data/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentAdminInfo = ({ formData, setFormData, isEdit }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const snapshot = await getDocs(collection(db, "locations"));
        const locs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLocations(locs);
      } catch (error) {
        toast.error("Error fetching locations: ", error);
      }
    };

    fetchLocations();
  });

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
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name}
                </MenuItem>
              ))}
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
            {locations.length === 0 ? (
              <Typography variant="h6" color={colors.grey[100]}>
                Loading ...
              </Typography>
            ) : (
              <Typography variant="h6" color={colors.grey[100]}>
                {locations.find((loc) => loc.id === formData.homeLocation)
                  ?.name || "Unknown Location"}
              </Typography>
            )}
          </div>
        </>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </Stack>
  );
};

export default StudentAdminInfo;
