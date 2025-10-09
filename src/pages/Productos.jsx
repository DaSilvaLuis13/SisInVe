//Aquí van los import que necesites incorporar elementos de la carpeta components
// Aquí van los import que necesites incorporar elementos de la carpeta components
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../services/client" // Asumiendo que esta es la ruta a tu cliente de Supabase
// import InputProducto from "../components/InputProducto"; // Si tuvieras un componente de input reutilizable

/* Formulario de registro/edición de productos
Código de barras
Nombre
Unidad de medida
Costo
Ganancia
Precio de venta
Stock mínimo / máximo
*/

function Productos() {
  const [idProducto, setIdProducto] = useState(null)
  const [codigoBarras, setCodigoBarras] = useState('')
  const [nombre, setNombre] = useState('')
  const [unidadMedida, setUnidadMedida] = useState('')
  const [costo, setCosto] = useState('')
  const [ganancia, setGanancia] = useState('')
  const [precioVenta, setPrecioVenta] = useState('')
  const [stockMinimo, setStockMinimo] = useState('')
  const [stockMaximo, setStockMaximo] = useState('')

  // Función para calcular automáticamente el Precio de Venta
  useEffect(() => {
    const c = Number(costo) || 0;
    const g = Number(ganancia) || 0;
    
    // Calcula el precio de venta (Costo + Ganancia)
    const nuevoPrecioVenta = c + g;
    
    // Solo actualiza si el cálculo es un número válido y si es diferente al valor actual para evitar loops
    if (!isNaN(nuevoPrecioVenta) && nuevoPrecioVenta !== Number(precioVenta)) {
        setPrecioVenta(nuevoPrecioVenta.toFixed(2)); // Mostrar con 2 decimales
    }
  }, [costo, ganancia]); // Se ejecuta cada vez que 'costo' o 'ganancia' cambian


  const crearProducto = async e => {
    e.preventDefault()

    // Validación básica
    if (!nombre || !unidadMedida || !costo || !precioVenta) {
      alert("Por favor, completa los campos obligatorios: Nombre, Unidad, Costo y Precio de Venta.");
      return;
    }
    
    try {
      const { data, error } = await supabase.from("Productos").insert({
        codigo_barras: codigoBarras || null, // Opcional
        nombre: nombre,
        unidad_medida: unidadMedida,
        costo: Number(costo),
        ganancia: Number(ganancia),
        precio_venta: Number(precioVenta),
        stock_minimo: stockMinimo ? Number(stockMinimo) : 0,
        stock_maximo: stockMaximo ? Number(stockMaximo) : null, // Opcional
      });

      if (error) throw error;

      // ✅ Reiniciar valores del formulario
      setIdProducto(null);
      setCodigoBarras('');
      setNombre('');
      setUnidadMedida('');
      setCosto('');
      setGanancia('');
      setPrecioVenta('');
      setStockMinimo('');
      setStockMaximo('');

      console.log("Producto creado:", data);
      alert("Producto registrado con éxito.");

    } catch (error) {
      console.log("Error al crear producto:", error);
      alert(`Error al registrar el producto: ${error.message}`);
    }
  }

  const actualizarProducto = async e => {
    e.preventDefault()

    if (!idProducto) {
      alert("Primero selecciona un producto para actualizar.");
      return;
    }
    
    try {
      const { data, error } = await supabase.from("Productos").update({
        codigo_barras: codigoBarras || null,
        nombre: nombre,
        unidad_medida: unidadMedida,
        costo: Number(costo),
        ganancia: Number(ganancia),
        precio_venta: Number(precioVenta),
        stock_minimo: stockMinimo ? Number(stockMinimo) : 0,
        stock_maximo: stockMaximo ? Number(stockMaximo) : null,
      }).eq('id', idProducto); // Asumiendo que la columna de ID es 'id'


      if (error) throw error;

      // ✅ Reiniciar valores del formulario (opcional, o podrías solo mostrar un mensaje)
      setIdProducto(null);
      setCodigoBarras('');
      setNombre('');
      setUnidadMedida('');
      setCosto('');
      setGanancia('');
      setPrecioVenta('');
      setStockMinimo('');
      setStockMaximo('');

      console.log("Producto actualizado:", data);
      alert("Producto actualizado con éxito.");


    } catch (error) {
      console.log("Error al actualizar producto:", error);
      alert(`Error al actualizar el producto: ${error.message}`);
    }
  }

  // Hook para cargar datos si viene desde una ruta de edición
  const location = useLocation();
  useEffect(() => {
    if(location.state?.producto){
      const p = location.state.producto;
      setIdProducto(p.id);
      setCodigoBarras(p.codigo_barras || '');
      setNombre(p.nombre);
      setUnidadMedida(p.unidad_medida);
      setCosto(p.costo.toString());
      setGanancia(p.ganancia.toString());
      setPrecioVenta(p.precio_venta.toString());
      setStockMinimo(p.stock_minimo?.toString() || '');
      setStockMaximo(p.stock_maximo?.toString() || '');
      
      // Limpiar state para que no persista en reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);


  return (
    <div>
      <h2>{idProducto ? "Editar Producto" : "Registrar Producto"}</h2>
      <div className="container">
        <div className="d-flex gap-2 justify-content-center">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={crearProducto}
          >
            Crear Producto
          </button>
          
          <button 
            type="button" 
            className="btn btn-success"
            onClick={actualizarProducto}
            disabled={!idProducto} // Deshabilita si no hay un producto cargado para edición
          >
            Editar Producto
          </button>
            
        </div>
        <Link to="/consulta-productos" className="btn btn-secondary m-2">Consultar Productos</Link>

      </div>
      <form className="container w-50">
        
        {/* Código de Barras */}
        <div className="row mb-3">
          <label htmlFor="codigoBarras" className="form-label">Código de Barras (opcional):</label>
          <input 
            type="text" 
            className="form-control text-center" 
            id="codigoBarras" 
            value={codigoBarras}
            onChange={(e) => setCodigoBarras(e.target.value)}
          />
        </div>

        {/* Nombre */}
        <div className="row mb-3">
          <label htmlFor="nombre" className="form-label">Nombre *:</label>
          <input 
            type="text" 
            className="form-control text-center" 
            id="nombre" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        {/* Unidad de medida */}
        <div className="row mb-3">
          <label htmlFor="unidadMedida" className="form-label">Unidad de Medida *:</label>
            <input 
              type="text" 
              className="form-control text-center" 
              id="unidadMedida" 
              value={unidadMedida}
              onChange={(e) => setUnidadMedida(e.target.value)}
              required
            />
        </div>

        {/* Costo */}
        <div className="row mb-3">
          <label htmlFor="costo" className="form-label">Costo *:</label>
            <input 
              type="number" 
              className="form-control text-center" 
              id="costo" 
              min={0}
              step="0.01"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              required
            />
        </div>
        
        {/* Ganancia */}
        <div className="row mb-3">
          <label htmlFor="ganancia" className="form-label">Ganancia *:</label>
            <input 
              type="number" 
              className="form-control text-center" 
              id="ganancia" 
              min={0}
              step="0.01"
              value={ganancia}
              onChange={(e) => setGanancia(e.target.value)}
              required
            />
        </div>
        
        {/* Precio de venta (calculado) */}
        <div className="row mb-3">
          <label htmlFor="precioVenta" className="form-label">Precio de Venta (Costo + Ganancia) *:</label>
            <input 
              type="number" 
              className="form-control text-center" 
              id="precioVenta" 
              min={0}
              step="0.01"
              value={precioVenta}
              // Aunque se calcula, permitimos la edición manual si es necesario
              onChange={(e) => setPrecioVenta(e.target.value)}
              required
            />
        </div>

        {/* Stock Mínimo */}
        <div className="row mb-3">
          <label htmlFor="stockMinimo" className="form-label">Stock Mínimo (opcional, por defecto 0):</label>
            <input 
              type="number" 
              className="form-control text-center" 
              id="stockMinimo"
              min={0}
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
            />
        </div>

        {/* Stock Máximo */}
        <div className="row mb-3">
          <label htmlFor="stockMaximo" className="form-label">Stock Máximo (opcional):</label>
            <input 
              type="number" 
              className="form-control text-center" 
              id="stockMaximo"
              min={0}
              value={stockMaximo}
              onChange={(e) => setStockMaximo(e.target.value)}
            />
        </div>
        
      </form>

      
    </div>
  );
}

export default Productos;