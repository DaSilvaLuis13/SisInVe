import { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import * as XLSX from 'xlsx';
import { supabase } from '../services/client';
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Reportes() {
  const [tipoReportes, setTipoReportes] = useState('ventas');
  const [data, setData] = useState([]);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  const tablas = {
    ventas: 'Ventas',
    devolucion: 'Devolucion',
    corteCaja: 'CorteCajaGanancia',
    productosMasVendidos: 'ProductosMasVendidos',
    productosDevueltos: 'ProductosDevueltos',
    ventasTipoPago: 'VentasTipoPago',
    stockMinimo: 'StockMinimo'
  };

  useEffect(() => {
    const fetchData = async () => {
      const tabla = tablas[tipoReportes];
      try {
        let query;

        if (tipoReportes === 'corteCaja' && fechaInicio && fechaFin) {
          // Ejecutar función personalizada de Postgres para CorteCaja
          const { data, error } = await supabase
            .rpc('CorteCajaGanancia', {
              f_i: fechaInicio.toISOString().split('T')[0],
              f_f: fechaFin.toISOString().split('T')[0]
            });
          if (!error) setData(data);
          else console.error('Error en CorteCajaGanancia:', error);
          return;
        }

        query = supabase.from(tabla).select('*');

        if (['ventas', 'devolucion'].includes(tipoReportes)) {
          if (fechaInicio) query = query.gte('fecha', fechaInicio.toISOString().split('T')[0]);
          if (fechaFin) query = query.lte('fecha', fechaFin.toISOString().split('T')[0]);
        }

        const result = await query;
        if (!result.error) setData(result.data);
        else console.error(`Error al cargar ${tabla}:`, result.error);
      } catch (err) {
        console.error('Error general:', err);
      }
    };
    fetchData();
  }, [tipoReportes, fechaInicio, fechaFin]);

  // Calcular totales para CorteCaja
  const calcularTotales = (rows) => {
    if (rows.length === 0) return null;
    const keys = ['ventas_total', 'devoluciones_total', 'pagos_total', 'retiros_total', 'depositos_total', 'abonos_total', 'total_entradas', 'total_salidas', 'ganancia_neta'];
    const total = {};
    keys.forEach(k => total[k] = rows.reduce((sum, r) => sum + Number(r[k] || 0), 0));
    return {
      id: 'TOTAL',
      fecha: '—',
      hora_inicio: '',
      hora_fin: '',
      fondo_inicial: '',
      ...total,
      fiado_total: '',
      fondo_actual: '',
      diferencia: ''
    };
  };

  const columnas = {
    ventas: [
      { field: 'id', headerName: 'ID', width: 70 },
      { field: 'id_cliente', headerName: 'ID Cliente', width: 100 },
      { field: 'fecha', headerName: 'Fecha', width: 120 },
      { field: 'hora', headerName: 'Hora', width: 100 },
      { field: 'tipo_pago', headerName: 'Tipo de Pago', width: 130 },
      { field: 'total', headerName: 'Total', width: 100 },
      { field: 'id_corte', headerName: 'ID Corte', width: 100 }
    ],
    devolucion: [
      { field: 'id', headerName: 'ID', width: 70 },
      { field: 'id_cliente', headerName: 'ID Cliente', width: 100 },
      { field: 'fecha', headerName: 'Fecha', width: 120 },
      { field: 'tipo_devolucion', headerName: 'Motivo', width: 150 },
      { field: 'dinero_devolver', headerName: 'Total', width: 100 }
    ],
    corteCaja: [
      { field: 'id', headerName: 'ID', width: 60 },
      { field: 'fecha', headerName: 'Fecha', width: 110 },
      { field: 'fondo_inicial', headerName: 'Fond. Inicial', width: 90 },
      { field: 'fondo_actual', headerName: 'Fond. Final', width: 90 },
      { field: 'ventas_total', headerName: 'Ventas', width: 90 },
      { field: 'devoluciones_total', headerName: 'Devoluciones', width: 110 },
      { field: 'fiado_total', headerName: 'Fiado', width: 70 },
      { field: 'pagos_total', headerName: 'Pagos', width: 80 },
      { field: 'retiros_total', headerName: 'Retiros', width: 80 },
      { field: 'depositos_total', headerName: 'Depósitos', width: 90 },
      { field: 'abonos_total', headerName: 'Abonos', width: 90 },
      { field: 'total_entradas', headerName: 'Total Entradas', width: 120 },
      { field: 'total_salidas', headerName: 'Total Salidas', width: 120 },
      { field: 'ganancia_neta', headerName: 'Ganancia Neta', width: 120 },
    ],
    productosMasVendidos: [
      { field: 'id_producto', headerName: 'ID Producto', width: 100 },
      { field: 'nombre_producto', headerName: 'Nombre', width: 200 },
      { field: 'total_cantidad', headerName: 'Cantidad Total', width: 130 },
      { field: 'total_subtotal', headerName: 'Subtotal Total', width: 130 }
    ],
    productosDevueltos: [
      { field: 'id_producto', headerName: 'ID Producto', width: 100 },
      { field: 'nombre_producto', headerName: 'Nombre', width: 200 },
      { field: 'total_cantidad', headerName: 'Cantidad Total', width: 130 },
      { field: 'total_subtotal', headerName: 'Subtotal Total', width: 130 }
    ],
    ventasTipoPago: [
      { field: 'tipo_pago', headerName: 'Tipo de Pago', width: 150 },
      { field: 'total_ventas', headerName: 'Total en Ventas', width: 150 },
      { field: 'total_ingresos', headerName: 'Total en Ingresos', width: 150 }
    ],
    stockMinimo: [
      { field: 'id', headerName: 'ID', width: 70 },
      { field: 'nombre', headerName: 'Nombre', width: 200 },
      { field: 'unidad_medida', headerName: 'Unidad', width: 100 },
      { field: 'stock_actual', headerName: 'Stock Actual', width: 120 },
      { field: 'stock_minimo', headerName: 'Stock Mínimo', width: 120 },
      { field: 'stock_maximo', headerName: 'Stock Máximo', width: 120 },
      { field: 'faltante', headerName: 'Faltante', width: 150 }
    ]
  };

  const exportarExcel = () => {
    if (data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tipoReportes);
    XLSX.writeFile(wb, `reporte_${tipoReportes}.xlsx`);
  };

  const imprimir = () => window.print();

  const datosConTotales = tipoReportes === 'corteCaja' ? [...data, calcularTotales(data)] : data;

  return (
    <div style={{ height: 520, width: '100%', padding: '20px' }}>
      <h1>Reportes</h1>

      <div style={{ marginBottom: 10 }}>
        <Button variant="outlined" onClick={() => setTipoReportes('ventas')}>Ventas</Button>
        <Button variant="outlined" onClick={() => setTipoReportes('devolucion')}>Devoluciones</Button>
        <Button variant="outlined" onClick={() => setTipoReportes('corteCaja')}>Cortes</Button>
        <Button variant="outlined" onClick={() => setTipoReportes('productosMasVendidos')}>Más Vendidos</Button>
        <Button variant="outlined" onClick={() => setTipoReportes('productosDevueltos')}>Devueltos</Button>
        <Button variant="outlined" onClick={() => setTipoReportes('ventasTipoPago')}>Ventas por Pago</Button>
        <Button variant="outlined" onClick={() => setTipoReportes('stockMinimo')}>Stock Mínimo</Button>
      </div>

      {['ventas', 'devolucion', 'corteCaja'].includes(tipoReportes) && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <DatePicker
            selected={fechaInicio}
            onChange={setFechaInicio}
            dateFormat="yyyy-MM-dd"
            placeholderText="Fecha inicio"
          />
          <DatePicker
            selected={fechaFin}
            onChange={setFechaFin}
            dateFormat="yyyy-MM-dd"
            placeholderText="Fecha fin"
          />
        </div>
      )}

      <Link to="/" className="btn btn-danger m-2">X</Link>
      <div style={{ marginBottom: '10px' }}>
        <Button variant="contained" color="primary" onClick={exportarExcel} style={{ marginRight: '10px' }}>Exportar a Excel</Button>
        <Button variant="contained" color="secondary" onClick={imprimir}>Imprimir</Button>
      </div>

      <DataGrid
        rows={datosConTotales.map((row, index) => ({
          ...row,
          _gridId: row.id || row.id_producto || row.tipo_pago || index
        }))}
        columns={columnas[tipoReportes]}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        components={{ Toolbar: GridToolbar }}
        getRowId={(row) => row._gridId}
      />
    </div>
  );
}

export default Reportes;
