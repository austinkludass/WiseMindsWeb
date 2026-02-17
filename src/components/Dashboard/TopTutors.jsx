import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { tokens } from "../../theme";
import { db } from "../../data/firebase";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const TopTutors = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [loading, setLoading] = useState(true);
  const [topTutors, setTopTutors] = useState([]);
  const [lastSat, setLastSat] = useState(null);
  const [lastFri, setLastFri] = useState(null);

  const owlIcons = [
    "/assets/owlgold.png",
    "/assets/owlsilver.png",
    "/assets/owlbronze.png",
  ];

  useEffect(() => {
    const fetchTopTutors = async () => {
      try {
        const today = dayjs();

        const lastSat = today.startOf("week").subtract(1, "week");
        const lastFri = lastSat.endOf("week");
        setLastSat(lastSat);
        setLastFri(lastFri);

        const startISO = lastSat.toISOString();
        const endISO = lastFri.toISOString();

        const q = query(
          collection(db, "lessons"),
          where("startDateTime", ">=", startISO),
          where("endDateTime", "<=", endISO),
          where("type", "!=", "Cancelled"),
        );

        const snapshot = await getDocs(q);
        const tutorHours = {};

        snapshot.forEach((doc) => {
          const lesson = doc.data();

          const start = dayjs(lesson.startDateTime);
          const end = dayjs(lesson.endDateTime);
          const durationHours = end.diff(start, "minute") / 60;

          tutorHours[lesson.tutorName] =
            (tutorHours[lesson.tutorName] || 0) + durationHours;
        });

        const sortedTopTutors = Object.entries(tutorHours)
          .map(([name, hours], index) => ({
            id: index,
            name,
            hours: Number(hours.toFixed(1)),
          }))
          .sort((a, b) => b.hours - a.hours)
          .slice(0, 3);

        setTopTutors(sortedTopTutors);
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    };

    fetchTopTutors();
  }, []);

  return (
    <Box
      width="100%"
      height="100%"
      p="20px 20px 0 20px"
      bgcolor={colors.primary[400]}
      borderRadius="8px"
      overflow="auto"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb="14px"
      >
        <Typography variant="h3" color={colors.orangeAccent[400]}>
          Top Tutors
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {lastSat && lastFri
            ? `${lastSat.format("MMM D")} - ${lastFri.format("MMM D")}`
            : ""}
        </Typography>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        topTutors.map((tutor, index) => (
          <Box
            key={tutor.id}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb="12"
          >
            <Box display="flex" alignItems="center" gap="12px" padding="2px 0">
              {index === 0 ? (
                <motion.img
                  src={owlIcons[index]}
                  alt="gold medal"
                  width="36"
                  height="36"
                  animate={{
                    filter: [
                      "drop-shadow(0 0 0px gold)",
                      "drop-shadow(0 0 6px gold)",
                      "drop-shadow(0 0 0px gold)",
                    ],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ) : (
                <img src={owlIcons[index]} alt="medal" width="36" height="36" />
              )}
              <Typography variant="h6">{tutor.name}</Typography>
            </Box>
            <Typography fontWeight="bold">{tutor.hours} hrs</Typography>
          </Box>
        ))
      )}
    </Box>
  );
};

export default TopTutors;
