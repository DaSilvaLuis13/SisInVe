import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../services/client";
import "./clientes.css";
import { alertaExito, alertaError, alertaInfo } from "../utils/alerts";

function Clientes() {
  const [idCliente, setIdCliente] = useState(null);
  const [nombre, setNombre] = useState("");
  const [aPaterno, setAPaterno] = useState("");
  const [aMaterno, setAMaterno] = useState("");
  const [domicilioCliente, setDomicilioCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [limiteCredito, setLimiteCredito] = useState("");
  const [errorTelefono, setErrorTelefono] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const ayuda = () => navigate("/ayuda#registrar_cliente");

  // Validaciones
  const validarCampos = () => {
    if (!nombre || !aPaterno || !aMaterno || !domicilioCliente || !telefonoCliente) {
      alertaInfo("Por favor llena todos los campos obligatorios");
      return false;
    }
    return true;
  };

  const validarTelefono = (telefono) => {
    const regex = /^\d{10}$/;
    if (!regex.test(telefono)) {
      setErrorTelefono("El teléfono debe tener 10 dígitos numéricos.");
      return false;
    }
    setErrorTelefono("");
    return true;
  };

  const handleTelefonoChange = (e) => {
    setTelefonoCliente(e.target.value);
    validarTelefono(e.target.value);
  };

  const verificarSaldoCero = async (idCliente) => {
    try {
      const { data, error } = await supabase
        .from("SaldoCliente")
        .select("monto_que_pagar")
        .eq("id_cliente", idCliente);

      if (error) throw error;

      const tieneDeuda = data.some((item) => parseFloat(item.monto_que_pagar) > 0);
      if (tieneDeuda) {
        alertaError("No se puede editar el cliente mientras tenga deudas pendientes.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error verificando saldo del cliente:", error);
      alertaError("Ocurrió un error al verificar el saldo del cliente.");
      return false;
    }
  };

  const limpiarFormulario = () => {
    setIdCliente(null);
    setNombre("");
    setAPaterno("");
    setAMaterno("");
    setDomicilioCliente("");
    setTelefonoCliente("");
    setLimiteCredito("");
    setErrorTelefono("");
  };

  const crearCliente = async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;
    if (!validarTelefono(telefonoCliente)) return;

    try {
      const { error } = await supabase.from("Clientes").insert({
        nombres: nombre,
        apellido_paterno: aPaterno,
        apellido_materno: aMaterno,
        domicilio: domicilioCliente,
        telefono: telefonoCliente,
        limite_credito: limiteCredito ? Number(limiteCredito) : null,
      });

      if (error) throw error;

      limpiarFormulario();
      alertaExito("Cliente registrado correctamente");
    } catch (error) {
      console.error("Error al crear cliente:", error);
      alertaError("Ocurrió un error al crear el cliente.");
    }
  };

  const actualizarCliente = async (e) => {
    e.preventDefault();
    if (!idCliente) {
      alertaInfo("Primero selecciona un cliente para actualizar.");
      return;
    }
    if (!validarCampos()) return;
    if (!validarTelefono(telefonoCliente)) return;

    const saldoCero = await verificarSaldoCero(idCliente);
    if (!saldoCero) return;

    try {
      const { error } = await supabase
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
      alertaExito("Cliente actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      alertaError("Ocurrió un error al actualizar el cliente.");
    }
  };

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
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);


  return (
  <div className="clientes-container d-flex justify-content-center py-5">
    <div className="card clientes-card p-4">
      <h2 className="text-center mb-4 fw-bold clientes-titulo">
        {idCliente ? "Editar Cliente" : "Registrar Cliente"}
      </h2>

      <form
        onSubmit={idCliente ? actualizarCliente : crearCliente}
        className="clientes-form"
      >
        <div className="row row-cols-1 row-cols-md-2 g-3">
          <div className="col">
            <label className="clientes-label">Nombres:</label>
            <input
              type="text"
              className="form-control clientes-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="col">
            <label className="clientes-label">Apellido Paterno:</label>
            <input
              type="text"
              className="form-control clientes-input"
              value={aPaterno}
              onChange={(e) => setAPaterno(e.target.value)}
            />
          </div>
          <div className="col">
            <label className="clientes-label">Apellido Materno:</label>
            <input
              type="text"
              className="form-control clientes-input"
              value={aMaterno}
              onChange={(e) => setAMaterno(e.target.value)}
            />
          </div>
          <div className="col">
            <label className="clientes-label">Domicilio:</label>
            <input
              type="text"
              className="form-control clientes-input"
              value={domicilioCliente}
              onChange={(e) => setDomicilioCliente(e.target.value)}
            />
          </div>
          <div className="col">
            <label className="clientes-label">Teléfono:</label>
            <input
              type="text"
              className={`form-control clientes-input ${
                errorTelefono ? "is-invalid" : ""
              }`}
              value={telefonoCliente}
              onChange={handleTelefonoChange}
            />
            {errorTelefono && (
              <div className="invalid-feedback clientes-feedback">{errorTelefono}</div>
            )}
          </div>
          <div className="col">
            <label className="clientes-label">Límite de crédito (opcional):</label>
            <input
              type="number"
              min={0}
              max={5000}
              className="form-control clientes-input"
              value={limiteCredito}
              onChange={(e) => setLimiteCredito(e.target.value)}
            />
          </div>
        </div>

        <div className="clientes-botones mt-4 d-flex gap-2 justify-content-center flex-wrap">
          <button
            type="submit"
            className={`clientes-btn ${
              idCliente ? "clientes-btn-actualizar" : "clientes-btn-registrar"
            }`}
            disabled={!!errorTelefono}
          >
            {idCliente ? "Actualizar" : "Registrar"}
          </button>
          <Link to="/consulta-clientes" className="clientes-btn clientes-btn-consultar">
            Consultar Clientes
          </Link>
          <button
            type="button"
            className="clientes-btn clientes-btn-cancelar"
            onClick={limpiarFormulario}
          >
            Cancelar
          </button>
                <button type="button" className="btn-ac" onClick={ayuda}>Ayuda</button>
        </div>
      </form>
    </div>
  </div>
);

}

export default Clientes;
