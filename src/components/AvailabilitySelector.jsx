import React, { useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import DeleteIcon from "@mui/icons-material/Delete";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AvailabilitySelector = ({ tutorId }) => {
  const [availability, setAvailability] = useState({});

  // Add a new time slot for a day
  const addTimeSlot = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { start: new Date(), end: new Date() }],
    }));
  };

  // Remove a time slot
  const removeTimeSlot = (day, index) => {
    setAvailability((prev) => {
      const updatedSlots = [...(prev[day] || [])];
      updatedSlots.splice(index, 1);
      return { ...prev, [day]: updatedSlots };
    });
  };

  // Update time values
  const handleTimeChange = (day, index, type, value) => {
    if (!value) return;
    setAvailability((prev) => {
      const updatedSlots = [...(prev[day] || [])];
      updatedSlots[index] = { ...updatedSlots[index], [type]: value };
      return { ...prev, [day]: updatedSlots };
    });
  };

  // Save to Firestore
  const saveAvailability = async () => {
    
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Day</TableCell>
              <TableCell>Available Time Slots</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {daysOfWeek.map((day) => (
              <TableRow key={day}>
                <TableCell>{day}</TableCell>
                <TableCell>
                  {availability[day]?.map((slot, index) => (
                    <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                      <TimePicker
                        label="Start Time"
                        value={slot.start}
                        onChange={(newValue) => handleTimeChange(day, index, "start", newValue)}
                        renderInput={(params) => <input {...params} />}
                      />
                      <TimePicker
                        label="End Time"
                        value={slot.end}
                        onChange={(newValue) => handleTimeChange(day, index, "end", newValue)}
                        renderInput={(params) => <input {...params} />}
                      />
                      <IconButton color="secondary" onClick={() => removeTimeSlot(day, index)}>
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => addTimeSlot(day)}>
                    + Add Time Slot
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button sx={{ mt: 2 }} variant="contained" color="success" onClick={saveAvailability}>
        Save Availability
      </Button>
    </LocalizationProvider>
  );
};

export default AvailabilitySelector;


// Data structure stored in firebase
// {
//   "tutorId": "abc123",
//   "weeklyAvailability": {
//     "Monday": [{ "start": "09:00", "end": "17:00" }],
//     "Tuesday": [{ "start": "10:00", "end": "15:00" }],
//     "Wednesday": [],
//     "Thursday": [{ "start": "08:00", "end": "12:00" }, { "start": "14:00", "end": "18:00" }],
//     "Friday": [{ "start": "09:00", "end": "13:00" }],
//     "Saturday": [],
//     "Sunday": []
//   },
//   "specificUnavailability": [
//     { "date": "2025-02-20", "reason": "Vacation" },
//     { "date": "2025-03-05", "reason": "Doctor Appointment" }
//   ]
// }