import React, { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Navbar, Container, Button } from 'react-bootstrap';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import FosoGrid from './FosoGrid';
import BobinaDetalle from './BobinaDetalle';
import ColocarBobina from './ColocarBobina';
import styles from './FosoPage.module.css';
import PanelBusqueda from './PanelBusqueda';
import ColocarBobinaExistente from './ColocarBobinaExistente';
import PanelRecepcionBobinas from './PanelRecepcionBobinas';

function FosoPage() {
  const [token] = useCookies(['tec-token']);
  const [user]  = useCookies(['tec-user']);

  const [fosos,   setFosos]   = useState([]);
  const [fosoId,  setFosoId]  = useState(null);
  const [lineas,   setLineas]   = useState([]);
  const [lineaId,  setLineaId]  = useState(null);
  const [fosoData, setFosoData] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [detalle,  setDetalle]  = useState(null);
  const [colocar,  setColocar]  = useState(null);
  const [moviendo, setMoviendo] = useState(null);
  const [resaltado, setResaltado] = useState(null);
  const [pendienteDetalle, setPendienteDetalle] = useState(null);
  const [colocarExistente, setColocarExistente] = useState(null);
  const [panelLateral, setPanelLateral] = useState(null);
  const [colaRecepcion, setColaRecepcion] = useState([]);
  const [colocandoRecepcion, setColocandoRecepcion] = useState(null);

  const authHeader = { headers: { Authorization: `token ${token['tec-token']}` } };
  const puedeEditar = user['tec-user']?.perfil?.destrezas_foso?.some(d => d.nombre === 'edicion') ?? false;
  const puedeMover   = user['tec-user']?.perfil?.destrezas_foso?.some(d => d.nombre === 'mover')    ?? false;
  const puedeRetirar = user['tec-user']?.perfil?.destrezas_foso?.some(d => d.nombre === 'retirar')  ?? false;
  const puedeAnadir  = user['tec-user']?.perfil?.destrezas_foso?.some(d => d.nombre === 'añadir')   ?? false;

  // Mostrar detalle pendiente tras cargar nuevo fosoData
  useEffect(() => {
    if (fosoData && pendienteDetalle) {     
      const { bobinaId, posicionId, altura, columna } = pendienteDetalle;
      setDetalle({ bobinaId, posicionId, altura, columna });
      setPendienteDetalle(null);
    }
  }, [fosoData, pendienteDetalle]);

  // 1. Cargar fosos al inicio
  useEffect(() => {
    axios.get(`${BACKEND_SERVER}/api/foso/fosos/`, authHeader)
      .then(r => {
        const activos = r.data.filter(f => f.activo).sort((a, b) => a.id - b.id);
        setFosos(activos);
        if (activos.length) setFosoId(activos[0].id);
      });
  }, []); // eslint-disable-line

  // 2. Cuando cambia el foso, cargar sus líneas
  useEffect(() => {
    if (fosoId == null) return;
    setLineaId(null);
    setFosoData(null);
    axios.get(`${BACKEND_SERVER}/api/foso/lineas/?foso=${fosoId}`, authHeader)
      .then(r => {
        const activas = r.data.filter(l => l.activa).sort((a, b) => a.id - b.id);
        setLineas(activas);
        if (pendienteDetalle?.lineaDestino) {
            setLineaId(Number(pendienteDetalle.lineaDestino));
          } else if (activas.length) {
            setLineaId(activas[0].id);
          }
      });
  }, [fosoId]); // eslint-disable-line

  const handleMover = async (posicionDestinoId) => {
    try {
      await axios.post(
        `${BACKEND_SERVER}/api/foso/ocupaciones/colocar/`,
        { bobina_id: moviendo.bobinaId, posicion_id: posicionDestinoId },
        { headers: { Authorization: `token ${token['tec-token']}` } }
      );
      setMoviendo(null);
      cargarFoso(lineaId);
    } catch {
      alert('Error al mover la bobina.');
    }
  };

  const cargarFoso = useCallback((id) => {
    setLoading(true);
    axios.get(`${BACKEND_SERVER}/api/foso/lineas/${id}/grid/`, authHeader)
      .then(r => setFosoData(r.data))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  // 3. Cuando cambia la línea, cargar su grid
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

        {/* Selector de foso */}
        {fosos.length > 0 && (
          <div className={styles.navLinea}>
            <label className={styles.navLabel}>Foso:</label>
            <select
              className={styles.navSelect}
              value={fosoId ?? ''}
              onChange={e => {
                setFosoId(Number(e.target.value));
                setMoviendo(null);
                setDetalle(null);
                setColocar(null);
              }}
            >
              {fosos.map(f => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {/* Selector de línea */}
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
          <button
            onClick={() => setPanelLateral('busqueda')}
            style={{
              background: 'none', border: '1px solid #ced4da',
              borderRadius: 4, padding: '4px 14px', fontSize: 13,
              cursor: 'pointer', marginRight: 8
            }}
          >
            Buscar bobina
          </button>

          <button
            onClick={() => setPanelLateral('recepcion')}
            style={{ background: 'none', border: '1px solid #ced4da', borderRadius: 4, padding: '4px 14px', fontSize: 13, cursor: 'pointer', marginRight: 8 }}
          >
            Recepción
          </button>

          <Button variant="info" onClick={() => window.location.href = '/home'}>Home</Button>
        </Navbar.Collapse>
      </Navbar>

      <Container fluid className="pt-2 mt-4 px-3" style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column' }}>
        {loading && <p className={styles.loadMsg}>Cargando foso...</p>}

        {moviendo && (
          <div style={{
            background: '#fff3cd', border: '1px solid #ffc107',
            borderRadius: 6, padding: '10px 16px', marginBottom: 12, marginTop: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: 13 }}>
              Selecciona la posición destino para mover <strong>{moviendo.codigo}</strong>
            </span>
            <button
              onClick={() => setMoviendo(null)}
              style={{ background: 'none', border: '1px solid #aaa', borderRadius: 4, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>
        )}

        {!loading && fosoData && (
          <div className={styles.fosoWrap} style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FosoGrid
              alturas={fosoData.alturas}
              onClickBobina={handleClickBobina}
              onClickVacia={(posicionId, altura, columna) => {
                if (moviendo) {
                  handleMover(posicionId);
                } else if (puedeAnadir) {
                  setColocar({ posicionId, altura, columna });
                }
              }}
              modoMoviendo={moviendo}
              resaltado={resaltado}
              puedeAnadir={puedeAnadir}
            />
          </div>
        )}
      </Container>

      {detalle && (
        <BobinaDetalle
          puedeEditar={puedeEditar}
          puedeMover={puedeMover}
          puedeRetirar={puedeRetirar}
          bobinaId={detalle.bobinaId}
          posicionId={detalle.posicionId}
          altura={detalle.altura}
          columna={detalle.columna}
          token={token['tec-token']}
          onClose={() => { setDetalle(null); setResaltado(null); }}
          onRetirada={() => { setDetalle(null); if (lineaId) cargarFoso(lineaId); }}
          onMover={(bobinaId, ocupacionId, codigo) => {
            setDetalle(null);
            setMoviendo({ bobinaId, ocupacionId, codigo });
          }}
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

      {panelLateral === 'busqueda' && (
        <PanelBusqueda
          token={token['tec-token']}
          onClose={() => setPanelLateral(null)}
          onSeleccionar={(bobinaId, posicionId, altura, columna, lineaDestino, fosoDestino) => {
            setPanelLateral(null);
            setResaltado(posicionId);      
            if (fosoDestino && Number(fosoDestino) !== Number(fosoId)) {
                setFosoId(Number(fosoDestino));
                // Esperamos a que cambie el foso y cargue líneas
                setPendienteDetalle({
                  bobinaId,
                  posicionId,
                  altura,
                  columna,
                  lineaDestino,
                });
                return;
              }
            if (lineaDestino && Number(lineaDestino) !== Number(lineaId)) {
              setLineaId(Number(lineaDestino));
            }
          }}
          onColocarFuera={(bobinaId, codigo) => {
            setPanelLateral(null);
            setColocarExistente({ bobinaId, codigo });
          }}
        />
      )}

      {colocarExistente && (
        <ColocarBobinaExistente
          bobinaId={colocarExistente.bobinaId}
          codigo={colocarExistente.codigo}
          token={token['tec-token']}
          fosoData={fosoData}
          lineas={lineas}
          lineaId={lineaId}
          onLineaChange={(id) => setLineaId(id)}
          onClose={() => setColocarExistente(null)}
          onColocada={() => { setColocarExistente(null); if (lineaId) cargarFoso(lineaId); }}
        />
      )}

      {panelLateral === 'recepcion' && (
        <PanelRecepcionBobinas
          token={token['tec-token']}
          cola={colaRecepcion}
          setCola={setColaRecepcion}
          onColocar={setColocandoRecepcion}
          onClose={() => setPanelLateral(null)}
        />
      )}

      {colocandoRecepcion && (
        <ColocarBobinaExistente
          bobinaId={colocandoRecepcion.id}
          codigo={colocandoRecepcion.codigo}
          token={token['tec-token']}
          lineas={lineas}
          lineaId={lineaId}
          onLineaChange={id => setLineaId(id)}
          onClose={() => setColocandoRecepcion(null)}
          onColocada={() => {
            setColaRecepcion(c => c.filter(b => b.id !== colocandoRecepcion.id));
            setColocandoRecepcion(null);
          }}
        />
      )}
    </React.Fragment>
  );
}

export default FosoPage;