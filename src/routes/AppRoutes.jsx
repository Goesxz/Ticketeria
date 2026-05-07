import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";
import EventDetails from "../pages/EventDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Checkout from "../pages/Checkout";
import Confirmation from "../pages/Confirmation";
import CreateEvent from "../pages/CreateEvent";
import MyTickets from "../pages/MyTickets";
import Organizer from "../pages/Organizer";
import Cart from "../pages/Cart";
import Success from "../pages/Success";
import Profile from "../pages/Profile";
import Faq from "../pages/Faq";

// Redireciona para /login se não autenticado
function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function NotFound() {
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        fontFamily: "var(--font-sans)",
        color: "var(--text-muted)",
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: "3rem" }}>404</span>
      <h2
        style={{
          color: "var(--text-primary)",
          margin: 0,
          fontFamily: "var(--font-display)",
        }}
      >
        Página não encontrada
      </h2>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/evento/:id" element={<EventDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/faq" element={<Faq />} />

      {/* Semi-protegidas */}
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/success" element={<Success />} />
      <Route path="/meus-ingressos" element={<MyTickets />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/criar-evento" element={<CreateEvent />} />
      <Route path="/organizador" element={<Organizer />} />

      {/* Protegidas */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
