import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Slider from "react-slick";
import "./App.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./services/firebase";
import { ModernAuthUI } from "./components/ModernAuthUI";
import QRCode from "react-qr-code";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion, AnimatePresence } from "framer-motion";

  function AnimatedRoutes({ user, filteredEvents, filter, setFilter, events }: any) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* HOME PAGE */}
        <Route
          path="/"
          element={
            <motion.main
              className="event-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="section-title">Upcoming Events</h2>

              <div className="filter-bar">
                {["All", "Sports", "Technology", "Music", "Competition"].map((cat) => (
                  <button
                    key={cat}
                    className={`filter-btn ${filter === cat ? "active" : ""}`}
                    onClick={() => setFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="event-grid">
                {filteredEvents.map((event: any, index: number) => (
                  <motion.div
                    key={event.id}
                    className="event-card"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => navigate(`/event/${event.id}`)}  
                  >
                    <img src={event.image} alt={event.title} className="event-img" />
                    <h3>{event.title}</h3>
                    <p>{event.category}</p>
                  </motion.div>
                ))}
              </div>
            </motion.main>
          }
        />

        {/* MY EVENTS PAGE */}
        <Route
          path="/myevents"
          element={
            <motion.main
              className="profile-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="section-title">My Events</h2>
              <p>You haven’t registered for any events yet.</p>
            </motion.main>
          }
        />

        {/* PROFILE PAGE */}
        <Route
          path="/profile"
          element={
            <motion.main
              className="profile-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="profile-card">
                <h2>My Profile</h2>
                <p>
                <strong>Email:</strong> {user.email}
                </p>
                <h3>My Tickets 🎟️</h3>
                <div className="ticket-display">
                  <QRCode value={`Ticket for ${user.email}`} size={128} />
                  <p>Example QR Code Ticket</p>
                </div>
              </div>
            </motion.main>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

  function App() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
 

  const events = [
    {
      id: 1,
      title: "Concordia Homecoming",
      category: "Sports",
      image: "/images/event1.jpg",
      fee: 10,
      location: "Stinger Dome, Loyola",
      date: "2025-03-21",
      description: "Celebrate Concordia pride with games, food, and music.",
    },
    {
      id: 2,
      title: "Tech Fair 2025",
      category: "Technology",
      image: "/images/event2.jpg",
      fee: 0,
      location: "EV Building, Downtown Campus",
      date: "2025-03-25",
      description: "Meet top companies and explore cutting-edge innovations.",
    },
    {
      id: 3,
      title: "Music Night @ Loyola",
      category: "Music",
      image: "/images/event3.jpg",
      fee: 5,
      location: "Loyola Auditorium",
      date: "2025-03-28",
      description: "Live performances from Concordia’s student bands!",
    },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
  };

    const filteredEvents = events.filter((event) => {
    const matchesCategory = filter === "All" || event.category === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

    const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    pauseOnHover: true,
    draggable: true,
    swipeToSlide: true,
    adaptiveHeight: true,
  };

    // LOGIN PAGE
    if (!user) {
    const images = ["/images/event1.jpg", "/images/event2.jpg", "/images/event3.jpg"];

    return (
      <div className="App split-layout">
        {/* LEFT SIDE - LOGIN */}
        <div className="auth-side">
          <div className="app-logo">
            <div className="app-logo-icon">C</div>
            <span className="app-logo-text">CUEvents</span>
          </div>
          <h1 className="app-title">CUEvents</h1>
          <p className="app-subtitle">Your Gateway to Campus Happenings 🎉</p>
          <p className="app-subtitle">See you at any Concordia Event!</p>

          <motion.div
            className="auth-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <ModernAuthUI />
          </motion.div>
        </div>

        {/* RIGHT SIDE - SLIDER GALLERY */}
        <div className="slider-side">
          <Slider {...sliderSettings}>
            {images.map((img, index) => (
              <div key={index} className="slide">
                <div className="overlay" />
                <img src={img} alt={`Slide ${index + 1}`} />
                <div className="slide-caption">
                  <h3>Campus Events</h3>
                  <p>Discover & Attend Exciting Activities</p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    );
  }

  // MAIN APP (AFTER LOGIN)
  return (
    <Router>
      <div className="App">
        {/* NAVBAR */}
        <nav className="navbar">
        <Link to="/" className="logo">
        CUEvents
        </Link>

          <input
            type="text"
            className="search-bar"
            placeholder="🔍 Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/myevents">My Events</Link>
            <div className="profile-menu-container">
            <div
                  className="profile-avatar"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {user.email[0].toUpperCase()}
            </div>

              {showProfileMenu && (
            <div className="profile-dropdown">
            <p className="profile-greeting">Hi, {user.email.split("@")[0]} 👋</p>
            <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
            My Profile
            </Link>
            <button
            className="signout-btn"
            onClick={() => {
            setShowProfileMenu(false);
            handleSignOut();
            }}
          >
          ⎋ Sign Out
          </button>
          </div>
          )}
          </div>

          </div>
        </nav>

        <AnimatedRoutes
          user={user}
          events={events}
          filteredEvents={filteredEvents}
          filter={filter}
          setFilter={setFilter}
          handleSignOut={handleSignOut}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      
      </div>
    </Router>
  );
}

export default App;
