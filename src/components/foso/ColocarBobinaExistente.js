import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from './Modal';
import styles from './ColocarBobinaExistente.module.css';

function ColocarBobinaExistente({ bobinaId, codigo, token, lineas, lineaId, onLineaChange, onClose, onColocada }) {
  const [lineaSel,  setLineaSel]  = useState(lineaId);
  const [fosoData,  setFosoData]  = useState(null);
  const [colocando, setColocando] = useState(false);
  const [posSelec,  setPosSelec]  = useState(null);

  const headers = { Authorization: `token ${token}` };

  useEffect(() => {
    setFosoData(null);
    setPosSelec(null);
    axios.get(`${BACKEND_SERVER}/api/foso/lineas/${lineaSel}/grid/`, { headers })  // ← era /foso/
      .then(r => setFosoData(r.data));
  }, [lineaSel]); // eslint-disable-line

  const mapa = {};
  fosoData?.alturas.forEach(a => {
    a.columnas.forEach(c => { mapa[`${a.altura}-${c.columna}`] = c; });
  });

  // Geometría dinámica derivada de fosoData
  const COLS_POR_ALTURA = fosoData
    ? Object.fromEntries(fosoData.alturas.map(a => [a.altura, a.columnas.length]))
    : {};
  const ALTURAS_ORDENADAS = fosoData
    ? [...fosoData.alturas].map(a => a.altura).sort((x, y) => x - y)
    : [];

  const tieneSoporte = (key) => {
    const celda = mapa[key];
    if (!celda) return false;
    return celda.bobina_id != null || celda.habilitada === false;
  };

  const puedeColocar = (altura, col) => {
    if (altura === ALTURAS_ORDENADAS[0]) return true;
    const alturaInferior = ALTURAS_ORDENADAS[ALTURAS_ORDENADAS.indexOf(altura) - 1];
    const maxColInf = COLS_POR_ALTURA[alturaInferior] ?? 0;

    if (altura % 2 === 0) {
      return tieneSoporte(`${alturaInferior}-${col}`) &&
             tieneSoporte(`${alturaInferior}-${col + 1}`);
    } else {
      const izq = col === 1        ? true : tieneSoporte(`${alturaInferior}-${col - 1}`);
      const der = col > maxColInf  ? true : tieneSoporte(`${alturaInferior}-${col}`);
      const tieneReal =
        (col > 1          && tieneSoporte(`${alturaInferior}-${col - 1}`)) ||
        (col <= maxColInf && tieneSoporte(`${alturaInferior}-${col}`));
      return izq && der && tieneReal;
    }
  };

  const handleColocar = async () => {
    if (!posSelec) return;
    setColocando(true);
    try {
      await axios.post(
        `${BACKEND_SERVER}/api/foso/ocupaciones/colocar/`,
        { bobina_id: bobinaId, posicion_id: posSelec.posicion_id },
        { headers }
      );
      onLineaChange(lineaSel);
      onColocada();
    } catch (e) {
      alert(e?.response?.data?.detail || 'Error al colocar la bobina.');
    } finally {
      setColocando(false);
    }
  };

  return (
    <Modal title={`Colocar ${codigo} en el foso`} onClose={onClose} width={600}>
      <div className={styles.toolbar}>
        <label className={styles.lbl}>Línea:</label>
        <select
          value={lineaSel}
          onChange={e => setLineaSel(Number(e.target.value))}
          className={styles.select}
        >
          {lineas.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
        </select>
        {posSelec && (
          <span className={styles.seleccionada}>
            Seleccionada: Alt. {posSelec.altura} · Col. {posSelec.columna}
          </span>
        )}
      </div>

      {!fosoData && <p className={styles.msg}>Cargando...</p>}

      {fosoData && (
        <div className={styles.gridWrap}>
          <p className={styles.hint}>Selecciona una posición libre (verde) donde colocar la bobina</p>
          <MiniGrid
            alturas={fosoData.alturas}
            mapa={mapa}
            puedeColocar={puedeColocar}
            posSelec={posSelec}
            onSelect={setPosSelec}
            colsPorAltura={COLS_POR_ALTURA}
            alturasOrdenadas={ALTURAS_ORDENADAS}
          />
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
        <button className={styles.btnColocar} onClick={handleColocar} disabled={!posSelec || colocando}>
          {colocando ? 'Colocando...' : 'Confirmar posición'}
        </button>
      </div>
    </Modal>
  );
}

function MiniGrid({ alturas, mapa, puedeColocar, posSelec, onSelect, colsPorAltura, alturasOrdenadas }) {
  const D = 38;
  const GAP = 4;
  const STEP = D + GAP;
  const VOFFSET = Math.round(D * 0.866);
  const TOTAL = alturasOrdenadas.length;
  const MAX_COLS = Math.max(...alturasOrdenadas.map(h => colsPorAltura[h] ?? 0));

  const colX = (h, c) => (c - 1) * STEP + (h % 2 === 0 ? STEP / 2 : 0);
  const rowY = (h)    => (TOTAL - alturasOrdenadas.indexOf(h) - 1) * VOFFSET + 16;

  const anchoTotal = (MAX_COLS - 1) * STEP + D;
  const altoTotal  = (TOTAL - 1) * VOFFSET + D;

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ position: 'relative', width: anchoTotal, height: altoTotal + 20, marginLeft: 48 }}>

        {/* Numeración de columnas */}
        {Array.from({ length: colsPorAltura[alturasOrdenadas[0]] ?? 0 }, (_, i) => i + 1).map(col => (
          <span key={col} style={{
            position: 'absolute', fontSize: 9, color: '#adb5bd',
            left: colX(alturasOrdenadas[0], col) + D / 2 - 6, top: 0, width: 12, textAlign: 'center'
          }}>{col}</span>
        ))}

        {/* Celdas */}
        {alturasOrdenadas.map(h =>
          Array.from({ length: colsPorAltura[h] ?? 0 }, (_, j) => j + 1).map(c => {
            const key   = `${h}-${c}`;
            const celda = mapa[key];
            const deshabilitada = celda?.habilitada === false;
            const tieneB = celda?.bobina_id != null;
            const puede  = !tieneB && !deshabilitada && puedeColocar(h, c);
            const selec  = posSelec?.posicion_id === celda?.posicion_id;

            let bg, border, cursor;
            if      (deshabilitada) { bg = '#adb5bd'; border = '2px solid #6c757d';  cursor = 'not-allowed'; }
            else if (tieneB)        { bg = '#cfe2ff'; border = '2px solid #0d6efd';  cursor = 'default';     }
            else if (selec)         { bg = '#ffc107'; border = '2px solid #664d03';  cursor = 'pointer';     }
            else if (puede)         { bg = '#d1e7dd'; border = '2px solid #0a3622';  cursor = 'pointer';     }
            else                    { bg = '#f8f9fa'; border = '1px dashed #dee2e6'; cursor = 'not-allowed'; }

            return (
              <div
                key={key}
                style={{
                  position: 'absolute', borderRadius: '50%',
                  left: colX(h, c), top: rowY(h), width: D, height: D,
                  background: bg, border, cursor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 7, color: tieneB ? '#084298' : puede ? '#0a3622' : '#adb5bd',
                  fontWeight: 500, textAlign: 'center', lineHeight: 1.1, padding: 2,
                  opacity: tieneB ? 0.7 : 1,
                }}
                onClick={() => {
                  if (puede && celda?.posicion_id != null) onSelect({ posicion_id: celda.posicion_id, altura: h, columna: c });
                  else if (selec) onSelect(null);
                }}
              >
                {deshabilitada            && <span style={{ fontSize: 14, color: '#495057' }}>✕</span>}
                {tieneB && !deshabilitada && <span>{celda.bobina_codigo?.substring(0, 6)}</span>}
                {puede  && !selec         && <span style={{ fontSize: 14 }}>+</span>}
                {selec                    && <span style={{ fontSize: 10 }}>✓</span>}
              </div>
            );
          })
        )}

        {/* Etiquetas de altura */}
        {alturasOrdenadas.map(h => (
          <span key={h} style={{
            position: 'absolute', left: -46, fontSize: 9,
            color: '#6c757d', top: rowY(h) + D / 2 - 7, whiteSpace: 'nowrap'
          }}>
            Alt. {h}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ColocarBobinaExistente;