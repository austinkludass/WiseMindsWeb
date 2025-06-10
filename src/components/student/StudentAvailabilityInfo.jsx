import { useState } from "react";
import { Stack, FormControlLabel, Switch } from "@mui/material";
import AvailabilitySelector from "../Tutor/AvailabilitySelector";

const StudentAvailabilityInfo = ({
  formData,
  setFormData,
  isEdit,
  availability,
  setAvailability,
}) => {
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
              isEdit={true}
            />
          )}
        </>
      ) : (
        <></>
      )}
    </Stack>
  );
};

export default StudentAvailabilityInfo;
