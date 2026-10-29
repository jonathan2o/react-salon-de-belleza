import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function AdminLoginPage() {

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const iniciarSesion = async () => {

    setMensaje("");
    setLoading(true);

    try {

      const response = await fetch(`${API_BASE}/login/admin/`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: correo,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {

        setMensaje("✅ Login administrador exitoso");

        setTimeout(() => {
          navigate("/admin-welcome");
        }, 1000);

      } else {

        setMensaje("❌ Credenciales incorrectas");

      }

    } catch (error) {

      setMensaje("❌ Error del servidor");

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="page-container">

      <h2 className="page-title">
        Inicio de Sesión Administrador
      </h2>

      {mensaje && (
        <div className="success-message">
          {mensaje}
        </div>
      )}

      <label>Correo:</label>

      <input
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        placeholder="Ingrese correo"
      />

      <label>Contraseña:</label>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Ingrese contraseña"
      />

      <button
        onClick={iniciarSesion}
        className="btn-agendar"
        disabled={loading}
      >
        {loading ? "Ingresando..." : "Iniciar Sesión"}
      </button>

    </div>
  );
}