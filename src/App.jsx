import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "./api/base44.js";
import Login from "./pages/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";
import MobileNav from "./components/MobileNav.jsx";
import Overview from "./pages/Overview.jsx";
import Messages from "./pages/Messages.jsx";
import Subscribers from "./pages/Subscribers.jsx";
import Enterprise from "./pages/Enterprise.jsx";
import DistressFlags from "./pages/DistressFlags.jsx";
import AccessCodes from "./pages/AccessCodes.jsx";
import CardTemplates from "./pages/CardTemplates.jsx";
import InstitutionOverview from "./pages/InstitutionOverview.jsx";
import InstitutionRoster from "./pages/InstitutionRoster.jsx";
import InstitutionFlags from "./pages/InstitutionFlags.jsx";
import Redeem from "./pages/Redeem.jsx";

function ProtectedLayout({ user, setUser }) {
  const [viewAs, setViewAs] = useState(null);
  const activeUser = viewAs || user;
  const isInstitution = activeUser?.role === "institution";

  return (
    <div className="flex min-h-screen bg-ll-offwhite">
      <div className="hidden md:block">
        <Sidebar user={activeUser} realUser={user} onImpersonate={u => setViewAs(u)} />
      </div>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40">
        <MobileNav user={activeUser} realUser={user} onImpersonate={u => setViewAs(u)} />
      </div>
      <main className="flex-1 md:ml-64 min-h-screen overflow-y-auto pt-16 md:pt-0">
        {isInstitution ? (
          <Routes>
            <Route path="/"       element={<InstitutionOverview user={activeUser} />} />
            <Route path="/roster" element={<InstitutionRoster   user={activeUser} />} />
            <Route path="/flags"  element={<InstitutionFlags    user={activeUser} />} />
            <Route path="*"       element={<Navigate to="/" />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/"               element={<Overview       user={activeUser} />} />
            <Route path="/messages"       element={<Messages       user={activeUser} />} />
            <Route path="/subscribers"    element={<Subscribers    user={activeUser} />} />
            <Route path="/enterprise"     element={<Enterprise     user={activeUser} />} />
            <Route path="/flags"          element={<DistressFlags  user={activeUser} />} />
            <Route path="/codes"          element={<AccessCodes    user={activeUser} />} />
            <Route path="/card-templates" element={<CardTemplates  user={activeUser} />} />
            <Route path="*"               element={<Navigate to="/" />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => auth.getUser());

  return (
    <BrowserRouter>
      <Routes>
        {/* Public — no login required */}
        <Route path="/redeem" element={<Redeem />} />

        {/* Auth-gated */}
        <Route path="/*" element={
          user
            ? <ProtectedLayout user={user} setUser={setUser} />
            : <Login onLogin={u => setUser(u)} />
        } />
      </Routes>
    </BrowserRouter>
  );
}
