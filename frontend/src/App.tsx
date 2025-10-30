import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./App.css";
import { useAuth } from "./hooks/useAuth";
import { useEvents } from "./hooks/useEvents";
import Navbar from "./components/layout/Navbar";
import HomePage from "./components/pages/HomePage";
import MyEventsPage from "./components/pages/MyEventsPage";
import ProfilePage from "./components/pages/ProfilePage";
import ManageEventsPage from "./components/pages/ManageEventsPage";
import CreateEventForm from "./components/forms/CreateEventForm";
import LoginPage from "./components/pages/LoginPage";
import AdminPage from "./components/pages/AdminPage";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ChatToggle from "./components/ChatToggle"; // ✅ seul point d’entrée du chat

function App() {
  const { user } = useAuth();
  const { events, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEvents();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredEvents = events.filter((event) => {
    const matchesCategory = filter === "All" || event.category === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!user) return <LoginPage />;

  const renderCurrentPage = () => {
    switch (location.pathname) {
      case "/myevents": return <MyEventsPage />;
      case "/profile": return <ProfilePage />;
      case "/create-event": return <CreateEventForm />;
      case "/manage-events": return <ManageEventsPage />;
      case "/admin": return <AdminPage />;
      case "/":
      default:
        return (
          <HomePage
            filteredEvents={filteredEvents}
            filter={filter}
            setFilter={setFilter}
            loading={eventsLoading}
            error={eventsError}
            onRefetch={refetchEvents}
          />
        );
    }
  };

  return (
    <div className="App">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      {renderCurrentPage()}
      <ChatToggle /> {/* ✅ exactement UNE seule fois */}
    </div>
  );
}

export default App;
