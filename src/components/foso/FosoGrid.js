import React, { useMemo, useEffect, useState } from 'react';
import styles from './FosoGrid.module.css';

const COLS_POR_ALTURA = { 1: 9, 2: 8, 3: 9, 4: 8, 5: 9 };
const TOTAL_ALTURAS = 5;
const MAX_COLS = 9;

function soportes(altura, col) {
  if (altura === 1) return [];
  if (altura % 2 === 0) return [`${altura - 1}-${col}`, `${altura - 1}-${col + 1}`];
  return [`${altura - 1}-${col - 1}`, `${altura - 1}-${col}`];
}

function FosoGrid({ alturas, onClickBobina, onClickVacia }) {
  const [D, setD] = useState(70);

  // Recalcula D según el ancho de ventana
  useEffect(() => {
    const calcD = () => {
      const disponible = window.innerWidth - 140; // margen etiquetas + padding
      const nuevo = Math.floor(disponible / (MAX_COLS + 0.5)) - 6;
      setD(Math.max(50, Math.min(nuevo, 120)));
    };
    calcD();
    window.addEventListener('resize', calcD);
    return () => window.removeEventListener('resize', calcD);
  }, []);

  const GAP     = Math.round(D * 0.11);
  const STEP    = D + GAP;
  const VOFFSET = Math.round(D * 0.866);

  const mapa = useMemo(() => {
    const m = {};
    alturas.forEach(a => {
      a.columnas.forEach(c => {
        m[`${a.altura}-${c.columna}`] = { ...c, altura: a.altura };
      });
    });
    return m;
  }, [alturas]);

  const puedeColocar = (altura, col) => {
    if (altura === 1) return true;
    return soportes(altura, col).every(k => mapa[k]?.bobina_id != null);
  };

  const colX = (altura, col) =>
    (col - 1) * STEP + (altura % 2 === 0 ? STEP / 2 : 0);

  const rowY = (altura) =>
    (TOTAL_ALTURAS - altura) * VOFFSET + 20;

  const anchoTotal = (COLS_POR_ALTURA[1] - 1) * STEP + D;
  const altoTotal  = (TOTAL_ALTURAS - 1) * VOFFSET + D;
  const fontSize   = Math.max(8, Math.round(D * 0.16));

  return (
    <div className={styles.scrollWrap}>
      <div className={styles.canvas} style={{ width: anchoTotal, height: altoTotal + 30 }}>

        {Array.from({ length: COLS_POR_ALTURA[1] }, (_, i) => i + 1).map(col => (
          <span
            key={`colnum-${col}`}
            className={styles.colNum}
            style={{ left: colX(1, col) + D / 2 - 8, top: 0, fontSize: Math.max(10, fontSize) }}
          >
            {col}
          </span>
        ))}

        {Array.from({ length: TOTAL_ALTURAS }, (_, i) => i + 1).map(h =>
          Array.from({ length: COLS_POR_ALTURA[h] }, (_, j) => j + 1).map(c => {
            const key   = `${h}-${c}`;
            const celda = mapa[key];
            const tieneB = celda?.bobina_id != null;
            const puede  = !tieneB && puedeColocar(h, c);
            const bloq   = !tieneB && !puede;

            let cls = styles.bobina;
            if (tieneB)     cls += ' ' + styles.ocupada;
            else if (puede) cls += ' ' + styles.vaciaClic;
            else            cls += ' ' + styles.vaciaBloq;

            return (
              <div
                key={key}
                className={cls}
                style={{ left: colX(h, c), top: rowY(h), width: D, height: D }}
                title={bloq ? `Requiere apoyos: ${soportes(h, c).join(' y ')}` : undefined}
                onClick={() => {
                  if (tieneB && celda.posicion_id != null)
                    onClickBobina(celda.posicion_id, celda.bobina_id, celda.bobina_codigo ?? '', h, c);
                  else if (puede && celda?.posicion_id != null)
                    onClickVacia(celda.posicion_id, h, c);
                }}
              >
                {tieneB  && <span className={styles.cod} style={{ fontSize }}>{celda.bobina_codigo}</span>}
                {puede   && <span className={styles.plusIcon} style={{ fontSize: D * 0.35 }}>+</span>}
                {bloq    && <span className={styles.lockIcon} style={{ fontSize: D * 0.28 }}>○</span>}
              </div>
            );
          })
        )}

        {Array.from({ length: TOTAL_ALTURAS }, (_, i) => i + 1).map(h => (
          <span
            key={`lbl-${h}`}
            className={styles.alturaLbl}
            style={{ top: rowY(h) + D / 2 - 8, fontSize: Math.max(10, fontSize) }}
          >
            Alt. {h}
          </span>
        ))}
      </div>
    </div>
  );
}

export default FosoGrid;