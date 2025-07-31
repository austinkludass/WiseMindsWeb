import { Stack } from "@mui/material";
import AvailabilitySelector from "../Tutor/AvailabilitySelector";

const StudentAvailabilityInfo = ({ isEdit, availability, setAvailability }) => {
  const handleAvailabilityChange = (updatedAvailability) => {
    setAvailability(updatedAvailability);
  };

  return (
    <Stack spacing={2}>
      {isEdit ? (
        <>
          <AvailabilitySelector
            onAvailabilityChange={handleAvailabilityChange}
            initialAvailability={availability}
            isEdit={true}
          />
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: "10px" }}>
            <AvailabilitySelector
              onAvailabilityChange={() => {}}
              initialAvailability={availability}
              isEdit={false}
            />
          </div>
        </>
      )}
    </Stack>
  );
};

export default StudentAvailabilityInfo;
