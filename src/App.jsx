import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "./api/base44.js";
import Login from "./pages/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Overview from "./pages/Overview.jsx";
import Messages from "./pages/Messages.jsx";
import Subscribers from "./pages/Subscribers.jsx";
import Enterprise from "./pages/Enterprise.jsx";
import DistressFlags from "./pages/DistressFlags.jsx";
import AccessCodes from "./pages/AccessCodes.jsx";

function ProtectedLayout({ user, setUser }) {
  // For impersonation — founder can view as another role
  const [viewAs, setViewAs] = useState(null);
  const activeUser = viewAs || user;

  function handleImpersonate(u) {
    if (!u) { setViewAs(null); return; }
    setViewAs(u);
  }

  return (
    <div className="flex min-h-screen bg-ll-offwhite">
      <Sidebar user={activeUser} onImpersonate={handleImpersonate} />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <Routes>
          <Route path="/"            element={<Overview user={activeUser} />} />
          <Route path="/messages"    element={<Messages user={activeUser} />} />
          <Route path="/subscribers" element={<Subscribers user={activeUser} />} />
          <Route path="/enterprise"  element={<Enterprise user={activeUser} />} />
          <Route path="/flags"       element={<DistressFlags user={activeUser} />} />
          <Route path="/codes"       element={<AccessCodes user={activeUser} />} />
          <Route path="*"            element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => auth.getUser());

  if (!user) {
    return (
      <BrowserRouter>
        <Login onLogin={(u) => setUser(u)} />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <ProtectedLayout user={user} setUser={setUser} />
    </BrowserRouter>
  );
}
