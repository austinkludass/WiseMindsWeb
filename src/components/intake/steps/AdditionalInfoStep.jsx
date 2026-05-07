import { useMemo } from "react";
import {
  Stack,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Checkbox,
} from "@mui/material";
import { getAdditionalInfoFieldErrors } from "../../../scenes/Intake/intakeUtils";

const AdditionalInfoStep = ({
  formData,
  setFormData,
  touched = {},
  setTouched = () => {},
  showAllErrors = false,
}) => {
  const fieldErrors = useMemo(
    () => getAdditionalInfoFieldErrors(formData),
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

  const handleConsentChange = (event) => {
    setFormData({ ...formData, consentAccepted: event.target.checked });
    setTouched((prev) => ({ ...prev, consentAccepted: true }));
  };

  const consentError = errorFor("consentAccepted");

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight="bold">
        Additional Information
      </Typography>

      <TextField
        name="howUserHeard"
        label="How did you hear about Wise Minds Canberra?"
        value={formData.howUserHeard}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        error={Boolean(errorFor("howUserHeard"))}
        helperText={errorFor("howUserHeard") || " "}
      />

      <TextField
        name="additionalNotes"
        label="Additional notes"
        value={formData.additionalNotes}
        onChange={handleChange}
        multiline
        minRows={3}
      />

      <FormControl required error={Boolean(consentError)}>
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
        {consentError && <FormHelperText>{consentError}</FormHelperText>}
      </FormControl>
    </Stack>
  );
};

export default AdditionalInfoStep;
