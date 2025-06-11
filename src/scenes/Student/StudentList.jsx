import React, { useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../data/firebase";
import { ToastContainer, toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import Header from "../../components/Global/Header";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import "react-toastify/dist/ReactToastify.css";

const fetchStudents = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      firstName: doc.data().firstName,
      lastName: doc.data().lastName,
      homeLocation: doc.data().homeLocation,
    }));
  } catch (error) {
    toast.error("Failed to fetch students: " + error.message);
  }
};

const StudentList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const { data: rows = [], error } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const columns = [
    {
      field: "fullName",
      headerName: "Name",
      width: 200,
      valueGetter: (value, row) =>
        `${row.firstName || ""} ${row.lastName || ""}`,
    },
    {
      field: "homeLocation",
      headerName: "Location",
      width: 200,
    },
    {
      field: "edit",
      headerName: "",
      width: 150,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <IconButton
          color="secondary"
          onClick={() => navigate(`/student/${params.row.id}`)}
        >
          <ArrowCircleRightIcon sx={{ width: 25, height: 25 }} />
        </IconButton>
      ),
    },
  ];

  return (
    <Box display="flex" m="20px">
      <Stack>
        <Header title="STUDENTS" subtitle="View all students" />
        <Button
          onClick={() => navigate("/newstudent")}
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

export default StudentList;
