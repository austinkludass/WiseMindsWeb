import { useState } from "react";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import dayjs from "dayjs";

const UnavailabilitySelector = ({ unavailability, onChange }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [reason, setReason] = useState("");

  const handleAdd = () => {
    if (!selectedDate || !reason) return;

    const newEntry = {
      date: dayjs(selectedDate).format("YYYY-MM-DD"),
      reason,
    };

    onChange([...unavailability, newEntry]);
    setSelectedDate(null);
    setReason("");
  };

  const handleRemove = (index) => {
    const updated = unavailability.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <DesktopDatePicker
          label="Select Date"
          value={selectedDate}
          onChange={(newDate) => setSelectedDate(newDate)}
          renderInput={(params) => <TextField {...params} />}
        />
        <TextField
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={!selectedDate || !reason}
        >
          Add
        </Button>
      </Box>

      <List sx={{ overflow: "auto", maxHeight: "500px" }}>
        {unavailability.map((entry, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton
                color="error"
                edge="end"
                onClick={() => handleRemove(index)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText>
              <Typography>{entry.date}: {entry.reason}</Typography>
            </ListItemText>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default UnavailabilitySelector;
