import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../services/client";

/* 
Formulario de registro/edición de proveedores
Campos: 
Empresa, Teléfono
*/

function Proveedores() {
  const [idProveedor, setIdProveedor] = useState(null);
  const [empresa, setEmpresa] = useState("");
  const [telefono, setTelefono] = useState("");

  const location = useLocation();

  const limpiarFormulario = () => {
    setIdProveedor(null);
    setEmpresa("");
    setTelefono("");
  };

  // 🧩 Crear proveedor
  const crearProveedor = async (e) => {
    e.preventDefault();

    if (!empresa || !telefono) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const { data, error } = await supabase.from("Proveedores").insert({
        empresa,
        telefono,
      });

      if (error) throw error;
      limpiarFormulario();
      alert("✅ Proveedor registrado con éxito.");
      console.log("Proveedor creado:", data);
    } catch (error) {
      alert(`❌ Error al registrar el proveedor: ${error.message}`);
      console.error(error);
    }
  };

  // 🧩 Actualizar proveedor
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

    try {
      const { data, error } = await supabase
        .from("Proveedores")
        .update({ empresa, telefono })
        .eq("id", idProveedor);

      if (error) throw error;
      limpiarFormulario();
      alert("✅ Proveedor actualizado con éxito.");
      console.log("Proveedor actualizado:", data);
    } catch (error) {
      alert(`❌ Error al actualizar el proveedor: ${error.message}`);
      console.error(error);
    }
  };

  // 📦 Cargar proveedor si viene desde "consulta-proveedores"
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
    <div className="container mt-4">
      <h2 className="text-center mb-4">
        {idProveedor ? "Editar Proveedor" : "Registrar Proveedor"}
      </h2>

      <form
        className="w-50 mx-auto"
        onSubmit={idProveedor ? actualizarProveedor : crearProveedor}
      >
        {/* Empresa */}
        <div className="mb-3">
          <label htmlFor="empresa" className="form-label">
            Empresa *:
          </label>
          <input
            type="text"
            className="form-control text-center"
            id="empresa"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            required
          />
        </div>

        {/* Teléfono */}
        <div className="mb-3">
          <label htmlFor="telefono" className="form-label">
            Teléfono *:
          </label>
          <input
            type="text"
            className="form-control text-center"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
        </div>

        {/* Botones */}
        <div className="d-flex justify-content-center gap-2">
          <button
            type="submit"
            className={`btn ${idProveedor ? "btn-success" : "btn-primary"}`}
          >
            {idProveedor ? "Actualizar" : "Crear"}
          </button>
          <Link to="/consulta-proveedores" className="btn btn-secondary">
            Consultar Proveedores
          </Link>
          <Link to="/" className="btn btn-danger">
            X
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Proveedores;
