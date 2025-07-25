import Login from "./scenes/login/Login";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard/Dashboard";
import TutorList from "./scenes/Tutor/TutorList";
import NewTutor from "./scenes/Tutor/NewTutor";
import TutorProfile from "./scenes/Tutor/TutorProfile";
import StudentList from "./scenes/Student/StudentList";
import NewStudent from "./scenes/Student/NewStudent";
import StudentProfile from "./scenes/Student/StudentProfile";
import SubjectList from "./scenes/Subject/SubjectList";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import TutoringBayList from "./scenes/Location/TutoringBayList";

function App() {
  const [theme, colorMode] = useMode();
  const { currentUser } = useContext(AuthContext);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          {currentUser ? (
            <div className="app">
              <Sidebar />
              <main className="content">
                <Topbar />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/tutors" element={<TutorList />} />
                  <Route path="/newtutor" element={<NewTutor />} />
                  <Route path="tutor/:tutorId" element={<TutorProfile />} />
                  <Route path="/students" element={<StudentList />} />
                  <Route path="/student/:studentId" element={<StudentProfile />} />
                  <Route path="/newstudent" element={<NewStudent />} />
                  <Route path="/subjects" element={<SubjectList />} />
                  <Route path="/tutoringbays" element={<TutoringBayList />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Routes>
              <Route path="*" element={<Login />} />
            </Routes>
          )}
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
