import { React, useState } from "react";
import {
  TextField,
  List,
  ListItem,
  ListItemText,
  Button,
  Paper,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

const TutorBlockedStudents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Call to Firebase to retrive students
  const allStudents = [
    { id: "1", name: "Alice Johnson" },
    { id: "2", name: "Bob Smith" },
    { id: "3", name: "Carol Williams" },
    { id: "4", name: "David Brown" },
    { id: "5", name: "Emma Davis" },
    { id: "6", name: "Frank Miller" },
    { id: "7", name: "Grace Wilson" },
    { id: "8", name: "Henry Taylor" },
    { id: "9", name: "Isabel Anderson" },
    { id: "10", name: "Jack Thompson" },
  ];

  const filteredStudents =
    searchTerm.trim() === ""
      ? []
      : allStudents.filter((student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const handleAddStudent = (student) => {
    if (!selectedStudents.some((s) => s.id === student.id)) {
      setSelectedStudents([...selectedStudents, student]);
      setSearchTerm("");
    }
  };

  const handleRemoveStudent = (studentId) => {
    setSelectedStudents(
      selectedStudents.filter((student) => student.id !== studentId)
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ position: "relative", mb: 2 }}>
        <TextField
          fullWidth
          label="Students"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Start typing to search..."
          slotProps={{
            input: {
              startAdornment: (
                <SearchIcon size={20} style={{ marginRight: "8px" }} />
              ),
            },
          }}
        />
      </Box>

      {searchTerm.trim() !== "" && (
        <Paper elevation={2} sx={{ mb: 4 }}>
          <List>
            {filteredStudents.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No matching students found"
                  sx={{ color: "text.secondary" }}
                />
              </ListItem>
            ) : (
              filteredStudents.map((student) => (
                <ListItem
                  key={student.id}
                  secondaryAction={
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAddStudent(student)}
                      disabled={selectedStudents.some(
                        (s) => s.id === student.id
                      )}
                    >
                      Add
                    </Button>
                  }
                >
                  <ListItemText primary={student.name} />
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      )}

      <Paper elevation={2}>
        <List>
          {selectedStudents.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No blocked students"
                secondary="Search and add students above"
                sx={{ color: "text.secondary" }}
              />
            </ListItem>
          ) : (
            selectedStudents.map((student) => (
              <ListItem
                key={student.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="remove"
                    onClick={() => handleRemoveStudent(student.id)}
                    size="small"
                    sx={{ "&:hover": { color: "error.main" } }}
                  >
                    <CloseIcon size={20} />
                  </IconButton>
                }
              >
                <ListItemText primary={student.name} />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default TutorBlockedStudents;
