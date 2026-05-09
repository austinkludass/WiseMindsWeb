import { useMemo } from "react";
import { Stack, Typography, TextField } from "@mui/material";
import FamilySchedulingPreference from "./FamilySchedulingPreference";
import { getExistingFamilyFieldErrors } from "../../../scenes/Intake/intakeUtils";

const ExistingFamilyStep = ({
  formData,
  setFormData,
  touched = {},
  setTouched = () => {},
  showAllErrors = false,
}) => {
  const fieldErrors = useMemo(
    () => getExistingFamilyFieldErrors(formData),
    [formData]
  );

  const errorFor = (field) => {
    if (!fieldErrors[field]) return "";
    if (showAllErrors || touched[field]) return fieldErrors[field];
    return "";
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight="bold">
        Family Details
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Update the primary guardian details for this family before continuing.
      </Typography>
      <TextField
        name="parentName"
        label="Primary Guardian Full Name"
        value={formData.parentName}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        fullWidth
        error={Boolean(errorFor("parentName"))}
        helperText={errorFor("parentName") || " "}
      />
      <TextField
        name="parentEmail"
        label="Primary Guardian Email"
        type="email"
        value={formData.parentEmail}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        fullWidth
        error={Boolean(errorFor("parentEmail"))}
        helperText={errorFor("parentEmail") || " "}
      />
      <FamilySchedulingPreference
        formData={formData}
        setFormData={setFormData}
      />
    </Stack>
  );
};

export default ExistingFamilyStep;
