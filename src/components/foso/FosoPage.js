import React, { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Navbar, Container, Button } from 'react-bootstrap';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import FosoGrid from './FosoGrid';
import BobinaDetalle from './BobinaDetalle';
import ColocarBobina from './ColocarBobina';
import styles from './FosoPage.module.css';

function FosoPage() {
  const [token] = useCookies(['tec-token']);
  const [lineas,   setLineas]   = useState([]);
  const [lineaId,  setLineaId]  = useState(null);
  const [fosoData, setFosoData] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [detalle,  setDetalle]  = useState(null);
  const [colocar,  setColocar]  = useState(null);

  const authHeader = { headers: { Authorization: `token ${token['tec-token']}` } };

  useEffect(() => {
    axios.get(`${BACKEND_SERVER}/api/foso/lineas/`, authHeader)
      .then(r => {
        const activas = r.data.filter(l => l.activa).sort((a, b) => a.id - b.id);
        setLineas(activas);
        if (activas.length) setLineaId(activas[0].id);
      });
  }, []); // eslint-disable-line

  const cargarFoso = useCallback((id) => {
    setLoading(true);
    axios.get(`${BACKEND_SERVER}/api/foso/lineas/${id}/foso/`, authHeader)
      .then(r => setFosoData(r.data))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  useEffect(() => {
    if (lineaId != null) cargarFoso(lineaId);
  }, [lineaId, cargarFoso]);

  const stats = fosoData
    ? fosoData.alturas.reduce(
        (acc, a) => {
          a.columnas.forEach(c => {
            acc.total++;
            if (c.bobina_id != null) acc.ocupadas++;
          });
          return acc;
        },
        { total: 0, ocupadas: 0 }
      )
    : null;

  const handleClickBobina = (posicionId, bobinaId, _codigo, altura, columna) => {
    setDetalle({ bobinaId, posicionId, altura, columna });
  };

  const handleClickVacia = (posicionId, altura, columna) => {
    setColocar({ posicionId, altura, columna });
  };

  return (
    <React.Fragment>
      <Navbar bg="light" fixed="top">
        <Navbar.Brand>Gestión de Foso</Navbar.Brand>

        {/* Selector de línea en la navbar */}
        {lineas.length > 0 && (
          <div className={styles.navLinea}>
            <label className={styles.navLabel}>Línea:</label>
            <select
              className={styles.navSelect}
              value={lineaId ?? ''}
              onChange={e => setLineaId(Number(e.target.value))}
            >
              {lineas.map(l => (
                <option key={l.id} value={l.id}>{l.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className={styles.navStats}>
            <span className={styles.statItem}>
              Total: <strong>{stats.total}</strong>
            </span>
            <span className={styles.statItem} style={{ color: '#4a90d9' }}>
              Ocupadas: <strong>{stats.ocupadas}</strong>
            </span>
            <span className={styles.statItem} style={{ color: '#3ecf8e' }}>
              Libres: <strong>{stats.total - stats.ocupadas}</strong>
            </span>
          </div>
        )}

        <Navbar.Collapse className="justify-content-end">
          <Button variant="info" onClick={() => window.location.href = '/home'}>Home</Button>
        </Navbar.Collapse>
      </Navbar>

      <Container fluid className="pt-2 mt-4 px-3" style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column' }}>
        {loading && <p className={styles.loadMsg}>Cargando foso...</p>}

        {!loading && fosoData && (
          <div className={styles.fosoWrap} style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <FosoGrid
              alturas={fosoData.alturas}
              onClickBobina={handleClickBobina}
              onClickVacia={handleClickVacia}
            />
          </div>
        )}
      </Container>

      {detalle && (
        <BobinaDetalle
          bobinaId={detalle.bobinaId}
          posicionId={detalle.posicionId}
          altura={detalle.altura}
          columna={detalle.columna}
          token={token['tec-token']}
          onClose={() => setDetalle(null)}
          onRetirada={() => { setDetalle(null); if (lineaId) cargarFoso(lineaId); }}
        />
      )}

      {colocar && (
        <ColocarBobina
          posicionId={colocar.posicionId}
          altura={colocar.altura}
          columna={colocar.columna}
          token={token['tec-token']}
          onClose={() => setColocar(null)}
          onColocada={() => { setColocar(null); if (lineaId) cargarFoso(lineaId); }}
        />
      )}
    </React.Fragment>
  );
}

export default FosoPage;