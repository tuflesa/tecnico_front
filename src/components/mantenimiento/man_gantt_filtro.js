import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';

const ZOOM_OPCIONES = [
  { label: '2 sem', dias: 14 },
  { label: '3 sem', dias: 21 },
  { label: '4 sem', dias: 28 },
  { label: '6 sem', dias: 42 },
  { label: '8 sem', dias: 56 },
  { label: '3 meses', dias: 84 },
];

const TIPOS_COLOR = {
  1: '#185FA5',
  2: '#993C1D',
  3: '#0F6E56',
  4: '#854F0B',
};

const ManGanttFiltro = ({
  filtros,
  onChange,
  token,
  onSeleccionarTodos,
  onDeseleccionarTodos,
  totalPartes,
  partesConFecha,
  zoomIdx,
  onZoomChange,
}) => {
  const [zonas,   setZonas]   = useState([]);
  const [tipos,   setTipos]   = useState([]);
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    if (!filtros.empresa__id) { setZonas([]); return; }
    axios.get(`${BACKEND_SERVER}/api/estructura/zona/?empresa__id=${filtros.empresa__id}`, {
      headers: { Authorization: `token ${token}` },
    })
      .then(r => setZonas(r.data.results || r.data))
      .catch(console.error);
  }, [filtros.empresa__id, token]);

  useEffect(() => {
    const headers = { Authorization: `token ${token}` };
    axios.get(`${BACKEND_SERVER}/api/mantenimiento/tipo_tarea/`, { headers })
      .then(r => setTipos(r.data.results || r.data))
      .catch(console.error);
    axios.get(`${BACKEND_SERVER}/api/mantenimiento/estado_lineas_tareas/`, { headers })
      .then(r => setEstados(r.data.results || r.data))
      .catch(console.error);
  }, [token]);

  const set = (campo, valor) => onChange({ ...filtros, [campo]: valor });

  return (
    <div style={s.wrap}>
      {/* ── Leyenda de tipos ── */}
      <div style={s.leyenda}>
        {tipos.map(t => (
          <span key={t.id} style={s.legItem}>
            <span style={{ ...s.legDot, background: TIPOS_COLOR[t.id] || '#888' }} />
            {t.nombre}
          </span>
        ))}
        <span style={s.legItem}>
          <span style={{ ...s.legDot, background: '#1D9E75' }} />
          Fin real
        </span>
        <span style={s.legItem}>
          <span style={{ ...s.legDot, background: '#E24B4A', width: 3, borderRadius: 0 }} />
          Hoy
        </span>
        <span style={{ ...s.legItem, color: '#bbb' }}>
          <span style={{ ...s.legDot, background: 'transparent', border: '2px dashed #bbb' }} />
          Sin fecha estimada
        </span>
      </div>

      {/* ── Barra de controles ── */}
      <div style={s.bar}>

        {/* Zona */}
        <div style={s.grupo}>
          <label style={s.lbl}>Zona</label>
          <select style={s.sel} value={filtros.zona__id} onChange={e => set('zona__id', e.target.value)}>
            <option value="">Todas</option>
            {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
          </select>
        </div>

        <div style={s.sep} />

        {/* Tipo */}
        <div style={s.grupo}>
          <label style={s.lbl}>Tipo</label>
          <select style={s.sel} value={filtros.tipo} onChange={e => set('tipo', e.target.value)}>
            <option value="">Todos</option>
            {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>

        <div style={s.sep} />

        {/* Estado */}
        <div style={s.grupo}>
          <label style={s.lbl}>Estado</label>
          <select style={s.sel} value={filtros.estado} onChange={e => set('estado', e.target.value)}>
            <option value="">Todos</option>
            {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>

        <div style={s.sep} />

        {/* Zoom pills */}
        <div style={s.grupo}>
          <label style={s.lbl}>Vista</label>
          <div style={s.pills}>
            {ZOOM_OPCIONES.map((op, idx) => (
              <button
                key={idx}
                style={{ ...s.pill, ...(idx === zoomIdx ? s.pillActive : {}) }}
                onClick={() => onZoomChange(idx)}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Selección rápida */}
        <div style={s.grupo}>
          <label style={s.lbl}>Selección</label>
          <div style={s.pills}>
            <button style={s.pill} onClick={onSeleccionarTodos}>
              Todos ✓ <span style={s.badge}>{partesConFecha}</span>
            </button>
            <button style={s.pill} onClick={onDeseleccionarTodos}>Ninguno</button>
          </div>
        </div>

      </div>

      {/* Aviso sin fecha */}
      {totalPartes > 0 && partesConFecha < totalPartes && (
        <div style={s.aviso}>
          ⚠️ {totalPartes - partesConFecha} parte(s) sin fecha prevista de inicio no aparecen en el Gantt
        </div>
      )}
    </div>
  );
};

const s = {
  wrap: { marginBottom: 12 },
  leyenda: {
    display: 'flex', gap: 14, flexWrap: 'wrap',
    padding: '6px 2px 10px',
  },
  legItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#666' },
  legDot:  { width: 12, height: 12, borderRadius: 3, flexShrink: 0 },
  bar: {
    display: 'flex', alignItems: 'flex-end', gap: 10,
    flexWrap: 'wrap',
    background: '#f8f8f8',
    border: '1px solid #ebebeb',
    borderRadius: 10,
    padding: '10px 14px',
  },
  sep: {
    width: 1, height: 32, background: '#e0e0e0',
    alignSelf: 'flex-end', marginBottom: 2,
  },
  grupo: { display: 'flex', flexDirection: 'column', gap: 4 },
  lbl: {
    fontSize: 10, color: '#aaa', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  sel: {
    fontSize: 13, borderRadius: 7,
    border: '1px solid #ddd', padding: '5px 10px',
    background: '#fff', height: 32, minWidth: 130,
  },
  pills: { display: 'flex', gap: 4 },
  pill: {
    fontSize: 12, padding: '5px 11px',
    borderRadius: 7, border: '1px solid #ddd',
    background: '#fff', cursor: 'pointer',
    color: '#555', height: 32,
    display: 'flex', alignItems: 'center', gap: 5,
    transition: 'all 0.12s',
  },
  pillActive: {
    background: '#1a1a2e', color: '#fff',
    border: '1px solid #1a1a2e', fontWeight: 500,
  },
  badge: {
    fontSize: 10, background: '#e8e8e8',
    borderRadius: 10, padding: '1px 6px', color: '#555',
  },
  aviso: {
    marginTop: 8, fontSize: 12, color: '#b07d00',
    background: '#fffbea', border: '1px solid #f0e0a0',
    borderRadius: 6, padding: '5px 10px',
  },
};

export { ZOOM_OPCIONES };
export default ManGanttFiltro;