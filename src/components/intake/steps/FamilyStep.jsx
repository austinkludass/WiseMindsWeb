import { Stack } from "@mui/material";
import FamilyEmergencyStep from "./FamilyEmergencyStep";

const FamilyStep = ({
  formData,
  setFormData,
  touched,
  setTouched,
  showAllErrors,
}) => {
  return (
    <Stack spacing={4}>
      <FamilyEmergencyStep
        formData={formData}
        setFormData={setFormData}
        touched={touched}
        setTouched={setTouched}
        showAllErrors={showAllErrors}
      />
    </Stack>
  );
};

export default FamilyStep;
