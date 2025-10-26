import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../services/client";
import "./proveedores.css";

function Proveedores() {
  const [idProveedor, setIdProveedor] = useState(null);
  const [empresa, setEmpresa] = useState("");
  const [telefono, setTelefono] = useState("");
  const [errorTelefono, setErrorTelefono] = useState("");

  const location = useLocation();

  const limpiarFormulario = () => {
    setIdProveedor(null);
    setEmpresa("");
    setTelefono("");
    setErrorTelefono("");
  };

  const validarTelefono = (numero) => {
    const regex = /^\d{10}$/;
    if (!regex.test(numero)) {
      setErrorTelefono("El teléfono debe tener 10 dígitos numéricos.");
      return false;
    }
    setErrorTelefono("");
    return true;
  };

  const handleTelefonoChange = (e) => {
    setTelefono(e.target.value);
    validarTelefono(e.target.value);
  };

  const crearProveedor = async (e) => {
    e.preventDefault();
    if (!empresa || !telefono) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    if (!validarTelefono(telefono)) return;

    try {
      const { data, error } = await supabase.from("Proveedores").insert({
        empresa,
        telefono,
      });
      if (error) throw error;
      limpiarFormulario();
      alert("✅ Proveedor registrado con éxito.");
    } catch (error) {
      console.error("❌ Error al registrar el proveedor:", error);
      alert("❌ Error al registrar el proveedor");
    }
  };

  const actualizarProveedor = async (e) => {
    e.preventDefault();
    if (!idProveedor) {
      alert("Primero selecciona un proveedor para actualizar.");
      return;
    }
    if (!empresa || !telefono) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    if (!validarTelefono(telefono)) return;

    try {
      const { data, error } = await supabase
        .from("Proveedores")
        .update({ empresa, telefono })
        .eq("id", idProveedor);
      if (error) throw error;
      limpiarFormulario();
      alert("✅ Proveedor actualizado con éxito.");
    } catch (error) {
      console.error("❌ Error al actualizar el proveedor:", error);
      alert("❌ Error al actualizar el proveedor");
    }
  };

  useEffect(() => {
    if (location.state?.proveedor) {
      const p = location.state.proveedor;
      setIdProveedor(p.id);
      setEmpresa(p.empresa);
      setTelefono(p.telefono);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className="proveedores-container">
      <div className="proveedores-card">
        <h2 className="proveedores-titulo text-center mb-4">
          {idProveedor ? "Editar Proveedor" : "Registrar Proveedor"}
        </h2>

        <form
          className="proveedores-form"
          onSubmit={idProveedor ? actualizarProveedor : crearProveedor}
        >
          <div className="form-group">
            <label>Empresa:</label>
            <input
              type="text"
              className="form-control"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Teléfono:</label>
            <input
              type="text"
              className={`form-control ${errorTelefono ? "is-invalid" : ""}`}
              value={telefono}
              onChange={handleTelefonoChange}
            />
            {errorTelefono && <div className="invalid-feedback">{errorTelefono}</div>}
          </div>

          <div className="proveedores-botones mt-4">
            <button
              type="submit"
              className={`btn ${idProveedor ? "btn-success" : "btn-primary"}`}
              disabled={!!errorTelefono}
            >
              {idProveedor ? "Actualizar" : "Crear"}
            </button>
            <Link to="/consulta-proveedores" className="btn btn-secondary">
              Consultar Proveedores
            </Link>
            <button type="button" className="btn btn-danger" onClick={limpiarFormulario}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Proveedores;
