import {
  Stack,
  Grid2 as Grid,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { tokens } from "../../theme";

const StudentGeneralInfo = ({
  formData,
  isEdit,
  setFormData,
  touched = {},
  setTouched = () => {},
  hideFields = [],
  errors = {},
  showAllErrors = false,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const errorFor = (field) => {
    if (!errors?.[field]) return "";
    return showAllErrors || touched?.[field] ? errors[field] : "";
  };
  const isHidden = (field) => hideFields.includes(field);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handleDateChange = (name) => (date) => {
    setFormData({ ...formData, [name]: date });
    setTouched({ ...touched, [name]: true });
  };

  const handleSwitchChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.checked });
  };

  return (
    <Stack spacing={2}>
      {isEdit ? (
        <>
          {!isHidden("firstName") && (
            <TextField
              name="firstName"
              value={formData.firstName ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              label="First Name"
              error={Boolean(errorFor("firstName"))}
              helperText={errorFor("firstName") || " "}
            />
          )}
          {!isHidden("middleName") && (
            <TextField
              name="middleName"
              value={formData.middleName ?? ""}
              onChange={handleChange}
              label="Middle Name"
            />
          )}
          {!isHidden("lastName") && (
            <TextField
              name="lastName"
              value={formData.lastName ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              label="Last Name"
              error={Boolean(errorFor("lastName"))}
              helperText={errorFor("lastName") || " "}
            />
          )}
          {!isHidden("dateOfBirth") && (
            <DatePicker
              value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
              onChange={handleDateChange("dateOfBirth")}
              label="Date of Birth"
              slotProps={{
                textField: {
                  name: "dateOfBirth",
                  onBlur: handleBlur,
                  required: true,
                  error: Boolean(errorFor("dateOfBirth")),
                  helperText: errorFor("dateOfBirth") || " ",
                },
              }}
            />
          )}
          <TextField
            name="allergiesNonAna"
            value={formData.allergiesNonAna ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            label="Allergies (Non-Anaphylactic)"
            required={Boolean(errors?.allergiesNonAna)}
            error={Boolean(errorFor("allergiesNonAna"))}
            helperText={errorFor("allergiesNonAna") || " "}
          />
          <TextField
            name="allergiesAna"
            value={formData.allergiesAna ?? ""}
            onChange={handleChange}
            label="Allergies (Anaphylactic)"
          />
          <FormControlLabel
            style={{ marginLeft: "50px" }}
            control={
              <Switch
                id="doesCarryEpi"
                checked={formData.doesCarryEpi ?? false}
                onChange={handleSwitchChange}
              />
            }
            label="Does the student carry an EPI Pen?"
          />
          <FormControlLabel
            style={{ marginLeft: "50px" }}
            control={
              <Switch
                id="doesAdminEpi"
                checked={formData.doesAdminEpi ?? false}
                onChange={handleSwitchChange}
              />
            }
            label="Can the student administer THEIR EPI Pen?"
          />
        </>
      ) : (
        <>
          {!isHidden("firstName") && (
            <div style={{ display: "flex", gap: "10px" }}>
              <Typography
                variant="h5"
                color={colors.orangeAccent[400]}
                fontWeight="bold"
                sx={{ mb: "5px" }}
              >
                First Name
              </Typography>
              <Typography variant="h6" color={colors.grey[100]}>
                {formData.firstName}
              </Typography>
            </div>
          )}
          {!isHidden("middleName") && (
            <div style={{ display: "flex", gap: "10px" }}>
              <Typography
                variant="h5"
                color={colors.orangeAccent[400]}
                fontWeight="bold"
                sx={{ mb: "5px" }}
              >
                Middle Name
              </Typography>
              <Typography variant="h6" color={colors.grey[100]}>
                {formData.middleName}
              </Typography>
            </div>
          )}
          {!isHidden("lastName") && (
            <div style={{ display: "flex", gap: "10px" }}>
              <Typography
                variant="h5"
                color={colors.orangeAccent[400]}
                fontWeight="bold"
                sx={{ mb: "5px" }}
              >
                Last Name
              </Typography>
              <Typography variant="h6" color={colors.grey[100]}>
                {formData.lastName}
              </Typography>
            </div>
          )}
          {!isHidden("dateOfBirth") && (
            <div style={{ display: "flex", gap: "10px" }}>
              <Typography
                variant="h5"
                color={colors.orangeAccent[400]}
                fontWeight="bold"
                sx={{ mb: "5px" }}
              >
                Date of Birth
              </Typography>
              <Typography variant="h6" color={colors.grey[100]}>
                {formData.dateOfBirth
                  ? dayjs(formData.dateOfBirth).format("MMMM D, YYYY")
                  : "N/A"}
              </Typography>
            </div>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <Typography
              variant="h5"
              color={colors.orangeAccent[400]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              Allergies (Non-Anaphylactic)
            </Typography>
            <Typography variant="h6" color={colors.grey[100]}>
              {formData.allergiesNonAna}
            </Typography>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Typography
              variant="h5"
              color={colors.orangeAccent[400]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              Carries EPI Pen?
            </Typography>
            <Typography variant="h6" color={colors.grey[100]}>
              {formData.doesCarryEpi ? "Yes" : "No"}
            </Typography>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Typography
              variant="h5"
              color={colors.orangeAccent[400]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              Administers own EPI Pen?
            </Typography>
            <Typography variant="h6" color={colors.grey[100]}>
              {formData.doesAdminEpi ? "Yes" : "No"}
            </Typography>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Typography
              variant="h5"
              color={colors.orangeAccent[400]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              Allergies (Anaphylactic)
            </Typography>
            <Typography variant="h6" color={colors.grey[100]}>
              {formData.allergiesAna}
            </Typography>
          </div>
        </>
      )}
    </Stack>
  );
};

export default StudentGeneralInfo;
