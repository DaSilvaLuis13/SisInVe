import './App.css'
import { Routes, Route } from 'react-router-dom'

import Layout from './components/Layout'
import AperturaDeCaja from './pages/AperturaDeCaja'
import CierreDeCaja from './pages/CierreDeCaja'
import ConsultaClientes from './pages/ConsultaClientes'
import ConsultaProductos from './pages/ConsultaProductos'
import ConsultaProveedores from './pages/ConsultaProveedores'
import DetalleDevoluciones from './pages/DetalleDevoluciones'
import DetalleVenta from './pages/DetalleVenta'
import Devoluciones from './pages/Devoluciones'
import MovimientoCaja from './pages/MovimientoCaja'
import MovimientoInventario from './pages/MovimientoInventario'
import Proveedores from './pages/Proveedores'
import SaldoCliente from './pages/SaldoCliente'
import Venta from './pages/Venta'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Productos from './pages/Productos'
import Clientes from './pages/Clientes'
import Consultas from './pages/Consultas'
import Reportes from './pages/Reportes'

function App() {
  return (
    <Routes>
      {/* Todas las rutas dentro del Layout */}
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />} />

        {/* Productos */}
        <Route path='productos' element={<Productos />} />
        <Route path='consulta-productos' element={<ConsultaProductos />} />
        <Route path='movimiento-inventario' element={<MovimientoInventario />} />

        {/* Clientes */}
        <Route path='clientes' element={<Clientes />} />
        <Route path='consulta-clientes' element={<ConsultaClientes />} />
        <Route path='saldo-cliente' element={<SaldoCliente />} />

        {/* Proveedores */}
        <Route path='proveedores' element={<Proveedores />} />
        <Route path='consulta-proveedores' element={<ConsultaProveedores />} />

        {/* Ventas y detalles */}
        <Route path='venta' element={<Venta />} />
        <Route path='detalle-venta' element={<DetalleVenta />} />

        {/* Devoluciones */}
        <Route path='devoluciones' element={<Devoluciones />} />
        <Route path='detalle-devoluciones' element={<DetalleDevoluciones />} />

        {/* Caja */}
        <Route path='apertura-caja' element={<AperturaDeCaja />} />
        <Route path='cierre-caja' element={<CierreDeCaja />} />
        <Route path='movimiento-caja' element={<MovimientoCaja />} />

        {/* Consultas y reportes */}
        <Route path='consultas' element={<Consultas />} />
        <Route path='reportes' element={<Reportes />} />

        {/* Página no encontrada */}
        <Route path='*' element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
