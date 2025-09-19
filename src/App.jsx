import './App.css'
import { Routes, Route } from 'react-router-dom'

import AperturaDeCaja from './pages/AperturaDeCaja'
import CierreDeCaja from './pages/CierreDeCaja'
import ConsultaClientes from './pages/ConsultaClientes'
import ConsultaProductos from './pages/ConsultaProductos'
import DetalleDevoluciones from './pages/DetalleDevoluciones'
import DetalleVenta from './pages/DetalleVenta'
import Devoluciones from './pages/Devoluciones'
import MovimientoCaja from './pages/MovimientoCaja'
import MovimientoInventario from './pages/MovimientoInventario'
import SaldoCliente from './pages/SaldoCliente'
import Venta from './pages/Venta'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Productos from './pages/Productos'
import Clientes from './pages/Clientes'

function App() {
  return (
    <div className='App'>
      {/* Rutas */}
      <Routes>
        <Route path='/' element={<Home />} />

        {/* Productos */}
        <Route path='/productos' element={<Productos />} />
        <Route path='/consulta-productos' element={<ConsultaProductos />} />
        <Route path='/movimiento-inventario' element={<MovimientoInventario />} />

        {/* Clientes */}
        <Route path='/clientes' element={<Clientes />} />
        <Route path='/consulta-clientes' element={<ConsultaClientes />} />
        <Route path='/saldo-cliente' element={<SaldoCliente />} />

        {/* Ventas y detalles */}
        <Route path='/venta' element={<Venta />} />
        <Route path='/detalle-venta' element={<DetalleVenta />} />

        {/* Devoluciones */}
        <Route path='/devoluciones' element={<Devoluciones />} />
        <Route path='/detalle-devoluciones' element={<DetalleDevoluciones />} />

        {/* Caja */}
        <Route path='/apertura-caja' element={<AperturaDeCaja />} />
        <Route path='/cierre-caja' element={<CierreDeCaja />} />
        <Route path='/movimiento-caja' element={<MovimientoCaja />} />

        {/* Página no encontrada */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
