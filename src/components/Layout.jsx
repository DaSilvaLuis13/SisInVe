// src/components/Layout.jsx
import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../services/client";
import AperturaDeCaja from "../pages/AperturaDeCaja"; // ajustar ruta si tu estructura es distinta
import "./layout.css";

function Layout() {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({});
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [cargando, setCargando] = useState(true);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isActive = (path) => location.pathname === path;

  const sections = [
    {
      title: "Productos",
      links: [
        { label: "Registrar/Editar Productos", path: "/productos" },
        { label: "Movimientos de Inventario", path: "/movimiento-inventario" },
      ],
    },
    {
      title: "Clientes",
      links: [
        { label: "Registrar/Editar Clientes", path: "/clientes" },
        { label: "Saldo de Cliente", path: "/saldo-cliente" },
      ],
    },
    {
      title: "Proveedores",
      links: [
        { label: "Registrar/Editar Proveedores", path: "/proveedores" },
      ],
    },
    {
      title: "Ventas",
      links: [
        { label: "Registrar Venta", path: "/venta" },
        { label: "Detalle de Ventas", path: "/detalle-venta" },
      ],
    },
    {
      title: "Devoluciones",
      links: [
        { label: "Registrar Devolución", path: "/devoluciones" },
        { label: "Detalle de Devoluciones", path: "/detalle-devoluciones" },
      ],
    },
    {
      title: "Caja",
      links: [
        { label: "Cierre de Caja", path: "/cierre-caja" },
        { label: "Movimientos de Caja", path: "/movimiento-caja" },
      ],
    },
    {
      title: "Consultas",
      links: [
        { label: "Consultas", path: "/consultas" },
        { label: "Reportes", path: "/reportes" },
      ],
    },
  ];

  useEffect(() => {
    // Verifica si hay una caja abierta para hoy (sin usuarios)
    const verificarCaja = async () => {
      setCargando(true);
      try {
        const hoy = new Date().toISOString().split("T")[0];
        const { data, error } = await supabase
          .from("CorteCaja")
          .select("id, fecha, estado")
          .eq("fecha", hoy)
          .eq("estado", "abierta");

        if (error) {
          console.error("Error verificando caja:", error);
          setCajaAbierta(false);
        } else {
          setCajaAbierta(Array.isArray(data) && data.length > 0);
        }
      } catch (err) {
        console.error("Error inesperado verificando caja:", err);
        setCajaAbierta(false);
      } finally {
        setCargando(false);
      }
    };

    verificarCaja();
    // Si quieres que re-verifique cada X segundos/minutos activa un interval aquí
  }, []);

  // handler para cuando AperturaDeCaja indique que ya abrió la caja
  const handleCajaAbierta = () => {
    setCajaAbierta(true);
  };

  if (cargando) {
    return (
      <div style={{ minHeight: "100vh" }} className="d-flex justify-content-center align-items-center">
        <div>Cargando sistema...</div>
      </div>
    );
  }

  // Si no hay caja abierta, mostramos el componente de apertura (impide acceso al resto)
  if (!cajaAbierta) {
    return <AperturaDeCaja onCajaAbierta={handleCajaAbierta} />;
  }

  // Si hay caja abierta, renderizamos layout completo con sidebar + contenido (Outlet)
  return (
    <div className="d-flex container-first" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <nav
        className="bg-light border-end p-3"
        style={{
          width: "250px",
          height: "100vh",
          overflowY: "auto",
          position: "sticky",
          top: 0,
        }}
      >

        <div className="sisInVe">
          <img src="/LogoSisInVe.jpg" alt="SisInVe Logo" style={{ width: "120px", height: "120px", margin: "10px" }} />
        </div>
        
        {sections.map((section) => (
          <div key={section.title} className="mb-2">
            <div
              onClick={() => toggleSection(section.title)}
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                padding: "8px 12px",
                borderRadius: "4px",
                userSelect: "none",
                color: "#563624ff",
                border: "1px solid #56362455",
                backgroundColor: "#f9f5f2",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0e6df"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f9f5f2"}
            >
              {section.title}
            </div>

            {openSections[section.title] && (
              <ul className="list-unstyled mt-1 ps-3">
                {section.links.map(link => (
                  <li key={link.path} className="mb-1">
                    <Link
                      to={link.path}
                      style={{
                        display: "block",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        textDecoration: "none",
                        color: isActive(link.path) ? "white" : "#333",
                        backgroundColor: isActive(link.path) ? "#0d6efd" : "transparent",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(link.path)) e.currentTarget.style.backgroundColor = "#e6f0ff";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(link.path)) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* Contenido principal */}
      <div className="flex-grow-1 p-4">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
