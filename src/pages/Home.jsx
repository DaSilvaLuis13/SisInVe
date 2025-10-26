import "./home.css"; // 👈 Importa el CSS exclusivo

function Home() {
  return (
    <div className="home-container container d-flex justify-content-center align-items-center vh-100">
      <div className="home-card card shadow-sm p-5 text-center">
        <h1 className="home-title mb-3">Bienvenido al Sistema</h1>
        <p className="home-text">
          Selecciona una opción del menú lateral para comenzar.
        </p>
      </div>
    </div>
  );
}

export default Home;
