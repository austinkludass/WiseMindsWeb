import { Stack, Typography } from "@mui/material";
import StudentAvailabilityInfo from "../../student/StudentAvailabilityInfo";

const RegularAvailabilityStep = ({ availability, setAvailability }) => {
  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight="bold">
        Regular Availability
      </Typography>
      <StudentAvailabilityInfo
        isEdit={true}
        availability={availability}
        setAvailability={setAvailability}
      />
    </Stack>
  );
};

export default RegularAvailabilityStep;
