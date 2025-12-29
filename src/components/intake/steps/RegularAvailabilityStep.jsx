import { Stack, Typography } from "@mui/material";
import StudentAvailabilityInfo from "../../student/StudentAvailabilityInfo";

const RegularAvailabilityStep = ({ availability, setAvailability }) => {
  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight="bold">
        Regular Availability
      </Typography>
      <Typography variant="body2" color="text.secondary">
        The regular availability is the times that your child is available on a
        weekly basis for tutoring. This will influence our tutor selection. The
        more availability you have, the better chance we find the best possible
        tutor!
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
