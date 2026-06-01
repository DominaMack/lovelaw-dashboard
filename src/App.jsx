import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "./api/base44.js";
import Login from "./pages/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Overview from "./pages/Overview.jsx";
import Messages from "./pages/Messages.jsx";
import Subscribers from "./pages/Subscribers.jsx";
import Enterprise from "./pages/Enterprise.jsx";
import DistressFlags from "./pages/DistressFlags.jsx";
import AccessCodes from "./pages/AccessCodes.jsx";

function ProtectedLayout({ user }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar user={user} />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <Routes>
          <Route path="/" element={<Overview user={user} />} />
          <Route path="/messages" element={<Messages user={user} />} />
          <Route path="/subscribers" element={<Subscribers user={user} />} />
          <Route path="/enterprise" element={<Enterprise user={user} />} />
          <Route path="/flags" element={<DistressFlags user={user} />} />
          <Route path="/codes" element={<AccessCodes user={user} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(auth.getUser());

  function handleLogin(u) { setUser(u); }

  if (!user) return (
    <BrowserRouter>
      <Login onLogin={handleLogin} />
    </BrowserRouter>
  );

  return (
    <BrowserRouter>
      <ProtectedLayout user={user} />
    </BrowserRouter>
  );
}
