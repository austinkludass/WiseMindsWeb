import { Stack, Typography } from "@mui/material";
import StudentGeneralInfo from "../../student/StudentGeneralInfo";

const StudentBasicsStep = ({ formData, setFormData, touched, setTouched }) => {
  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight="bold">
        General Student Information
      </Typography>
      <StudentGeneralInfo
        formData={formData}
        setFormData={setFormData}
        touched={touched}
        setTouched={setTouched}
        isEdit={true}
      />
    </Stack>
  );
};

export default StudentBasicsStep;
