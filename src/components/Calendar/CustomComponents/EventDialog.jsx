import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { Delete, Edit } from "@mui/icons-material";

const EventDialog = ({ event, onClose, onEdit, onDelete }) => {
  if (!event) return null;

  return (
    <Dialog open={!!event} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: event.color || "primary.main",
        }}
      >
        <Typography variant="h4" color="white">
          {event.subject || "Lesson Details"}
        </Typography>
        <Box>
          <IconButton sx={{ color: "white" }} onClick={() => onEdit?.(event)}>
            <Edit />
          </IconButton>
          <IconButton sx={{ color: "white" }} onClick={() => onDelete?.(event)}>
            <Delete />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {dayjs(event.start).format("dddd, MMMM D, YYYY")}
            </Typography>
            <Typography variant="body2">
              {dayjs(event.start).format("h:mm A")} -{" "}
              {dayjs(event.end).format("h:mm A")}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Tutor
            </Typography>
            <Chip
              label={event.tutor}
              sx={{
                backgroundColor: event.color,
                color: "white",
              }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Students
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {event.students?.map((student, i) => (
                <Chip key={i} label={student} />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Location
            </Typography>
            <Typography>{event.location}</Typography>
          </Box>

          {event.notes && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Notes
              </Typography>
              <Typography>{event.notes}</Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <Box display="flex" justifyContent="flex-end" p={2}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </Box>
    </Dialog>
  );
};

export default EventDialog;
