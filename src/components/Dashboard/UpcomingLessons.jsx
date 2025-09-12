import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Box, Chip, Stack, Typography, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { tokens } from "../../theme";
import { db } from "../../data/firebase";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";

dayjs.extend(relativeTime);

const UpcomingLessons = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [lessons, setLessons] = useState([]);
  const [now, setNow] = useState(new Date());
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!currentUser) return;

    const fetchLessons = async () => {
      try {
        const nowDate = new Date();
        const threeDaysLater = dayjs().add(3, "day").toDate();
        const lessonRef = collection(db, "lessons");
        const q = query(
          lessonRef,
          where("tutorId", "==", currentUser.uid),
          where("startDateTime", ">=", nowDate.toISOString()),
          where("startDateTime", "<=", threeDaysLater.toISOString()),
          orderBy("startDateTime", "asc")
        );

        const querySnap = await getDocs(q);
        const fetched = querySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLessons(fetched);
      } catch (error) {
        console.error("Error fetching lessons: ", error);
      }
    };

    fetchLessons();
  }, [currentUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeUntil = (lessonDate) => {
    const diffMs = new Date(lessonDate) - now;
    if (diffMs <= 0) return "started";

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffHrs < 24) {
      const hours = diffHrs;
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    } else {
      const days = diffDays;
      const hours = diffHrs % 24;
      return `${days}d ${hours}h`;
    }
  };

  return (
    <Box
      width="100%"
      height="100%"
      p="20px"
      bgcolor={colors.primary[400]}
      borderRadius="8px"
      display="flex"
      flexDirection="column"
    >
      <Typography
        variant="h3"
        mb="16px"
        color={colors.orangeAccent[400]}
        sx={{ flexShrink: 0 }}
      >
        Upcoming Lessons
      </Typography>

      <Box flex={1} overflow="auto" pr={1}>
        {lessons.length === 0 ? (
          <Typography variant="body1" color={colors.grey[200]}>
            No lessons in the next 3 days.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {lessons.map((lesson) => (
              <Box
                key={lesson.id}
                p={2}
                borderRadius="8px"
                bgcolor={colors.primary[500]}
                position="relative"
              >
                <Typography
                  variant="body2"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 12,
                    color: colors.orangeAccent[400],
                  }}
                >
                  {formatTimeUntil(lesson.startDateTime)}
                </Typography>
                <Typography variant="h5" color={colors.orangeAccent[400]}>
                  {lesson.subjectGroupName}
                </Typography>

                <Typography variant="body2" color={colors.grey[100]}>
                  {lesson.locationName}
                </Typography>

                <Typography variant="body2" color={colors.grey[100]}>
                  {dayjs(lesson.startDateTime).format("ddd, MMM D • h:mm A")}
                </Typography>

                <Box
                  display="grid"
                  gridTemplateColumns="repeat(auto-fit, 120px)"
                  gap={1}
                  mt={1}
                >
                  {lesson.studentNames?.slice(0, 3).map((name, idx) => (
                    <Chip key={idx} label={name} size="small" />
                  ))}
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default UpcomingLessons;
