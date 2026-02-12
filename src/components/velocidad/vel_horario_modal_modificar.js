import React, { useState, useEffect } from 'react';
import { Modal, Button, Container, Form, Row, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const ModalModificarHorario = ({ zonaId, mostrarModal, cerrarModal, diaSelec, onActualizar }) => {
    const [token] = useCookies(["tec-token"]);

    const [cambio_turno_1, setCambioTurno1] = useState(diaSelec?.cambio_turno_1 || null);
    const [cambio_turno_2, setCambioTurno2] = useState(null);
    const [numero_turnos, setNumeroTurnos] = useState('2');
    const [turnos, setTurnos] = useState(null);
    const [turno_mañana, setTurnoMañana] = useState(diaSelec?.turno_mañana || '');
    const [turno_tarde, setTurnoTarde] = useState(diaSelec?.turno_tarde || '')
    const [turno_noche, setTurnoNoche] = useState(diaSelec?.turno_noche || '');
    const [diaSeleccionado, setDiaSeleccionado] = useState(diaSelec || null);

    useEffect(() => {
        if (diaSelec) {
            setDiaSeleccionado(diaSelec);
            setTurnoMañana(diaSelec.turno_mañana);
            setTurnoTarde(diaSelec.turno_tarde);
            setTurnoNoche(diaSelec.turno_noche);
            setCambioTurno1(diaSelec.cambio_turno_1);
            setCambioTurno2(diaSelec.cambio_turno_2);
        }
    }, [diaSelec]);
    
    useEffect(() => {
        zonaId && axios.get(BACKEND_SERVER + `/api/velocidad/turnos/?zona=${zonaId}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setTurnos(res.data);
        })
        .catch( err => {
            console.log(err);
        });    
    }, [token, zonaId]);

    const modificarDia = async () => {
        try {
        await axios.put(
            BACKEND_SERVER + `/api/velocidad/horarios/${diaSeleccionado.fecha}/`,
            {
            inicio: diaSeleccionado.inicio,
            fin: diaSeleccionado.fin,
            zona_id: zonaId,
            turno_mañana: turno_mañana,
            turno_tarde: turno_tarde,
            turno_noche: turno_noche,
            cambio_turno_1: cambio_turno_1,
            cambio_turno_2: cambio_turno_2,
            },
            { headers: { Authorization: `token ${token["tec-token"]}` } }
        );
        alert("Guardado correctamente");
        handleCerrar();
        if (onActualizar) {
            onActualizar();
        }
        } catch (err) {
            console.log(err);
        }
    };

    const handleCerrar = () => {
        cerrarModal();

        setTurnoMañana('');
        setTurnoNoche('');
        setTurnoTarde('');
    }

    return (
        <Container>
            <Modal show={mostrarModal} onHide={cerrarModal} size="lg">
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>Editar horario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {diaSeleccionado && (
                    <div style={{ display: "grid", flexDirection: "column", gap: "6px" }}>
                        <p><strong>Día:</strong> {diaSeleccionado.nombreDia}</p>
                        <p><strong>Fecha:</strong> {new Date(diaSeleccionado.fecha).toLocaleDateString("es-ES")}</p>
                        <p><strong>Semana:</strong> {diaSeleccionado.semana}</p>
                        <Form.Group className="mb-1">
                        <Form.Label>Selecciona el número de turnos</Form.Label>
                        <Form.Control
                            as="select"
                            value={numero_turnos}
                            onChange={(e) => setNumeroTurnos(e.target.value)}
                            style={{ width: "200px" }}
                        >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                        </Form.Control>
                        </Form.Group>
                        <Row className="g-1 justify-content-start">
                        <Col xs="auto">
                            <Form.Group>
                                <Form.Label>Hora inicio</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={diaSeleccionado.inicio}
                                    onChange={(e) =>setDiaSeleccionado({ ...diaSeleccionado, inicio: e.target.value })}
                                    style={{ width: "300px" }}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs="auto">
                            <Form.Group>
                                <Form.Label>Hora fin</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={diaSeleccionado.fin}
                                    onChange={(e) => setDiaSeleccionado({ ...diaSeleccionado, fin: e.target.value })}
                                    style={{ width: "300px" }}
                                />
                            </Form.Group>
                        </Col>
                        </Row>
                        <Row className="g-1 justify-content-start">
                        <Col xs="auto">
                            <Form.Group controlId="turno_mañana">
                            <Form.Label>Turno de mañana</Form.Label>
                            <Form.Control
                                as="select"
                                name="turno_mañana"
                                value={turno_mañana}
                                onChange={(e) => setTurnoMañana(e.target.value)}
                                style={{ width: "300px" }}   // <-- opcional, para que no se expanda
                                >
                                <option value="">Selecciona una opción</option>
                                {turnos?.map((turno) => (
                                    <option key={turno.id} value={turno.id}>
                                    {turno.turno} - {turno?.maquinista?.get_full_name}
                                    </option>
                                ))}
                            </Form.Control>
                            </Form.Group>
                            <Form.Group controlId="turno_tarde">
                            <Form.Label>Turno de tarde</Form.Label>
                            <Form.Control
                                as="select"
                                name="turno_tarde"
                                value={turno_tarde}
                                onChange={(e) => setTurnoTarde(e.target.value)}
                                style={{ width: "300px" }}   // <-- opcional, para que no se expanda
                            >
                                <option value="">Selecciona una opción</option>
                                {turnos?.map((turno) => (
                                <option key={turno.id} value={turno.id}>
                                    {turno.turno} - {turno?.maquinista?.get_full_name}
                                </option>
                                ))}
                            </Form.Control>
                            </Form.Group>
                            <Form.Group controlId="turno_noche">
                            <Form.Label>Turno de noche</Form.Label>
                            <Form.Control
                                as="select"
                                name="turno_noche"
                                value={turno_noche}
                                onChange={(e) => setTurnoNoche(e.target.value)}
                                style={{ width: "300px" }}   // <-- opcional, para que no se expanda
                            >
                                <option value="">Selecciona una opción</option>
                                {turnos?.map((turno) => (
                                <option key={turno.id} value={turno.id}>
                                    {turno.turno} - {turno?.maquinista?.get_full_name}
                                </option>
                                ))}
                            </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col xs="auto"> 
                            <Form.Group>
                            <Form.Label>Hora de cambio al turno de tarde</Form.Label>
                            <Form.Control
                                type="time"
                                value={cambio_turno_1}
                                onChange={(e) => setCambioTurno1(e.target.value)}
                                style={{ width: "300px" }}
                            />
                            </Form.Group>
                            <Form.Group>
                            <Form.Label>Hora de cambio al turno de noche</Form.Label>
                            <Form.Control
                                type="time"
                                value={cambio_turno_2}
                                onChange={(e) => setCambioTurno2(e.target.value)}
                                style={{ width: "300px" }}
                            />
                            </Form.Group>
                        </Col>
                        </Row>
                    </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                <Button variant="secondary" onClick={handleCerrar}>
                    Cancelar
                    </Button>
                    <Button variant="primary" onClick={modificarDia}>
                    Guardar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ModalModificarHorario;