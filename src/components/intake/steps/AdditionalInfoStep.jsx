import { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../data/firebase";
import StudentAdditionalInfo from "../../student/StudentAdditionalInfo";

const AdditionalInfoStep = ({ formData, setFormData }) => {
  const [locations, setLocations] = useState([]);
  const [locationError, setLocationError] = useState("");

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
        setLocationError("Unable to load locations right now.");
      }
    };

    fetchLocations();
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleConsentChange = (event) => {
    setFormData({ ...formData, consentAccepted: event.target.checked });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight="bold">
        Additional Information
      </Typography>
      <StudentAdditionalInfo
        formData={formData}
        setFormData={setFormData}
        isEdit={true}
      />

      <TextField
        name="additionalNotes"
        label="Additional notes"
        value={formData.additionalNotes}
        onChange={handleChange}
        multiline
        minRows={3}
      />

      <Typography variant="h6">Location & Pricing</Typography>
      <FormControl fullWidth>
        <InputLabel id="home-location-label">Preferred Location</InputLabel>
        <Select
          labelId="home-location-label"
          name="homeLocation"
          label="Preferred Location"
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
      {locationError && <Alert severity="warning">{locationError}</Alert>}

      <TextField
        name="baseRate"
        label="Expected hourly rate (AUD)"
        type="number"
        inputProps={{ min: 0, step: 1 }}
        value={formData.baseRate}
        onChange={handleChange}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.consentAccepted}
            onChange={handleConsentChange}
          />
        }
        label={
          <Typography variant="body2">
            I agree to the Wise Minds terms and conditions. You can read them at{" "}
            <a
              href="https://www.wisemindscanberra.com/terms-and-conditions"
              target="_blank"
              rel="noreferrer"
            >
              this link
            </a>
            .
          </Typography>
        }
      />
    </Stack>
  );
};

export default AdditionalInfoStep;
