import React, { useMemo } from 'react';
import styles from './FosoGrid.module.css';

const D        = 70;
const GAP      = 6;
const STEP     = D + GAP;
const VOFFSET  = Math.round(D * 0.866);

const COLS_POR_ALTURA = { 1: 9, 2: 8, 3: 9, 4: 8, 5: 9 };
const TOTAL_ALTURAS   = 5;

function colX(altura, col) {
  return (col - 1) * STEP + (altura % 2 === 0 ? STEP / 2 : 0);
}

function rowY(altura) {
  return (TOTAL_ALTURAS - altura) * VOFFSET + 20;
}

function soportes(altura, col) {
  if (altura === 1) return [];
  if (altura % 2 === 0) return [`${altura - 1}-${col}`, `${altura - 1}-${col + 1}`];
  return [`${altura - 1}-${col - 1}`, `${altura - 1}-${col}`];
}

function FosoGrid({ alturas, onClickBobina, onClickVacia }) {
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

  const anchoTotal = (COLS_POR_ALTURA[1] - 1) * STEP + D;
  const altoTotal  = (TOTAL_ALTURAS - 1) * VOFFSET + D;

  return (
    <div className={styles.scrollWrap}>
      <div className={styles.canvas} style={{ width: anchoTotal, height: altoTotal + 24 }}>

        {/* Números de columna sobre la altura 1 */}
        {Array.from({ length: COLS_POR_ALTURA[1] }, (_, i) => i + 1).map(col => (
          <span
            key={`colnum-${col}`}
            className={styles.colNum}
            style={{ left: colX(1, col) + D / 2 - 8, top: 0 }}
          >
            {col}
          </span>
        ))}

        {/* Bobinas */}
        {Array.from({ length: TOTAL_ALTURAS }, (_, i) => i + 1).map(h =>
          Array.from({ length: COLS_POR_ALTURA[h] }, (_, j) => j + 1).map(c => {
            const key    = `${h}-${c}`;
            const celda  = mapa[key];
            const tieneB = celda?.bobina_id != null;
            const puede  = !tieneB && puedeColocar(h, c);
            const bloq   = !tieneB && !puede;

            let cls = styles.bobina;
            if (tieneB)      cls += ' ' + styles.ocupada;
            else if (puede)  cls += ' ' + styles.vaciaClic;
            else             cls += ' ' + styles.vaciaBloq;

            const handleClick = () => {
              if (tieneB && celda.posicion_id != null) {
                onClickBobina(celda.posicion_id, celda.bobina_id, celda.bobina_codigo ?? '', h, c);
              } else if (puede && celda?.posicion_id != null) {
                onClickVacia(celda.posicion_id, h, c);
              }
            };

            return (
              <div
                key={key}
                className={cls}
                style={{ left: colX(h, c), top: rowY(h), width: D, height: D }}
                title={bloq ? `Requiere apoyos: ${soportes(h, c).join(' y ')}` : undefined}
                onClick={handleClick}
              >
                {tieneB  && <span className={styles.cod}>{celda.bobina_codigo}</span>}
                {puede   && <span className={styles.plusIcon}>+</span>}
                {bloq    && <span className={styles.lockIcon}>○</span>}
              </div>
            );
          })
        )}

        {/* Etiquetas de altura */}
        {Array.from({ length: TOTAL_ALTURAS }, (_, i) => i + 1).map(h => (
          <span
            key={`lbl-${h}`}
            className={styles.alturaLbl}
            style={{ top: rowY(h) + D / 2 - 8 }}
          >
            Alt. {h}
          </span>
        ))}
      </div>
    </div>
  );
}

export default FosoGrid;