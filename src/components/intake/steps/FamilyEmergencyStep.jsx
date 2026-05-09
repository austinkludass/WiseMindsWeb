import { useEffect, useMemo } from "react";
import {
  Stack,
  Typography,
  TextField,
  Grid2 as Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import FamilySchedulingPreference from "./FamilySchedulingPreference";
import { getFamilyFieldErrors } from "../../../scenes/Intake/intakeUtils";

const relationshipOptions = [
  "Mother",
  "Father",
  "Guardian",
  "Sibling",
  "Grandparent",
  "Friend",
  "Other",
];

const splitName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
};

const FamilyEmergencyStep = ({
  formData,
  setFormData,
  touched = {},
  setTouched = () => {},
  showAllErrors = false,
}) => {
  const fieldErrors = useMemo(() => getFamilyFieldErrors(formData), [formData]);

  const errorFor = (field) => {
    if (!fieldErrors[field]) return "";
    if (showAllErrors || touched[field]) return fieldErrors[field];
    return "";
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleUsePrimaryChange = (event) => {
    const checked = event.target.checked;
    setFormData((prev) => {
      if (!checked) {
        return { ...prev, usePrimaryAsEmergency: false };
      }

      const { first, last } = splitName(prev.parentName);
      return {
        ...prev,
        usePrimaryAsEmergency: true,
        emergencyFirst: first,
        emergencyLast: last,
        emergencyPhone: prev.familyPhone,
        emergencyRelationship: "Guardian",
        emergencyRelationshipOther: "",
      };
    });
  };

  const handleSecondarySameAddressChange = (event) => {
    const checked = event.target.checked;
    setFormData((prev) => ({
      ...prev,
      secondaryContactSameAddress: checked,
      secondaryContactAddress: checked ? prev.familyAddress : prev.secondaryContactAddress,
    }));
  };

  useEffect(() => {
    if (!formData.usePrimaryAsEmergency) return;
    setFormData((prev) => {
      if (!prev.usePrimaryAsEmergency) return prev;

      const { first, last } = splitName(prev.parentName);
      if (
        prev.emergencyFirst === first &&
        prev.emergencyLast === last &&
        prev.emergencyPhone === prev.familyPhone
      ) {
        return prev;
      }

      return {
        ...prev,
        emergencyFirst: first,
        emergencyLast: last,
        emergencyPhone: prev.familyPhone,
      };
    });
  }, [formData.parentName, formData.familyPhone, formData.usePrimaryAsEmergency, setFormData]);

  useEffect(() => {
    if (!formData.secondaryContactSameAddress) return;
    setFormData((prev) => {
      if (!prev.secondaryContactSameAddress) return prev;
      if (prev.secondaryContactAddress === prev.familyAddress) return prev;
      return {
        ...prev,
        secondaryContactAddress: prev.familyAddress,
      };
    });
  }, [formData.familyAddress, formData.secondaryContactSameAddress, setFormData]);

  const relationshipError = errorFor("emergencyRelationship");

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight="bold">
          Parent or Guardian Details
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: "1.05rem" }}
        >
          The Primary guardian is the main point of contact for a family. They
          will receive reports, invoices and other communications directly from
          us.
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
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
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="familyEmail"
              label="Primary Guardian Email"
              value={formData.familyEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              fullWidth
              error={Boolean(errorFor("familyEmail"))}
              helperText={errorFor("familyEmail") || " "}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="familyPhone"
              label="Primary Guardian Phone"
              value={formData.familyPhone}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              fullWidth
              error={Boolean(errorFor("familyPhone"))}
              helperText={errorFor("familyPhone") || " "}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="familyAddress"
              label="Home Address"
              value={formData.familyAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              fullWidth
              error={Boolean(errorFor("familyAddress"))}
              helperText={errorFor("familyAddress") || " "}
            />
          </Grid>
        </Grid>

        <Typography variant="h5" fontWeight="bold">
          Optional secondary contact
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: "1.05rem" }}
        >
          A secondary guardian will also receive a copy of student reports,
          invoices and email communications.
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="secondaryContactName"
              label="Secondary Guardian Name"
              value={formData.secondaryContactName}
              onChange={handleChange}
              fullWidth
              helperText=" "
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="secondaryContactEmail"
              label="Secondary Guardian Email"
              value={formData.secondaryContactEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              error={Boolean(errorFor("secondaryContactEmail"))}
              helperText={errorFor("secondaryContactEmail") || " "}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="secondaryContactPhone"
              label="Secondary Guardian Phone"
              value={formData.secondaryContactPhone}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              error={Boolean(errorFor("secondaryContactPhone"))}
              helperText={errorFor("secondaryContactPhone") || " "}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="secondaryContactAddress"
              label="Secondary Guardian Address"
              value={formData.secondaryContactAddress}
              onChange={handleChange}
              fullWidth
              disabled={formData.secondaryContactSameAddress}
              helperText=" "
            />
          </Grid>
        </Grid>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.secondaryContactSameAddress}
              onChange={handleSecondarySameAddressChange}
            />
          }
          label="Secondary guardian address is the same as primary"
        />

        <FamilySchedulingPreference
          formData={formData}
          setFormData={setFormData}
        />
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h5" fontWeight="bold">
          Emergency Contact
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.usePrimaryAsEmergency}
              onChange={handleUsePrimaryChange}
            />
          }
          label="Use primary guardian as the emergency contact"
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="emergencyFirst"
              label="First Name"
              value={formData.emergencyFirst}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              fullWidth
              disabled={formData.usePrimaryAsEmergency}
              error={Boolean(errorFor("emergencyFirst"))}
              helperText={errorFor("emergencyFirst") || " "}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="emergencyLast"
              label="Last Name"
              value={formData.emergencyLast}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              fullWidth
              disabled={formData.usePrimaryAsEmergency}
              error={Boolean(errorFor("emergencyLast"))}
              helperText={errorFor("emergencyLast") || " "}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl
              fullWidth
              required
              error={Boolean(relationshipError)}
              disabled={formData.usePrimaryAsEmergency}
            >
              <InputLabel id="emergency-relationship-label">
                Relationship
              </InputLabel>
              <Select
                labelId="emergency-relationship-label"
                name="emergencyRelationship"
                value={formData.emergencyRelationship}
                label="Relationship"
                onChange={handleChange}
                onBlur={handleBlur}
              >
                {relationshipOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{relationshipError || " "}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="emergencyPhone"
              label="Phone"
              value={formData.emergencyPhone}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              fullWidth
              disabled={formData.usePrimaryAsEmergency}
              error={Boolean(errorFor("emergencyPhone"))}
              helperText={errorFor("emergencyPhone") || " "}
            />
          </Grid>
          {!formData.usePrimaryAsEmergency &&
            formData.emergencyRelationship === "Other" && (
            <Grid size={{ xs: 12 }}>
              <TextField
                name="emergencyRelationshipOther"
                label="Please specify relationship"
                value={formData.emergencyRelationshipOther}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                required
                error={Boolean(errorFor("emergencyRelationshipOther"))}
                helperText={errorFor("emergencyRelationshipOther") || " "}
              />
            </Grid>
          )}
        </Grid>
      </Stack>
    </Stack>
  );
};

export default FamilyEmergencyStep;
