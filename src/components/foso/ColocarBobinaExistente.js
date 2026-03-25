import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from './Modal';
import styles from './ColocarBobinaExistente.module.css';

const COLS_POR_ALTURA = { 1:9, 2:8, 3:9, 4:8, 5:9 };

function soportes(altura, col) {
  if (altura === 1) return [];
  if (altura % 2 === 0) return [`${altura-1}-${col}`, `${altura-1}-${col+1}`];
  return [`${altura-1}-${col-1}`, `${altura-1}-${col}`];
}

function ColocarBobinaExistente({ bobinaId, codigo, token, lineas, lineaId, onLineaChange, onClose, onColocada }) {
  const [lineaSel,  setLineaSel]  = useState(lineaId);
  const [fosoData,  setFosoData]  = useState(null);
  const [colocando, setColocando] = useState(false);
  const [posSelec,  setPosSelec]  = useState(null);

  const headers = { Authorization: `token ${token}` };

  useEffect(() => {
    setFosoData(null);
    setPosSelec(null);
    axios.get(`${BACKEND_SERVER}/api/foso/lineas/${lineaSel}/foso/`, { headers })
      .then(r => setFosoData(r.data));
  }, [lineaSel]); // eslint-disable-line

  const mapa = {};
  fosoData?.alturas.forEach(a => {
    a.columnas.forEach(c => { mapa[`${a.altura}-${c.columna}`] = c; });
  });

  const puedeColocar = (altura, col) => {
    if (altura === 1) return true;
    const maxColInf = COLS_POR_ALTURA[altura - 1];
    if (altura % 2 === 0) {
      return mapa[`${altura-1}-${col}`]?.bobina_id != null &&
             mapa[`${altura-1}-${col+1}`]?.bobina_id != null;
    } else {
      const izq = col === 1           ? true : mapa[`${altura-1}-${col-1}`]?.bobina_id != null;
      const der = col > maxColInf     ? true : mapa[`${altura-1}-${col}`]?.bobina_id   != null;
      const tieneReal =
        (col > 1        && mapa[`${altura-1}-${col-1}`]?.bobina_id != null) ||
        (col <= maxColInf && mapa[`${altura-1}-${col}`]?.bobina_id != null);
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

function MiniGrid({ alturas, mapa, puedeColocar, posSelec, onSelect }) {
  const D = 38;
  const GAP = 4;
  const STEP = D + GAP;
  const VOFFSET = Math.round(D * 0.866);
  const TOTAL = 5;
  const COLS = { 1:9, 2:8, 3:9, 4:8, 5:9 };

  const colX = (h, c) => (c-1)*STEP + (h%2===0 ? STEP/2 : 0);
  const rowY = (h)    => (TOTAL-h)*VOFFSET + 16;

  const anchoTotal = (COLS[1]-1)*STEP + D;
  const altoTotal  = (TOTAL-1)*VOFFSET + D;

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ position:'relative', width: anchoTotal, height: altoTotal+20, marginLeft: 48 }}>

        {Array.from({length:COLS[1]},(_,i)=>i+1).map(col => (
          <span key={col} style={{
            position:'absolute', fontSize:9, color:'#adb5bd',
            left: colX(1,col)+D/2-6, top:0, width:12, textAlign:'center'
          }}>{col}</span>
        ))}

        {Array.from({length:TOTAL},(_,i)=>i+1).map(h => {
          return Array.from({length:COLS[h]},(_,j)=>j+1).map(c => {
            const key   = `${h}-${c}`;
            const celda = mapa[key];
            const tieneB = celda?.bobina_id != null;
            const puede  = !tieneB && puedeColocar(h, c);
            const selec  = posSelec?.posicion_id === celda?.posicion_id;

            let bg, border, cursor;
            if (tieneB)        { bg='#cfe2ff'; border='2px solid #0d6efd'; cursor='default'; }
            else if (selec)    { bg='#ffc107'; border='2px solid #664d03'; cursor='pointer'; }
            else if (puede)    { bg='#d1e7dd'; border='2px solid #0a3622'; cursor='pointer'; }
            else               { bg='#f8f9fa'; border='1px dashed #dee2e6'; cursor='not-allowed'; }

            return (
              <div
                key={key}
                style={{
                  position:'absolute', borderRadius:'50%',
                  left: colX(h,c), top: rowY(h), width:D, height:D,
                  background:bg, border, cursor,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: 7, color: tieneB ? '#084298' : puede ? '#0a3622' : '#adb5bd',
                  fontWeight: 500, textAlign:'center', lineHeight:1.1, padding:2,
                  opacity: tieneB ? 0.7 : 1,
                }}
                onClick={() => {
                  if (puede && celda?.posicion_id != null) onSelect({ posicion_id: celda.posicion_id, altura: h, columna: c });
                  else if (selec) onSelect(null);
                }}
              >
                {tieneB && <span>{celda.bobina_codigo?.substring(0,6)}</span>}
                {puede  && !selec && <span style={{fontSize:14}}>+</span>}
                {selec  && <span style={{fontSize:10}}>✓</span>}
              </div>
            );
          });
        })}

        {Array.from({length:TOTAL},(_,i)=>i+1).map(h => (
          <span key={h} style={{
            position:'absolute', left:-46, fontSize:9,
            color:'#6c757d', top: rowY(h)+D/2-7, whiteSpace:'nowrap'
          }}>
            Alt. {h}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ColocarBobinaExistente;