import { Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import StudentGeneralInfo from "../../student/StudentGeneralInfo";

const StudentBasicsStep = ({
  formData,
  setFormData,
  touched,
  setTouched,
  readOnlyIdentity = false,
}) => {
  const fullName = [formData.firstName, formData.middleName, formData.lastName]
    .filter(Boolean)
    .join(" ");
  const dobLabel = formData.dateOfBirth
    ? dayjs(formData.dateOfBirth).format("MMMM D, YYYY")
    : "N/A";

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight="bold">
        General Student Information
      </Typography>
      {readOnlyIdentity && (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" color="text.secondary">
            Student Name
          </Typography>
          <Typography variant="body1">
            {fullName || "Unknown student"}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Date of Birth
          </Typography>
          <Typography variant="body1">{dobLabel}</Typography>
        </Stack>
      )}
      <StudentGeneralInfo
        formData={formData}
        setFormData={setFormData}
        touched={touched}
        setTouched={setTouched}
        isEdit={true}
        hideFields={
          readOnlyIdentity
            ? ["firstName", "middleName", "lastName", "dateOfBirth"]
            : []
        }
      />
    </Stack>
  );
};

export default StudentBasicsStep;
