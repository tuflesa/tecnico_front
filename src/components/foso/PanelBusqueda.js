import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import styles from './PanelBusqueda.module.css';

function PanelBusqueda({ token, onClose, onSeleccionar }) {
  const [texto,      setTexto]      = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando,   setBuscando]   = useState(false);
  const [buscado,    setBuscado]    = useState(false);

  const headers = { Authorization: `token ${token}` };

  const buscar = useCallback(async (valor) => {
    if (!valor.trim()) { setResultados([]); setBuscado(false); return; }
    setBuscando(true);
    try {
        const r = await axios.get(
        `${BACKEND_SERVER}/api/foso/bobinas/?search=${encodeURIComponent(valor)}`,
        { headers }
        );
        const todos = r.data.results ?? r.data;
        const v = valor.toLowerCase();

        // Filtra en cliente: startswith para código, colada y material — contains para proveedor
        const filtrados = todos.filter(b =>
        b.codigo?.toLowerCase().startsWith(v) ||
        b.colada?.toLowerCase().startsWith(v) ||
        b.material_nombre?.toLowerCase().startsWith(v) ||
        b.proveedor_nombre?.toLowerCase().includes(v)
        );

        setResultados(filtrados);
        setBuscado(true);
    } catch {
        setResultados([]);
    } finally {
        setBuscando(false);
    }
    }, []); // eslint-disable-line

  const handleChange = (e) => {
    const v = e.target.value;
    setTexto(v);
    if (v.length >= 2) buscar(v);
    else { setResultados([]); setBuscado(false); }
  };

  return (
    <>
      {/* Fondo oscuro */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Panel */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Buscar bobina</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.searchWrap}>
          <input
            autoFocus
            value={texto}
            onChange={handleChange}
            placeholder="Código, material, proveedor, colada..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.resultados}>
          {buscando && <p className={styles.msg}>Buscando...</p>}

          {!buscando && buscado && resultados.length === 0 && (
            <p className={styles.msg}>Sin resultados.</p>
          )}

          {!buscando && resultados.map(b => (
            <div
              key={b.id}
              className={styles.item}
              onClick={() => {
                if (!b.posicion_actual) {
                  alert('Esta bobina no está en el foso actualmente.');
                  return;
                }
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
              <div className={styles.itemUbicacion}>
                {b.posicion_actual
                  ? `L${b.posicion_actual.linea} · A${b.posicion_actual.altura} · C${b.posicion_actual.columna}`
                  : <span className={styles.fuera}>Fuera del foso</span>
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