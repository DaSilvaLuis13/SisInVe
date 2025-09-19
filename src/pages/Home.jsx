//Aquí van los import que necesites incorporar elementos de la carpeta components

/* 
Formulario Home
Este es el menú principal de nuestro sistema 
aquí van los botones para
ir a los formularios
*/


//Está es un versión solo para facilitar el desarrollo inicial pero lo cambiaremos 

import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="container mt-2">
      <h1 className="mb-2">SisInVe</h1>

      {/* Productos */}
      <div className="mb-2">
        <h3>Productos</h3>
        <Link to="/productos" className="btn btn-primary m-2">Registrar/Editar Productos</Link>
        <Link to="/consulta-productos" className="btn btn-secondary m-2">Consultar Productos</Link>
        <Link to="/movimiento-inventario" className="btn btn-info m-2">Movimientos de Inventario</Link>
      </div>

      {/* Clientes */}
      <div className="mb-2">
        <h3>Clientes</h3>
        <Link to="/clientes" className="btn btn-primary m-2">Registrar/Editar Clientes</Link>
        <Link to="/consulta-clientes" className="btn btn-secondary m-2">Consultar Clientes</Link>
        <Link to="/saldo-cliente" className="btn btn-info m-2">Saldo de Clientes</Link>
      </div>

      {/* Ventas y Devoluciones */}
      <div className="mb-2">
        <h3>Ventas</h3>
        <Link to="/venta" className="btn btn-success m-2">Registrar Venta</Link>
        <Link to="/detalle-venta" className="btn btn-secondary m-2">Detalle de Ventas</Link>

        <h3 className="mt-2">Devoluciones</h3>
        <Link to="/devoluciones" className="btn btn-warning m-2">Registrar Devolución</Link>
        <Link to="/detalle-devoluciones" className="btn btn-secondary m-2">Detalle de Devoluciones</Link>
      </div>

      {/* Caja */}
      <div className="mb-2">
        <h3>Caja</h3>
        <Link to="/apertura-caja" className="btn btn-primary m-2">Apertura de Caja</Link>
        <Link to="/cierre-caja" className="btn btn-danger m-2">Cierre de Caja</Link>
        <Link to="/movimiento-caja" className="btn btn-info m-2">Movimientos de Caja</Link>
      </div>
    </div>
  );
}

export default Home;