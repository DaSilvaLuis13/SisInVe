//Aquí van los import que necesites incorporar elementos de la carpeta components
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../services/client"

/* 
Formulario de registro/edición de proveedores
Empresa
Teléfono
*/

function Proveedores() {
  const [idProveedor, setIdProveedor] = useState(null)
  const [nombreEmpresa, setEmpresa] = useState('')
  const [telefonoEmpresa, setTelefonoEmpresa] = useState('')

  const crearProveedor = async e => {
    e.preventDefault()
    
    try {
      const { data, error } = await supabase.from("Proveedores").insert({
      empresa: nombreEmpresa,
      telefono: telefonoEmpresa
    });


      if (error) throw error;

      // ✅ Reiniciar valores del formulario
      setIdProveedor(null);
      setEmpresa('');
      setTelefonoEmpresa('');

      console.log("Proveedor creado:", data);

    } catch (error) {
      console.log(error)
    }
  }

  //Actualizar Proveedor

  const actualizarProveedor = async e => {
    e.preventDefault()

    if (!idProveedor) {
      alert("Primero selecciona un proveedor para actualizar.");
      return;
    }
    
    try {
      const { data, error } = await supabase.from("Proveedores").update({
      empresa: nombreEmpresa,
      telefono: telefonoEmpresa
    }).eq('id', idProveedor);


      if (error) throw error;

      // ✅ Reiniciar valores del formulario
      setIdProveedor(null);
      setEmpresa('');
      setTelefonoEmpresa('');
      
      console.log("Proveedor actualizado:", data);

    } catch (error) {
      console.log(error)
    }
  }

  //Localizar Id proveedor

  const location = useLocation();
        useEffect(() => {
      if(location.state?.proveedor){
        const p = location.state.proveedor;
        setIdProveedor(p.id);
        setEmpresa(p.empresa);
        setTelefonoEmpresa(p.telefono);
        
        // Limpiar state para que no persista en reload
        window.history.replaceState({}, document.title);
      }
  }, [location.state]);

  return (
    <div>
      <h2>Registrar Proveedor</h2>
      <div className="container">
        <div className="d-flex gap-2 justify-content-center">
          <button 
            type="button"   // importante: NO submit
            className="btn btn-primary"
            onClick={crearProveedor}  // se ejecuta solo al hacer click
          >
            Crear
          </button>
          
          <button 
            type="button" 
            className="btn btn-success"
            onClick={actualizarProveedor}
          >
            Editar
          </button>
           
        </div>
        <Link to="/consulta-proveedores" className="btn btn-secondary m-2">Consultar Proveedores</Link>

      </div>
      <form className="container w-50">
        
        <div className="row mb-3">
          <label htmlFor="empresas" className="form-label">Empresa:</label>
          <input 
            type="text" 
            className="form-control text-center" 
            id="empresas" 
            value={nombreEmpresa}
            onChange={(e) => setEmpresa(e.target.value)}
          />
        </div>

        <div className="row mb-3">
          <label htmlFor="telefono" className="form-label">Teléfono:</label>
            <input 
              type="text" 
              className="form-control text-center" 
              id="telefono"
              value={telefonoEmpresa}
              onChange={(e) => setTelefonoEmpresa(e.target.value)}
            />
        </div>

        

        
      </form>

      
    </div>
  )
}

export default Proveedores