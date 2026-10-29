import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import React, { useContext, useState, useEffect, Fragment } from "react";
import { createPortal } from "react-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RegistrarTrabajadorPage from "./pages/RegistrarTrabajadorPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import CitasPage from "./pages/CitasPage";
import ProfilePage from "./pages/ProfilePage";
import HorarioPage from "./pages/HorarioPage";
import QRPage from "./pages/QRPage";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import AddServiceWizard from "./components/AddServiceWizard";
import ServiceBackgroundCard from "./components/ServiceBackgroundCard";
import DrawerMenu from "./components/DrawerMenu";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000/api";

function HomePage() {
  const [loginCorreo, setLoginCorreo] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMensaje, setLoginMensaje] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);

  // Si ya está autenticado, redirigir al perfil
  if (isAuthenticated) {
    navigate("/perfil", { replace: true });
  }

  const iniciarSesion = async () => {
    setLoginMensaje("");
    setLoginError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: loginCorreo,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Guardar usuario y tokens en el contexto
        const userData = {
          id: data.user_id,
          trabajador_id: data.trabajador_id,
          correo: data.correo,
          nombre: data.nombre || data.correo.split("@")[0],
          apellidos: data.apellidos || "",
          telefono: data.telefono || "",
        };

        const tokenData = {
          access: data.tokens.access,
          refresh: data.tokens.refresh,
        };

        localStorage.setItem("access", data.tokens.access);
        localStorage.setItem("refresh", data.tokens.refresh);

        login(userData, tokenData);
        setLoginMensaje("✅ Iniciando sesión...");
        setLoginCorreo("");
        setLoginPassword("");

        // Redirigir al perfil después de 1 segundo
        setTimeout(() => {
          navigate("/perfil", { replace: true });
        }, 1000);
      } else {
        setLoginError(data.error || "❌ Datos incorrectos");
      }
    } catch (error) {
      setLoginError("❌ No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Inicio de Sesión</h2>
      {loginMensaje && <div className="success-message">{loginMensaje}</div>}
      {loginError && <div className="error-mensaje">{loginError}</div>}

      <label>Correo:</label>
      <input
        type="email"
        value={loginCorreo}
        onChange={(e) => setLoginCorreo(e.target.value)}
        placeholder="Correo"
        className="login-input"
        disabled={loading}
      />

      <label>Contraseña:</label>
      <input
        type="password"
        value={loginPassword}
        onChange={(e) => setLoginPassword(e.target.value)}
        placeholder="Contraseña"
        className="login-input"
        disabled={loading}
      />

      <button
        onClick={iniciarSesion}
        className="btn-agendar"
        disabled={loading}
      >
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>


    </div>
  );
}

const GEMSTONES = [
  { id: "dorado", label: "Dorado", emoji: "💎", className: "gem-dorado" },
  { id: "plateado", label: "Plateado", emoji: "💎", className: "gem-plateado" },
  { id: "zafiro", label: "Zafiro", emoji: "💎", className: "gem-zafiro" },
  { id: "brown", label: "Brown", emoji: "💎", className: "gem-brown" },
  { id: "green", label: "Green", emoji: "💎", className: "gem-green" },
  { id: "esmeralda", label: "Esmeralda", emoji: "💎", className: "gem-esmeralda" },
];

function AdminWelcomePage() {
  const [mensajeServicio, setMensajeServicio] = useState("");
  const [loadingServicio, setLoadingServicio] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [citas, setCitas] = useState([]);

  const fetchServicios = async () => {
    try {
      const res = await fetch(`${API_BASE}/servicios/`);
      const data = await res.json();
      if (res.ok) setServicios(data);
    } catch (e) {
      // ignore fetch errors for list
    }
  };
  const fetchTrabajadores = async () => {
    try {
      const res = await fetch(`${API_BASE}/trabajadores/`);
      const data = await res.json();
      if (res.ok) {
        setTrabajadores(data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchCitas = async () => {
    try {
      const res = await fetch(`${API_BASE}/citas/`);
      const data = await res.json();
      if (res.ok) {
        setCitas(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchServicios();
    fetchTrabajadores();
    fetchCitas();
  }, []);

  const eliminarTrabajador = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este trabajador?",
    );

    if (!confirmar) return;

    try {
      const res = await fetch(`${API_BASE}/trabajadores/${id}/eliminar/`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setMensajeServicio("✅ Trabajador eliminado.");

        fetchTrabajadores();
      } else {
        setMensajeServicio(`❌ ${data.error || "No se pudo eliminar"}`);
      }
    } catch (error) {
      setMensajeServicio("❌ Error al conectar con el servidor");
    }
  };



  const [selectedItem, setSelectedItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDuration, setEditDuration] = useState(15);
  const [editPrice, setEditPrice] = useState(0);
  const [errorModal, setErrorModal] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});

  // States for adding subtitle
  const [addSubtitleModalOpen, setAddSubtitleModalOpen] = useState(false);
  const [newSubNombre, setNewSubNombre] = useState("");
  const [newSubBloques, setNewSubBloques] = useState(2);
  const [newSubPrecio, setNewSubPrecio] = useState("");
  const [newSubColor, setNewSubColor] = useState("zafiro");
  const [loadingNewSub, setLoadingNewSub] = useState(false);
  const [newSubError, setNewSubError] = useState("");

  const [expandedWorkers, setExpandedWorkers] = useState({});
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [serviciosGlobalDesplegado, setServiciosGlobalDesplegado] = useState(false);
  const [trabajadoresGlobalDesplegado, setTrabajadoresGlobalDesplegado] = useState(false);
  const [citasGlobalDesplegado, setCitasGlobalDesplegado] = useState(false);
  const [citasSearch, setCitasSearch] = useState("");
  const [expandedCitaClients, setExpandedCitaClients] = useState({});

  const toggleCategoryExpand = (categoryName, e) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const parseServiceName = (nombre) => {
    const parts = nombre.split(" - ");
    if (parts.length > 1) {
      const category = parts[0].trim();
      const rest = parts.slice(1).join(" - ").trim();
      
      const fondoMatch = rest.match(/\|fondo:([^|]+)\|/);
      let fondo = fondoMatch ? fondoMatch[1] : "";
      let subtitle = fondoMatch ? rest.replace(/\|fondo:[^|]+\|/, "").trim() : rest;
      
      // Fallback for old gem format
      if (!fondo) {
        const gemMatch = subtitle.match(/\(([^)]+)\)$/);
        if (gemMatch) {
          fondo = gemMatch[1].toLowerCase();
          subtitle = subtitle.replace(/\s*\([^)]+\)$/, "").trim();
        }
      }
      
      return { category, subtitle, fondo };
    }
    return { category: nombre, subtitle: "", fondo: "" };
  };

  const abrirModalModificar = () => {
    if (!selectedItem) return;
    setErrorModal("");
    if (selectedItem.type === "category") {
      setEditName(selectedItem.name);
    } else {
      const parsed = parseServiceName(selectedItem.rawName);
      setEditName(parsed.subtitle || selectedItem.name);
      setEditDuration(selectedItem.duration);
      setEditPrice(selectedItem.price);
    }
    setEditModalOpen(true);
  };

  const guardarModificacion = async () => {
    if (!editName.trim()) {
      setErrorModal("El nombre no puede estar vacío");
      return;
    }
    setMensajeServicio("");
    setLoadingServicio(true);
    try {
      if (selectedItem.type === "category") {
        const res = await fetch(`${API_BASE}/categorias/modificar/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            old_name: selectedItem.name,
            new_name: editName.trim(),
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setMensajeServicio("✅ Categoría modificada correctamente.");
          setSelectedItem(null);
          setEditModalOpen(false);
          fetchServicios();
        } else {
          setErrorModal(data.error || "Error al modificar la categoría");
        }
      } else {
        const parsed = parseServiceName(selectedItem.rawName);
        const newNombre = parsed.subtitle 
          ? `${parsed.category} - ${editName.trim()}${parsed.gem ? ` (${parsed.gem})` : ""}` 
          : editName.trim();

        const res = await fetch(`${API_BASE}/servicios/${selectedItem.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: newNombre,
            duracion: Number(editDuration),
            precio: Number(editPrice),
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setMensajeServicio("✅ Servicio modificado correctamente.");
          setSelectedItem(null);
          setEditModalOpen(false);
          fetchServicios();
        } else {
          setErrorModal(data.error || "Error al modificar el servicio");
        }
      }
    } catch (e) {
      setErrorModal("Error al conectar con el servidor.");
    } finally {
      setLoadingServicio(false);
    }
  };

  const guardarNuevoSubtitulo = async () => {
    setNewSubError("");
    if (!newSubNombre.trim()) {
      setNewSubError("❌ Por favor escribe el nombre del subtítulo.");
      return;
    }
    if (newSubPrecio === "" || isNaN(newSubPrecio) || Number(newSubPrecio) < 0) {
      setNewSubError("❌ Por favor escribe un precio válido.");
      return;
    }

    setLoadingNewSub(true);
    try {
      const gemaObj = GEMSTONES.find((g) => g.id === newSubColor);
      const gemaLabel = gemaObj ? gemaObj.label : "Zafiro";
      const nombreCompleto = `${selectedItem.name.trim()} - ${newSubNombre.trim()} (${gemaLabel})`;

      const res = await fetch(`${API_BASE}/servicios/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreCompleto,
          bloques: Number(newSubBloques),
          precio: Number(newSubPrecio),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Guardar color de gema localmente
        const localColors = JSON.parse(localStorage.getItem("servicio_colors") || "{}");
        localColors[nombreCompleto] = newSubColor;
        localStorage.setItem("servicio_colors", JSON.stringify(localColors));

        setMensajeServicio("✅ Subtítulo añadido correctamente.");
        setAddSubtitleModalOpen(false);
        setNewSubNombre("");
        setNewSubBloques(2);
        setNewSubPrecio("");
        setNewSubColor("zafiro");

        // Mantener la categoría expandida
        setExpandedCategories((prev) => ({
          ...prev,
          [selectedItem.name]: true,
        }));

        fetchServicios();
      } else {
        setNewSubError(data.error || "Error al guardar el subtítulo");
      }
    } catch (error) {
      console.error(error);
      setNewSubError("Error al conectar con el servidor.");
    } finally {
      setLoadingNewSub(false);
    }
  };

  const eliminarTrabajadoresSeleccionados = async () => {
    const confirmar = window.confirm(
      selectedWorkers.length === 1
        ? "¿Deseas eliminar el trabajador seleccionado?"
        : "¿Deseas eliminar los trabajadores seleccionados?"
    );

    if (!confirmar) return;

    setMensajeServicio("");
    setLoadingServicio(true);
    try {
      const res = await fetch(`${API_BASE}/trabajadores/eliminar-masivo/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedWorkers }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensajeServicio(`✅ ${data.message || "Trabajadores eliminados correctamente."}`);
        setSelectedWorkers([]); // Limpiar selección
        fetchTrabajadores();
      } else {
        setMensajeServicio(`❌ ${data.error || "No se pudieron eliminar los trabajadores."}`);
      }
    } catch (error) {
      console.error(error);
      setMensajeServicio("❌ Error al conectar con el servidor.");
    } finally {
      setLoadingServicio(false);
    }
  };

  const toggleSelectWorker = (id) => {
    setSelectedWorkers((prev) =>
      prev.includes(id) ? prev.filter((wid) => wid !== id) : [...prev, id]
    );
  };

  const toggleWorkerExpand = (id) => {
    setExpandedWorkers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const eliminarSeleccionado = async () => {
    if (!selectedItem) return;
    setMensajeServicio("");
    
    if (selectedItem.type === "category") {
      const confirmar = window.confirm(
        `¿Seguro que deseas eliminar la categoría "${selectedItem.name}" y todos sus servicios relacionados?`
      );
      if (!confirmar) return;
      
      setLoadingServicio(true);
      try {
        const res = await fetch(`${API_BASE}/categorias/eliminar/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: selectedItem.name }),
        });
        const data = await res.json();
        if (res.ok) {
          setMensajeServicio("✅ Categoría y servicios eliminados correctamente.");
          setSelectedItem(null);
          fetchServicios();
        } else {
          setMensajeServicio(`❌ ${data.error || "No se pudo eliminar"}`);
        }
      } catch (e) {
        setMensajeServicio("❌ Error al conectar con el servidor.");
      } finally {
        setLoadingServicio(false);
      }
    } else {
      const confirmar = window.confirm(
        `¿Seguro que deseas eliminar el servicio "${selectedItem.name}"?`
      );
      if (!confirmar) return;

      setLoadingServicio(true);
      try {
        const res = await fetch(`${API_BASE}/servicios/${selectedItem.id}/`, {
          method: "DELETE",
        });
        if (res.ok) {
          setMensajeServicio("✅ Servicio eliminado correctamente.");
          setSelectedItem(null);
          fetchServicios();
        } else {
          const data = await res.json();
          setMensajeServicio(`❌ ${data.error || "No se pudo eliminar el servicio"}`);
        }
      } catch (e) {
        setMensajeServicio("❌ Error al conectar con el servidor.");
      } finally {
        setLoadingServicio(false);
      }
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Bienvenida, Sofía</h2>
      <div className="profile-card">
        <div className="profile-info">
          <h3>Perfil de Sofía</h3>
          <p className="profile-text">
            <strong>Nombre completo:</strong> Sofía Hernández
          </p>
          <p className="profile-text">
            <strong>Correo:</strong> sofia@example.com
          </p>
          <p className="profile-text">
            <strong>Teléfono:</strong> 300 123 4567
          </p>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {mensajeServicio && (
          <div
            className={
              mensajeServicio.includes("✅")
                ? "success-message"
                : "error-mensaje"
            }
            style={{ marginBottom: "20px" }}
          >
            {mensajeServicio}
          </div>
        )}

        <AddServiceWizard 
          fetchServicios={fetchServicios} 
          setParentMensaje={setMensajeServicio} 
        />

        <div className="wizard-outer-container" style={{ marginTop: 24 }}>
          <div 
            onClick={() => setServiciosGlobalDesplegado(!serviciosGlobalDesplegado)} 
            className={`wizard-trigger-card ${serviciosGlobalDesplegado ? "active" : ""}`}
            style={{ marginBottom: serviciosGlobalDesplegado ? "16px" : "0", cursor: "pointer" }}
          >
            <div className="trigger-card-content" style={{ justifyContent: "flex-start", gap: "12px" }}>
              <span className="category-toggle-btn" style={{ 
                background: "transparent", border: "none", color: "var(--accent-lavender)",
                fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {serviciosGlobalDesplegado ? "▼" : "▶"}
              </span>
              <span className="trigger-title" style={{ fontSize: "18px", fontWeight: "600" }}>Servicios Guardados</span>
            </div>
          </div>
          
          <div className={`wizard-panel-collapsible ${serviciosGlobalDesplegado ? "expanded" : "collapsed"}`}>
            {serviciosGlobalDesplegado && (
              <div className="wizard-inner-form" style={{ padding: 0, border: "none", background: "transparent" }}>
                <div className="services-list-container">
            {(() => {
              // renderNombreServicio no longer needed, using parseServiceName directly


              const groupedServicios = {};
              servicios.forEach((s) => {
                const sNombre = s.nombre || "";
                const parts = sNombre.split(" - ");
                const title = parts[0].trim();
                const subtitle = parts.length > 1 ? parts.slice(1).join(" - ").trim() : "";
                if (!groupedServicios[title]) {
                  groupedServicios[title] = [];
                }
                groupedServicios[title].push({ ...s, subtitle });
              });

              const keys = Object.keys(groupedServicios);
              if (keys.length === 0) {
                return <p style={{ color: "var(--text-muted)", padding: "10px 0" }}>No hay servicios guardados.</p>;
              }

              return keys.map((title) => {
                const items = groupedServicios[title];
                const hasSubservices = items.some(item => item.subtitle !== "");
                const isExpanded = !!expandedCategories[title];
                const isCatSelected = selectedItem && selectedItem.type === "category" && selectedItem.name === title;

                return (
                  <div key={title} className="category-group">
                    <div 
                      className="category-header"
                      onClick={(e) => {
                        if (isCatSelected) {
                          setSelectedItem(null);
                        } else {
                          setSelectedItem({
                            type: "category",
                            name: title
                          });
                          if (hasSubservices && !isExpanded) {
                            setExpandedCategories((prev) => ({
                              ...prev,
                              [title]: true,
                            }));
                          }
                          const target = e.currentTarget;
                          setTimeout(() => {
                            if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
                          }, 50);
                        }
                      }}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      {hasSubservices && (
                        <button
                          type="button"
                          className="category-toggle-btn"
                          onClick={(e) => toggleCategoryExpand(title, e)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--accent-lavender)",
                            cursor: "pointer",
                            fontSize: "14px",
                            padding: "4px 8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "4px",
                            outline: "none"
                          }}
                        >
                          {isExpanded ? "▼" : "▶"}
                        </button>
                      )}
                      {!hasSubservices && <div style={{ width: "26px" }} />}
                      
                      <input 
                        type="radio" 
                        name="selected-service-item"
                        checked={!!isCatSelected}
                        onChange={() => {}}
                        className="custom-radio-input"
                        style={{ marginRight: "10px" }}
                      />
                      <span className="category-title">{title}</span>
                    </div>

                    {hasSubservices && isExpanded && (
                      <div className="category-services">
                        {items.map((s) => {
                          const isServiceSelected = selectedItem && selectedItem.type === "service" && selectedItem.id === s.id;
                          const parsed = parseServiceName(s.nombre);
                          
                          return (
                            <div key={s.id} style={{ marginBottom: "16px", padding: "0 16px" }}>
                              <ServiceBackgroundCard 
                                nombre={parsed.subtitle || parsed.category}
                                tiempo={s.duracion}
                                background_id={parsed.fondo}
                                isSelected={isServiceSelected}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isServiceSelected) {
                                    setSelectedItem(null);
                                  } else {
                                    setSelectedItem({
                                      type: "service",
                                      id: s.id,
                                      name: parsed.subtitle || parsed.category,
                                      rawName: s.nombre,
                                      duration: s.duracion,
                                      price: s.precio
                                    });
                                  }
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>


              </div>
              )}
            </div>
          </div>
        </div>

        {selectedItem && createPortal(
          <div className="sticky-bottom-action-bar">
            <span style={{ color: "white", alignSelf: "center", marginRight: "10px", fontWeight: "bold" }}>
              {selectedItem.type === "category" ? selectedItem.name : selectedItem.name}
            </span>
            <button 
              onClick={abrirModalModificar} 
              className="sticky-action-btn edit"
              disabled={loadingServicio}
            >
              ✏️ Editar Información
            </button>
            <button 
              onClick={() => {}} 
              className="sticky-action-btn theme"
              disabled={loadingServicio}
            >
              ✨ Cambiar Fondo
            </button>
            <button 
              onClick={() => {}} 
              className="sticky-action-btn duplicate"
              disabled={loadingServicio}
            >
              📑 Duplicar
            </button>
            <button 
              onClick={eliminarSeleccionado} 
              className="sticky-action-btn delete"
              disabled={loadingServicio}
            >
              🗑️ Eliminar
            </button>
            {selectedItem.type === "category" && (
              <button 
                onClick={() => {
                  setNewSubError("");
                  setNewSubNombre("");
                  setNewSubBloques(2);
                  setNewSubPrecio("");
                  setNewSubColor("zafiro");
                  setAddSubtitleModalOpen(true);
                }} 
                className="sticky-action-btn edit"
                disabled={loadingServicio}
              >
                ➕ Añadir Subtítulo
              </button>
            )}
          </div>,
          document.body
        )}

        <div className="wizard-outer-container" style={{ marginTop: 24 }}>
          <div 
            className="wizard-trigger-card" 
            onClick={() => setTrabajadoresGlobalDesplegado(!trabajadoresGlobalDesplegado)}
            style={{ padding: "16px 24px", cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <span style={{
              marginRight: "12px",
              color: "var(--accent-lavender)",
              fontSize: "14px",
              fontWeight: "bold"
            }}>
              {trabajadoresGlobalDesplegado ? "▼" : "▶"}
            </span>
            <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-primary)" }}>
              Trabajadores Registrados
            </h3>
          </div>
          <div className={`wizard-panel-collapsible ${trabajadoresGlobalDesplegado ? "expanded" : "collapsed"}`}>
            <div className="wizard-inner-form">
              <div className="worker-list-container">
            {trabajadores.length === 0 ? (
              <p style={{ color: "var(--text-muted)", padding: "10px 0" }}>No hay trabajadores registrados.</p>
            ) : (
              trabajadores.map((t) => {
                const isSelected = selectedWorkers.includes(t.id);
                const isExpanded = !!expandedWorkers[t.id];
                
                const categoriasUnicas = new Set();
                t.servicios?.forEach((s) => {
                  const parts = s.nombre.split(" - ");
                  if (parts.length > 0) categoriasUnicas.add(parts[0].trim());
                });
                const especialidad = categoriasUnicas.size > 0 
                  ? Array.from(categoriasUnicas).join(", ") 
                  : "Estilista Profesional";

                return (
                  <div 
                    key={t.id} 
                    className={`worker-item-card ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleSelectWorker(t.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="worker-item-header" style={{ justifyContent: "flex-start", gap: "8px" }}>
                      <button
                        type="button"
                        className="category-toggle-btn"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWorkerExpand(t.id); }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: isSelected ? "var(--success)" : "var(--accent-lavender)",
                          cursor: "pointer",
                          fontSize: isSelected ? "18px" : "14px",
                          padding: "4px 8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          outline: "none",
                          fontWeight: "bold"
                        }}
                      >
                        {isSelected ? "✓" : (isExpanded ? "▼" : "▶")}
                      </button>
                      <span className="worker-name-text">{t.nombre} {t.apellidos}</span>
                    </div>

                    {isExpanded && (
                      <div 
                        className="worker-details-panel animated-fade-in"
                        onClick={(e) => e.stopPropagation()} // Prevent row click when interacting with panel
                      >
                        <div className="worker-detail-row">
                          <span className="detail-label">Correo:</span>
                          <a href={`mailto:${t.correo}`} className="detail-value email">{t.correo}</a>
                        </div>
                        <div className="worker-detail-row">
                          <span className="detail-label">Teléfono:</span>
                          <span className="detail-value">{t.telefono}</span>
                        </div>
                        <div className="worker-detail-row">
                          <span className="detail-label">Especialidad:</span>
                          <span className="detail-value">{especialidad}</span>
                        </div>
                        <div className="worker-detail-row">
                          <span className="detail-label">Estado:</span>
                          <span className="detail-value status-active">Activo</span>
                        </div>
                        <div className="worker-detail-row">
                          <span className="detail-label">Fecha de registro:</span>
                          <span className="detail-value">01/06/2026</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="wizard-outer-container" style={{ marginTop: 24 }}>
        <div 
          className="wizard-trigger-card" 
          onClick={() => setCitasGlobalDesplegado(!citasGlobalDesplegado)}
          style={{ padding: "16px 24px", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <span style={{
            marginRight: "12px",
            color: "var(--accent-lavender)",
            fontSize: "14px",
            fontWeight: "bold"
          }}>
            {citasGlobalDesplegado ? "▼" : "▶"}
          </span>
          <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-primary)" }}>
            Citas Agendadas
          </h3>
        </div>
        <div className={`wizard-panel-collapsible ${citasGlobalDesplegado ? "expanded" : "collapsed"}`}>
          {citasGlobalDesplegado && (
            <div className="wizard-inner-form" style={{ padding: "16px" }}>
              {(() => {
                const renderGema = (nombreCompleto) => {
                  const nameStr = nombreCompleto || "";
                  const match = nameStr.match(/^(.*?)\s*\((Dorado|Plateado|Zafiro|Violeta|Brown|Green|Esmeralda|Multicolor)\)$/i);
                  if (match) {
                    const mainText = match[1];
                    const colorName = match[2];
                    const colorId = colorName.toLowerCase();
                    return (
                      <div className="service-name-badge">
                        <span>{mainText}</span>
                        <span className={`saved-gem-badge ${colorId}`}>💎 {colorName}</span>
                      </div>
                    );
                  }
                  const localColors = JSON.parse(localStorage.getItem("servicio_colors") || "{}");
                  const colorId = localColors[nameStr];
                  if (colorId) {
                    const label = colorId.charAt(0).toUpperCase() + colorId.slice(1);
                    return (
                      <div className="service-name-badge">
                        <span>{nameStr}</span>
                        <span className={`saved-gem-badge ${colorId}`}>💎 {label}</span>
                      </div>
                    );
                  }
                  return <span>{nameStr}</span>;
                };

                const currentDate = new Date();
                const currentMonthNum = currentDate.getMonth() + 1;
                const currentYear = currentDate.getFullYear();
                const currentMonthName = currentDate.toLocaleString('es-ES', { month: 'long' });
                
                const citasDelMes = citas.filter(c => {
                  if (!c.fecha) return false;
                  const [y, m, d] = c.fecha.split("-");
                  return Number(y) === currentYear && Number(m) === currentMonthNum;
                });

                const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
                const firstDay = `01/${currentMonthNum.toString().padStart(2, '0')}/${currentYear}`;
                const lastDay = `${getDaysInMonth(currentYear, currentMonthNum).toString().padStart(2, '0')}/${currentMonthNum.toString().padStart(2, '0')}/${currentYear}`;

                const serviciosCounter = {};
                citasDelMes.forEach(c => {
                  const svc = servicios.find(s => s.id === c.servicio);
                  const nombreSvc = svc ? svc.nombre : "Desconocido";
                  serviciosCounter[nombreSvc] = (serviciosCounter[nombreSvc] || 0) + 1;
                });
                const serviciosMasSolicitados = Object.entries(serviciosCounter).sort((a, b) => b[1] - a[1]);

                const clientesMap = {};
                citasDelMes.forEach(c => {
                  if (!clientesMap[c.telefono]) {
                    clientesMap[c.telefono] = { telefono: c.telefono, nombre: c.nombre, citas: [] };
                  } else {
                    clientesMap[c.telefono].nombre = c.nombre; 
                  }
                  clientesMap[c.telefono].citas.push(c);
                });
                
                const clientesList = Object.values(clientesMap).filter(cli => {
                  if (!citasSearch) return true;
                  const term = citasSearch.toLowerCase();
                  return cli.nombre.toLowerCase().includes(term) || cli.telefono.includes(term);
                });

                const toggleClient = (tel) => {
                  setExpandedCitaClients(prev => ({ ...prev, [tel]: !prev[tel] }));
                };

                return (
                  <div className="citas-agendadas-container">
                    {/* BLOQUE 1 - RESUMEN DEL MES */}
                    <div className="citas-resumen-card">
                      <h4 className="citas-resumen-title">RESUMEN DEL MES</h4>
                      <div className="citas-resumen-content">
                        <div className="citas-res-row"><strong>Mes:</strong> <span style={{textTransform: "capitalize"}}>{currentMonthName} {currentYear}</span></div>
                        <div className="citas-res-row"><strong>Total citas:</strong> <span className="citas-highlight">{citasDelMes.length}</span></div>
                        <div className="citas-res-row"><strong>Inicio:</strong> {firstDay}</div>
                        <div className="citas-res-row"><strong>Fin:</strong> {lastDay}</div>
                      </div>
                    </div>

                    {/* BLOQUE 2 - SERVICIOS MÁS SOLICITADOS */}
                    <div className="citas-resumen-card" style={{ marginTop: "16px" }}>
                      <h4 className="citas-resumen-title">Servicios Más Solicitados</h4>
                      <div className="citas-servicios-list">
                        {serviciosMasSolicitados.length === 0 ? (
                          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No hay citas este mes.</p>
                        ) : (
                          serviciosMasSolicitados.map(([nombre, count], idx) => (
                            <div key={idx} className="citas-servicio-row">
                              <div className="citas-servicio-name">{renderGema(nombre)}</div>
                              <div className="citas-servicio-count">{count}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* BLOQUE 3 - BUSCADOR */}
                    <div className="citas-search-container" style={{ marginTop: "16px" }}>
                      <div className="citas-search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input 
                          type="text" 
                          placeholder="Buscar cliente por nombre o teléfono..." 
                          value={citasSearch}
                          onChange={(e) => setCitasSearch(e.target.value)}
                          className="citas-search-input"
                        />
                      </div>
                    </div>

                    {/* BLOQUE 4 - CLIENTES */}
                    <div className="citas-clientes-container" style={{ marginTop: "16px" }}>
                      {clientesList.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "10px" }}>No se encontraron clientes.</p>
                      ) : (
                        clientesList.map(cli => {
                          const isExpanded = !!expandedCitaClients[cli.telefono];
                          return (
                            <div key={cli.telefono} className="citas-cliente-card">
                              <div 
                                className="citas-cliente-header" 
                                onClick={() => toggleClient(cli.telefono)}
                              >
                                <span className="citas-toggle-icon" style={{ color: "var(--accent-lavender)", marginRight: "8px" }}>
                                  {isExpanded ? "▼" : "▶"}
                                </span>
                                <span className="citas-cliente-name" style={{ fontWeight: "bold" }}>{cli.nombre} ({cli.citas.length})</span>
                              </div>
                              
                              {isExpanded && (
                                <div className="citas-cliente-body animated-fade-in" style={{ marginTop: "12px" }}>
                                  <div className="citas-cliente-info" style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                    <p style={{ margin: "4px 0" }}><strong>Teléfono:</strong> {cli.telefono}</p>
                                    <p style={{ margin: "4px 0" }}><strong>Total citas este mes:</strong> {cli.citas.length}</p>
                                  </div>
                                  <div className="citas-historial-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {cli.citas.map((c, i) => {
                                      const t = trabajadores.find(tr => tr.id === c.trabajador);
                                      const s = servicios.find(srv => srv.id === c.servicio);
                                      const nomSvc = s ? s.nombre : "Desconocido";
                                      const nomTrb = t ? t.nombre : "Desconocido";
                                      return (
                                        <div key={i} className="cita-historial-item">
                                          <div className="cita-historial-header" style={{ marginBottom: "8px" }}>
                                            {renderGema(nomSvc)}
                                          </div>
                                          <div className="cita-historial-details" style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                                            <p style={{ margin: "2px 0" }}><strong>Trabajador:</strong> <span style={{ color: "var(--text-primary)" }}>{nomTrb}</span></p>
                                            <p style={{ margin: "2px 0" }}><strong>Fecha:</strong> <span style={{ color: "var(--text-primary)" }}>{c.fecha}</span></p>
                                            <p style={{ margin: "2px 0" }}><strong>Hora:</strong> <span style={{ color: "var(--text-primary)" }}>{c.hora}</span></p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>


          {selectedWorkers.length > 0 && createPortal(
            <div className="selection-action-bar worker-action-bar">
              <div className="action-bar-info">
                <span className="action-bar-value">
                  {selectedWorkers.length} {selectedWorkers.length === 1 ? "trabajador seleccionado" : "trabajadores seleccionados"}
                </span>
              </div>
              <div className="action-bar-buttons">
                <button 
                  onClick={eliminarTrabajadoresSeleccionados} 
                  className="btn-action-delete"
                  disabled={loadingServicio}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Eliminar Selección
                </button>
              </div>
            </div>,
            document.body
          )}
        </div>


      {editModalOpen && selectedItem && (
        <div className="glass-modal-overlay">
          <div className="glass-modal">
            <div className="glass-modal-header">
              <span className="glass-modal-title">
                {selectedItem.type === "category" ? "Modificar Categoría" : "Modificar Servicio"}
              </span>
              <button 
                onClick={() => setEditModalOpen(false)} 
                className="glass-modal-close"
              >
                ✕
              </button>
            </div>
            
            <div className="glass-modal-body">
              {errorModal && (
                <div className="error-mensaje" style={{ marginBottom: "10px", padding: "10px" }}>
                  {errorModal}
                </div>
              )}
              
              <div className="glass-modal-field">
                <label style={{ marginTop: 0 }}>Nombre:</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  placeholder={selectedItem.type === "category" ? "Nombre de categoría" : "Nombre del servicio"}
                />
              </div>

              {selectedItem.type === "service" && (
                <>
                  <div className="glass-modal-field">
                    <label>Duración (minutos):</label>
                    <input 
                      type="number" 
                      value={editDuration} 
                      onChange={(e) => setEditDuration(e.target.value)} 
                      min="1"
                    />
                  </div>
                  <div className="glass-modal-field">
                    <label>Precio ($):</label>
                    <input 
                      type="number" 
                      value={editPrice} 
                      onChange={(e) => setEditPrice(e.target.value)} 
                      min="0"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="glass-modal-footer">
              <button 
                onClick={() => setEditModalOpen(false)} 
                className="btn-secondary"
                style={{ width: "auto", margin: 0 }}
                disabled={loadingServicio}
              >
                Cancel
              </button>
              <button 
                onClick={guardarModificacion} 
                className="btn-guardar"
                style={{ width: "auto", margin: 0, padding: "10px 20px" }}
                disabled={loadingServicio}
              >
                {loadingServicio ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {addSubtitleModalOpen && selectedItem && (
        <div className="glass-modal-overlay">
          <div className="glass-modal" style={{ maxWidth: "500px", padding: "0", background: "transparent", border: "none" }}>
            <div className={`subtitle-config-card gem-${newSubColor} animated-fade-in-scale`} style={{ margin: "0" }}>
              <div className="sub-card-header">
                <span className="sub-card-title-text">
                  Añadir Subtítulo a {selectedItem.name}
                </span>
                <button
                  type="button"
                  onClick={() => setAddSubtitleModalOpen(false)}
                  className="sub-card-delete-btn"
                  title="Cerrar"
                  disabled={loadingNewSub}
                >
                  ✕
                </button>
              </div>

              <div className="sub-card-fields-stacked" style={{ marginTop: "16px" }}>
                <div className="sub-card-field-group">
                  <label style={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: "bold" }}>Nombre del subtítulo:</label>
                  <input
                    type="text"
                    value={newSubNombre}
                    onChange={(e) => setNewSubNombre(e.target.value)}
                    placeholder="Ej. Corte Premium, Corte Clásico..."
                    className="sub-card-input-text"
                    disabled={loadingNewSub}
                  />
                </div>

                <div className="sub-card-fields-grid">
                  <div className="sub-card-field-group">
                    <label style={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: "bold" }}>Cantidad de bloques (1 bloque = 15 minutos):</label>
                    <select
                      value={newSubBloques}
                      onChange={(e) => setNewSubBloques(Number(e.target.value))}
                      disabled={loadingNewSub}
                      className="sub-card-select"
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((b) => (
                        <option key={b} value={b}>
                          {b} {b === 1 ? "bloque" : "bloques"} ({b * 15} minutos)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sub-card-field-group">
                    <label style={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: "bold" }}>Precio:</label>
                    <div className="price-input-wrapper">
                      <span className="price-currency-symbol">$</span>
                      <input
                        type="number"
                        value={newSubPrecio}
                        onChange={(e) => setNewSubPrecio(e.target.value)}
                        placeholder="Ej. 25000"
                        className="sub-card-input-price"
                        disabled={loadingNewSub}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="gemstone-selector-area">
                  <label className="gem-selector-label" style={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: "bold" }}>Color visual de gema brillante:</label>
                  <div className="gem-options-flex">
                    {GEMSTONES.map((gem) => (
                      <button
                        key={gem.id}
                        type="button"
                        onClick={() => setNewSubColor(gem.id)}
                        className={`gem-mini-btn ${gem.id} ${newSubColor === gem.id ? "active" : ""}`}
                        title={`${gem.label} brillante`}
                        disabled={loadingNewSub}
                      >
                        <span className="gem-emoji">{gem.emoji}</span>
                        <span className="gem-name">{gem.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {newSubError && (
                  <div className="error-mensaje" style={{ marginTop: "10px", padding: "10px", borderRadius: "8px" }}>
                    {newSubError}
                  </div>
                )}

                <div className="wizard-actions-bottom-row" style={{ marginTop: "20px" }}>
                  <button
                    type="button"
                    onClick={() => setAddSubtitleModalOpen(false)}
                    className="wizard-action-btn btn-add"
                    disabled={loadingNewSub}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={guardarNuevoSubtitulo}
                    className="wizard-action-btn btn-save"
                    disabled={loadingNewSub}
                  >
                    {loadingNewSub ? "Guardando..." : "💎 GUARDAR SUBTÍTULO"}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppContent() {
  return (
    <>
      <Navbar />
      <DrawerMenu />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/perfil"
            element={<ProtectedRoute element={<ProfilePage />} />}
          />
          <Route path="/citas" element={<CitasPage />} />
          <Route path="/horario" element={<HorarioPage />} />
          <Route path="/qr" element={<QRPage />} />
          <Route
            path="/registrar-trabajador"
            element={<RegistrarTrabajadorPage />}
          />
          <Route path="/admin-welcome" element={<AdminWelcomePage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
