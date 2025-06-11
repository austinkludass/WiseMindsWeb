import React, { useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Avatar, Box, IconButton, useTheme } from "@mui/material";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../data/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../components/Global/Header";
import { useQuery } from "@tanstack/react-query";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";

const fetchTutors = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "tutors"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      avatar: doc.data().avatar,
      firstName: doc.data().firstName,
      lastName: doc.data().lastName,
      wiseMindsEmail: doc.data().wiseMindsEmail,
    }));
  } catch (error) {
    toast.error("Failed to fetch tutors: " + error.message);
  }
};

const TutorList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const { data: rows = [], error } = useQuery({
    queryKey: ["tutors"],
    queryFn: fetchTutors,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const columns = [
    {
      field: "avatar",
      headerName: "",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Avatar src={params.value} sx={{ width: 40, height: 40 }} />
        </Box>
      ),
    },
    {
      field: "fullName",
      headerName: "Name",
      width: 200,
      valueGetter: (value, row) =>
        `${row.firstName || ""} ${row.lastName || ""}`,
    },
    { field: "wiseMindsEmail", headerName: "Email", width: 200 },
    {
      field: "edit",
      headerName: "",
      width: 150,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <IconButton
          color="secondary"
          onClick={() => navigate(`/tutor/${params.row.id}`)}
        >
          <ArrowCircleRightIcon sx={{ width: 25, height: 25 }} />
        </IconButton>
      ),
    },
  ];

  return (
    <Box display="flex" m="20px">
      <Stack>
        <Header title="TUTORS" subtitle="View all tutors" />
        <Button
          onClick={() => navigate("/newtutor")}
          variant="contained"
          sx={{
            width: "20%",
            backgroundColor: `${colors.orangeAccent[700]}`,
            fontSize: "1.3em",
          }}
        >
          <Typography variant="h6">NEW</Typography>
        </Button>
        <Paper sx={{ width: "100vh", backgroundColor: "transparent", marginTop: "4px" }}>
          <DataGrid
            checkboxSelection={false}
            rows={rows}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
            }}
            pageSizeOptions={[10]}
            sx={{ border: 0 }}
          />
        </Paper>
      </Stack>
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default TutorList;
