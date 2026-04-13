import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from './Modal';
import styles from './BobinaDetalle.module.css';

function BobinaDetalle({ bobinaId, posicionId, altura, columna, token, onClose, onRetirada, onMover, puedeEditar, puedeMover, puedeRetirar }) {
  const [bobina,     setBobina]     = useState(null);
  const [historial,  setHistorial]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [retirando,  setRetirando]  = useState(false);
  const [tab,        setTab]        = useState('datos');
  const [editando,   setEditando]   = useState(false);
  const [form,       setForm]       = useState({});
  const [materiales, setMateriales] = useState([]);
  const [proveedores,setProveedores]= useState([]);
  const [guardando,  setGuardando]  = useState(false);
  const [tieneCarga, setTieneCarga] = useState(false);

  const headers = { Authorization: `token ${token}` };
  useEffect(() => {
    Promise.all([
      axios.get(`${BACKEND_SERVER}/api/foso/bobinas/${bobinaId}/`, { headers }),
      axios.get(`${BACKEND_SERVER}/api/foso/bobinas/${bobinaId}/historial/`, { headers }),
    ]).then(([b, h]) => {
      setBobina(b.data);
      setHistorial(h.data);

      // Comprueba si hay bobinas apoyadas encima
      if (b.data.posicion_actual?.linea_id) {
        const { altura, columna, linea_id } = b.data.posicion_actual;
        axios.get(`${BACKEND_SERVER}/api/foso/lineas/${linea_id}/grid/`, { headers })
          .then(foso => {
            const altSup = foso.data.alturas.find(a => a.altura === altura + 1);
            if (!altSup) { setTieneCarga(false); return; }

            // Posiciones de la altura superior que apoyan sobre esta bobina
            // Altura superior impar: col-1 apoya en col-1 y col → nos afecta col c
            // Altura superior par:   col   apoya en col   y col+1 → nos afecta col c-1
            const posicionesQueApoyan = altSup.columnas.filter(cel => {
              if ((altura + 1) % 2 === 0) {
                // altura+1 es par: cel.columna apoya en cel.columna y cel.columna+1
                return cel.columna === columna || cel.columna === columna - 1;
              } else {
                // altura+1 es impar: cel.columna apoya en cel.columna-1 y cel.columna
                return cel.columna === columna || cel.columna === columna + 1;
              }
            });

            const hayCarga = posicionesQueApoyan.some(cel => cel.bobina_id != null);
            setTieneCarga(hayCarga);
          });
      }
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
      await axios.patch(
        `${BACKEND_SERVER}/api/foso/bobinas/${bobinaId}/`,
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

  const handleEditar = () => {
    setForm({
      material:      bobina.material      ?? '',
      proveedor:     bobina.proveedor     ?? '',
      ref_proveedor: bobina.ref_proveedor ?? '',
      peso_kg:       bobina.peso_kg       ?? '',
      ancho_mm:      bobina.ancho_mm      ?? '',
      espesor_mm:    bobina.espesor_mm    ?? '',
      colada:        bobina.colada        ?? '',
      observaciones: bobina.observaciones ?? '',
    });
    Promise.all([
      axios.get(`${BACKEND_SERVER}/api/foso/materiales/`,  { headers }),
      axios.get(`${BACKEND_SERVER}/api/foso/proveedores/`, { headers }),
    ]).then(([m, p]) => {
      setMateriales(m.data);
      setProveedores(p.data);
    });
    setEditando(true);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await axios.patch(
        `${BACKEND_SERVER}/api/foso/bobinas/${bobinaId}/`,
        {
          material:      form.material      || null,
          proveedor:     form.proveedor     || null,
          ref_proveedor: form.ref_proveedor || null,
          peso_kg:       form.peso_kg       ? parseFloat(form.peso_kg)    : null,
          ancho_mm:      form.ancho_mm      ? parseFloat(form.ancho_mm)   : null,
          espesor_mm:    form.espesor_mm    ? parseFloat(form.espesor_mm) : null,
          colada:        form.colada        || null,
          observaciones: form.observaciones || null,
        },
        { headers }
      );
      setEditando(false);
      const r = await axios.get(`${BACKEND_SERVER}/api/foso/bobinas/${bobinaId}/`, { headers });
      setBobina(r.data);
    } catch {
      alert('Error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const fmt     = (v) => v != null ? Number(v).toLocaleString('es-ES') : '—';
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-ES') : '—';

  return (
    <Modal title={`Bobina ${bobina?.codigo ?? '...'}`} onClose={onClose} width={520}>
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

          {/* ── VISTA LECTURA ── */}
          {tab === 'datos' && !editando && (
            <div className={styles.grid}>
              <Campo label="Código"        value={bobina.codigo} />
              <Campo label="Ref. proveedor" value={bobina.ref_proveedor} />
              <Campo label="Material"      value={bobina.material_nombre} />
              <Campo label="Proveedor"     value={bobina.proveedor_nombre} />
              <Campo label="Peso"          value={bobina.peso_kg    != null ? `${fmt(bobina.peso_kg)} kg`    : '—'} />
              <Campo label="Ancho"         value={bobina.ancho_mm   != null ? `${fmt(bobina.ancho_mm)} mm`   : '—'} />
              <Campo label="Espesor"       value={bobina.espesor_mm != null ? `${fmt(bobina.espesor_mm)} mm` : '—'} />
              <Campo label="Colada"        value={bobina.colada} />
              <Campo label="F. entrada"    value={fmtDate(bobina.fecha_entrada)} />
              <Campo label="F. salida"     value={fmtDate(bobina.fecha_salida)} />
              <Campo label="Observaciones" value={bobina.observaciones} full />
            </div>
          )}

          {/* ── VISTA EDICIÓN ── */}
          {tab === 'datos' && editando && (
            <div className={styles.grid}>
              <Campo label="Código" value={bobina.codigo} full />

              <CampoEdit label="Material" full>
                <select value={form.material} onChange={set('material')}>
                  <option value="">— Selecciona —</option>
                  {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </CampoEdit>

              <CampoEdit label="Proveedor" full>
                <select value={form.proveedor} onChange={set('proveedor')}>
                  <option value="">— Selecciona —</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </CampoEdit>

              <CampoEdit label="Ref. proveedor">
                <input value={form.ref_proveedor} onChange={set('ref_proveedor')} placeholder="Ref. del proveedor" />
              </CampoEdit>

              <CampoEdit label="Peso (kg)">
                <input value={form.peso_kg} onChange={set('peso_kg')} type="number" placeholder="2500" />
              </CampoEdit>

              <CampoEdit label="Ancho (mm)">
                <input value={form.ancho_mm} onChange={set('ancho_mm')} type="number" placeholder="1000" />
              </CampoEdit>

              <CampoEdit label="Espesor (mm)">
                <input value={form.espesor_mm} onChange={set('espesor_mm')} type="number" step="0.01" placeholder="2.5" />
              </CampoEdit>

              <CampoEdit label="Colada">
                <input value={form.colada} onChange={set('colada')} placeholder="C-2024-015" />
              </CampoEdit>

              <CampoEdit label="Observaciones" full>
                <textarea value={form.observaciones} onChange={set('observaciones')} rows={3} style={{ resize: 'vertical', width: '100%' }} />
              </CampoEdit>
            </div>
          )}

          {/* ── HISTORIAL ── */}
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

          {/* ── ACCIONES ── */}
          <div className={styles.actions}>
            {!editando && (
              <>
                {puedeRetirar && (
                  <button
                    className={styles.btnRetirar}
                    onClick={handleRetirar}
                    disabled={retirando || tieneCarga}
                    title={tieneCarga ? 'Hay bobinas apoyadas encima — retíralas primero' : ''}
                  >
                    {retirando ? 'Retirando...' : tieneCarga ? 'Con carga encima' : 'Retirar del foso'}
                  </button>
                )}

                {puedeMover && (
                  <button
                    className={styles.btnMover}
                    onClick={() => {
                      const ocupActiva = historial.find(o => o.activo && o.posicion === posicionId);
                      if (ocupActiva) onMover(bobinaId, ocupActiva.id, bobina.codigo);
                    }}
                    disabled={tieneCarga}
                    title={tieneCarga ? 'Hay bobinas apoyadas encima — muévelas primero' : ''}
                  >
                    {tieneCarga ? 'Con carga encima' : 'Mover'}
                  </button>
                )}
                {puedeEditar && (
                  <button className={styles.btnEditar} onClick={handleEditar}>Editar</button>
                )}
                <button className={styles.btnCerrar} onClick={onClose}>Cerrar</button>
              </>
            )}
            {editando && (
              <>
                <button className={styles.btnRetirar} onClick={() => setEditando(false)}>Cancelar</button>
                <button className={styles.btnGuardar} onClick={handleGuardar} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </>
            )}
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

function CampoEdit({ label, children, full }) {
  return (
    <div className={styles.campo} style={full ? { gridColumn: 'span 2' } : {}}>
      <label className={styles.campoLbl}>{label}</label>
      {children}
    </div>
  );
}

export default BobinaDetalle;