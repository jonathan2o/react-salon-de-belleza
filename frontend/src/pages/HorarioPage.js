import React, { useState, useEffect } from 'react';
import './HorarioPage.css';

const API_BASE = "http://127.0.0.1:8000/api";

const mapToOfficialBg = (bgId) => {
  if (!bgId) return "gold";
  const map = {
    dorado: "gold", plateado: "silver", bronce: "bronze", obsidiana: "obsidian",
    zafiro: "sapphire", amatista: "amethyst", esmeralda: "emerald", rubi: "ruby",
    pink: "pink", rosa: "pink", rosado: "pink", turquoise: "turquoise",
    turquesa: "turquoise", violet: "violet", violeta: "violet", marble: "marble",
    marmol: "marble", diamante: "diamond"
  };
  return map[bgId.toLowerCase()] || bgId.toLowerCase();
};

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

export default function HorarioPage() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);
  
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [currentWeekMonday, setCurrentWeekMonday] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  useEffect(() => {
    // Initialize current week monday and selected date to today (ignoring time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today);
    
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    setCurrentWeekMonday(monday);
    
    fetchTrabajadores();
    fetchCitas();
    fetchServicios();
  }, []);

  const fetchTrabajadores = async () => {
    try {
      const res = await fetch(`${API_BASE}/trabajadores/`);
      const data = await res.json();
      if (res.ok) {
        setTrabajadores(data);
        if (data.length > 0 && !selectedWorkerId) {
          setSelectedWorkerId(data[0].id.toString());
        }
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

  const fetchServicios = async () => {
    try {
      const res = await fetch(`${API_BASE}/servicios/`);
      const data = await res.json();
      if (res.ok) {
        setServicios(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekMonday);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekMonday(prev);
    
    // Auto select the same day of the week if possible, or just the monday
    const dayIndex = (selectedDate.getDay() + 6) % 7; // 0 for Monday, 6 for Sunday
    const newSelected = new Date(prev);
    newSelected.setDate(newSelected.getDate() + dayIndex);
    setSelectedDate(newSelected);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekMonday);
    next.setDate(next.getDate() + 7);
    setCurrentWeekMonday(next);
    
    const dayIndex = (selectedDate.getDay() + 6) % 7;
    const newSelected = new Date(next);
    newSelected.setDate(newSelected.getDate() + dayIndex);
    setSelectedDate(newSelected);
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekMonday);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  
  // Format month and year
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const currentMonthName = monthNames[currentWeekMonday.getMonth()];
  const currentYear = currentWeekMonday.getFullYear();

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const getDayName = (date) => {
    const names = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return names[date.getDay()];
  };

  // Format YYYY-MM-DD for comparison with citas
  const formatDateString = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatHora = (horaString) => {
    // horaString comes as "HH:MM:SS" or similar
    if (!horaString) return "";
    const parts = horaString.split(':');
    return `${parts[0]}:${parts[1]}`;
  };

  // Check if a cita is in the past
  const isCitaPasada = (cita) => {
    const now = new Date();
    const citaDate = new Date(`${cita.fecha}T${cita.hora}`);
    return now > citaDate;
  };

  const getServicioData = (servicioId) => {
    const s = servicios.find(s => s.id === servicioId);
    if (s) {
      return { nombre: s.nombre, duracion: s.duracion };
    }
    return { nombre: "Servicio", duracion: 0 };
  };

  const selectedDateString = formatDateString(selectedDate);
  
  // Filter and sort citas
  const citasFiltradas = citas.filter(c => 
    c.trabajador.toString() === selectedWorkerId && 
    c.fecha === selectedDateString
  ).sort((a, b) => {
    return a.hora.localeCompare(b.hora);
  });

  return (
    <div className="horario-container">
      <h2 className="horario-title">HORARIO DE TRABAJADOR</h2>
      
      <div className="horario-selector-wrapper">
        <select 
          className="horario-selector" 
          value={selectedWorkerId}
          onChange={(e) => setSelectedWorkerId(e.target.value)}
        >
          {trabajadores.map(t => (
            <option key={t.id} value={t.id.toString()}>
              {t.nombre} {t.apellidos}
            </option>
          ))}
        </select>
        <span className="horario-selector-icon">▼</span>
      </div>

      <div className="horario-calendar-section">
        <div className="horario-month-year">
          {currentMonthName} {currentYear}
        </div>
        <div className="horario-week-row">
          <button className="horario-nav-btn" onClick={handlePrevWeek}>◀</button>
          <div className="horario-days-container">
            {weekDays.map((d, index) => (
              <div 
                key={index}
                className={`horario-day-card ${isSelected(d) ? 'selected' : ''}`}
                onClick={() => setSelectedDate(d)}
              >
                {isToday(d) && <span className="horario-hoy-badge">HOY</span>}
                <span className="horario-day-name">{getDayName(d)}</span>
                <span className="horario-day-number">{d.getDate()}</span>
              </div>
            ))}
          </div>
          <button className="horario-nav-btn" onClick={handleNextWeek}>▶</button>
        </div>
      </div>

      <div className="horario-counter">
        {citasFiltradas.length} cita{citasFiltradas.length !== 1 ? 's' : ''} programada{citasFiltradas.length !== 1 ? 's' : ''} para este día
      </div>

      {citasFiltradas.length > 0 ? (
        <div className="horario-table-wrapper">
          <table className="horario-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>👤 Cliente</th>
                <th>✂ Servicio</th>
                <th>⏱ Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {citasFiltradas.map((cita) => {
                const sData = getServicioData(cita.servicio);
                const parsedService = parseServiceName(sData.nombre);
                const bgId = mapToOfficialBg(parsedService.fondo);
                const bgUrl = `/assets/fondos-servicios-horizontales/${bgId}.webp`;
                
                return (
                  <tr key={cita.id} className={isCitaPasada(cita) ? 'horario-cita-pasada' : ''}>
                    <td className="horario-cell-hora">{formatHora(cita.hora)}</td>
                    <td className="horario-cell-cliente">{cita.nombre}</td>
                    <td>
                      <div className="horario-service-bg">
                        <img src={bgUrl} alt="" className="horario-service-bg-img" loading="lazy" />
                        <div className="horario-service-bg-overlay"></div>
                        <span className="horario-service-text">{parsedService.subtitle || parsedService.category}</span>
                      </div>
                    </td>
                    <td className="horario-cell-tiempo">{sData.duracion} min</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="horario-empty">
          <span className="horario-empty-icon">📅</span>
          <span className="horario-empty-text">No hay citas programadas para este día.</span>
        </div>
      )}
    </div>
  );
}
