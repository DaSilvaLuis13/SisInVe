// Aquí van los import que necesites incorporar elementos de la carpeta components
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../services/client";

/* 
Formulario de registro/edición de clientes
Nombres, apellidos
Domicilio, teléfono
Límite de crédito (opcional)
*/

function Clientes() {
  const [idCliente, setIdCliente] = useState(null);
  const [nombre, setNombre] = useState("");
  const [aPaterno, setAPaterno] = useState("");
  const [aMaterno, setAMaterno] = useState("");
  const [domicilioCliente, setDomicilioCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [limiteCredito, setLimiteCredito] = useState("");

  const location = useLocation();

  // Validar campos obligatorios
  const validarCampos = () => {
    if (!nombre || !aPaterno || !aMaterno || !domicilioCliente || !telefonoCliente) {
      alert("Por favor llena todos los campos obligatorios");
      return false;
    }
    return true;
  };

  const limpiarFormulario = () => {
    setIdCliente(null);
    setNombre("");
    setAPaterno("");
    setAMaterno("");
    setDomicilioCliente("");
    setTelefonoCliente("");
    setLimiteCredito("");
  };

  const crearCliente = async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;

    try {
      const { data, error } = await supabase.from("Clientes").insert({
        nombres: nombre,
        apellido_paterno: aPaterno,
        apellido_materno: aMaterno,
        domicilio: domicilioCliente,
        telefono: telefonoCliente,
        limite_credito: limiteCredito ? Number(limiteCredito) : null,
      });

      if (error) throw error;

      limpiarFormulario();
      console.log("✅ Cliente creado:", data);
    } catch (error) {
      console.error("❌ Error al crear cliente:", error);
    }
  };

  const actualizarCliente = async (e) => {
    e.preventDefault();
    if (!idCliente) {
      alert("Primero selecciona un cliente para actualizar.");
      return;
    }
    if (!validarCampos()) return;

    try {
      const { data, error } = await supabase
        .from("Clientes")
        .update({
          nombres: nombre,
          apellido_paterno: aPaterno,
          apellido_materno: aMaterno,
          domicilio: domicilioCliente,
          telefono: telefonoCliente,
          limite_credito: limiteCredito ? Number(limiteCredito) : null,
        })
        .eq("id", idCliente);

      if (error) throw error;

      limpiarFormulario();
      console.log("✅ Cliente actualizado:", data);
    } catch (error) {
      console.error("❌ Error al actualizar cliente:", error);
    }
  };

  // Cargar datos si vienen desde otra ruta (modo edición)
  useEffect(() => {
    if (location.state?.cliente) {
      const c = location.state.cliente;
      setIdCliente(c.id);
      setNombre(c.nombres);
      setAPaterno(c.apellido_paterno);
      setAMaterno(c.apellido_materno);
      setDomicilioCliente(c.domicilio);
      setTelefonoCliente(c.telefono);
      setLimiteCredito(c.limite_credito || "");

      // Limpiar state para que no persista al recargar
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">
        {idCliente ? "Editar Cliente" : "Registrar Cliente"}
      </h2>

      <form className="w-50 mx-auto" onSubmit={idCliente ? actualizarCliente : crearCliente}>
        <div className="mb-3">
          <label htmlFor="nombres" className="form-label">
            Nombres:
          </label>
          <input
            type="text"
            className="form-control text-center"
            id="nombres"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="apellidoP" className="form-label">
            Apellido Paterno:
          </label>
          <input
            type="text"
            className="form-control text-center"
            id="apellidoP"
            value={aPaterno}
            onChange={(e) => setAPaterno(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="apellidoM" className="form-label">
            Apellido Materno:
          </label>
          <input
            type="text"
            className="form-control text-center"
            id="apellidoM"
            value={aMaterno}
            onChange={(e) => setAMaterno(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="domicilio" className="form-label">
            Domicilio:
          </label>
          <input
            type="text"
            className="form-control text-center"
            id="domicilio"
            value={domicilioCliente}
            onChange={(e) => setDomicilioCliente(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="telefono" className="form-label">
            Teléfono:
          </label>
          <input
            type="text"
            className="form-control text-center"
            id="telefono"
            value={telefonoCliente}
            onChange={(e) => setTelefonoCliente(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="limite" className="form-label">
            Límite de crédito (opcional):
          </label>
          <input
            type="number"
            className="form-control text-center"
            id="limite"
            min={0}
            max={5000}
            value={limiteCredito}
            onChange={(e) => setLimiteCredito(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-center gap-2">
          <button
            type="submit"
            className={`btn ${idCliente ? "btn-success" : "btn-primary"}`}
          >
            {idCliente ? "Actualizar" : "Crear"}
          </button>

          <Link to="/consulta-clientes" className="btn btn-secondary">
            Consultar Clientes
          </Link>
          <Link to="/" className="btn btn-danger">
            X
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Clientes;
