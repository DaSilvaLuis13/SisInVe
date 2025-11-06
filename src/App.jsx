import './App.css'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'

// Páginas
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
import Ayuda from './pages/ayuda'
function App() {
  return (
    <Routes>
      {/* Todas las rutas dentro del Layout */}
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />} />

        {/* Productos */}
        <Route path='productos' element={<ProtectedRoute><Productos /></ProtectedRoute>} />
        <Route path='consulta-productos' element={<ProtectedRoute><ConsultaProductos /></ProtectedRoute>} />
        <Route path='movimiento-inventario' element={<ProtectedRoute><MovimientoInventario /></ProtectedRoute>} />

        {/* Clientes */}
        <Route path='clientes' element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
        <Route path='consulta-clientes' element={<ProtectedRoute><ConsultaClientes /></ProtectedRoute>} />
        <Route path='saldo-cliente' element={<ProtectedRoute><SaldoCliente /></ProtectedRoute>} />

        {/* Proveedores */}
        <Route path='proveedores' element={<ProtectedRoute><Proveedores /></ProtectedRoute>} />
        <Route path='consulta-proveedores' element={<ProtectedRoute><ConsultaProveedores /></ProtectedRoute>} />

        {/* Ventas y detalles */}
        <Route path='venta' element={<ProtectedRoute><Venta /></ProtectedRoute>} />
        <Route path='detalle-venta' element={<ProtectedRoute><DetalleVenta /></ProtectedRoute>} />

        {/* Devoluciones */}
        <Route path='devoluciones' element={<ProtectedRoute><Devoluciones /></ProtectedRoute>} />
        <Route path='detalle-devoluciones' element={<ProtectedRoute><DetalleDevoluciones /></ProtectedRoute>} />

        {/* Caja */}
        <Route path='apertura-caja' element={<AperturaDeCaja />} />
        <Route path='cierre-caja' element={<CierreDeCaja />} />
        <Route path='movimiento-caja' element={<ProtectedRoute><MovimientoCaja /></ProtectedRoute>} />

        {/* Consultas y reportes */}
        <Route path='consultas' element={<ProtectedRoute><Consultas /></ProtectedRoute>} />
        <Route path='reportes' element={<ProtectedRoute><Reportes /></ProtectedRoute>} />

        <Route path='ayuda' element={<Ayuda />} />
        
        {/* Página no encontrada */}
        <Route path='*' element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
