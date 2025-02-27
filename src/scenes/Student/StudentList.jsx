import { React, useState, useEffect } from "react";
import { useTheme, Box, Stack, Button, Typography, Paper } from "@mui/material";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Global/Header";
import { DataGrid } from "@mui/x-data-grid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const columns = [
  {
    field: "fullName",
    headerName: "Name",
    width: 200,
    valueGetter: (value, row) => `${row.firstName || ""} ${row.lastName || ""}`,
  },
];

const paginationModel = { page: 0, pageSize: 10 };

const StudentList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
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

    fetchStudents();
  }, []);

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

export default StudentList;
