import React from "react";
import ReactDOM from "react-dom/client";
import 'bootstrap/dist/css/bootstrap.min.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import EventDashboard from "./pages/EventDashboard";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/myevents", element: <App /> },
  { path: "/profile", element: <App /> },
  { path: "/create-event", element: <App /> },
  { path: "/manage-events", element: <App /> },
  { path: "/admin", element: <App /> },
  { path: "/organizer/events/:id/dashboard", element: <EventDashboard /> },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);