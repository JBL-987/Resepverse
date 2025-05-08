import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './views/Home';
import { Chat } from './views/chat/Index';
import NotFound from './views/NotFound';

const App: React.FC = () => {
  return (
    <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:threadId" element={<Chat />} />
            </Route>
            <Route path="/home" element={<Navigate replace to="/" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
    </BrowserRouter>
  );
};

export default App;