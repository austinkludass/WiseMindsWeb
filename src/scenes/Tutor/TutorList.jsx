import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Avatar, Box, useTheme } from "@mui/material";
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
    valueGetter: (value, row) => `${row.firstName || ""} ${row.lastName || ""}`,
  },
  { field: "wiseMindsEmail", headerName: "Email", width: 200 },
];

const paginationModel = { page: 0, pageSize: 10 };

const TutorList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        // const querySnapshot = await getDocs(collection(db, "tutors"));
        // const tutorData = querySnapshot.docs.map((doc) => ({
        //   id: doc.id,
        //   avatar: doc.data().avatar,
        //   firstName: doc.data().firstName,
        //   lastName: doc.data().lastName,
        //   wiseEmailsEmail: doc.data().wiseEmailsEmail,
        // }));
        // setRows(tutorData);
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    };

    fetchTutors();
  }, []);

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
          <Typography variant="h6">ADD</Typography>
        </Button>
        <Paper sx={{ width: "100vh", backgroundColor: "transparent" }}>
          <DataGrid
            checkboxSelection={false}
            rows={rows}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
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
