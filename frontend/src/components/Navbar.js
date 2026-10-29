import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isAgendarCita = location.pathname === "/citas";

  return (
    <nav className="navbar">
      <div className="navbar-brand">Salón de Belleza</div>
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <NavLink to="/perfil" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Mi Perfil
            </NavLink>
            <span className="nav-user">
              {user && user.nombre}
            </span>
            <button onClick={handleLogout} className="nav-logout-btn">
              Cerrar sesión
            </button>
          </>
        ) : (
          <>

          </>
        )}
      </div>
    </nav>
  );
}
