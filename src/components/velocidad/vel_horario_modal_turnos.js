import React, { useState, useEffect } from 'react';
import { Modal, Button, Container, Form } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const ModalTurnos = ({ zonaId, yearSeleccionado, mostrarModalTurnos, cerrarModalTurnos, turno_inicio, setTurnoInicio }) => {
    const [token] = useCookies(["tec-token"]);

    const hoy = new Date().toISOString().split("T")[0];
    const ultimoDiaAñoActual = new Date(
            new Date().getFullYear(),
            11, // diciembre (mes 11)
            31
            ).toISOString().split("T")[0];

    const [fecha_inicio_turnos, setFechaInicioTurnos] = useState(hoy);
    const año = yearSeleccionado || new Date().getFullYear();
    const [fecha_fin_turnos, setFechaFinTurnos] = useState(ultimoDiaAñoActual);
    const [numero_turnos, setNumeroTurnos] = useState('2');
    const [turnos, setTurnos] = useState(null);
    const [datos_dia, setDatosDia] = useState(null);
    const [hora_cambio_1, setHoraCambio_1] = useState("14:00");
    const [hora_cambio_2, setHoraCambio_2] = useState('');
    const [nombre_turno, setNombreTurno] = useState('');

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

    useEffect(() => {
        fecha_inicio_turnos && axios.get(BACKEND_SERVER + `/api/velocidad/horariodia/?zona=${zonaId}&fecha=${fecha_inicio_turnos}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setDatosDia(res.data);
            setTurnoInicio(res.data[0].turno_mañana);

        })
        .catch( err => {
            console.log(err);
        });    
    }, [token, fecha_inicio_turnos]);

    const ModificarTurnos = () => {
        // console.log('QUE DATOS NOS LLEGAN: ');
        // console.log('fecha_inicio_turnos', fecha_inicio_turnos);
        // console.log('fecha_fin_turnos', fecha_fin_turnos);
        console.log('turno_inicio', turno_inicio);
        console.log('Nombre turno: ', nombre_turno);
        // console.log('numTurnos', numTurnos);
        // console.log('zonaId', zonaId);
        // console.log('Hora del cambio: ', hora_cambio_1);
        // console.log('Hora del cambio_2: ', hora_cambio_2);

        const datos = {
            fecha_inicio_turnos,
            fecha_fin_turnos,
            turno_inicio,
            nombre_turno,
            numero_turnos,
            zonaId,
            hora_cambio_1,
            hora_cambio_2
        };

        axios.post(`${BACKEND_SERVER}/api/velocidad/crear_turnos/`,
                datos,
                {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            .then(res => {
                if (res.status === 200) {
                    console.log(res.data);
                }
            })
            .catch (err => {
                console.log(err)
            });
    }

    const handleInputChangeTurno = (e) => {
        const { value } = e.target;
        if (value) {
            const [id, nombre] = value.split('|');
            setTurnoInicio(id);
            setNombreTurno(nombre);
        };
    }

    return (
        <Container>
            <Modal show={mostrarModalTurnos} onHide={cerrarModalTurnos}>
                <Modal.Header closeButton>
                    <Modal.Title>Generar Turnos</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Fecha inicio</Form.Label>
                        <Form.Control
                            type="date"
                            value={fecha_inicio_turnos}
                            onChange={(e) => setFechaInicioTurnos(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Fecha fin</Form.Label>
                        <Form.Control
                            type="date"
                            value={fecha_fin_turnos}
                            onChange={(e) => setFechaFinTurnos(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="turno_noche">
                        <Form.Label>Turno de inicio</Form.Label>
                        <Form.Control
                            as="select"
                            name="turno_inicio"
                            value={`${turno_inicio}|${nombre_turno}`}
                            onChange={handleInputChangeTurno}
                            style={{ width: "200px" }}   // <-- opcional, para que no se expanda
                        >
                            <option value="">Selecciona una opción</option>
                            {turnos?.map((turno) => (
                            <option key={turno.id} value={`${turno.id}|${turno.turno}`}>
                                {turno.turno} - {turno?.maquinista?.get_full_name}
                            </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group>
                    <Form.Label>Selecciona el número de turnos</Form.Label>
                    <Form.Control
                        as="select"
                        value={numero_turnos}
                        onChange={(e) => setNumeroTurnos(e.target.value)}
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </Form.Control>
                    </Form.Group>
                    {numero_turnos!=='1'?
                        <Form.Group>
                        <Form.Label>Hora inicio del segundo turno</Form.Label>
                        <Form.Control
                            type="time"
                            value={hora_cambio_1}
                            onChange={(e) => setHoraCambio_1(e.target.value)}
                        />
                        </Form.Group>
                    :''}
                    
                    {numero_turnos==='3'?
                        <Form.Group>
                        <Form.Label>Hora inicio del tercer turno</Form.Label>
                            <Form.Control
                                type="time"
                                value={hora_cambio_2}
                                onChange={(e) => setHoraCambio_2(e.target.value)}
                            />
                        </Form.Group>
                    :''}
                    <p>zona_id {zonaId}</p>
                    <p>año {yearSeleccionado}</p>
                    <p>Mostramos los datos para el generar nuevos turnos</p>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={cerrarModalTurnos}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={ModificarTurnos}>
                        Modificar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ModalTurnos;