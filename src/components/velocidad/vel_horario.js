import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_SERVER } from "../../constantes";
import { useCookies } from "react-cookie";
import { Modal, Button, Form } from "react-bootstrap";

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
//--------------------------------------------------------------------------------------//
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

  const cerrarModal = () => setMostrarModal(false);

  const guardarDia = async () => {
    try {
      await axios.put(
        BACKEND_SERVER + `/api/velocidad/horarios/${diaSeleccionado.fecha}/`,
        {
          inicio: diaSeleccionado.inicio,
          fin: diaSeleccionado.fin,
          zona_id:zonaId,
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

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}>Calendario 2025</h1>
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
                {console.log('que trae en mes: ---->',mes)}
                {mes.map((dia) => {
                  const marcado = festivosSeleccionados[dia.fecha] || dia.es_fin_de_semana;
                  let colorFondo = "#ffffff"; // color por defecto
                  if (dia.es_fin_de_semana && dia.inicio !== "00:00:00") {
                    // fines de semana que se trabaja
                    colorFondo = "#e0bb5eff"; 
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

      {/* Modal edición horas */}
      <Modal show={mostrarModal} onHide={cerrarModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar horario</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {diaSeleccionado && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarDia}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HorarioCalendario;
