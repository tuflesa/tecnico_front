import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from './Modal';
import styles from './BobinaDetalle.module.css';

function BobinaDetalle({ bobinaId, posicionId, altura, columna, token, onClose, onRetirada, onMover }) {
  const [bobina,    setBobina]   = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [retirando, setRetirando] = useState(false);
  const [tab,       setTab]      = useState('datos');

  const headers = { Authorization: `token ${token}` };

  useEffect(() => {
    Promise.all([
      axios.get(`${BACKEND_SERVER}/api/foso/bobinas/${bobinaId}/`, { headers }),
      axios.get(`${BACKEND_SERVER}/api/foso/bobinas/${bobinaId}/historial/`, { headers }),
    ]).then(([b, h]) => {
      setBobina(b.data);
      setHistorial(h.data);
    }).finally(() => setLoading(false));
  }, [bobinaId]); // eslint-disable-line

  const handleRetirar = async () => {
    if (!window.confirm('¿Retirar esta bobina de la posición?')) return;
    setRetirando(true);
    try {
      const ocupActiva = historial.find(o => o.activo && o.posicion === posicionId);
      if (ocupActiva) {
        await axios.post(`${BACKEND_SERVER}/api/foso/ocupaciones/${ocupActiva.id}/retirar/`, {}, { headers });
      }
      await axios.patch(`${BACKEND_SERVER}/api/foso/bobinas/${bobinaId}/`,
        { fecha_salida: new Date().toISOString().split('T')[0] },
        { headers }
      );
      onRetirada();
    } catch {
      alert('Error al retirar la bobina.');
    } finally {
      setRetirando(false);
    }
  };

  const fmt     = (v) => v != null ? Number(v).toLocaleString('es-ES') : '—';
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-ES') : '—';

  return (
    <Modal title={`Bobina ${bobina?.codigo ?? '...'}`} onClose={onClose} width={480}>
      {loading ? (
        <p className={styles.loading}>Cargando...</p>
      ) : bobina ? (
        <>
          <div className={styles.badge}>Alt. {altura} · Col. {columna}</div>

          <div className={styles.tabs}>
            <button className={tab === 'datos'     ? styles.tabActive : styles.tab} onClick={() => setTab('datos')}>Datos</button>
            <button className={tab === 'historial' ? styles.tabActive : styles.tab} onClick={() => setTab('historial')}>
              Historial ({historial.length})
            </button>
          </div>

          {tab === 'datos' && (
            <div className={styles.grid}>
              <Campo label="Código" value={bobina.codigo} />
              <Campo label="Material" value={bobina.material_nombre} />
              <Campo label="Peso" value={bobina.peso_kg     != null ? `${fmt(bobina.peso_kg)} kg`     : '—'} />
              <Campo label="Ref. proveedor" value={bobina.ref_proveedor} />
              <Campo label="Ancho" value={bobina.ancho_mm    != null ? `${fmt(bobina.ancho_mm)} mm`    : '—'} />
              <Campo label="Colada" value={bobina.colada} />
              <Campo label="Proveedor" value={bobina.proveedor_nombre} full />
              <Campo label="F. entrada" value={fmtDate(bobina.fecha_entrada)} />
              <Campo label="Espesor" value={bobina.espesor_mm != null ? `${fmt(bobina.espesor_mm)} mm` : '—'} />
              {bobina.observaciones && <Campo label="Notas" value={bobina.observaciones} full />}
            </div>
          )}

          {tab === 'historial' && (
            <div className={styles.historial}>
              {historial.length === 0
                ? <p className={styles.empty}>Sin historial de movimientos.</p>
                : historial.map(o => (
                    <div key={o.id} className={styles.histItem}>
                      <span className={o.activo ? styles.badgeVerde : styles.badgeGris}>
                        {o.activo ? 'activa' : 'retirada'}
                      </span>
                      <span className={styles.histPos}>
                        {o.posicion_detalle
                          ? `L${o.posicion_detalle.linea} · A${o.posicion_detalle.altura} · C${o.posicion_detalle.columna}`
                          : `Pos. ${o.posicion}`
                        }
                      </span>
                      <span className={styles.histDate}>
                        {fmtDate(o.fecha_inicio)} → {o.fecha_fin ? fmtDate(o.fecha_fin) : 'hoy'}
                      </span>
                    </div>
                  ))
              }
            </div>
          )}

          <div className={styles.actions}>
            <button className={styles.btnRetirar} onClick={handleRetirar} disabled={retirando}>
              {retirando ? 'Retirando...' : 'Retirar del foso'}
            </button>
            <button className={styles.btnMover} onClick={() => {
              const ocupActiva = historial.find(o => o.activo && o.posicion === posicionId);
              if (ocupActiva) onMover(bobinaId, ocupActiva.id, bobina.codigo);
            }}>
              Mover
            </button>
            <button className={styles.btnCerrar} onClick={onClose}>Cerrar</button>
          </div>
        </>
      ) : <p>No se encontró la bobina.</p>}
    </Modal>
  );
}

function Campo({ label, value, full }) {
  return (
    <div className={styles.campo} style={full ? { gridColumn: 'span 2' } : {}}>
      <span className={styles.campoLbl}>{label}</span>
      <span className={styles.campoVal}>{value || '—'}</span>
    </div>
  );
}

export default BobinaDetalle;