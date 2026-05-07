import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import Checkout from "./pages/Checkout.jsx";
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Success from "./pages/Success.jsx";
import MyTickets from "./pages/MyTickets.jsx";
import { useAuth } from "./context/AuthContext";
import About from "./pages/About.jsx";
import Profile from "./pages/Profile.jsx";
import Faq from "./pages/Faq.jsx";
import Orders from "./pages/Orders.jsx";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function NotFound() {
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "var(--font-sans)",
        color: "var(--text-muted)",
      }}
    >
      <span style={{ fontSize: "3rem" }}>🎟️</span>
      <h2
        style={{
          color: "var(--text-primary)",
          margin: 0,
          fontFamily: "var(--font-display)",
        }}
      >
        Página não encontrada
      </h2>
      <p style={{ margin: 0 }}>Esta página não existe ainda.</p>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Navbar />
      <Layout>
        <main style={{ paddingTop: "64px" }}>
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/evento/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/faq" element={<Faq />} />

            {/* Protegidas */}
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/success"
              element={
                <PrivateRoute>
                  <Success />
                </PrivateRoute>
              }
            />
            <Route
              path="/meus-ingressos"
              element={
                <PrivateRoute>
                  <MyTickets />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />
            <Route path="/sobre" element={<About />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Layout>
    </ThemeProvider>
  );
}
