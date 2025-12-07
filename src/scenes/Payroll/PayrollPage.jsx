import { useState, useEffect, useMemo, useContext } from "react";
import {
  Box,
  Paper,
  Button,
  Typography,
  IconButton,
  CircularProgress,
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
  useTheme,
  Alert,
} from "@mui/material";
import {
  getWeekRange,
  nextWeek,
  prevWeek,
  getCurrentWeekStart,
  fetchLessonsForWeek,
  fetchTutors,
  calculateTutorHoursPreview,
  fetchPayrollMeta,
  fetchPayrollItems,
  fetchPendingRequests,
  calculatePreviewTotals,
  calculatePayrollTotals,
} from "../../utils/PayrollUtils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { AuthContext } from "../../context/AuthContext";
import { tokens } from "../../theme";
import { app } from "../../data/firebase";
import { toast, ToastContainer } from "react-toastify";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import LockIcon from "@mui/icons-material/Lock";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PendingIcon from "@mui/icons-material/Pending";
import Header from "../../components/Global/Header";
import dayjs from "dayjs";
import "react-toastify/dist/ReactToastify.css";

const functions = getFunctions(app, "australia-southeast1");

const PayrollPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { currentUser } = useContext(AuthContext);

  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [locking, setLocking] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [payrollMeta, setPayrollMeta] = useState(null);
  const [payrollItems, setPayrollItems] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [expandedTutor, setExpandedTutor] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(null);

  const week = getWeekRange(weekStart);
  const isGenerated = payrollMeta?.generated === true;
  const isLocked = payrollMeta?.locked === true;

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

  const handleLockPayroll = async () => {
    if (pendingRequests.length > 0) {
      toast.error(
        "Cannot lock payroll while there are pending additional hours requests"
      );
      return;
    }

    setLocking(true);
    try {
      const lockFn = httpsCallable(functions, "lockPayroll");
      await lockFn({ weekStart: week.start.format("YYYY-MM-DD") });

      const meta = await fetchPayrollMeta(week.start);
      setPayrollMeta(meta);

      toast.success("Payroll locked and ready for export");
    } catch (error) {
      toast.error("Failed to lock payroll: " + error.message);
    } finally {
      setLocking(false);
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
            {!isGenerated ? (
              <Button
                variant="contained"
                onClick={handleGeneratePayroll}
                disabled={generating || lessons.length === 0}
              >
                {generating ? (
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                ) : null}
                Generate Weekly Payroll
              </Button>
            ) : !isLocked ? (
              <Button
                variant="outlined"
                onClick={handleLockPayroll}
                disabled={locking || pendingRequests.length > 0}
                startIcon={<LockIcon />}
              >
                {locking ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
                Export to XERO
              </Button>
            ) : null}

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
                          {tutor.tutorName?.charAt(0)}
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
                  </TableRow>

                  <TableRow>
                    <TableCell
                      colSpan={isGenerated ? 7 : 6}
                      sx={{
                        py: 0,
                        borderBottom: expandedTutor === tutor.tutorId ? 1 : 0,
                      }}
                    >
                      <Collapse
                        in={expandedTutor === tutor.tutorId}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ py: 2, px: 4 }}>
                          {/* Lessons */}
                          {tutor.lessons?.length > 0 && (
                            <Box mb={2}>
                              <Typography
                                variant="subtitle2"
                                color={colors.orangeAccent[400]}
                                gutterBottom
                              >
                                Lessons ({tutor.lessonCount})
                              </Typography>
                              <Stack spacing={1}>
                                {tutor.lessons.map((lesson) => (
                                  <Paper
                                    key={lesson.id}
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

      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default PayrollPage;
