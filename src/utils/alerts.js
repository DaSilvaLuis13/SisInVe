// src/utils/alerts.js
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export const alertaExito = (mensaje) => {
  return Swal.fire({
    icon: "success",
    title: "Éxito",
    text: mensaje,
    confirmButtonColor: "#4CAF50",
  });
};

export const alertaError = (mensaje) => {
  return Swal.fire({
    icon: "error",
    title: "Error",
    text: mensaje,
    confirmButtonColor: "#d33",
  });
};

export const alertaInfo = (mensaje) => {
  return Swal.fire({
    icon: "info",
    title: "Información",
    text: mensaje,
    confirmButtonColor: "#3085d6",
  });
};

export const alertaConfirmacion = async (mensaje) => {
  const result = await Swal.fire({
    title: "Confirmar",
    text: mensaje,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#aaa",
  });
  return result.isConfirmed;
};
