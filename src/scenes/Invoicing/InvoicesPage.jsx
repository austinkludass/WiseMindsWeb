import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Button,
  Typography,
  Stack,
  IconButton,
  CircularProgress,
  Grid2 as Grid,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  getWeekRange,
  nextWeek,
  prevWeek,
  getCurrentWeekStart,
  fetchLessonsForWeek,
  fetchInvoicesForWeek,
  getWeeklyReportStatusBreakdown,
} from "../../utils/InvoiceUtils";
import { getFunctions, httpsCallable } from "firebase/functions";
import { PieChart } from "@mui/x-charts/PieChart";
import { Edit } from "@mui/icons-material";
import { app } from "../../data/firebase";
import EditInvoiceDialog from "../../components/Invoice/EditInvoiceDialog";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ErrorIcon from "@mui/icons-material/Error";
import LockIcon from "@mui/icons-material/Lock";
import Header from "../../components/Global/Header";
import dayjs from "dayjs";

const functions = getFunctions(app, "australia-southeast1");
const valueFormatter = (item) =>
  `${Math.round(item.value)}% (${item.count} ${
    item.count === 1 ? "report" : "reports"
  })`;

const InvoicesPage = () => {
  const theme = useTheme();
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const [weekLessons, setWeekLessons] = useState([]);
  const [existingInvoices, setExistingInvoices] = useState([]);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [loading, setLoading] = useState(false);

  const statusColorMap = {
    Present: theme.palette.success.main,
    Partial: theme.palette.info.main,
    "No Show": theme.palette.warning.main,
    Unreported: theme.palette.error.main,
  };

  const week = getWeekRange(weekStart);

  const load = async () => {
    setLoading(true);
    const lessons = await fetchLessonsForWeek(week.start, week.end);
    setWeekLessons(lessons);
    setStatusBreakdown(getWeeklyReportStatusBreakdown(lessons));
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

  const generateInvoices = async () => {
    setLoading(true);
    const generateFn = httpsCallable(functions, "generateWeeklyInvoices");
    await generateFn({
      start: week.start.format("YYYY-MM-DD"),
      end: week.end.format("YYYY-MM-DD"),
    });

    const inv = await fetchInvoicesForWeek(week.start.format("YYYY-MM-DD"));
    setExistingInvoices(inv);
    setLoading(false);
  };

  const filteredStatus = statusBreakdown.filter((item) => item.count > 0);
  const filteredColors = filteredStatus.map((s) => statusColorMap[s.label]);

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
            <Button
              variant="contained"
              loading={loading}
              onClick={generateInvoices}
            >
              Generate Weekly Invoices
            </Button>
          )}

          <Box mt={2}></Box>

          <Box mt={2}>
            {weekLessons.length > 0 && (
              <Button variant="outlined" size="small">
                Export to XERO
              </Button>
            )}
          </Box>
        </Box>

        <Stack direction="row" gap={1} spacing={1} alignItems="center">
          <Box width={400}>
            <PieChart
              series={[
                {
                  innerRadius: 30,
                  paddingAngle: 5,
                  cornerRadius: 4,
                  data: filteredStatus,
                  highlightScope: { fade: "global", highlight: "item" },
                  faded: {
                    innerRadius: 30,
                    additionalRadius: -30,
                    color: "gray",
                  },
                  valueFormatter,
                },
              ]}
              height={200}
              colors={filteredColors}
            />
          </Box>
        </Stack>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        existingInvoices.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Invoices ({existingInvoices.length})
            </Typography>

            {existingInvoices.map((inv) => (
              <Paper key={inv.id} sx={{ p: 2, mb: 2 }}>
                <Grid
                  container
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "8fr 4fr 2fr 1fr",
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <Grid xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Family
                    </Typography>
                    <Typography variant="subtitle1">
                      {inv.familyName}
                    </Typography>
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
                    <Typography color="primary">{`$${inv.total.toFixed(
                      2
                    )}`}</Typography>
                  </Grid>

                  <Grid xs={4} display="flex" alignItems="center" gap={1}>
                    <Tooltip
                      sx={{
                        visibility: inv.editedSinceGeneration
                          ? "visible"
                          : "hidden",
                      }}
                      title="This invoice has been modified since generation"
                    >
                      <ErrorIcon color="warning" fontSize="small" />
                    </Tooltip>
                    <IconButton onClick={() => setEditingInvoice(inv)}>
                      <Edit />
                    </IconButton>
                  </Grid>
                </Grid>

                <Box pt={1}>
                  {inv.lineItems.map((item, index) => (
                    <Box px={2} key={index}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {`${item.duration} x ${item.studentName} with ${
                          item.tutorName
                        } - (${dayjs(item.date).format("DD/MM/YYYY")}) - ${
                          item.subject
                        } - $${item.price}`}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            ))}
          </Paper>
        )
      )}

      <EditInvoiceDialog
        open={Boolean(editingInvoice)}
        invoice={editingInvoice}
        onClose={() => setEditingInvoice(null)}
        onSave={(updatedInvoice) => {
          console.log("Saving invoice with details: ", updatedInvoice);
          setEditingInvoice(null);
        }}
      />
    </Box>
  );
};

export default InvoicesPage;
