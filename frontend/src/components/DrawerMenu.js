import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './DrawerMenu.css';

export default function DrawerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // Para saber qué opción está activa

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleNavigation = (e, path) => {
    if (location.pathname === path) {
      e.preventDefault();
    }
    closeMenu();
  };

  return (
    <>
      {/* Botón Flotante para abrir el menú */}
      <button className="drawer-toggle-btn" onClick={toggleMenu} aria-label="Abrir menú">
        ☰
      </button>

      {/* Overlay desenfocado para el fondo */}
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={closeMenu}></div>

      {/* Panel Lateral */}
      <div className={`drawer-container ${isOpen ? 'open' : ''}`}>
        
        {/* Encabezado */}
        <div className="drawer-header">
          <span className="drawer-brand">✂ BARBER PRO</span>
          <span className="drawer-subbrand">Sistema de Gestión</span>
          <div className="drawer-header-line"></div>
        </div>

        {/* Opciones del menú */}
        <div className="drawer-nav">
          
          <Link 
            to="/citas" 
            className={`drawer-item ${location.pathname === '/citas' ? 'active' : ''}`}
            onClick={(e) => handleNavigation(e, '/citas')}
          >
            <div className="drawer-item-content">
              <span className="drawer-item-icon">📅</span>
              <span>Agendar Cita</span>
            </div>
          </Link>

          <Link 
            to="/horario" 
            className={`drawer-item ${location.pathname === '/horario' ? 'active' : ''}`}
            onClick={(e) => handleNavigation(e, '/horario')}
          >
            <div className="drawer-item-content">
              <span className="drawer-item-icon">🕒</span>
              <span>Horario</span>
            </div>
          </Link>

          <Link 
            to="/" 
            className={`drawer-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={(e) => handleNavigation(e, '/')}
          >
            <div className="drawer-item-content">
              <span className="drawer-item-icon">👤</span>
              <span>Iniciar sesión</span>
            </div>
          </Link>

          <Link 
            to="/admin-login" 
            className={`drawer-item ${(location.pathname === '/admin-login' || location.pathname === '/admin-welcome') ? 'active' : ''}`}
            onClick={(e) => handleNavigation(e, '/admin-login')}
          >
            <div className="drawer-item-content">
              <span className="drawer-item-icon">🛠</span>
              <span>Administrador</span>
            </div>
          </Link>

          <Link 
            to="/registrar-trabajador" 
            className={`drawer-item ${location.pathname === '/registrar-trabajador' ? 'active' : ''}`}
            onClick={(e) => handleNavigation(e, '/registrar-trabajador')}
          >
            <div className="drawer-item-content">
              <span className="drawer-item-icon">👨‍💼</span>
              <span>Registrar trabajador</span>
            </div>
          </Link>

          <Link 
            to="/qr" 
            className={`drawer-item ${location.pathname === '/qr' ? 'active' : ''}`}
            onClick={(e) => handleNavigation(e, '/qr')}
          >
            <div className="drawer-item-content">
              <span className="drawer-item-icon">📷</span>
              <span>QR</span>
            </div>
          </Link>

          <div className="drawer-item inactive" onClick={() => alert('Próximamente')}>
            <div className="drawer-item-content">
              <span className="drawer-item-icon">💎</span>
              <span>Planes</span>
            </div>
            <span className="drawer-badge">◉ Próximamente</span>
          </div>

        </div>

        {/* Pie del menú */}
        <div className="drawer-footer">
          <span>Versión 1.0</span>
          <span>© 2026</span>
        </div>

      </div>
    </>
  );
}
