import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import NewHome from "./views/NewHome";
import { Chat } from "./views/chat/Index";
import { AgentSetup } from "./views/AgentSetup";
import Login from "./views/Login";
import Onboarding from "./views/Onboarding";
import NotFound from "./views/NotFound";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <Routes>
            <Route path="/" element={<NewHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:threadId" element={<Chat />} />
              <Route path="/agent-setup" element={<AgentSetup />} />
            </Route>
            <Route path="/home" element={<Navigate replace to="/" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
