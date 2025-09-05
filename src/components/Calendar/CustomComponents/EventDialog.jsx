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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import {
  Delete,
  Edit,
  CalendarMonthOutlined,
  SchoolOutlined,
  GroupsOutlined,
  LocationOnOutlined,
  SpeakerNotesOutlined,
  RepeatOutlined,
  ArrowBack,
} from "@mui/icons-material";
import { useState } from "react";
import LessonForm from "../../Lesson/LessonForm";

const StyledIconBox = ({ children }) => (
  <Box
    sx={{
      padding: "4px",
      backgroundColor: "primary.highlight",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "primary.main",
    }}
  >
    {children}
  </Box>
);

const EventDialog = ({ event, onClose, onEdit, onDelete }) => {
  const [mode, setMode] = useState("view");
  if (!event) return null;

  const handleBack = () => setMode("view");
  const handleEdit = () => setMode("edit");

  return (
    <Dialog open={!!event} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: event.tutorColor || "primary.main",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          {mode === "edit" && (
            <IconButton sx={{ color: "white" }} onClick={handleBack}>
              <ArrowBack />
            </IconButton>
          )}
          <Typography variant="h4" color="white">
            {mode === "edit"
              ? "Edit Lesson"
              : event.subjectGroupName || "Lesson Details"}
          </Typography>
        </Box>

        {mode === "view" && (
          <Box>
            <IconButton sx={{ color: "white" }} onClick={handleEdit}>
              <Edit />
            </IconButton>
            <IconButton
              sx={{ color: "white" }}
              onClick={() => onDelete?.(event)}
            >
              <Delete />
            </IconButton>
          </Box>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {mode === "view" ? (
          <Stack spacing={2}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center" gap={1}>
                <StyledIconBox>
                  <CalendarMonthOutlined fontSize="large" />
                </StyledIconBox>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {dayjs(event.start).format("dddd, MMMM D, YYYY")}
                  </Typography>
                  <Typography variant="body2">
                    {dayjs(event.start).format("h:mm A")} -{" "}
                    {dayjs(event.end).format("h:mm A")}
                  </Typography>
                </Box>
              </Box>
              {event.frequency && (
                <Tooltip title={`Repeats ${event.frequency ?? ""}`}>
                  <RepeatOutlined />
                </Tooltip>
              )}
            </Box>

            <Divider />

            <Box display="flex" alignItems="center" gap={1}>
              <StyledIconBox>
                <SchoolOutlined fontSize="large" />
              </StyledIconBox>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tutor
                </Typography>
                <Chip
                  label={event.tutorName}
                  sx={{
                    backgroundColor: event.tutorColor,
                    color: "white",
                  }}
                />
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <StyledIconBox>
                <GroupsOutlined fontSize="large" />
              </StyledIconBox>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Students
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {event.studentNames?.map((student, i) => (
                    <Chip
                      color="default"
                      sx={{ cursor: "pointer" }}
                      key={i}
                      label={student}
                    />
                  ))}
                </Stack>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <StyledIconBox>
                <LocationOnOutlined fontSize="large" />
              </StyledIconBox>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography>{event.locationName}</Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="flex-start" gap={1} pt={1}>
              <StyledIconBox>
                <SpeakerNotesOutlined fontSize="large" />
              </StyledIconBox>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Notes
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  value={event.notes}
                  slotProps={{
                    input: {
                      readOnly: true,
                      sx: {
                        borderRadius: "8px",
                        padding: "10px",
                        overflowY: "auto",
                      },
                    },
                  }}
                  variant="outlined"
                  sx={{
                    width: "100%",
                  }}
                />
              </Box>
            </Box>
          </Stack>
        ) : (
          <LessonForm
            initialValues={{
              date: dayjs(event.start),
              tutor: event.tutorId,
              selectedStudents: event.studentIds ?? [],
              subjectGroup: event.subjectGroupId,
              location: event.locationId,
              type: event.type ?? "Normal",
              repeat: event.repeat ?? false,
              frequency: event.frequency ?? "weekly",
              notes: event.notes ?? "",
              startTime: dayjs(event.start),
              endTime: dayjs(event.end),
            }}
            edit
            onCreated={(updated) => {
              onEdit?.(updated);
              handleBack();
            }}
          />
        )}
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
