import { useState } from "react";
import {
  Stack,
  FormControlLabel,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import AvailabilitySelector from "../Tutor/AvailabilitySelector";

const StudentAvailabilityInfo = ({
  formData,
  setFormData,
  isEdit,
  availability,
  setAvailability,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleAvailabilityChange = (updatedAvailability) => {
    setAvailability(updatedAvailability);
  };

  const handleSwitchChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.checked });
  };

  return (
    <Stack spacing={2}>
      {isEdit ? (
        <>
          <FormControlLabel
            control={
              <Switch
                id="isSameAsTrial"
                checked={formData.isSameAsTrial}
                onChange={handleSwitchChange}
              />
            }
            label="Same availability as above"
          />
          {!formData.isSameAsTrial && (
            <AvailabilitySelector
              onAvailabilityChange={handleAvailabilityChange}
              initialAvailability={availability}
              isEdit={true}
            />
          )}
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
              Same as above?
            </Typography>
            <Typography variant="h6" color={colors.grey[100]}>
              {formData.isSameAsTrial ? "Yes" : "No"}
            </Typography>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <AvailabilitySelector
              onAvailabilityChange={() => {}}
              initialAvailability={availability}
              isEdit={false}
            />
          </div>
        </>
      )}
    </Stack>
  );
};

export default StudentAvailabilityInfo;
