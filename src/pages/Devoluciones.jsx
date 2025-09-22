// src/pages/Devoluciones.jsx

// Aquí van los import que necesites
import { useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
// Si tienes componentes personalizados:
// import SearchBar from "../components/SearchBar";
// import ProductTable from "../components/ProductTable";
// import MetodoDevolucion from "../components/MetodoDevolucion";

function Devoluciones() {
  // Estados principales
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [productos, setProductos] = useState([]);
  const [dineroDevolver, setDineroDevolver] = useState(0);
  const [metodo, setMetodo] = useState("");
  const [corteCaja, setCorteCaja] = useState(null);

  // Placeholder: lógica de agregar producto
  const addProducto = (producto) => {
    const existe = productos.find((p) => p.id === producto.id);
    if (existe) {
      setProductos(
        productos.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      );
    } else {
      setProductos([...productos, { ...producto, cantidad: 1 }]);
    }
  };

  // Placeholder: lógica de quitar producto
  const removeProducto = (id) => {
    setProductos(
      productos
        .map((p) =>
          p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p
        )
        .filter((p) => p.cantidad > 0)
    );
  };

  return (
    <div className="container mt-4">
      <h2>Formulario de Devoluciones</h2>

      {/* Selección de venta */}
      <div className="mb-3">
        <Form.Label>Seleccionar venta</Form.Label>
        <Form.Control
          type="text"
          placeholder="Buscar venta por folio o cliente"
          // aquí podrías poner un buscador tipo autocomplete
          onChange={(e) => setVentaSeleccionada(e.target.value)}
        />
      </div>

      {/* Buscador de productos */}
      <div className="mb-3">
        <Form.Label>Buscar producto</Form.Label>
        <div className="d-flex gap-2">
          <Form.Control type="text" placeholder="Por nombre" />
          <Form.Control type="text" placeholder="Por código de barras" />
        </div>
      </div>

      {/* Tabla de productos seleccionados */}
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No hay productos seleccionados
              </td>
            </tr>
          ) : (
            productos.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>${p.precio}</td>
                <td>{p.cantidad}</td>
                <td>${p.precio * p.cantidad}</td>
                <td>
                  <Button variant="danger" onClick={() => removeProducto(p.id)}>
                    Quitar
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Método de devolución */}
      <div className="mt-3">
        <Form.Label>Método de devolución</Form.Label>
        <div className="d-flex gap-2">
          <Button
            variant={metodo === "Credito" ? "info" : "outline-info"}
            onClick={() => setMetodo("Credito")}
          >
            Crédito
          </Button>
          <Button
            variant={metodo === "Contado" ? "success" : "outline-success"}
            onClick={() => setMetodo("Contado")}
          >
            Contado
          </Button>
        </div>
      </div>

      {/* Dinero a devolver */}
      <div className="mt-3">
        <Form.Label>Dinero a devolver</Form.Label>
        <Form.Control
          type="number"
          value={dineroDevolver}
          onChange={(e) => setDineroDevolver(e.target.value)}
        />
      </div>

      {/* Asociación con corte de caja */}
      <div className="mt-3">
        <Form.Label>Asociar con corte de caja</Form.Label>
        <Form.Control
          type="text"
          placeholder="ID del corte de caja"
          value={corteCaja || ""}
          onChange={(e) => setCorteCaja(e.target.value)}
        />
      </div>

      {/* Acciones */}
      <div className="mt-4 d-flex gap-2">
        <Button variant="primary">Grabar</Button>
        <Button variant="secondary">Consultar Detalle</Button>
        <Button variant="danger">Salir</Button>
      </div>
    </div>
  );
}

export default Devoluciones;
