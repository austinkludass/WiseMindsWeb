import {
  Box,
  Paper,
  Button,
  Typography,
  Stack,
  IconButton,
  CircularProgress,
  Grid2 as Grid,
} from "@mui/material";
import { useState, useEffect } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Header from "../../components/Global/Header";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../data/firebase";
import dayjs from "dayjs";
import {
  getWeekRange,
  nextWeek,
  prevWeek,
  getCurrentWeekStart,
  fetchLessonsForWeek,
  getUnreportedLessonsCount,
  getTotalReportsCount,
  getReportedCount,
  fetchInvoicesForWeek,
} from "../../utils/InvoiceUtils";

const functions = getFunctions(app, "australia-southeast1");

const InvoicesPage = () => {
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const [weekLessons, setWeekLessons] = useState([]);
  const [existingInvoices, setExistingInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const week = getWeekRange(weekStart);

  const load = async () => {
    setLoading(true);
    const lessons = await fetchLessonsForWeek(week.start, week.end);
    setWeekLessons(lessons);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [weekStart]);

  useEffect(() => {
    const loadInvoices = async () => {
      const inv = await fetchInvoicesForWeek(week.start.format("YYYY-MM-DD"));
      setExistingInvoices(inv);
    };
    loadInvoices();
  }, [weekStart]);

  const unreportedCount = getUnreportedLessonsCount(weekLessons);

  const generateInvoices = async () => {
    const generateFn = httpsCallable(functions, "generateWeeklyInvoices");
    await generateFn({
      start: week.start.format("YYYY-MM-DD"),
      end: week.end.format("YYYY-MM-DD"),
    });

    const inv = await fetchInvoicesForWeek(week.start.format("YYYY-MM-DD"));
    setExistingInvoices(inv);
  };

  const totalReports = getTotalReportsCount(weekLessons);
  const reportedCount = getReportedCount(weekLessons);
  const pendingCount = totalReports - reportedCount;
  const percent =
    totalReports > 0 ? Math.round((reportedCount / totalReports) * 100) : 0;

  return (
    <Box p={4}>
      <Header title="Invoices" subtitle="Manage lesson invoicing" />

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

      <Paper
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          {weekLessons.length > 0 && (
            <Button variant="contained" onClick={generateInvoices}>
              Generate Weekly Invoices
            </Button>
          )}

          <Box mt={2}>
            <Typography variant="h6">
              {weekLessons.length} Lesson(s) This Week
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {reportedCount} {`reports • ${pendingCount} pending`}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" gap={1} spacing={1} alignItems="center">
          <Stack spacing={2}>
            <Paper sx={{ p: 1.5, width: 100 }}>
              <Typography variant="body2" color="text.secondary">
                Total Reports
              </Typography>
              <Typography variant="h6">{totalReports}</Typography>
            </Paper>

            <Paper sx={{ p: 1.5, width: 100 }}>
              <Typography variant="body2" color="text.secondary">
                Reported
              </Typography>
              <Typography variant="h6">{reportedCount}</Typography>
            </Paper>

            <Button variant="outlined">Remaining</Button>
          </Stack>

          <Box position="relative" display="inline-flex">
            <CircularProgress
              variant="determinate"
              value={percent}
              size={150}
              thickness={4}
            />

            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h4" component="div">
                {Math.round(percent)}%
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {existingInvoices.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Invoices
          </Typography>

          {existingInvoices.map((inv) => (
            <Paper key={inv.id} sx={{ p: 2, mb: 2 }}>
              <Grid
                container
                sx={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 0.5fr",
                  gap: 2,
                  width: "100%",
                }}
              >
                <Grid xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Family
                  </Typography>
                  <Typography variant="subtitle1">{inv.familyName}</Typography>
                </Grid>

                <Grid xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{inv.parentEmail}</Typography>
                </Grid>

                <Grid xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography>{`$${inv.total.toFixed(2)}`}</Typography>
                </Grid>
              </Grid>

              <Box pt={1}>
                {inv.lineItems.map((item, index) => (
                  <Box px={2} key={index}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {`${item.duration} x ${item.studentName} with ${
                        item.tutorName
                      } - (${dayjs(item.date).format("MM/DD/YYYY")}) - ${
                        item.subject
                      } - $${item.price}`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default InvoicesPage;
