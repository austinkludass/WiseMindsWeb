import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
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
import { toast } from "react-toastify";
import ConfirmEventDialog from "./ConfirmEventDialog";
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

const EventDialog = ({
  event,
  onClose,
  onDelete,
  mode: initialMode = "view",
  reportStudent: initialReportStudent = null,
}) => {
  const [mode, setMode] = useState(initialMode);
  const [reportStudent, setReportStudent] = useState(initialReportStudent);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reports, setReports] = useState(event?.reports || []);

  if (!event) return null;

  const handleBack = () => {
    setReportStudent(null);
    setMode("view");
  };

  const handleEdit = () => setMode("edit");

  const handleSubmit = () => {
    if (event.frequency) {
      setDeleteConfirmOpen(true);
    } else {
      handleDelete(false);
    }
  };

  const handleDelete = async (applyToFuture = false) => {
    onDelete?.(event, applyToFuture);
  };

  const updateReportField = (studentId, field, value) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.studentId === studentId ? { ...report, [field]: value } : report
      )
    );
  };

  const handleSaveReport = (studentId) => {
    try {
      // Save the report for the student
      toast.success("Report saved");
      setMode("view");
      setReportStudent(null);
    } catch (error) {
      toast.error("Error saving report: " + error.message);
    }
  };

  return (
    <>
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
            {(mode === "edit" || mode === "report") && (
              <IconButton sx={{ color: "white" }} onClick={handleBack}>
                <ArrowBack />
              </IconButton>
            )}
            <Typography variant="h4" color="white">
              {mode === "edit"
                ? "Edit Lesson"
                : mode === "report"
                ? `Report ${reportStudent?.studentName}`
                : event.subjectGroupName || "Lesson Details"}
            </Typography>
          </Box>

          {mode === "view" && (
            <Box>
              <IconButton sx={{ color: "white" }} onClick={handleEdit}>
                <Edit />
              </IconButton>
              <IconButton sx={{ color: "white" }} onClick={handleSubmit}>
                <Delete />
              </IconButton>
            </Box>
          )}
        </DialogTitle>

        <DialogContent dividers>
          {mode === "view" && (
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
                    {reports?.map((report) => (
                      <Chip
                        key={report.studentId}
                        label={report.studentName}
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                          setReportStudent(report);
                          setMode("report");
                        }}
                        color={report.attendance ? "success" : "default"}
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
          )}

          {mode === "edit" && (
            <LessonForm
              initialValues={{
                date: dayjs(event.start),
                tutor: event.tutorId,
                selectedStudents: event.studentIds ?? [],
                subjectGroup: event.subjectGroupId,
                location: event.locationId,
                type: event.type ?? "Normal",
                frequency: event.frequency,
                notes: event.notes ?? "",
                startTime: dayjs(event.start),
                endTime: dayjs(event.end),
                repeatingId: event.repeatingId,
                startDateTime: event.startDateTime,
                endDateTime: event.endDateTime,
                id: event.id,
              }}
              edit
              onUpdated={() => {
                onClose();
              }}
            />
          )}

          {mode === "report" && reportStudent && (
            <Box>
              <Typography variant="h6">
                Report for {reportStudent.studentName}
              </Typography>

              <TextField
                fullWidth
                select
                label="Attendance"
                value={reportStudent.attendance || ""}
                onChange={(e) =>
                  updateReportField(
                    reportStudent.studentId,
                    "attendance",
                    e.target.value
                  )
                }
                sx={{ mt: 2 }}
              >
                <MenuItem value="Present">Present</MenuItem>
                <MenuItem value="Absent">Absent</MenuItem>
                <MenuItem value="Late">Late</MenuItem>
              </TextField>

              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Report Notes"
                value={reportStudent.report || ""}
                onChange={(e) =>
                  updateReportField(
                    reportStudent.studentId,
                    "report",
                    e.target.value
                  )
                }
                sx={{ mt: 2 }}
              />

              <Box display="flex" justifyContent="flex-start" gap={2} mt={2}>
                <Button
                  variant="contained"
                  onClick={() => handleSaveReport(reportStudent.studentId)}
                >
                  Save
                </Button>
                <Button variant="outlined" onClick={handleBack}>
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>

        <Box display="flex" justifyContent="flex-end" p={2}>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Dialog>

      <ConfirmEventDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirmOnly={() => handleDelete(false)}
        onConfirmFuture={() => handleDelete(true)}
        title="Delete lesson(s)..."
        onlyLabel="Only this lesson"
        futureLabel="This and future lessons"
      />
    </>
  );
};

export default EventDialog;
