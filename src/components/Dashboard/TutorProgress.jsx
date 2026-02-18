import {
  Typography,
  useTheme,
  Box,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState, useContext } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { tokens } from "../../theme";
import { db } from "../../data/firebase";
import dayjs from "dayjs";

const TutorProgress = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { currentUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [scheduledHours, setScheduledHours] = useState(0);
  const [completedHours, setCompletedHours] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [completedReports, setCompletedReports] = useState(0);
  const [lastSat, setLastSat] = useState(null);
  const [lastFri, setLastFri] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const today = dayjs();

        const lastSat = today.startOf("week");
        const lastFri = lastSat.endOf("week");

        setLastSat(lastSat);
        setLastFri(lastFri);

        const startISO = lastSat.toISOString();
        const endISO = lastFri.toISOString();

        const q = query(
          collection(db, "lessons"),
          where("tutorId", "==", currentUser.uid),
          where("startDateTime", ">=", startISO),
          where("endDateTime", "<=", endISO),
        );

        const snapshot = await getDocs(q);

        let totalScheduled = 0;
        let totalCompleted = 0;
        let pending = 0;
        let completed = 0;

        snapshot.forEach((doc) => {
          const lesson = doc.data();

          if (lesson.type === "Cancelled") return;

          const start = dayjs(lesson.startDateTime);
          const end = dayjs(lesson.endDateTime);
          const duration = end.diff(start, "minute") / 60;

          totalScheduled += duration;

          const hasEnded = end.isBefore(dayjs());

          if (hasEnded) {
            totalCompleted += duration;

            if (lesson.reports) {
              lesson.reports.forEach((report) => {
                if (report.status == null) {
                  pending++;
                } else {
                  completed++;
                }
              });
            }
          }
        });

        setScheduledHours(Number(totalScheduled.toFixed(1)));
        setCompletedHours(Number(totalCompleted.toFixed(1)));
        setPendingReports(pending);
        setCompletedReports(completed);
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    };

    if (currentUser) {
      fetchProgress();
    }
  }, [currentUser]);

  const progressValue =
    scheduledHours === 0 ? 0 : (completedHours / scheduledHours) * 100;

  const totalReports = pendingReports + completedReports;
  const reportProgress =
    totalReports === 0 ? 0 : (completedReports / totalReports) * 100;

  return (
    <Box width="100%" height="100%" p="20px" overflow="auto">
      <Box display="flex" justifyContent="space-between" mb="12px">
        <Typography variant="h3" color={colors.orangeAccent[400]}>
          Weekly Progress
        </Typography>

        {lastSat && lastFri && (
          <Typography variant="body2" color="text.secondary">
            {lastSat.format("MMM D")} - {lastFri.format("MMM D")}
          </Typography>
        )}
      </Box>

      {loading ? (
        <CircularProgress />
      ) : scheduledHours === 0 ? (
        <Typography color="text.secondary">
          No scheduled lessons this week.
        </Typography>
      ) : (
        <Box>
          {/* Hours Section */}
          <Typography variant="h5" mb="4px">
            {completedHours} / {scheduledHours} hrs completed
          </Typography>

          <LinearProgress
            variant="determinate"
            value={progressValue}
            sx={{
              height: 10,
              borderRadius: 5,
            }}
          />

          {/* Reports Section */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mt={1.5}
          >
            <Box>
              <Typography variant="h6">Completed Lesson Reports</Typography>
              <Typography variant="body2" color="text.secondary">
                {completedReports} of {totalReports} submitted
              </Typography>
            </Box>

            <Box position="relative" display="inline-flex">
              <CircularProgress
                variant="determinate"
                value={reportProgress}
                size={70}
                thickness={5}
                sx={{
                  color:
                    reportProgress === 100
                      ? "success.main"
                      : pendingReports > 0
                        ? colors.orangeAccent[700]
                        : "text.secondary",
                }}
              />

              <Box
                position="absolute"
                top={0}
                left={0}
                bottom={0}
                right={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography variant="body2" fontWeight="bold">
                  {Math.round(reportProgress)}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TutorProgress;
