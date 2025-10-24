import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { supabase } from '../services/client'

function Consultas() {
  const [resultados, setResultados] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [error, setError] = useState(null);

  const getProductosConStock = async () => {
    setTitulo('Productos con Existencias');
    const { data, error } = await supabase
      .from('Productos')
      .select('codigo_barras,nombre,costo,precio_venta,stock_actual')
      .gt('stock_actual', 0);

    if (error) {
      setError('Error al consultar productos con stock: ' + error.message);
      setResultados([]);
    } else {
      setResultados(data);
      setError(null);
    }
  };

  const getProductosSinStock = async () => {
    setTitulo('Productos sin Existencias');
    const { data, error } = await supabase
      .from('Productos')
      .select('codigo_barras, nombre, costo, precio_venta')
      .or('stock_actual.eq.0,stock_actual.is.null');

    if (error) {
      setError('Error al consultar productos sin stock: ' + error.message);
      setResultados([]);
    } else {
      setResultados(data);
      setError(null);
    }
  };

  const getVentasPorFechaCredito = async () => {
  if (!fechaInicio || !fechaFin) {
    setError('Por favor, selecciona ambas fechas.');
    return;
  }

  const inicio = fechaInicio.toISOString().split('T')[0];
  const fin = fechaFin.toISOString().split('T')[0];

  setTitulo(`Ventas a Crédito desde ${inicio} hasta ${fin}`);
  const { data, error } = await supabase
    .from('Ventas')
    .select('id,id_cliente,fecha,hora,total')
    .gte('fecha', inicio)
    .lte('fecha', fin)
    .eq('tipo_pago', 'Crédito');

  if (error) {
    setError('Error al consultar las ventas: ' + error.message);
    setResultados([]);
  } else {
    setResultados(data);
    setError(null);
  }
};

const getVentasPorFechaContado = async () => {
  if (!fechaInicio || !fechaFin) {
    setError('Por favor, selecciona ambas fechas.');
    return;
  }

  const inicio = fechaInicio.toISOString().split('T')[0];
  const fin = fechaFin.toISOString().split('T')[0];

  setTitulo(`Ventas de Contado desde ${inicio} hasta ${fin}`);
  const { data, error } = await supabase
    .from('Ventas')
    .select('id,fecha,hora,total')
    .gte('fecha', inicio)
    .lte('fecha', fin)
    .eq('tipo_pago', 'Contado');

  if (error) {
    setError('Error al consultar las ventas: ' + error.message);
    setResultados([]);
  } else {
    setResultados(data);
    setError(null);
  }
};

const getDevolucionesPorFecha = async () => {
  if (!fechaInicio || !fechaFin) {
    setError('Por favor, selecciona ambas fechas.');
    return;
  }

  const inicio = fechaInicio.toISOString().split('T')[0];
  const fin = fechaFin.toISOString().split('T')[0];

  setTitulo(`Devoluciones desde ${inicio} hasta ${fin}`);
  const { data, error } = await supabase
    .from('Devolucion')
    .select('*')
    .gte('fecha', inicio)
    .lte('fecha', fin);

  if (error) {
    setError('Error al consultar las devoluciones: ' + error.message);
    setResultados([]);
  } else {
    setResultados(data);
    setError(null);
  }
};

  return (
    <div className="container my-5">
            <Link to="/" className="btn btn-danger m-2">X</Link>
      
      <h1 className="mb-4 text-center">Panel de Consultas</h1>

      {/* Sección de Productos */}
      <div className="mb-4 p-3 border rounded shadow-sm bg-light">
        <h2 className="mb-3">Productos</h2>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={getProductosConStock}>Mostrar con Existencias</button>
          <button className="btn btn-danger" onClick={getProductosSinStock}>Mostrar sin Existencias</button>
        </div>
      </div>

      {/* Sección de Consultas por Fecha */}
      <div className="mb-4 p-3 border rounded shadow-sm bg-light">
        <h2 className="mb-3">Consultas por Rango de Fecha</h2>
        <div className="row mb-3 g-2">
          <div className="col-md-6">
            <label className="form-label">Desde:</label>
            <DatePicker
              className="form-control"
              selected={fechaInicio}
              onChange={(date) => setFechaInicio(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Selecciona fecha inicio"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Hasta:</label>
            <DatePicker
              className="form-control"
              selected={fechaFin}
              onChange={(date) => setFechaFin(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Selecciona fecha fin"
            />
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-success" onClick={getVentasPorFechaCredito}>Buscar Ventas (Crédito)</button>
          <button className="btn btn-warning" onClick={getVentasPorFechaContado}>Buscar Ventas (Contado)</button>
          <button className="btn btn-info text-white" onClick={getDevolucionesPorFecha}>Buscar Devoluciones</button>
        </div>
      </div>
      
      {/* Mensaje de error */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tabla de Resultados */}
      <div className="table-responsive">
        {resultados.length > 0 ? (
          <div>
            <h2 className="mt-4">{titulo}</h2>
            <table className="table table-striped table-bordered mt-2">
              <thead className="table-dark">
                <tr>
                  {Object.keys(resultados[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultados.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{String(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center mt-3">No hay resultados para mostrar. Realiza una consulta.</p>
        )}
      </div>
    </div>
  );
}

export default Consultas;
