import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_SERVER } from "../../constantes";
import { useCookies } from "react-cookie";
import { Modal, Button, Form } from "react-bootstrap";
import VelocidadNavBar from './vel_nav_bar';

const HorarioCalendario = () => {
  const [token] = useCookies(["tec-token"]);
  const [user] = useCookies(['tec-user']);

  const [dias, setDias] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoFestivos, setModoFestivos] = useState(false);
  const [festivosSeleccionados, setFestivosSeleccionados] = useState({});
  const [zonaId, setZonaId] = useState(null);
  const [zonas, setZonas] = useState(null);
  const [empresaId, setEmpresaId] = useState(user['tec-user'].perfil.empresa.id);
  const soyProgramador = user['tec-user'].perfil.destrezas.filter(s => s === 7);
  const [mostrarModalNuevoCalen, setMostrarModalNuevoCalen] = useState(false);
  const [yearSeleccionado, setYearSeleccionado] = useState(new Date().getFullYear());
  const [cargando, setCargando] = useState(false);
  const [turnos, setTurnos] = useState(null);
  const [turno_mañana, setTurnoMañana] = useState(null);
  const [turno_tarde, setTurnoTarde] = useState(null);
  const [turno_noche, setTurnoNoche] = useState(null);
  const [cambio_turno_1, setCambioTurno1] = useState(null);
  const [cambio_turno_2, setCambioTurno2] = useState(null);

  useEffect(() => {
    if(zonaId){
      cargarDias();
    }
  }, [zonaId]);

  useEffect(() => {
    if (empresaId === '') {
        setZonas([]);
    }
    else {
        empresaId && axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${empresaId}&es_maquina_tubo=${true}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setZonas(res.data);
        })
        .catch( err => {
            console.log(err);
        });            
    }
  }, [token]);
  
  useEffect(() => {
    zonaId && axios.get(BACKEND_SERVER + `/api/velocidad/turnos/?zona=${zonaId}`,{
        headers: {
            'Authorization': `token ${token['tec-token']}`
        }
    })
    .then( res => {
        setTurnos(res.data);
        console.log('estos son los turnos',res.data);

    })
    .catch( err => {
        console.log(err);
    });    
  }, [token, zonaId]);

  const cargarDias = async () => {
    try {
      const res = await axios.get(
        BACKEND_SERVER + `/api/velocidad/horarios/anual/?zona=${zonaId}`,
        { headers: { Authorization: `token ${token["tec-token"]}` } }
      );
      setDias(res.data);
    } catch (error) {
      console.error("Error cargando días:", error);
    }
  };

  const abrirModal = (dia) => {
    if (modoFestivos) return; // en modo festivos no abrir modal
    setDiaSeleccionado({ ...dia });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    console.log('que vale turno_mañana antes de borrarlo', turno_mañana);
    console.log('que vale turno_tarde antes de borrarlo', turno_tarde);
    console.log('que vale turno_noche antes de borrarlo', turno_noche);
    setMostrarModal(false);
    setTurnoMañana('');
    setTurnoNoche('');
    setTurnoTarde('');
  }

  const modificarDia = async () => {
    try {
      await axios.put(
        BACKEND_SERVER + `/api/velocidad/horarios/${diaSeleccionado.fecha}/`,
        {
          inicio: diaSeleccionado.inicio,
          fin: diaSeleccionado.fin,
          zona_id:zonaId,
          turno_mañana: turno_mañana,
          turno_tarde: turno_tarde,
          turno_noche: turno_noche,
        },
        { headers: { Authorization: `token ${token["tec-token"]}` } }
      );
      alert("Guardado correctamente");
      setMostrarModal(false);
      cargarDias();
    } catch (error) {
      alert("Error guardando");
      console.error(error);
    }
  };

  const toggleFestivo = (fecha) => {
    setFestivosSeleccionados((prev) => ({
      ...prev,
      [fecha]: !prev[fecha],
    }));
  };

  const guardarFestivos = async () => {
    const fechas = Object.keys(festivosSeleccionados).filter(
      (f) => festivosSeleccionados[f]
    );
    try {
      // aquí envias las fechas al backend para marcar como festivos
      await axios.post(
        BACKEND_SERVER + "/api/velocidad/horarios/festivos/",
        { fechas, zona_id: zonaId },
        { headers: { Authorization: `token ${token["tec-token"]}` } }
      );
      alert("Festivos guardados correctamente");
      setFestivosSeleccionados({});
      cargarDias();
    } catch (error) {
      console.error(error);
      alert("Error guardando festivos");
    }
  };

  // Agrupar días por mes
  const meses = {};
  dias.forEach((dia) => {
    const mes = new Date(dia.fecha).getMonth();
    if (!meses[mes]) meses[mes] = [];
    meses[mes].push(dia);
  });

  const nombreMes = (n) => {
    const nombres = [
      "Enero", "Febrero", "Marzo", "Abril",
      "Mayo", "Junio", "Julio", "Agosto",
      "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return nombres[n];
  };

  //-------------------------Crear nuevo calendario--------------------------//
  const abrirModalYear = () => {
      setYearSeleccionado(new Date().getFullYear());
      setMostrarModalNuevoCalen(true);
  };

  const cerrarModalYear = () => {
      setMostrarModalNuevoCalen(false);
  };

  const generarAnual = async () => {
      if (!yearSeleccionado){
          alert("Por favor introduce un año válido");
          return;
      }
      const confirmar = window.confirm(`¿Deseas generar todos los horarios del año ${yearSeleccionado}?`);
      if (!confirmar) return;
      setCargando(true);
      try {
          const response = await axios.post(BACKEND_SERVER + `/api/velocidad/horarios/generar/`, {
              year: yearSeleccionado
          }, { 
              headers: {
                  'Authorization': `token ${token['tec-token']}` 
              }
          });
          alert("Año generado correctamente");
      } catch (error) {
          alert("Hubo un error generando el año: " + (error.response?.data?.mensaje || error.message));
      } finally {
          setCargando(false);
      }
  };

  return (
    <div>
      <VelocidadNavBar/>
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ margin: 0 }}>Calendario {new Date().getFullYear()}</h1>
          {soyProgramador? 
            <Button variant="primary" onClick={abrirModalYear}>
              Crear calendario
            </Button> : ''}
        </div>
        {/* Seleccionar máquina */}
        <div style={{ marginTop: "10px", marginBottom: "20px" }}>
          <strong>Zonas:</strong>

          {zonas && zonas.length > 0 ? (
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "10px" }}>
              {zonas.map((z) => (
                <Form.Check
                  key={z.id}
                  inline
                  type="radio"
                  name="zona-check"
                  label={z.nombre}
                  checked={zonaId === z.id}
                  onChange={() => setZonaId(z.id)}
                />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "14px", color: "#888" }}>No hay zonas registradas.</p>
          )}
        </div>
        {/* Check para activar modo festivos */}
        <Form.Check
          inline
          type="switch"
          id="modo-festivos"
          label="Modo Festivos"
          checked={modoFestivos}
          onChange={() => setModoFestivos(!modoFestivos)}
        />

        {modoFestivos && (
          <Button
            style={{ marginLeft: "10px" }}
            variant="success"
            onClick={guardarFestivos}
          >
            Guardar Festivos
          </Button>
        )}

        {/* Contenedor de meses 4x3 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {Object.keys(meses).map((mesKey) => {
            const mes = meses[mesKey].sort(
              (a, b) => new Date(a.fecha) - new Date(b.fecha)
            );

            const primerDiaSemana = new Date(mes[0].fecha).getDay();
            const huecos = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

            return (
              <div
                key={mesKey}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  background: "#fafafa"
                }}
              >
                <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                  {nombreMes(Number(mesKey))}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    textAlign: "center",
                    fontSize: "12px",
                    marginBottom: "5px",
                    fontWeight: "bold"
                  }}
                >
                  {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "3px"
                  }}
                >
                  {Array.from({ length: huecos }).map((_, i) => (
                    <div key={"hueco-" + i}></div>
                  ))}
                  {mes.map((dia) => {
                    const marcado = festivosSeleccionados[dia.fecha] || dia.es_festivo;
                    let colorFondo = "#ffffff"; // color por defecto
                    if (modoFestivos && festivosSeleccionados[dia.fecha]) {
                      colorFondo = "#fff3a1"; // amarillo para indicar selección, no están todavía grabados
                    /* }
                    if (dia.es_festivo && dia.inicio !== "00:00:00") {
                      // fines de semana que se trabaja
                      colorFondo = "#e0bb5eff";  */
                    } else if (dia.inicio === "00:00:00") {
                      // festivos y fines de semana normales
                      colorFondo = "#ffdede"; 
                    }
                    return (
                      <div
                        key={dia.fecha}
                        onClick={() =>
                          modoFestivos ? toggleFestivo(dia.fecha) : abrirModal(dia)
                        }
                        style={{
                          height: "30px",
                          fontSize: "12px",
                          borderRadius: "4px",
                          background: colorFondo,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          border: "1px solid #ddd"
                        }}
                      >
                        {new Date(dia.fecha).getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal para modificar las horas de un día */}
      <Modal show={mostrarModal} onHide={cerrarModal} size="lg">
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>Editar horario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {diaSeleccionado && (
              <div style={{ display: "grid", flexDirection: "column", gap: "12px" }}>
                <p><strong>Día:</strong> {diaSeleccionado.nombreDia}</p>
                <p><strong>Fecha:</strong> {diaSeleccionado.fecha}</p>

                <label>Hora inicio</label>
                <input
                  type="time"
                  value={diaSeleccionado.inicio}
                  onChange={(e) =>
                    setDiaSeleccionado({ ...diaSeleccionado, inicio: e.target.value })
                  }
                />

                <label>Hora fin</label>
                <input
                  type="time"
                  value={diaSeleccionado.fin}
                  onChange={(e) =>
                    setDiaSeleccionado({ ...diaSeleccionado, fin: e.target.value })
                  }
                />
                <Form.Group controlId="turno_mañana">
                  <Form.Label>Turno de mañana</Form.Label>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Form.Control
                      as="select"
                      name="turno_mañana"
                      value={turno_mañana}
                      onChange={(e) => setTurnoMañana(e.target.value)}
                      style={{ width: "200px" }}   // <-- opcional, para que no se expanda
                    >
                      <option value="">Selecciona una opción</option>
                      {turnos?.map((turno) => (
                        <option key={turno.id} value={turno.id}>
                          {turno.turno}
                        </option>
                      ))}
                    </Form.Control>

                    <span style={{ fontWeight: "bold" }}>
                      {turnos.find((t) => String(t.id) === String(turno_mañana))?.maquinista?.get_full_name ?? ""}
                    </span>
                  </div>
                </Form.Group>
                <label>Hora cambio de turno 1</label>
                <input
                  type="time"
                  value={cambio_turno_1}
                  onChange={(e) => setCambioTurno1(e.target.value)}
                />
                <Form.Group controlId="turno_tarde">
                  <Form.Label>Turno de tarde</Form.Label>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Form.Control
                      as="select"
                      name="turno_tarde"
                      value={turno_tarde}
                      onChange={(e) => setTurnoTarde(e.target.value)}
                      style={{ width: "200px" }}   // <-- opcional, para que no se expanda
                    >
                      <option value="">Selecciona una opción</option>
                      {turnos?.map((turno) => (
                        <option key={turno.id} value={turno.id}>
                          {turno.turno}
                        </option>
                      ))}
                    </Form.Control>

                    <span style={{ fontWeight: "bold" }}>
                      {turnos.find((t) => String(t.id) === String(turno_tarde))?.maquinista?.get_full_name ?? ""}
                    </span>
                  </div>
                </Form.Group>
                <label>Hora cambio de turno 2</label>
                <input
                  type="time"
                  value={cambio_turno_2}
                  onChange={(e) => setCambioTurno2(e.target.value)}
                />
                <Form.Group controlId="turno_noche">
                  <Form.Label>Turno de noche</Form.Label>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Form.Control
                      as="select"
                      name="turno_noche"
                      value={turno_noche}
                      onChange={(e) => setTurnoNoche(e.target.value)}
                      style={{ width: "200px" }}   // <-- opcional, para que no se expanda
                    >
                      <option value="">Selecciona una opción</option>
                      {turnos?.map((turno) => (
                        <option key={turno.id} value={turno.id}>
                          {turno.turno}
                        </option>
                      ))}
                    </Form.Control>

                    <span style={{ fontWeight: "bold" }}>
                      {turnos.find((t) => String(t.id) === String(turno_noche))?.maquinista?.get_full_name ?? ""}
                    </span>
                  </div>
                </Form.Group>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={modificarDia}>
              Guardar
            </Button>
          </Modal.Footer>
        </Modal>
        {/* Modal para seleccionar año y crearlo */}
        <Modal show={mostrarModalNuevoCalen} onHide={cerrarModalYear}>
            <Modal.Header closeButton>
                <Modal.Title>Generar Horarios Anuales</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>Selecciona el año para el que deseas generar los horarios:</p>
                
                <Form.Group>
                    <Form.Label>Año</Form.Label>
                    <Form.Control
                        type="number"
                        min="2025"
                        max="2200"
                        value={yearSeleccionado}
                        onChange={(e) => setYearSeleccionado(parseInt(e.target.value))}
                        disabled={cargando}
                    />
                    <Form.Text className="text-muted">
                        Se generarán horarios para todas las máquinas de tubo
                    </Form.Text>
                </Form.Group>

                {cargando && (
                    <div className="mt-3 text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Generando...</span>
                        </div>
                        <p className="mt-2">Generando horarios, por favor espera...</p>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={cerrarModalYear} disabled={cargando}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={generarAnual} disabled={cargando}>
                    {cargando ? 'Generando...' : 'Generar Año'}
                </Button>
            </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default HorarioCalendario;
