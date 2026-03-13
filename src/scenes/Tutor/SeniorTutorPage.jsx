import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Chip,
  Divider,
  Alert,
  Tooltip,
  useTheme,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StarIcon from "@mui/icons-material/Star";
import TodayIcon from "@mui/icons-material/Today";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../data/firebase";
import { tokens } from "../../theme";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import { toast, ToastContainer } from "react-toastify";
import updateLocale from "dayjs/plugin/updateLocale";
import Toolbar from "../../components/Calendar/CustomComponents/Toolbar";
import Header from "../../components/Global/Header";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-toastify/dist/ReactToastify.css";

dayjs.extend(updateLocale);
dayjs.updateLocale("en", { weekStart: 6 });
const localizer = dayjsLocalizer(dayjs);

const getWeekStart = (date) => dayjs(date).startOf("week");
const getWeekKey = (weekStart) => dayjs(weekStart).format("YYYY-MM-DD");
const getWeekEnd = (weekStart) => dayjs(weekStart).add(6, "day");
const getCurrentWeekStart = () => getWeekStart(dayjs());

const SeniorTutorCalendar = ({
  assignments,
  tutors,
  colors,
  onRangeChange,
}) => {
  const [calendarDate, setCalendarDate] = useState(new Date());

  const events = useMemo(() => {
    return Object.entries(assignments).flatMap(([weekKey, assignment]) => {
      if (!assignment?.tutorId) return [];
      const tutor = tutors.find((t) => t.id === assignment.tutorId);
      if (!tutor) return [];

      const weekStart = dayjs(weekKey);
      const events = [];
      for (let i = 0; i < 7; i++) {
        const day = weekStart.add(i, "day");
        events.push({
          title: `${tutor.firstName} ${tutor.lastName}`,
          start: day.toDate(),
          end: day.toDate(),
          allDay: true,
          tutorColor: tutor.tutorColor || "#888",
          tutorId: tutor.id,
        });
      }
      return events;
    });
  }, [assignments, tutors]);

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.tutorColor,
      border: "none",
      borderRadius: "4px",
      color: "#fff",
      fontSize: "0.72rem",
      padding: "1px 4px",
    },
  });

  const components = useMemo(
    () => ({
      toolbar: Toolbar,
    }),
    []
  );

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: "12px", mt: 3 }}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Senior Tutor Schedule
      </Typography>
      <Box
        sx={{
          "& .rbc-header": {
            py: 0.75,
            fontSize: "0.8rem",
            borderBottom: `1px solid ${colors.primary[300]}`,
          },
          "& .rbc-off-range-bg": { bgcolor: "transparent", opacity: 0.4 },
          "& .rbc-today": { bgcolor: `${colors.orangeAccent[400]}22` },
          "& .rbc-header": {
            py: 0.75,
            fontSize: "0.8rem",
            borderBottom: `1px solid #ddd !important`,
          },
        }}
      >
        <Calendar
          localizer={localizer}
          events={events}
          date={calendarDate}
          onNavigate={setCalendarDate}
          views={["month"]}
          defaultView="month"
          style={{ height: 550 }}
          eventPropGetter={eventStyleGetter}
          components={components}
          onRangeChange={(range) => {
            if (range.start && range.end) {
              const start = dayjs(range.start);
              const end = dayjs(range.end);
              const weekKeys = [];
              let cursor = start.startOf("week");
              while (cursor.isBefore(end)) {
                weekKeys.push(cursor.format("YYYY-MM-DD"));
                cursor = cursor.add(7, "day");
              }
              onRangeChange(weekKeys);
            }
          }}
          popup
          selectable={false}
          toolbar
        />
      </Box>
    </Paper>
  );
};

const SeniorTutorPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const [tutors, setTutors] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loadingTutors, setLoadingTutors] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState("");

  const weekKey = getWeekKey(weekStart);
  const weekEnd = getWeekEnd(weekStart);
  const isCurrentWeek = weekKey === getWeekKey(getCurrentWeekStart());
  const isPastWeek = weekStart.isBefore(getCurrentWeekStart());

  const fetchAssignmentsForRange = async (weekKeys) => {
    const missing = weekKeys.filter((k) => assignments[k] === undefined);
    if (missing.length === 0) return;
    const fetched = {};
    await Promise.all(
      missing.map(async (key) => {
        const snap = await getDoc(doc(db, "seniorTutorAssignments", key));
        fetched[key] = snap.exists() ? snap.data() : null;
      })
    );
    setAssignments((prev) => ({ ...prev, ...fetched }));
  };

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const snap = await getDocs(collection(db, "tutors"));
        const list = snap.docs
          .map((d) => ({
            id: d.id,
            firstName: d.data().firstName,
            lastName: d.data().lastName,
            avatar: d.data().avatar ?? "",
            tutorColor: d.data().tutorColor,
            role: d.data().role,
          }))
          .filter((t) =>
            ["Tutor", "Senior Tutor", "Head Tutor", "Admin"].includes(t.role)
          )
          .sort((a, b) =>
            `${a.firstName} ${a.lastName}`.localeCompare(
              `${b.firstName} ${b.lastName}`
            )
          );
        setTutors(list);
      } catch (err) {
        toast.error("Failed to load tutors: " + err.message);
      } finally {
        setLoadingTutors(false);
      }
    };
    fetchTutors();
  }, []);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (assignments[weekKey] !== undefined) {
        setSelectedTutorId(assignments[weekKey]?.tutorId ?? "");
        return;
      }
      try {
        const docRef = doc(db, "seniorTutorAssignments", weekKey);
        const snap = await getDoc(docRef);
        const data = snap.exists() ? snap.data() : null;
        setAssignments((prev) => ({ ...prev, [weekKey]: data }));
        setSelectedTutorId(data?.tutorId ?? "");
      } catch (err) {
        toast.error("Failed to load assignment: " + err.message);
        setSelectedTutorId("");
      }
    };
    fetchAssignment();
  }, [weekKey]);

  const handleTutorChange = async (newTutorId) => {
    setSelectedTutorId(newTutorId);
    setSaving(true);
    try {
      const tutor = tutors.find((t) => t.id === newTutorId);
      const payload = newTutorId
        ? {
            tutorId: newTutorId,
            tutorName: `${tutor.firstName} ${tutor.lastName}`,
            weekStart: weekKey,
            updatedAt: new Date().toISOString(),
          }
        : null;

      const docRef = doc(db, "seniorTutorAssignments", weekKey);
      if (payload) {
        await setDoc(docRef, payload);
      } else {
        await setDoc(docRef, {
          tutorId: null,
          tutorName: null,
          weekStart: weekKey,
          updatedAt: new Date().toISOString(),
        });
      }

      setAssignments((prev) => ({ ...prev, [weekKey]: payload }));
      toast.success(
        newTutorId
          ? `${tutor.firstName} ${tutor.lastName} assigned as Senior Tutor for this week.`
          : "Senior Tutor assignment cleared."
      );
    } catch (err) {
      toast.error("Failed to save assignment: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentAssignment = assignments[weekKey];
  const assignedTutor = tutors.find((t) => t.id === currentAssignment?.tutorId);

  return (
    <Box m="20px">
      <ToastContainer position="top-right" autoClose={3000} />
      <Header
        title="SENIOR TUTOR"
        subtitle="Assign the Senior Tutor for each week"
      />

      <Paper
        elevation={1}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderRadius: "12px",
          mb: 3,
          maxWidth: 600,
        }}
      >
        <Tooltip title="Previous week">
          <IconButton onClick={() => setWeekStart((w) => w.subtract(7, "day"))}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>

        <Box textAlign="center">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
          >
            <TodayIcon fontSize="small" sx={{ color: "text.secondary" }} />
            <Typography variant="h6" fontWeight={600}>
              {weekStart.format("D MMM")} – {weekEnd.format("D MMM YYYY")}
            </Typography>
            {isCurrentWeek && (
              <Chip label="This Week" color="primary" size="small" />
            )}
            {isPastWeek && (
              <Chip label="Past" size="small" variant="outlined" />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Week of {weekStart.format("dddd, MMMM D")}
          </Typography>
        </Box>

        <Tooltip title="Next week">
          <IconButton onClick={() => setWeekStart((w) => w.add(7, "day"))}>
            <ArrowForwardIcon />
          </IconButton>
        </Tooltip>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, borderRadius: "12px", maxWidth: 600 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <StarIcon sx={{ color: "warning.main" }} />
          <Typography variant="h5" fontWeight={600}>
            Senior Tutor Assignment
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Select the tutor who will serve as Senior Tutor for the week of{" "}
          <strong>{weekStart.format("D MMM")}</strong> –{" "}
          <strong>{weekEnd.format("D MMM YYYY")}</strong>.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {loadingTutors ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Select
              fullWidth
              value={selectedTutorId}
              onChange={(e) => handleTutorChange(e.target.value)}
              displayEmpty
              disabled={saving}
              sx={{ borderRadius: "10px", mb: 3 }}
              renderValue={(value) => {
                if (!value) {
                  return (
                    <Typography color="text.disabled">
                      — No Senior Tutor assigned —
                    </Typography>
                  );
                }
                const t = tutors.find((t) => t.id === value);
                if (!t) return value;
                return (
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar
                      src={t.avatar}
                      sx={{ width: 28, height: 28, bgcolor: t.tutorColor }}
                    />
                    <Typography>
                      {t.firstName} {t.lastName}
                    </Typography>
                    <Chip label={t.role} size="small" variant="outlined" />
                  </Box>
                );
              }}
            >
              <MenuItem value="">
                <Typography color="text.secondary">
                  — No Senior Tutor assigned —
                </Typography>
              </MenuItem>
              {tutors.map((tutor) => (
                <MenuItem key={tutor.id} value={tutor.id}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                    width="100%"
                  >
                    <Avatar
                      src={tutor.avatar}
                      sx={{ width: 32, height: 32, bgcolor: tutor.tutorColor }}
                    />
                    <Box flex={1}>
                      <Typography fontWeight={500}>
                        {tutor.firstName} {tutor.lastName}
                      </Typography>
                    </Box>
                    <Chip label={tutor.role} size="small" variant="outlined" />
                  </Box>
                </MenuItem>
              ))}
            </Select>

            {saving && (
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Saving…
                </Typography>
              </Box>
            )}

            {assignedTutor && !saving && (
              <Alert
                icon={<CheckCircleOutlineIcon />}
                severity="success"
                sx={{ borderRadius: "10px" }}
              >
                <strong>
                  {assignedTutor.firstName} {assignedTutor.lastName}
                </strong>{" "}
                is the Senior Tutor for this week.
              </Alert>
            )}

            {!assignedTutor && !saving && selectedTutorId === "" && (
              <Alert severity="warning" sx={{ borderRadius: "10px" }}>
                No Senior Tutor has been assigned for this week yet.
              </Alert>
            )}
          </>
        )}
      </Paper>

      <SeniorTutorCalendar
        assignments={assignments}
        tutors={tutors}
        colors={colors}
        onRangeChange={fetchAssignmentsForRange}
      />
    </Box>
  );
};

export default SeniorTutorPage;
