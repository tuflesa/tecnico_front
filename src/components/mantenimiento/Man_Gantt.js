import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import ManGanttFiltro, { ZOOM_OPCIONES } from './man_gantt_filtro';
import ManGanttTabla from './man_gantt_tabla';
// import { exportarGanttPDF } from './man_gantt_pdf';  // descomentar cuando instales jspdf
import { ArrowClockwise } from 'react-bootstrap-icons';

const ManGantt = () => {
  const [token] = useCookies(['tec-token']);
  const [user]  = useCookies(['tec-user']);

  const [partes,        setPartes]        = useState([]);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [cargando,      setCargando]      = useState(false);
  const [zoomIdx,       setZoomIdx]       = useState(2);   // 4 semanas por defecto
  const [filtros,       setFiltros]       = useState({
    empresa__id: user['tec-user']?.perfil?.empresa?.id || '',
    zona__id:    '',
    tipo:        '',
    estado:      '',
  });

  const ganttRef   = useRef(null);
  const windowDias = ZOOM_OPCIONES[zoomIdx].dias;

  const fetchPartes = useCallback(async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([k, v]) => { if (v !== '') params.append(k, v); });
      params.append('page_size', 200);

      const res = await axios.get(
        `${BACKEND_SERVER}/api/mantenimiento/parte_trabajo_detalle/?${params.toString()}`,
        { headers: { Authorization: `token ${token['tec-token']}` } }
      );

      const data = res.data.results || res.data;
      setPartes(data);
      setSeleccionados(new Set(
        data.filter(p => p.fecha_prevista_inicio).map(p => p.id)
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, [filtros, token]);

  useEffect(() => { fetchPartes(); }, [fetchPartes]);

  const toggleSeleccion    = id => setSeleccionados(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const seleccionarTodos   = () => setSeleccionados(new Set(
    partes.filter(p => p.fecha_prevista_inicio).map(p => p.id)
  ));
  const deseleccionarTodos = () => setSeleccionados(new Set());

  const partesConFecha = partes.filter(p => p.fecha_prevista_inicio).length;

  return (
    <div style={styles.wrapper}>

      {/* ── Cabecera mínima ── */}
      <div style={styles.header}>
        <div>
          <h4 style={styles.titulo}>Diagrama Gantt</h4>
          <span style={styles.subtitulo}>
            {seleccionados.size} de {partesConFecha} partes mostrados
          </span>
        </div>
        <button
          style={styles.btnRecargar}
          onClick={fetchPartes}
          disabled={cargando}
          title="Recargar"
        >
          <ArrowClockwise size={15} className={cargando ? 'spin' : ''} />
          {cargando ? 'Cargando…' : 'Actualizar'}
        </button>
      </div>

      {/* ── Filtros + Zoom + Leyenda (todo junto) ── */}
      <ManGanttFiltro
        filtros={filtros}
        onChange={setFiltros}
        token={token['tec-token']}
        onSeleccionarTodos={seleccionarTodos}
        onDeseleccionarTodos={deseleccionarTodos}
        totalPartes={partes.length}
        partesConFecha={partesConFecha}
        zoomIdx={zoomIdx}
        onZoomChange={setZoomIdx}
      />

      {/* ── Gantt ── */}
      {cargando ? (
        <div style={styles.loading}>Cargando partes…</div>
      ) : (
        <ManGanttTabla
          ref={ganttRef}
          partes={partes}
          seleccionados={seleccionados}
          onToggle={toggleSeleccion}
          windowDias={windowDias}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin .8s linear infinite; display: inline-block; }
      `}</style>
    </div>
  );
};

const styles = {
  wrapper: { padding: '20px', fontFamily: "'IBM Plex Sans', sans-serif" },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  titulo:    { margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px' },
  subtitulo: { fontSize: 12, color: '#888', marginTop: 2 },
  btnRecargar: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 8, fontSize: 13,
    border: '1px solid #ddd', background: '#fafafa',
    cursor: 'pointer', color: '#555',
  },
  loading: { textAlign: 'center', padding: 48, fontSize: 14, color: '#aaa' },
};

export default ManGantt;