import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import styles from './PanelBusqueda.module.css';

const filtrosVacios = {
  codigo:       '',
  ref_proveedor:'',
  colada:       '',
  material:     '',
  proveedor:    '',
  ancho_mm:     '',
  espesor_mm:   '',
};

function PanelBusqueda({ token, onClose, onSeleccionar, onColocarFuera }) {
  const [filtros,    setFiltros]    = useState(filtrosVacios);
  const [resultados, setResultados] = useState([]);
  const [buscando,   setBuscando]   = useState(false);
  const [buscado,    setBuscado]    = useState(false);
  const [materiales, setMateriales] = useState([]);
  const [proveedores,setProveedores]= useState([]);
  const [incluyeFuera, setIncluyeFuera] = useState(false);

  const headers = { Authorization: `token ${token}` };
  const set = (k) => (e) => setFiltros(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    axios.get(`${BACKEND_SERVER}/api/foso/materiales/`,  { headers }).then(r => setMateriales(r.data)).catch(() => {});
    axios.get(`${BACKEND_SERVER}/api/foso/proveedores/`, { headers }).then(r => setProveedores(r.data)).catch(() => {});
  }, []); // eslint-disable-line

  const hayFiltros = Object.values(filtros).some(v => v !== '');

  const buscar = async () => {
    if (!hayFiltros) return;
    setBuscando(true);
    try {
      const r = await axios.get(`${BACKEND_SERVER}/api/foso/bobinas/`, { headers });
      const todos = r.data.results ?? r.data;
      const v = (campo, valor) => valor === '' || campo?.toString().toLowerCase().includes(valor.toLowerCase());

      const filtrados = todos.filter(b =>
        (incluyeFuera || b.posicion_actual != null) &&
        (filtros.codigo        === '' || b.codigo?.toLowerCase().startsWith(filtros.codigo.toLowerCase())) &&
        (filtros.ref_proveedor === '' || b.ref_proveedor?.toLowerCase().startsWith(filtros.ref_proveedor.toLowerCase())) &&
        (filtros.colada        === '' || b.colada?.toLowerCase().startsWith(filtros.colada.toLowerCase())) &&
        (filtros.material      === '' || String(b.material) === filtros.material) &&
        (filtros.proveedor     === '' || String(b.proveedor) === filtros.proveedor) &&
        (filtros.ancho_mm      === '' || parseFloat(b.ancho_mm)   === parseFloat(filtros.ancho_mm)) &&
        (filtros.espesor_mm    === '' || parseFloat(b.espesor_mm) === parseFloat(filtros.espesor_mm))
      );

      setResultados(filtrados);
      setBuscado(true);
    } catch {
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  };

  const limpiar = () => {
    setFiltros(filtrosVacios);
    setResultados([]);
    setBuscado(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') buscar();
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.panel}>

        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Buscar bobina</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.filtros}>

          <div className={styles.filtroFila}>
            <div className={styles.filtroGrupo}>
              <label className={styles.filtroLbl}>Código</label>
              <input value={filtros.codigo} autoFocus onChange={set('codigo')} onKeyDown={handleKeyDown} placeholder="Ej: 260046755B" />
            </div>
            <div className={styles.filtroGrupo}>
              <label className={styles.filtroLbl}>Ref. proveedor</label>
              <input value={filtros.ref_proveedor} onChange={set('ref_proveedor')} onKeyDown={handleKeyDown} placeholder="Ref." />
            </div>
          </div>

          <div className={styles.filtroFila}>
            <div className={styles.filtroGrupo}>
              <label className={styles.filtroLbl}>Colada</label>
              <input value={filtros.colada} onChange={set('colada')} onKeyDown={handleKeyDown} placeholder="Colada" />
            </div>
          </div>

          <div className={styles.filtroGrupo}>
            <label className={styles.filtroLbl}>Material</label>
            <select value={filtros.material} onChange={set('material')}>
              <option value="">— Todos —</option>
              {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>

          <div className={styles.filtroGrupo}>
            <label className={styles.filtroLbl}>Proveedor</label>
            <select value={filtros.proveedor} onChange={set('proveedor')}>
              <option value="">— Todos —</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div className={styles.filtroFila}>
            <div className={styles.filtroGrupo}>
              <label className={styles.filtroLbl}>Ancho (mm)</label>
              <input value={filtros.ancho_mm} onChange={set('ancho_mm')} onKeyDown={handleKeyDown} type="number" placeholder="1250" />
            </div>
            <div className={styles.filtroGrupo}>
              <label className={styles.filtroLbl}>Espesor (mm)</label>
              <input value={filtros.espesor_mm} onChange={set('espesor_mm')} onKeyDown={handleKeyDown} type="number" placeholder="1.5" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="incluyeFuera"
              checked={incluyeFuera}
              onChange={e => setIncluyeFuera(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <label htmlFor="incluyeFuera" style={{ fontSize: 13, color: '#6c757d', margin: 0, cursor: 'pointer' }}>
              Incluir bobinas fuera del foso
            </label>
          </div>
          <div className={styles.btnFila}>
            <button className={styles.btnLimpiar} onClick={limpiar}>Limpiar</button>
            <button className={styles.btnBuscar} onClick={buscar} disabled={!hayFiltros || buscando}>
              {buscando ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

        </div>

        <div className={styles.resultados}>
          {buscado && resultados.length === 0 && (
            <p className={styles.msg}>Sin resultados.</p>
          )}
          {!buscado && !buscando && (
            <p className={styles.msg}>Rellena los filtros y pulsa Buscar.</p>
          )}

          {resultados.map(b => (
            <div
              key={b.id}
              className={styles.item}
              onClick={() => {
                if (!b.posicion_actual) return;
                onSeleccionar(
                  b.id,
                  b.posicion_actual.id,
                  b.posicion_actual.altura,
                  b.posicion_actual.columna,
                  b.posicion_actual.linea
                );
              }}
            >
              <div className={styles.itemCodigo}>{b.codigo}</div>
              <div className={styles.itemInfo}>
                {[b.material_nombre, b.proveedor_nombre].filter(Boolean).join(' · ')}
              </div>
              <div className={styles.itemDetalle}>
                {[
                  b.ancho_mm    ? `${b.ancho_mm} mm ancho`    : null,
                  b.espesor_mm  ? `${b.espesor_mm} mm espesor` : null,
                  b.ref_proveedor ? `Ref: ${b.ref_proveedor}`  : null,
                ].filter(Boolean).join(' · ')}
              </div>
              <div className={styles.itemUbicacion}>
                {b.posicion_actual
                  ? <span>
                      {`L${b.posicion_actual.linea_nombre ?? b.posicion_actual.linea} · A${b.posicion_actual.altura} · C${b.posicion_actual.columna}`}
                    </span>
                  : <button
                      className={styles.btnColocar}
                      onClick={(e) => { e.stopPropagation(); onColocarFuera(b.id, b.codigo); }}
                    >
                      + Colocar en foso
                    </button>
                }
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}

export default PanelBusqueda;