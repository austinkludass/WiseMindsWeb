import {
  Box,
  Paper,
  Button,
  Typography,
  Stack,
  Divider,
  IconButton,
  Collapse,
} from "@mui/material";
import { useState, useEffect } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DownloadIcon from "@mui/icons-material/Download";
import Header from "../../components/Global/Header";
import dayjs from "dayjs";
import {
  getWeekRange,
  nextWeek,
  prevWeek,
  getCurrentWeekStart,
  fetchLessonsForWeek,
  getUnreportedLessonsCount,
} from "../../utils/InvoiceUtils";

const InvoicesPage = () => {
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const [weekLessons, setWeekLessons] = useState([]);
  const [invoices, setInvoices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});

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

  const unreportedCount = getUnreportedLessonsCount(weekLessons);

  const generateInvoices = () => {};

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

      <Box mb={3}>
        {unreportedCount > 0 ? (
          <Paper sx={{ p: 2 }}>
            <Typography>
              {unreportedCount} lessons still need to be reported before
              generating invoices.
            </Typography>
          </Paper>
        ) : (
          <Button variant="contained" onClick={generateInvoices}>
            Generate Weekly Invoices
          </Button>
        )}
      </Box>

      {invoices && (
        <Box>
          <Typography variant="h6" mb={2}>
            Generated Invoices
          </Typography>

          {Object.entries(invoices).map(([id, inv]) => (
            <Paper key={id} sx={{ p: 2, mb: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle1">{id}</Typography>
                  <Typography variant="body2">{inv.familyName}</Typography>
                  <Typography variant="body2">
                    {inv.lessons.length} lessons
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h6" color="primary">
                    ${inv.totalAmount.toFixed(2)}
                  </Typography>
                  <Button
                    startIcon={<DownloadIcon />}
                    variant="contained"
                    color="primary"
                  >
                    Download
                  </Button>
                </Stack>
              </Stack>

              <Button size="small" onClick={() => toggleExpand(id)}>
                {expanded[id] ? "Hide details" : "View details"}
              </Button>

              <Collapse in={expanded[id]}>
                <Divider sx={{ my: 2 }} />
                {inv.lessons.map((l) => (
                  <Box key={l.lessonId} sx={{ mb: 1 }}>
                    <Typography>
                      {dayjs(l.date).format("MMM D")} - {l.subject}
                    </Typography>
                    <Typography>${l.price}</Typography>
                  </Box>
                ))}
              </Collapse>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default InvoicesPage;
