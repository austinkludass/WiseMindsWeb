import AvailabilitySelector from "../Tutor/AvailabilitySelector";
import studentAvailabilityBounds from "./studentAvailabilityBounds";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { FormHelperText, Typography, useTheme, Stack } from "@mui/material";
import { tokens } from "../../theme";

const StudentTrialInfo = ({
  formData,
  setFormData,
  isEdit,
  trialAvailability,
  setTrialAvailability,
  touched = {},
  setTouched = () => {},
  errors = {},
  showAllErrors = false,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const errorFor = (field) => {
    if (!errors?.[field]) return "";
    return showAllErrors || touched?.[field] ? errors[field] : "";
  };

  const handleTrialAvailabilityChange = (updatedAvailability) => {
    setTrialAvailability(updatedAvailability);
    if (!touched?.trialAvailability) {
      setTouched({ ...touched, trialAvailability: true });
    }
  };

  const handleDateChange = (name) => (date) => {
    setFormData({ ...formData, [name]: date });
    setTouched({ ...touched, [name]: true });
  };

  const handlePreferredStartBlur = () => {
    setTouched({ ...touched, preferredStart: true });
  };

  const trialAvailabilityError = errorFor("trialAvailability");
  const preferredStartError = errorFor("preferredStart");

  return (
    <Stack spacing={2}>
      {isEdit ? (
        <>
          <Stack spacing={0.5}>
            <AvailabilitySelector
              onAvailabilityChange={handleTrialAvailabilityChange}
              initialAvailability={trialAvailability}
              isEdit={true}
              dayTimeBounds={studentAvailabilityBounds}
            />
            {trialAvailabilityError && (
              <FormHelperText error>{trialAvailabilityError}</FormHelperText>
            )}
          </Stack>
          <DatePicker
            value={formData.preferredStart ? dayjs(formData.preferredStart) : null}
            onChange={handleDateChange("preferredStart")}
            label="Preferred Start Date"
            slotProps={{
              textField: {
                name: "preferredStart",
                onBlur: handlePreferredStartBlur,
                required: Boolean(errors?.preferredStart),
                error: Boolean(preferredStartError),
                helperText: preferredStartError || " ",
              },
            }}
          />
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: "10px" }}>
            <AvailabilitySelector
              onAvailabilityChange={() => {}}
              initialAvailability={trialAvailability}
              isEdit={false}
              dayTimeBounds={studentAvailabilityBounds}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Typography
              variant="h5"
              color={colors.orangeAccent[400]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              Preferred Start
            </Typography>
            <Typography variant="h6" color={colors.grey[100]}>
              {formData.preferredStart
                ? dayjs(formData.preferredStart).format("MMMM D, YYYY")
                : "N/A"}
            </Typography>
          </div>
        </>
      )}
    </Stack>
  );
};

export default StudentTrialInfo;
