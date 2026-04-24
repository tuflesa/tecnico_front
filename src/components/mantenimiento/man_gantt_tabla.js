import React, { forwardRef, useMemo, useState } from 'react';

const TIPOS_COLOR = {
  1: { bg: '#185FA5', label: 'Preventivo' },
  2: { bg: '#993C1D', label: 'Correctivo' },
  3: { bg: '#0F6E56', label: 'Mejora' },
  4: { bg: '#854F0B', label: 'PRL' },
};
const COLOR_DEFAULT = '#555';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function toDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function diffDays(a, b) {
  return Math.round((b - a) / 86400000);
}

function formatFecha(date) {
  if (!date) return '—';
  return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
}

// ── Tooltip ─────────────────────────────────────────────────────────────────
const Tooltip = ({ parte, x, y }) => {
  if (!parte) return null;
  const colorInfo = TIPOS_COLOR[parte.tipo] || { bg: COLOR_DEFAULT, label: 'Sin tipo' };
  const inicio    = toDate(parte.fecha_prevista_inicio);
  const finEst    = toDate(parte.fecha_estimada_fin);
  const finReal   = toDate(parte.fecha_finalizacion);
  const duracion  = inicio && finEst ? diffDays(inicio, finEst) + 1 : null;

  return (
    <div style={{ ...styles.tooltip, left: x + 14, top: y - 10 }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{parte.nombre}</div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{parte.num_parte}</div>
      <span style={{
        background: colorInfo.bg + '22', color: colorInfo.bg,
        border: `1px solid ${colorInfo.bg}55`,
        borderRadius: 4, fontSize: 10, padding: '1px 6px',
      }}>
        {colorInfo.label}
      </span>
      <div style={{ marginTop: 8, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Row label="Inicio prev." value={formatFecha(inicio)} />
        <Row label="Fin estimado" value={formatFecha(finEst)} color={finEst ? colorInfo.bg : undefined} />
        {finReal && <Row label="Fin real" value={formatFecha(finReal)} color="#1D9E75" />}
        {duracion && <Row label="Duración est." value={`${duracion} días`} />}
        <Row label="Estado" value={parte.estado_nombre || '—'} />
        {parte.equipo?.nombre && <Row label="Equipo" value={parte.equipo.nombre} />}
      </div>
    </div>
  );
};

const Row = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
    <span style={{ color: '#aaa' }}>{label}</span>
    <span style={{ fontWeight: 500, color: color || 'inherit' }}>{value}</span>
  </div>
);

// ── Componente principal ─────────────────────────────────────────────────────
const ManGanttTabla = forwardRef(({ partes, seleccionados, onToggle, windowDias }, ref) => {
  const [tooltip, setTooltip] = useState({ parte: null, x: 0, y: 0 });

  const hoy = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  }, []);

  // Ventana de fechas centrada en hoy
  const startDate = useMemo(() => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - Math.floor(windowDias * 0.3));
    d.setHours(0,0,0,0);
    return d;
  }, [hoy, windowDias]);

  const dias = useMemo(() =>
    Array.from({ length: windowDias }, (_, i) => addDays(startDate, i)),
    [startDate, windowDias]
  );

  const partesEnVentana = useMemo(() =>
    partes.filter(p => {
      if (!seleccionados.has(p.id)) return false;
      if (!p.fecha_prevista_inicio) return false;
      const ini = toDate(p.fecha_prevista_inicio);
      const fin = toDate(p.fecha_estimada_fin) || toDate(p.fecha_finalizacion) || addDays(ini, 1);
      const end = addDays(startDate, windowDias);
      return fin >= startDate && ini <= end;
    }),
    [partes, seleccionados, startDate, windowDias]
  );

  const todayOff = diffDays(startDate, hoy);
  const DAY_W = Math.max(22, Math.min(40, Math.floor(900 / windowDias)));
  const LABEL_W = 230;

  return (
    <div style={styles.outer} ref={ref}>
      {partes.length === 0 && (
        <div style={styles.empty}>No hay partes con los filtros aplicados.</div>
      )}

      {partes.length > 0 && (
        <div style={{ overflowX: 'auto', position: 'relative' }}>
          <table style={{ ...styles.table, minWidth: LABEL_W + 30 + DAY_W * windowDias }}>
            <thead>
              <tr>
                {/* Check */}
                <th style={{ ...styles.thCheck, width: 30 }} />
                {/* Label */}
                <th style={{ ...styles.thLabel, width: LABEL_W }}>
                  <div style={styles.thLabelInner}>Parte de trabajo</div>
                </th>
                {/* Días */}
                {dias.map((d, i) => {
                  const dom = d.getDate();
                  const dow = d.getDay();
                  const isMon = dow === 1;
                  const isFirst = dom === 1;
                  const showLabel = isMon || isFirst || i === 0;
                  return (
                    <th
                      key={i}
                      style={{
                        ...styles.thDay,
                        width: DAY_W,
                        minWidth: DAY_W,
                        borderLeft: isMon || isFirst
                          ? '1px solid #ccc'
                          : '1px solid #ebebeb',
                        background: dow === 0 || dow === 6 ? '#f5f5f5' : '#fff',
                      }}
                    >
                      {showLabel
                        ? <span style={{ fontSize: 10, color: isMon || isFirst ? '#555' : '#bbb' }}>
                            {isFirst ? `${dom} ${MESES[d.getMonth()]}` : dom}
                          </span>
                        : null}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Fila de seleccionados que no están en ventana */}
              {partes
                .filter(p => seleccionados.has(p.id) && p.fecha_prevista_inicio)
                .filter(p => !partesEnVentana.find(x => x.id === p.id))
                .map(p => (
                  <FilaParte
                    key={p.id}
                    parte={p}
                    checked={seleccionados.has(p.id)}
                    onToggle={onToggle}
                    dias={dias}
                    DAY_W={DAY_W}
                    todayOff={todayOff}
                    startDate={startDate}
                    onTooltip={setTooltip}
                    fuera
                  />
                ))}
              {/* Partes en ventana */}
              {partesEnVentana.map(p => (
                <FilaParte
                  key={p.id}
                  parte={p}
                  checked={seleccionados.has(p.id)}
                  onToggle={onToggle}
                  dias={dias}
                  DAY_W={DAY_W}
                  todayOff={todayOff}
                  startDate={startDate}
                  onTooltip={setTooltip}
                />
              ))}
              {/* Partes NO seleccionados */}
              {partes
                .filter(p => !seleccionados.has(p.id))
                .map(p => (
                  <FilaParte
                    key={p.id}
                    parte={p}
                    checked={false}
                    onToggle={onToggle}
                    dias={dias}
                    DAY_W={DAY_W}
                    todayOff={todayOff}
                    startDate={startDate}
                    onTooltip={setTooltip}
                  />
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Leyenda */}
      <div style={styles.leyenda}>
        {Object.entries(TIPOS_COLOR).map(([k, v]) => (
          <span key={k} style={styles.legItem}>
            <span style={{ ...styles.legDot, background: v.bg }} />
            {v.label}
          </span>
        ))}
        <span style={styles.legItem}>
          <span style={{ ...styles.legDot, background: '#E24B4A', width: 3, borderRadius: 0 }} />
          Hoy
        </span>
        <span style={styles.legItem}>
          <span style={{ ...styles.legDot, background: '#1D9E75' }} />
          Fin real
        </span>
        <span style={{ ...styles.legItem, marginLeft: 8, color: '#bbb' }}>
          <span style={{ ...styles.legDot, background: '#ddd', border: '1px dashed #bbb' }} />
          Sin fecha estimada
        </span>
      </div>

      {/* Tooltip flotante */}
      {tooltip.parte && (
        <Tooltip parte={tooltip.parte} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  );
});

// ── Fila de parte ────────────────────────────────────────────────────────────
const FilaParte = ({ parte, checked, onToggle, dias, DAY_W, todayOff, startDate, onTooltip, fuera }) => {
  const colorInfo = TIPOS_COLOR[parte.tipo] || { bg: COLOR_DEFAULT, label: '—' };
  const ini       = toDate(parte.fecha_prevista_inicio);
  const finEst    = toDate(parte.fecha_estimada_fin);
  const finReal   = toDate(parte.fecha_finalizacion);

  // Barra estimada
  const barEstStart = ini ? diffDays(startDate, ini) : null;
  const barEstEnd   = finEst
    ? diffDays(startDate, finEst) + 1
    : barEstStart !== null ? barEstStart + 1 : null;

  // Barra real (si existe)
  const barRealStart = ini    ? diffDays(startDate, ini) : null;
  const barRealEnd   = finReal ? diffDays(startDate, finReal) + 1 : null;

  const totalDias = dias.length;

  const calcBar = (s, e) => {
    if (s === null || e === null) return null;
    const left  = Math.max(0, s) * DAY_W;
    const right = Math.min(totalDias, e) * DAY_W;
    const width = Math.max(4, right - left);
    if (right <= 0 || left >= totalDias * DAY_W) return null;
    return { left, width };
  };

  const barEst  = barEstStart !== null ? calcBar(barEstStart, barEstEnd) : null;
  const barReal = barRealStart !== null && barRealEnd !== null ? calcBar(barRealStart, barRealEnd) : null;

  const rowBg   = !checked ? '#fafafa' : fuera ? '#fff8ee' : '#fff';
  const opacity = !checked ? 0.5 : 1;

  return (
    <tr style={{ background: rowBg, opacity }}>
      {/* Checkbox */}
      <td style={styles.tdCheck}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(parte.id)}
          style={{ cursor: 'pointer' }}
        />
      </td>

      {/* Etiqueta */}
      <td style={styles.tdLabel} onClick={() => onToggle(parte.id)}>
        <div style={styles.labelInner}>
          <span style={{ ...styles.tipoBadge, background: colorInfo.bg + '22', color: colorInfo.bg, border: `1px solid ${colorInfo.bg}44` }}>
            {colorInfo.label.slice(0, 3).toUpperCase()}
          </span>
          <div>
            <div style={styles.numParte}>{parte.num_parte}</div>
            <div style={styles.nombreParte} title={parte.nombre}>{parte.nombre}</div>
          </div>
        </div>
      </td>

      {/* Celdas de días + barras */}
      {dias.map((d, i) => {
        const dow = d.getDay();
        const isWknd = dow === 0 || dow === 6;
        const isMon  = dow === 1 || d.getDate() === 1;
        const isToday = i === todayOff;

        return (
          <td
            key={i}
            style={{
              ...styles.tdDay,
              width: DAY_W,
              minWidth: DAY_W,
              background: isWknd ? '#f5f5f5' : 'inherit',
              borderLeft: isMon ? '1px solid #ccc' : '1px solid #ebebeb',
              position: 'relative',
            }}
          >
            {/* Línea de hoy */}
            {isToday && (
              <div style={{ ...styles.todayLine, left: DAY_W / 2 }} />
            )}

            {/* Barra estimada (en la primera celda lógicamente, dibujada con posición absoluta relativa al primer día) */}
            {i === 0 && barEst && (
              <div
                style={{
                  position: 'absolute',
                  top: 6, bottom: 6,
                  left: barEst.left,
                  width: barEst.width,
                  background: finEst ? colorInfo.bg : 'transparent',
                  border: finEst ? 'none' : `2px dashed ${colorInfo.bg}`,
                  borderRadius: 4,
                  opacity: finReal ? 0.4 : 0.85,
                  zIndex: 2,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '0 5px',
                }}
                onMouseEnter={e => onTooltip({ parte, x: e.clientX, y: e.clientY })}
                onMouseMove={e => onTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }))}
                onMouseLeave={() => onTooltip({ parte: null })}
              >
                {barEst.width > 60 && (
                  <span style={{ fontSize: 10, color: finEst ? '#fff' : colorInfo.bg, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {parte.nombre}
                  </span>
                )}
              </div>
            )}

            {/* Barra real (verde, encima) */}
            {i === 0 && barReal && (
              <div
                style={{
                  position: 'absolute',
                  top: 10, bottom: 10,
                  left: barReal.left,
                  width: barReal.width,
                  background: '#1D9E75',
                  borderRadius: 4,
                  opacity: 0.9,
                  zIndex: 3,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => onTooltip({ parte, x: e.clientX, y: e.clientY })}
                onMouseMove={e => onTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }))}
                onMouseLeave={() => onTooltip({ parte: null })}
              />
            )}
          </td>
        );
      })}
    </tr>
  );
};

const styles = {
  outer: {
    border: '1px solid #e8e8e8',
    borderRadius: 12,
    background: '#fff',
    overflow: 'hidden',
  },
  empty: {
    padding: 48, textAlign: 'center', fontSize: 14, color: '#aaa',
  },
  table: {
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    width: '100%',
  },
  thCheck: {
    padding: '0 8px',
    borderBottom: '2px solid #ebebeb',
    background: '#fafafa',
    textAlign: 'center',
  },
  thLabel: {
    borderBottom: '2px solid #ebebeb',
    background: '#fafafa',
    padding: 0,
  },
  thLabelInner: {
    padding: '10px 12px',
    fontSize: 11,
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  thDay: {
    borderBottom: '2px solid #ebebeb',
    background: '#fafafa',
    textAlign: 'center',
    padding: '8px 0 4px',
    position: 'relative',
  },
  tdCheck: {
    textAlign: 'center',
    padding: '0 6px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
  },
  tdLabel: {
    borderBottom: '1px solid #f0f0f0',
    padding: '0',
    cursor: 'pointer',
    userSelect: 'none',
  },
  labelInner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    height: 44,
  },
  tipoBadge: {
    fontSize: 9,
    padding: '2px 5px',
    borderRadius: 3,
    fontWeight: 700,
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  numParte: { fontSize: 10, color: '#aaa' },
  nombreParte: {
    fontSize: 12,
    fontWeight: 500,
    maxWidth: 155,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  tdDay: {
    height: 44,
    borderBottom: '1px solid #f0f0f0',
    padding: 0,
    overflow: 'visible',
  },
  todayLine: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 2,
    background: '#E24B4A',
    opacity: 0.7,
    zIndex: 4,
    pointerEvents: 'none',
  },
  leyenda: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    padding: '10px 14px',
    borderTop: '1px solid #f0f0f0',
    background: '#fafafa',
  },
  legItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    color: '#666',
  },
  legDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    flexShrink: 0,
  },
  tooltip: {
    position: 'fixed',
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 12,
    zIndex: 9999,
    boxShadow: '0 4px 16px rgba(0,0,0,.10)',
    minWidth: 200,
    maxWidth: 260,
    pointerEvents: 'none',
  },
};

ManGanttTabla.displayName = 'ManGanttTabla';
export default ManGanttTabla;
