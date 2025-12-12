import { useState, useEffect, useMemo, useContext } from "react";
import {
  Box,
  Paper,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Collapse,
  Stack,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  getWeekRange,
  nextWeek,
  prevWeek,
  getCurrentWeekStart,
  fetchLessonsForWeek,
  fetchTutors,
  fetchPayrollMeta,
  fetchPayrollItems,
  fetchPendingRequests,
  calculateTutorHoursPreview,
  calculatePayrollTotals,
  calculatePreviewTotals,
} from "../../utils/PayrollUtils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../data/firebase";
import { tokens } from "../../theme";
import { AuthContext } from "../../context/AuthContext";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LockIcon from "@mui/icons-material/Lock";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PendingIcon from "@mui/icons-material/Pending";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Header from "../../components/Global/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";

const functions = getFunctions(app, "australia-southeast1");

const PayrollPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { currentUser } = useContext(AuthContext);

  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [payrollMeta, setPayrollMeta] = useState(null);
  const [payrollItems, setPayrollItems] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [expandedTutor, setExpandedTutor] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [exportResult, setExportResult] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const week = getWeekRange(weekStart);
  const isGenerated = payrollMeta?.generated === true;
  const isLocked = payrollMeta?.locked === true;

  const today = dayjs().startOf("day");
  const weekEndFriday = week.end.startOf("day");

  const isPastOrCurrentFriday =
    today.isSame(weekEndFriday, "day") || today.isAfter(weekEndFriday, "day");

  const isFutureWeek = today.isBefore(weekEndFriday, "day");

  const canGenerate =
    lessons.length > 0 && isPastOrCurrentFriday && !isGenerated && !isLocked;

  useEffect(() => {
    const loadTutors = async () => {
      try {
        const tutorData = await fetchTutors();
        setTutors(tutorData);
      } catch (error) {
        toast.error("Failed to fetch tutors: " + error.message);
      }
    };
    loadTutors();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [meta, lessonData, requests] = await Promise.all([
          fetchPayrollMeta(week.start),
          fetchLessonsForWeek(week.start, week.end),
          fetchPendingRequests(week.start),
        ]);

        setPayrollMeta(meta);
        setLessons(lessonData);
        setPendingRequests(requests);

        if (meta?.generated) {
          const items = await fetchPayrollItems(week.start);
          setPayrollItems(items);
        } else {
          setPayrollItems([]);
        }
      } catch (error) {
        toast.error("Failed to fetch data: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [weekStart]);

  const previewData = useMemo(() => {
    if (isGenerated) return null;
    const tutorHours = calculateTutorHoursPreview(lessons, tutors);
    return Object.values(tutorHours)
      .filter((t) => t.lessonCount > 0)
      .sort((a, b) => b.lessonHours - a.lessonHours);
  }, [lessons, tutors, isGenerated]);

  const totals = useMemo(() => {
    if (isGenerated) {
      return calculatePayrollTotals(payrollItems);
    } else if (previewData) {
      const preview = calculatePreviewTotals(
        Object.fromEntries(previewData.map((t) => [t.tutorId, t]))
      );
      return {
        ...preview,
        additionalHours: 0,
        totalHours: preview.lessonHours,
      };
    }
    return {
      lessonHours: 0,
      additionalHours: 0,
      totalHours: 0,
      lessonCount: 0,
      tutorCount: 0,
    };
  }, [isGenerated, payrollItems, previewData]);

  const displayData = useMemo(() => {
    if (isGenerated) {
      return payrollItems.sort((a, b) => b.totalHours - a.totalHours);
    }
    return previewData || [];
  }, [isGenerated, payrollItems, previewData]);

  const handleGeneratePayroll = async () => {
    setGenerating(true);
    try {
      const generateFn = httpsCallable(functions, "generateWeeklyPayroll");
      await generateFn({
        weekStart: week.start.format("YYYY-MM-DD"),
        weekEnd: week.end.format("YYYY-MM-DD"),
      });

      const [meta, items, requests] = await Promise.all([
        fetchPayrollMeta(week.start),
        fetchPayrollItems(week.start),
        fetchPendingRequests(week.start),
      ]);
      setPayrollMeta(meta);
      setPayrollItems(items);
      setPendingRequests(requests);

      toast.success("Payroll generated successfully");
    } catch (error) {
      toast.error("Failed to generate payroll: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportToXero = async () => {
    setExporting(true);
    setExportResult(null);
    try {
      const exportFn = httpsCallable(functions, "exportPayrollToXero");
      const result = await exportFn({
        weekStart: week.start.format("YYYY-MM-DD"),
      });

      setExportResult(result.data);
      setShowExportDialog(true);

      const meta = await fetchPayrollMeta(week.start);
      setPayrollMeta(meta);

      const items = await fetchPayrollItems(week.start);
      setPayrollItems(items);

      toast.success("Payroll exported to XERO");
    } catch (error) {
      console.error("Failed to export to XERO:", error);
      setExportResult({
        success: false,
        error: error.message || "Failed to export to XERO",
      });
      setShowExportDialog(true);
    } finally {
      setExporting(false);
    }
  };

  const handleApproveRequest = async (requestId, approved) => {
    setProcessingRequest(requestId);
    try {
      const approveFn = httpsCallable(functions, "approveAdditionalHours");
      await approveFn({
        requestId,
        approved,
        reviewedBy: currentUser?.uid,
      });

      const [items, requests] = await Promise.all([
        fetchPayrollItems(week.start),
        fetchPendingRequests(week.start),
      ]);
      setPayrollItems(items);
      setPendingRequests(requests);

      toast.success(`Request ${approved ? "approved" : "declined"}`);
    } catch (error) {
      toast.error("Failed to process request: " + error.message);
    } finally {
      setProcessingRequest(null);
    }
  };

  const toggleExpand = (tutorId) => {
    setExpandedTutor(expandedTutor === tutorId ? null : tutorId);
  };

  const formatHours = (hours) => {
    if (!hours || hours === 0) return "0h";
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) return `${wholeHours}h`;
    return `${wholeHours}h ${minutes}m`;
  };

  const getGenerateDisabledReason = () => {
    if (isLocked) {
      return "Payroll has been exported to XERO and cannot be regenerated";
    }
    if (isGenerated) {
      return "Payroll has already been generated for this week";
    }
    if (isFutureWeek) {
      return `Payroll can be generated from ${weekEndFriday.format(
        "dddd, MMM D, YYYY"
      )}`;
    }
    if (lessons.length === 0) {
      return "No lessons found for this week";
    }
    return "";
  };

  return (
    <Box p={4}>
      <Header title="Payroll" subtitle="Generate and manage tutor payroll" />

      <Paper sx={{ p: 2, mb: 3, display: "flex", alignItems: "center" }}>
        <IconButton onClick={() => setWeekStart(prevWeek)}>
          <ArrowBackIcon />
        </IconButton>

        <Box flexGrow={1} textAlign="center">
          <Typography variant="h6">
            {week.start.format("MMM D, YYYY")} -{" "}
            {week.end.format("MMM D, YYYY")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Saturday - Friday
          </Typography>
        </Box>

        <Button
          sx={{ mr: 2 }}
          variant="outlined"
          onClick={() => setWeekStart(getCurrentWeekStart())}
        >
          Current Week
        </Button>

        <IconButton onClick={() => setWeekStart(nextWeek)}>
          <ArrowForwardIcon />
        </IconButton>
      </Paper>

      {isGenerated && (
        <Alert
          severity={isLocked ? "info" : "success"}
          icon={isLocked ? <LockIcon /> : undefined}
          sx={{ mb: 3 }}
        >
          {isLocked
            ? "Payroll has been locked and exported to XERO"
            : `Payroll generated on ${dayjs(
                payrollMeta?.lastGenerated?.toDate()
              ).format("MMM D, YYYY h:mm A")}`}
        </Alert>
      )}

      {isFutureWeek && !isGenerated && !isLocked && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Payroll can be generated from{" "}
          {weekEndFriday.format("dddd, MMM D, YYYY")}
        </Alert>
      )}

      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))"
        gap={2}
        mb={3}
      >
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" color={colors.orangeAccent[400]}>
            {formatHours(totals.lessonHours)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lesson Hours
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" color={colors.orangeAccent[400]}>
            {formatHours(totals.additionalHours)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Additional Hours
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" color={colors.orangeAccent[400]}>
            {formatHours(totals.totalHours)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Hours
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" color={colors.orangeAccent[400]}>
            {totals.lessonCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Lessons
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            {!isGenerated && !isFutureWeek ? (
              <Tooltip title={canGenerate ? "" : getGenerateDisabledReason()}>
                <span>
                  <Button
                    variant="contained"
                    onClick={handleGeneratePayroll}
                    disabled={!canGenerate || generating}
                  >
                    {generating ? (
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                    ) : null}
                    Generate Weekly Payroll
                  </Button>
                </span>
              </Tooltip>
            ) : isGenerated && !isLocked ? (
              <Tooltip
                title={
                  pendingRequests.length > 0
                    ? "Approve or decline all pending requests before exporting"
                    : ""
                }
              >
                <span>
                  <Button
                    variant="outlined"
                    onClick={handleExportToXero}
                    disabled={exporting || pendingRequests.length > 0}
                    startIcon={
                      exporting ? (
                        <CircularProgress size={16} />
                      ) : (
                        <CloudUploadIcon />
                      )
                    }
                  >
                    {exporting ? "Exporting..." : "Export to XERO"}
                  </Button>
                </span>
              </Tooltip>
            ) : null}

            {!isGenerated && !isFutureWeek && !canGenerate && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {getGenerateDisabledReason()}
              </Typography>
            )}

            {payrollMeta?.lastGenerated && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Last generated:{" "}
                {dayjs(payrollMeta.lastGenerated.toDate()).format(
                  "MMM D, YYYY h:mm A"
                )}
              </Typography>
            )}
          </Box>

          {pendingRequests.length > 0 && (
            <Chip
              icon={<PendingIcon />}
              label={`${pendingRequests.length} pending request${
                pendingRequests.length > 1 ? "s" : ""
              }`}
              color="warning"
            />
          )}
        </Box>
      </Paper>

      {!isLocked && pendingRequests.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography
            variant="h6"
            color={colors.orangeAccent[400]}
            gutterBottom
          >
            Pending Additional Hours Requests
          </Typography>

          {!isGenerated && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Generate the weekly payroll to approve or decline these requests.
            </Alert>
          )}

          <Stack spacing={2}>
            {pendingRequests.map((request) => (
              <Paper key={request.id} variant="outlined" sx={{ p: 2 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {request.tutorName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {request.description}
                    </Typography>
                    {request.notes && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1, fontStyle: "italic" }}
                      >
                        Reason: {request.notes}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Submitted:{" "}
                      {dayjs(request.createdAt).format("MMM D, YYYY h:mm A")}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={formatHours(request.hours)}
                      color="primary"
                      icon={<AccessTimeIcon />}
                    />
                    {isGenerated && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton
                            color="success"
                            onClick={() =>
                              handleApproveRequest(request.id, true)
                            }
                            disabled={processingRequest === request.id}
                          >
                            {processingRequest === request.id ? (
                              <CircularProgress size={24} />
                            ) : (
                              <CheckIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Decline">
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleApproveRequest(request.id, false)
                            }
                            disabled={processingRequest === request.id}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : displayData.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {isGenerated
              ? "No payroll data for this week"
              : "No lessons scheduled for this week"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            {isGenerated
              ? "Generate payroll to see tutor hours"
              : "Tutor hours will appear here when lessons are scheduled"}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={50} />
                <TableCell>Tutor</TableCell>
                <TableCell align="center">Lessons</TableCell>
                <TableCell align="center">Lesson Hours</TableCell>
                {isGenerated && (
                  <TableCell align="center">Additional Hours</TableCell>
                )}
                <TableCell align="center">
                  {isGenerated ? "Total Hours" : "Hours"}
                </TableCell>
                {isGenerated && payrollItems.some((p) => p.xeroTimesheetId) && (
                  <TableCell align="center">XERO</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayData.map((tutor) => (
                <>
                  <TableRow
                    key={tutor.tutorId}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => toggleExpand(tutor.tutorId)}
                  >
                    <TableCell>
                      <IconButton size="small">
                        {expandedTutor === tutor.tutorId ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={tutor.avatar}
                          sx={{
                            bgcolor: tutor.tutorColor,
                            width: 40,
                            height: 40,
                          }}
                        >
                          <Typography variant="h6" color="white">
                            {tutor.tutorName?.charAt(0)}
                          </Typography>
                        </Avatar>
                        <Typography variant="body1">
                          {tutor.tutorName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<SchoolIcon />}
                        label={tutor.lessonCount}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {formatHours(tutor.lessonHours)}
                    </TableCell>
                    {isGenerated && (
                      <TableCell align="center">
                        {tutor.additionalHours > 0 ? (
                          <Chip
                            icon={<AccessTimeIcon />}
                            label={formatHours(tutor.additionalHours)}
                            size="small"
                            color="primary"
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight="bold">
                        {formatHours(
                          isGenerated ? tutor.totalHours : tutor.lessonHours
                        )}
                      </Typography>
                    </TableCell>
                    {isGenerated &&
                      payrollItems.some((p) => p.xeroTimesheetId) && (
                        <TableCell align="center">
                          {tutor.xeroTimesheetId ? (
                            <Chip
                              label="✓"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      )}
                  </TableRow>

                  <TableRow>
                    <TableCell
                      colSpan={
                        isGenerated
                          ? payrollItems.some((p) => p.xeroTimesheetId)
                            ? 8
                            : 7
                          : 6
                      }
                      sx={{ py: 0, borderBottom: "none" }}
                    >
                      <Collapse
                        in={expandedTutor === tutor.tutorId}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ py: 2, px: 4 }}>
                          {tutor.lessons?.length > 0 && (
                            <Box mb={2}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Lessons
                              </Typography>
                              <Stack spacing={1}>
                                {tutor.lessons.map((lesson, idx) => (
                                  <Paper
                                    key={idx}
                                    variant="outlined"
                                    sx={{ p: 1.5 }}
                                  >
                                    <Box
                                      display="flex"
                                      justifyContent="space-between"
                                      alignItems="center"
                                    >
                                      <Box>
                                        <Typography variant="body2">
                                          {dayjs(lesson.date).format(
                                            "ddd, MMM D @ h:mm A"
                                          )}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {lesson.subjectGroupName} •{" "}
                                          {lesson.studentNames?.join(", ")}
                                        </Typography>
                                      </Box>
                                      <Chip
                                        label={formatHours(lesson.duration)}
                                        size="small"
                                      />
                                    </Box>
                                  </Paper>
                                ))}
                              </Stack>
                            </Box>
                          )}

                          {isGenerated &&
                            tutor.additionalHoursDetails?.length > 0 && (
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  color={colors.orangeAccent[400]}
                                  gutterBottom
                                >
                                  Additional Hours
                                </Typography>
                                <Stack spacing={1}>
                                  {tutor.additionalHoursDetails.map(
                                    (entry, idx) => (
                                      <Paper
                                        key={idx}
                                        variant="outlined"
                                        sx={{ p: 1.5 }}
                                      >
                                        <Box
                                          display="flex"
                                          justifyContent="space-between"
                                          alignItems="center"
                                        >
                                          <Box>
                                            <Typography variant="body2">
                                              {entry.description}
                                            </Typography>
                                            {entry.notes && (
                                              <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                fontStyle="italic"
                                              >
                                                {entry.notes}
                                              </Typography>
                                            )}
                                          </Box>
                                          <Chip
                                            label={formatHours(entry.hours)}
                                            size="small"
                                            color="primary"
                                          />
                                        </Box>
                                      </Paper>
                                    )
                                  )}
                                </Stack>
                              </Box>
                            )}

                          {tutor.lessons?.length === 0 &&
                            (!tutor.additionalHoursDetails ||
                              tutor.additionalHoursDetails.length === 0) && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No details to display
                              </Typography>
                            )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {exportResult?.success ? "Export Successful" : "Export Result"}
        </DialogTitle>
        <DialogContent>
          {exportResult?.success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Successfully exported {exportResult.exported} timesheets to XERO
              </Alert>

              {exportResult.errors > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {exportResult.errors} timesheets could not be exported
                </Alert>
              )}

              {exportResult.errorDetails?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Errors:
                  </Typography>
                  {exportResult.errorDetails.map((err, idx) => (
                    <Alert key={idx} severity="error" sx={{ mb: 1 }}>
                      <strong>{err.tutorName}:</strong> {err.error}
                    </Alert>
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <Alert severity="error">
              {exportResult?.error || "Failed to export payroll"}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default PayrollPage;
