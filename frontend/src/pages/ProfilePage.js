import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ServiceBackgroundCard from "../components/ServiceBackgroundCard";

const API_BASE = "http://127.0.0.1:8000/api";

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [serviciosSeleccionadosInicial, setServiciosSeleccionadosInicial] = useState([]);
  const [mensajeServicios, setMensajeServicios] = useState("");
  const [mensajeDias, setMensajeDias] = useState("");
  const [isSavingServicios, setIsSavingServicios] = useState(false);
  const [isSavingDias, setIsSavingDias] = useState(false);
  const [mostrarServicios, setMostrarServicios] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const serviciosRes = await fetch(`${API_BASE}/servicios/`);
        const serviciosData = await serviciosRes.json();

        setServicios(serviciosData);

        const trabajadoresRes = await fetch(`${API_BASE}/trabajadores/`);
        const trabajadoresData = await trabajadoresRes.json();

        const trabajador = trabajadoresData.find(
          (t) => t.id === user.trabajador_id,
        );

        if (trabajador) {
          if (trabajador.servicios) {
            const idsServicios = trabajador.servicios.map((s) => s.id);

            setServiciosSeleccionados(idsServicios);
            setServiciosSeleccionadosInicial(idsServicios);
          }

          if (trabajador.dias_disponibles) {
            setDiasSeleccionados(trabajador.dias_disponibles);
          }

          if (trabajador.hora_inicio) {
            setHoraInicio(trabajador.hora_inicio);
          }

          if (trabajador.hora_fin) {
            setHoraFin(trabajador.hora_fin);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    cargarDatos();
  }, []);

  const parseServiceName = (nombre) => {
    const parts = nombre.split(" - ");
    if (parts.length > 1) {
      const category = parts[0].trim();
      const rest = parts.slice(1).join(" - ").trim();
      
      const fondoMatch = rest.match(/\|fondo:([^|]+)\|/);
      let fondo = fondoMatch ? fondoMatch[1] : "";
      let subtitle = fondoMatch ? rest.replace(/\|fondo:[^|]+\|/, "").trim() : rest;
      
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
  const manejarSeleccion = (id) => {
    const idNumero = Number(id);

    if (serviciosSeleccionados.includes(idNumero)) {
      const nuevosServicios = serviciosSeleccionados.filter(
        (servicioId) => servicioId !== idNumero,
      );

      setServiciosSeleccionados(nuevosServicios);
    } else {
      setServiciosSeleccionados([...serviciosSeleccionados, idNumero]);
    }
  };

  const manejarSeleccionCategoria = (items) => {
    const idsCategoria = items.map((s) => s.id);
    const isSelected = items.some((s) => serviciosSeleccionados.includes(s.id));
    if (isSelected) {
      setServiciosSeleccionados((prev) =>
        prev.filter((id) => !idsCategoria.includes(id))
      );
    } else {
      setServiciosSeleccionados((prev) => [
        ...new Set([...prev, ...idsCategoria]),
      ]);
    }
  };

  const hasChanges =
    JSON.stringify([...serviciosSeleccionados].sort()) !==
    JSON.stringify([...serviciosSeleccionadosInicial].sort());

  const guardarServicios = async () => {
    setMensajeServicios("⏳ Guardando cambios...");
    setIsSavingServicios(true);

    try {
      const token = localStorage.getItem("access");

      const response = await fetch(
        `${API_BASE}/trabajadores/${user.trabajador_id}/servicios/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            servicios: serviciosSeleccionados,
          }),
        },
      );

      if (response.ok) {
        setMensajeServicios("✅ Cambios guardados correctamente");
        setServiciosSeleccionadosInicial(serviciosSeleccionados);
        setTimeout(() => setMensajeServicios(""), 4000);
      } else {
        setMensajeServicios("❌ Error al guardar los cambios");
      }
    } catch (error) {
      console.log(error);
      setMensajeServicios("❌ Error al guardar los cambios");
    } finally {
      setIsSavingServicios(false);
    }
  };
  const guardarDias = async () => {
    setMensajeDias("⏳ Guardando cambios...");
    setIsSavingDias(true);

    try {
      const storedTokens = JSON.parse(localStorage.getItem("tokens"));

      const token = storedTokens?.access;

      const response = await fetch(
        `${API_BASE}/trabajadores/${user.trabajador_id}/disponibilidad/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dias: diasSeleccionados,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
          }),
        },
      );

      if (response.ok) {
        setMensajeDias("✅ Cambios guardados correctamente");
        setTimeout(() => setMensajeDias(""), 4000);
      } else {
        setMensajeDias("❌ Error al guardar los cambios");
      }
    } catch (error) {
      console.log(error);
      setMensajeDias("❌ Error al guardar los cambios");
    } finally {
      setIsSavingDias(false);
    }
  };
  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const seleccionarDia = (dia) => {
    if (diasSeleccionados.includes(dia)) {
      setDiasSeleccionados(diasSeleccionados.filter((d) => d !== dia));
    } else {
      setDiasSeleccionados([...diasSeleccionados, dia]);
    }
  };

  if (!user) {
    return (
      <div className="page-container">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Mi Perfil</h2>
      <div className="profile-card">
        <div className="profile-info">
          <h3>Bienvenido, {user.nombre}</h3>
          <p className="profile-text">
            <strong>Nombre completo:</strong> {user.nombre} {user.apellidos}
          </p>
          <p className="profile-text">
            <strong>Correo:</strong> {user.correo}
          </p>
          <p className="profile-text">
            <strong>Teléfono:</strong> {user.telefono}
          </p>
          {user.numero_cc && (
            <p className="profile-text">
              <strong>CC:</strong> {user.numero_cc}
            </p>
          )}
        </div>
      </div>

      <div className="profile-actions">
        {(() => {
          const groupedServiciosTemp = {};
          servicios.forEach((s) => {
            const parts = s.nombre.split(" - ");
            const title = parts[0].trim();
            if (!groupedServiciosTemp[title]) {
              groupedServiciosTemp[title] = [];
            }
            groupedServiciosTemp[title].push(s);
          });
          const numActivos = Object.keys(groupedServiciosTemp).filter(title => 
            groupedServiciosTemp[title].some(s => serviciosSeleccionados.includes(s.id))
          ).length;

          return (
            <div className="premium-dashboard-card animated-fade-in-scale">
              <div className="premium-dashboard-header">
                <span className="premium-icon">📅</span>
                <div className="premium-titles">
                  <h3 className="premium-title">Servicios habilitados para reservas</h3>
                  <p className="premium-subtitle">Gestiona los servicios disponibles para tus clientes</p>
                </div>
              </div>
              <div className="premium-active-indicator">
                <span className="indicator-number">{numActivos}</span>
                <span className="indicator-label">activos</span>
              </div>
            </div>
          );
        })()}

        <div className="wizard-outer-container" style={{ marginBottom: "30px" }}>
          <div 
            className="premium-section-header" 
            onClick={() => setMostrarServicios(!mostrarServicios)}
          >
            <div className="premium-section-titles">
              <h4 className="premium-section-title">
                <span className="premium-icon-small">✂</span> Servicios Seleccionados
              </h4>
              <p className="premium-section-subtitle">Servicios activos actualmente</p>
            </div>
            {(() => {
              const groupedServiciosTemp = {};
              servicios.forEach((s) => {
                const parts = s.nombre.split(" - ");
                const title = parts[0].trim();
                if (!groupedServiciosTemp[title]) {
                  groupedServiciosTemp[title] = [];
                }
                groupedServiciosTemp[title].push(s);
              });
              const numActivos = Object.keys(groupedServiciosTemp).filter(title => 
                groupedServiciosTemp[title].some(s => serviciosSeleccionados.includes(s.id))
              ).length;
              return (
                <div className="premium-capsule-indicator">
                  <span className="capsule-dot">🟢</span>
                  <span className="capsule-text">Servicios activos: {numActivos}</span>
                </div>
              );
            })()}
          </div>
          
          <div className={`wizard-panel-collapsible ${mostrarServicios ? "expanded" : "collapsed"}`}>
            {mostrarServicios && (
              <div className="wizard-inner-form" style={{ padding: "16px" }}>
                <div className="services-list-container" style={{ marginTop: 0, border: "none", padding: 0, backgroundColor: "transparent" }}>
                  {(() => {
                    // Removed old renderGema and cleanName


                    const groupedServicios = {};
                    servicios.forEach((s) => {
                      const parts = s.nombre.split(" - ");
                      const title = parts[0].trim();
                      const subtitle = parts.length > 1 ? parts.slice(1).join(" - ").trim() : "";
                      if (!groupedServicios[title]) {
                        groupedServicios[title] = [];
                      }
                      groupedServicios[title].push({ ...s, subtitle });
                    });

                    const toggleCat = (cat, e) => {
                      e.stopPropagation();
                      setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
                    };

                    const keys = Object.keys(groupedServicios);
                    if (keys.length === 0) return <p style={{ color: "var(--text-muted)", padding: "10px 0" }}>No hay servicios creados.</p>;

                    return keys.map((title) => {
                      const items = groupedServicios[title];
                      const isExpanded = !!expandedCategories[title];
                      const hasSubservices = items.some(item => item.subtitle !== "");
                      const isCategorySelected = items.some(item => serviciosSeleccionados.includes(item.id));
                      
                      return (
                        <div key={title} className="category-group" style={{ marginBottom: "12px", border: isCategorySelected ? "1px solid var(--accent-lavender)" : "1px solid var(--border-color)" }}>
                          <div 
                            className="category-header"
                            onClick={(e) => {
                              if (hasSubservices) {
                                toggleCat(title, e);
                              }
                            }}
                            style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "16px", backgroundColor: isCategorySelected ? "rgba(139, 92, 246, 0.08)" : "transparent", alignItems: "stretch" }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%", gap: "12px" }}>
                              <div style={{ display: "flex", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                                <input 
                                  type="checkbox" 
                                  className="custom-checkbox"
                                  checked={isCategorySelected}
                                  onChange={() => manejarSeleccionCategoria(items)}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ marginTop: "2px", marginRight: "12px", flexShrink: 0 }}
                                />
                                <span className="category-title" style={{ flex: 1, wordWrap: "break-word", lineHeight: "1.4", overflowWrap: "break-word" }}>
                                  {title}
                                </span>
                              </div>
                              <span style={{ color: "var(--accent-lavender)", fontSize: "14px", fontWeight: "bold", flexShrink: 0, marginLeft: "8px", display: "flex", alignItems: "center", height: "24px" }}>
                                {hasSubservices ? (isExpanded ? "▼" : "▶") : ""}
                              </span>
                            </div>

                            {isCategorySelected && (
                              <div style={{ display: "flex", alignItems: "center", paddingLeft: "32px", marginTop: "4px" }}>
                                <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--success, #22c55e)", display: "inline-block", boxShadow: "0 0 8px rgba(34, 197, 94, 0.5)" }}></span>
                                  Activo
                                </span>
                              </div>
                            )}
                          </div>

                          {hasSubservices && isExpanded && (
                            <div className="category-services animated-fade-in" style={{ padding: "8px 0" }}>
                              <div style={{ padding: "0 16px", marginBottom: "8px" }}><hr className="wizard-divider" style={{ margin: "4px 0" }} /></div>
                              {items.map((s) => {
                                const isSelected = serviciosSeleccionados.includes(s.id);
                                const parsed = parseServiceName(s.nombre);
                                
                                return (
                                  <div key={s.id} style={{ marginBottom: "16px", padding: "0 16px" }}>
                                    <ServiceBackgroundCard 
                                      nombre={parsed.subtitle || parsed.category}
                                      tiempo={s.duracion}
                                      background_id={parsed.fondo}
                                      isSelected={isSelected}
                                      onClick={() => manejarSeleccion(s.id)}
                                    />
                                  </div>
                                );
                              })}
                              <div style={{ padding: "0 16px", marginTop: "8px" }}><hr className="wizard-divider" style={{ margin: "4px 0" }} /></div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>

                {hasChanges && (
                  <div className="wizard-actions-bottom-row" style={{ marginTop: "20px" }}>
                    <button 
                      onClick={guardarServicios} 
                      className="wizard-btn-continuar animated-fade-in-scale"
                      disabled={isSavingServicios}
                    >
                      Guardar Cambios
                    </button>
                  </div>
                )}
                
                {mensajeServicios && (
                  <div className={mensajeServicios.includes("✅") ? "wizard-success-alert" : (mensajeServicios.includes("⏳") ? "wizard-info-alert" : "wizard-error-alert")} style={{ marginTop: "16px" }}>
                    {mensajeServicios}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: "40px",
            paddingTop: "24px",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <h3>Días Disponibles</h3>

          <div className="dias-grid-chips">
            {diasSemana.map((dia) => {
              const isAvailable = diasSeleccionados.includes(dia);
              return (
                <button
                  key={dia}
                  onClick={() => seleccionarDia(dia)}
                  className={`chip-dia-btn ${isAvailable ? "disponible" : "no-disponible"}`}
                >
                  {dia}
                </button>
              );
            })}
          </div>
        </div>
        
        <div style={{ marginTop: "30px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ marginTop: 0 }}>Hora de Inicio:</label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>

            <div>
              <label style={{ marginTop: 0 }}>Hora Fin:</label>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              marginTop: "20px",
            }}
          >
            <button
              onClick={guardarDias}
              className="btn-guardar"
              style={{ width: "auto", minWidth: "150px", marginTop: 0, opacity: isSavingDias ? 0.5 : 1, cursor: isSavingDias ? "not-allowed" : "pointer" }}
              disabled={isSavingDias}
            >
              Guardar Días
            </button>
            {mensajeDias && (
              <div
                className={
                  mensajeDias.includes("✅") ? "wizard-success-alert" : (mensajeDias.includes("⏳") ? "wizard-info-alert" : "wizard-error-alert")
                }
                style={{ marginTop: "15px", width: "100%" }}
              >
                {mensajeDias}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
