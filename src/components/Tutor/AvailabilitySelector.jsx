import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import DeleteIcon from "@mui/icons-material/Delete";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function timeStringToDate(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

const AvailabilitySelector = ({
  initialAvailability,
  onAvailabilityChange,
  isEdit,
}) => {
  const [availability, setAvailability] = useState({});

  useEffect(() => {
    if (!initialAvailability) return;

    const parsed = {};
    for (const day in initialAvailability) {
      parsed[day] = initialAvailability[day].map((slot) => ({
        start:
          typeof slot.start === "string"
            ? timeStringToDate(slot.start)
            : slot.start,
        end:
          typeof slot.start === "string"
            ? timeStringToDate(slot.end)
            : slot.end,
      }));
    }

    setAvailability(parsed);
  }, [initialAvailability]);

  const updateAvailability = (newAvailability) => {
    setAvailability(newAvailability);
    if (onAvailabilityChange) onAvailabilityChange(newAvailability);
  };

  // Add a new time slot for a day
  const addTimeSlot = (day) => {
    updateAvailability((prev) => ({
      ...prev,
      [day]: [
        ...(prev[day] || []),
        {
          start: new Date().setHours(6, 0, 0, 0),
          end: new Date().setHours(22, 0, 0, 0),
        },
      ],
    }));
  };

  // Remove a time slot
  const removeTimeSlot = (day, index) => {
    updateAvailability((prev) => {
      const updatedSlots = [...(prev[day] || [])];
      updatedSlots.splice(index, 1);
      return { ...prev, [day]: updatedSlots };
    });
  };

  // Update time values
  const handleTimeChange = (day, index, type, value) => {
    if (!value) return;
    updateAvailability((prev) => {
      const updatedSlots = [...(prev[day] || [])];
      updatedSlots[index] = { ...updatedSlots[index], [type]: value };
      return { ...prev, [day]: updatedSlots };
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Day</TableCell>
              <TableCell>Available Time Slots</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {daysOfWeek.map((day) => (
              <TableRow key={day}>
                <TableCell>{day}</TableCell>
                <TableCell sx={{ width: 600, verticalAlign: "top" }}>
                  {availability[day]?.map((slot, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: "10px",
                        paddingTop: `${index === 0 ? "0px" : "15px"}`,
                      }}
                    >
                      <DesktopTimePicker
                        label="Start Time"
                        readOnly={!isEdit}
                        value={slot.start}
                        onChange={(newValue) =>
                          handleTimeChange(day, index, "start", newValue)
                        }
                        renderInput={(params) => <input {...params} />}
                      />
                      <DesktopTimePicker
                        label="End Time"
                        readOnly={!isEdit}
                        value={slot.end}
                        onChange={(newValue) =>
                          handleTimeChange(day, index, "end", newValue)
                        }
                        renderInput={(params) => <input {...params} />}
                      />
                      {isEdit && (
                        <IconButton
                          color="error"
                          onClick={() => removeTimeSlot(day, index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </div>
                  ))}
                </TableCell>
                <TableCell sx={{ verticalAlign: "top", width: 55, height: 55 }}>
                  {isEdit && (
                    <IconButton
                      sx={{ width: 55, height: 55 }}
                      color="secondary"
                    >
                      <AddCircleIcon
                        sx={{ width: 30, height: 30 }}
                        onClick={() => addTimeSlot(day)}
                      />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </LocalizationProvider>
  );
};

export default AvailabilitySelector;
