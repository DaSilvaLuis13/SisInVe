//Aquí van los import que necesites incorporar elementos de la carpeta components
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../services/client"

/* 
Formulario de registro/edición de clientes
Nombres, apellidos
Domicilio, teléfono
Límite de crédito (opcional)
*/

function Clientes() {
  const [idCliente, setIdCliente] = useState(null)
  const [nombre, setNombre] = useState('')
  const [aPaterno, setAPaterno] = useState('')
  const [aMaterno, setAMaterno] = useState('')
  const [domicilioCliente, setDocimilio] = useState('')
  const [telefonoCliente, setTelefonoCliente] = useState('')
  const [limitiCredito, setLimiteCliente] = useState('')

  const crearCliente = async e => {
    e.preventDefault()
    
    try {
      const { data, error } = await supabase.from("Clientes").insert({
      nombres: nombre,
      apellido_pagitterno: aPaterno,
      apellido_materno: aMaterno,
      domicilio: domicilioCliente,
      telefono: telefonoCliente,
      limite_credito: limitiCredito ? Number(limitiCredito) : null
    });


      if (error) throw error;

      // ✅ Reiniciar valores del formulario
      setIdCliente(null);
      setNombre('');
      setAPaterno('');
      setAMaterno('');
      setDocimilio('');
      setTelefonoCliente('');
      setLimiteCliente('');

      console.log("Cliente creado:", data);

    } catch (error) {
      console.log(error)
    }
  }

  const actualizarCliente = async e => {
    e.preventDefault()

    if (!idCliente) {
      alert("Primero selecciona un cliente para actualizar.");
      return;
    }
    
    try {
      const { data, error } = await supabase.from("Clientes").update({
      nombres: nombre,
      apellido_paterno: aPaterno,
      apellido_materno: aMaterno,
      domicilio: domicilioCliente,
      telefono: telefonoCliente,
      limite_credito: limitiCredito ? Number(limitiCredito) : null
    }).eq('id', idCliente);


      if (error) throw error;

      // ✅ Reiniciar valores del formulario
      setIdCliente(null);
      setNombre('');
      setAPaterno('');
      setAMaterno('');
      setDocimilio('');
      setTelefonoCliente('');
      setLimiteCliente('');

      console.log("Cliente actualizado:", data);

    } catch (error) {
      console.log(error)
    }
  }

  const location = useLocation();
    useEffect(() => {
  if(location.state?.cliente){
    const c = location.state.cliente;
    setIdCliente(c.id);
    setNombre(c.nombres);
    setAPaterno(c.apellido_paterno);
    setAMaterno(c.apellido_materno);
    setDocimilio(c.domicilio);
    setTelefonoCliente(c.telefono);
    setLimiteCliente(c.limite_credito || '');
    
    // Limpiar state para que no persista en reload
    window.history.replaceState({}, document.title);
  }
}, [location.state]);


  return (
    <div>
      <h2>Registrar Cliente</h2>
      <div className="container">
        <div className="d-flex gap-2 justify-content-center">
          <button 
            type="button"   // importante: NO submit
            className="btn btn-primary"
            onClick={crearCliente}  // se ejecuta solo al hacer click
          >
            Crear
          </button>
          
          <button 
            type="button" 
            className="btn btn-success"
            onClick={actualizarCliente}
          >
            Editar
          </button>
           
        </div>
        <Link to="/consulta-clientes" className="btn btn-secondary m-2">Consultar Clientes</Link>

      </div>
      <form className="container w-50">
        
        <div className="row mb-3">
          <label htmlFor="nombres" className="form-label">Nombres:</label>
          <input 
            type="text" 
            className="form-control text-center" 
            id="nombres" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>


        <div className="row mb-3">
          <label htmlFor="apellidoP" className="form-label">Apellido Paterno:</label>
            <input 
              type="text" 
              className="form-control text-center" 
              id="apellidoP" 
              value={aPaterno}
              onChange={(e) => setAPaterno(e.target.value)}
            />
        </div>

        <div className="row mb-3">
          <label htmlFor="apellidoM" className="form-label">Apellido Materno:</label>
            <input 
              type="text" 
              className="form-control text-center" 
              id="apellidoM"
              value={aMaterno}
              onChange={(e) => setAMaterno(e.target.value)}
            />
        </div>

        <div className="row mb-3">
          <label htmlFor="domicilio" className="form-label">Domicilio:</label>
            <input 
              type="text" 
              className="form-control text-center" 
              id="domicilio" 
              value={domicilioCliente}
              onChange={(e) => setDocimilio(e.target.value)}
            />
        </div>

        <div className="row mb-3">
          <label htmlFor="telefono" className="form-label">Teléfono:</label>
            <input 
              type="text" 
              className="form-control text-center" 
              id="telefono"
              value={telefonoCliente}
              onChange={(e) => setTelefonoCliente(e.target.value)}
            />
        </div>

        <div className="row mb-3">
          <label htmlFor="limite" className="form-label">Límite de crédito (opcional):</label>
            <input 
              type="number" 
              className="form-control text-center" 
              id="limite" 
              min={0}
              max={5000}
              value={limitiCredito}
              onChange={(e) => setLimiteCliente(e.target.value)}
            />
        </div>

        
      </form>

      
    </div>
  );
}

export default Clientes;
