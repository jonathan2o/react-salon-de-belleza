import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api/trabajadores/registrar/";

export default function RegistrarTrabajadorPage() {
  const navigate = useNavigate();
  const [nombreTrabajador, setNombreTrabajador] = useState("");
  const [apellidosTrabajador, setApellidosTrabajador] = useState("");
  const [telefonoTrabajador, setTelefonoTrabajador] = useState("");
  const [correoTrabajador, setCorreoTrabajador] = useState("");
  const [passwordTrabajador, setPasswordTrabajador] = useState("");
  const [errorRegistro, setErrorRegistro] = useState("");
  const [exitoRegistro, setExitoRegistro] = useState("");
  const [loading, setLoading] = useState(false);

  const registrarTrabajador = async () => {
    setErrorRegistro("");
    setExitoRegistro("");

    if (!nombreTrabajador || !apellidosTrabajador || !telefonoTrabajador || !correoTrabajador || !passwordTrabajador) {
      setErrorRegistro("❌ Por favor completa TODOS los campos antes de guardar");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: nombreTrabajador,
          apellidos: apellidosTrabajador,
          telefono: telefonoTrabajador,
          correo: correoTrabajador,
          password: passwordTrabajador
        })
      });

      const data = await res.json();

      if (res.ok) {
        setExitoRegistro(`✅ Trabajador ${data.trabajador.nombre} registrado correctamente. Puedes iniciar sesión con tu correo.`);
        setNombreTrabajador("");
        setApellidosTrabajador("");
        setTelefonoTrabajador("");
        setCorreoTrabajador("");
        setPasswordTrabajador("");
        // Redirigir a la página de inicio (inicio de sesión)
        navigate("/", { replace: true });
      } else {
        setErrorRegistro(data.error || "❌ Error al registrar trabajador");
      }
    } catch (error) {
      setErrorRegistro("❌ No se pudo conectar con el servidor. Verifica que Django esté corriendo en http://127.0.0.1:8000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Registrar Trabajador</h2>

      {errorRegistro && <div className="error-mensaje">{errorRegistro}</div>}
      {exitoRegistro && <div className="exito-mensaje">{exitoRegistro}</div>}

      <label>Nombre:</label>
      <input 
        type="text" 
        value={nombreTrabajador} 
        onChange={(e) => setNombreTrabajador(e.target.value)} 
        placeholder="Nombre"
        disabled={loading}
      />

      <label>Apellidos:</label>
      <input 
        type="text" 
        value={apellidosTrabajador} 
        onChange={(e) => setApellidosTrabajador(e.target.value)} 
        placeholder="Apellidos"
        disabled={loading}
      />

      <label>Teléfono:</label>
      <input 
        type="text" 
        value={telefonoTrabajador} 
        onChange={(e) => setTelefonoTrabajador(e.target.value)} 
        placeholder="Teléfono"
        disabled={loading}
      />

      <label>Correo:</label>
      <input 
        type="email" 
        value={correoTrabajador} 
        onChange={(e) => setCorreoTrabajador(e.target.value)} 
        placeholder="Correo"
        disabled={loading}
      />

      <label>Contraseña:</label>
      <input 
        type="password" 
        value={passwordTrabajador} 
        onChange={(e) => setPasswordTrabajador(e.target.value)} 
        placeholder="Contraseña"
        disabled={loading}
      />

      <button onClick={registrarTrabajador} className="btn-guardar" disabled={loading}>
        {loading ? "Registrando..." : "Guardar Trabajador"}
      </button>
    </div>
  );
}
