// src/routes/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useCaja } from "../context/CajaContext";

export const ProtectedRoute = ({ children }) => {
  const { cajaAbierta, loading } = useCaja();

  if (loading) return <div>Cargando...</div>;

  if (!cajaAbierta) {
    return <Navigate to="/apertura-caja" replace />;
  }

  return children;
};
