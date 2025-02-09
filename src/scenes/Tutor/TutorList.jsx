import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Box } from "@mui/material";

const columns = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "firstName", headerName: "First name", width: 130 },
  { field: "lastName", headerName: "Last name", width: 130 },
  {
    field: "age",
    headerName: "Age",
    type: "number",
    width: 90,
  },
  {
    field: "fullName",
    headerName: "Full name",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 160,
    valueGetter: (value, row) => `${row.firstName || ""} ${row.lastName || ""}`,
  },
];

const rows = [
  { id: 1, lastName: "Snow", firstName: "Jon", age: 35 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 42 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 45 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
  { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
  { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
  { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
  { id: 11, lastName: "Snow", firstName: "Jon", age: 35 },
  { id: 21, lastName: "Lannister", firstName: "Cersei", age: 42 },
  { id: 31, lastName: "Lannister", firstName: "Jaime", age: 45 },
  { id: 41, lastName: "Stark", firstName: "Arya", age: 16 },
  { id: 51, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 61, lastName: "Melisandre", firstName: null, age: 150 },
  { id: 71, lastName: "Clifford", firstName: "Ferrara", age: 44 },
  { id: 81, lastName: "Frances", firstName: "Rossini", age: 36 },
  { id: 91, lastName: "Roxie", firstName: "Harvey", age: 65 },
  { id: 12, lastName: "Snow", firstName: "Jon", age: 35 },
  { id: 22, lastName: "Lannister", firstName: "Cersei", age: 42 },
  { id: 32, lastName: "Lannister", firstName: "Jaime", age: 45 },
  { id: 42, lastName: "Stark", firstName: "Arya", age: 16 },
  { id: 52, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 62, lastName: "Melisandre", firstName: null, age: 150 },
  { id: 72, lastName: "Clifford", firstName: "Ferrara", age: 44 },
  { id: 82, lastName: "Frances", firstName: "Rossini", age: 36 },
  { id: 92, lastName: "Roxie", firstName: "Harvey", age: 65 },
  { id: 13, lastName: "Snow", firstName: "Jon", age: 35 },
  { id: 23, lastName: "Lannister", firstName: "Cersei", age: 42 },
  { id: 33, lastName: "Lannister", firstName: "Jaime", age: 45 },
  { id: 43, lastName: "Stark", firstName: "Arya", age: 16 },
  { id: 53, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 63, lastName: "Melisandre", firstName: null, age: 150 },
  { id: 73, lastName: "Clifford", firstName: "Ferrara", age: 44 },
  { id: 83, lastName: "Frances", firstName: "Rossini", age: 36 },
  { id: 93, lastName: "Roxie", firstName: "Harvey", age: 65 },
];

const paginationModel = { page: 0, pageSize: 10 };

const TutorList = () => {
  return (
    <Box display="flex" m="20px">
      <Paper sx={{ width: "1300px", backgroundColor: "transparent" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 25]}
          checkboxSelection
          sx={{ border: 0 }}
        />
      </Paper>
    </Box>
  );
};

export default TutorList;
