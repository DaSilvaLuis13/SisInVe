import { Link } from "react-router-dom";
import "./notfound.css"; // 👈 importa el CSS exclusivo

function NotFound() {
  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404</h1>
      <h2 className="notfound-subtitle">Página no encontrada</h2>
      <p className="notfound-text">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Link to="/" className="btn-volver">
        Volver al inicio
      </Link>
    </div>
  );
}

export default NotFound;
