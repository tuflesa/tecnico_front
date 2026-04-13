import React, { useMemo, useEffect, useState } from 'react';
import styles from './FosoGrid.module.css';

function soportes(altura, col) {
  if (altura === 1) return [];
  if (altura % 2 === 0) return [`${altura - 1}-${col}`, `${altura - 1}-${col + 1}`];
  return [`${altura - 1}-${col - 1}`, `${altura - 1}-${col}`];
}

function FosoGrid({ alturas, onClickBobina, onClickVacia, modoMoviendo, resaltado, puedeAnadir }) {
  const [D, setD] = useState(70);

  // ── Geometría dinámica derivada de los datos ──────────────────────────
  const COLS_POR_ALTURA = useMemo(() =>
    Object.fromEntries(alturas.map(a => [a.altura, a.columnas.length])),
    [alturas]
  );
  const TOTAL_ALTURAS = alturas.length;
  const MAX_COLS = useMemo(() =>
    Math.max(...alturas.map(a => a.columnas.length)),
    [alturas]
  );
  // Alturas ordenadas (el serializer ya las ordena, pero por seguridad)
  const ALTURAS_ORDENADAS = useMemo(() =>
    [...alturas].map(a => a.altura).sort((x, y) => x - y),
    [alturas]
  );

  useEffect(() => {
    const calcD = () => {
      const disponible = window.innerWidth - 140;
      const nuevo = Math.floor(disponible / (MAX_COLS + 0.5)) - 6;
      setD(Math.max(50, Math.min(nuevo, 120)));
    };
    calcD();
    window.addEventListener('resize', calcD);
    return () => window.removeEventListener('resize', calcD);
  }, [MAX_COLS]);

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

  const tieneSoporte = (key) => {
    const celda = mapa[key];
    if (!celda) return false;
    return celda.bobina_id != null || celda.habilitada === false;
  };

  const puedeColocar = (celda, altura, col) => {
    if (celda?.habilitada === false) return false;
    if (altura === ALTURAS_ORDENADAS[0]) return true;  // altura mínima = suelo
    const alturaInferior = ALTURAS_ORDENADAS[ALTURAS_ORDENADAS.indexOf(altura) - 1];
    const maxColInferior = COLS_POR_ALTURA[alturaInferior] ?? 0;

    if (altura % 2 === 0) {
      return tieneSoporte(`${alturaInferior}-${col}`) &&
             tieneSoporte(`${alturaInferior}-${col + 1}`);
    } else {
      const soporteIzq = col === 1              ? true : tieneSoporte(`${alturaInferior}-${col - 1}`);
      const soporteDer = col > maxColInferior   ? true : tieneSoporte(`${alturaInferior}-${col}`);
      const tieneAlMenosUnoReal =
        (col > 1              && tieneSoporte(`${alturaInferior}-${col - 1}`)) ||
        (col <= maxColInferior && tieneSoporte(`${alturaInferior}-${col}`));
      return soporteIzq && soporteDer && tieneAlMenosUnoReal;
    }
  };

  const colX = (altura, col) =>
    (col - 1) * STEP + (altura % 2 === 0 ? STEP / 2 : 0);

  const rowY = (altura) =>
    (TOTAL_ALTURAS - ALTURAS_ORDENADAS.indexOf(altura) - 1) * VOFFSET + 20;

  const anchoTotal = (COLS_POR_ALTURA[ALTURAS_ORDENADAS[0]] - 1) * STEP + D;
  const altoTotal  = (TOTAL_ALTURAS - 1) * VOFFSET + D;
  const fontSize   = Math.max(8, Math.round(D * 0.16));

  return (
    <div className={styles.scrollWrap}>
      <div className={styles.canvas} style={{ width: anchoTotal, height: altoTotal + 30 }}>

        {/* Numeración de columnas (fila inferior = altura mínima) */}
        {Array.from(
          { length: COLS_POR_ALTURA[ALTURAS_ORDENADAS[0]] },
          (_, i) => i + 1
        ).map(col => (
          <span
            key={`colnum-${col}`}
            className={styles.colNum}
            style={{ left: colX(ALTURAS_ORDENADAS[0], col) + D / 2 - 8, top: 0, fontSize: Math.max(10, fontSize) }}
          >
            {col}
          </span>
        ))}

        {/* Celdas */}
        {ALTURAS_ORDENADAS.map(h =>
          Array.from({ length: COLS_POR_ALTURA[h] }, (_, j) => j + 1).map(c => {
            const key   = `${h}-${c}`;
            const celda = mapa[key];
            const tieneB = celda?.bobina_id != null;
            const puede  = !tieneB && puedeColocar(celda, h, c);
            const bloq   = !tieneB && !puede;

            let cls = styles.bobina;
            if (celda?.habilitada === false) cls += ' ' + styles.vaciaAnulada;
            else if (tieneB && resaltado && celda.posicion_id === resaltado) cls += ' ' + styles.resaltada;
            else if (tieneB) cls += ' ' + styles.ocupada;
            else if (modoMoviendo && puede) cls += ' ' + styles.vaciaMover;
            else if (puede && puedeAnadir) cls += ' ' + styles.vaciaClic;
            else cls += ' ' + styles.vaciaBloq;

            return (
              <div
                key={key}
                className={cls}
                style={{ left: colX(h, c), top: rowY(h), width: D, height: D }}
                title={
                  celda?.habilitada === false
                    ? 'Posición anulada'
                    : bloq
                    ? `Requiere apoyos: ${soportes(h, c).join(' y ')}`
                    : undefined
                }
                onClick={() => {
                  if (tieneB && celda.posicion_id != null)
                    onClickBobina(celda.posicion_id, celda.bobina_id, celda.bobina_codigo ?? '', h, c);
                  else if (puede && celda?.posicion_id != null)
                    onClickVacia(celda.posicion_id, h, c);
                }}
              >
                {tieneB  && <span className={styles.cod}     style={{ fontSize }}>{celda.bobina_codigo}</span>}
                {puede && puedeAnadir  && <span className={styles.plusIcon} style={{ fontSize: D * 0.35 }}>+</span>}
                {puede && !puedeAnadir && <span className={styles.lockIcon} style={{ fontSize: D * 0.28 }}>○</span>}
                {bloq    && <span className={styles.lockIcon} style={{ fontSize: D * 0.28 }}>○</span>}
              </div>
            );
          })
        )}

        {/* Etiquetas de altura */}
        {ALTURAS_ORDENADAS.map(h => (
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