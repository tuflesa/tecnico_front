import React , { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Table, Modal, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Trash, PencilFill, Truck, DoorClosed } from 'react-bootstrap-icons';
import CargasFiltro from './cargas_carga_filtro';
import useInterval from '../utilidades/use_interval';

const CargasLista = () => {
    const [token] = useCookies(['tec-token']);
    const [cargas, setCargas] = useState([]);
    const [filtro, setFiltro] = useState(null);
    const [show, setShow] = useState(false);
    const [showPuerta, setShowPuerta] = useState(false);
    const [carga, setCarga] = useState(null);

    const actualiza_lista = ()=> {
        // console.log('actualiza lista');
        //console.log(BACKEND_SERVER + '/api/cargas/cargas/' + filtro);
        filtro && axios.get(BACKEND_SERVER + '/api/cargas/lista/' + filtro, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then(res => {
            console.log(res.data);
            setCargas(res.data);
        })
    }

    useInterval(actualiza_lista,10000);

    useEffect(()=>{
        filtro && axios.get(BACKEND_SERVER + '/api/cargas/lista/' + filtro, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then(res => {
            console.log(res.data);
            setCargas(res.data);
        })
    },[token, filtro]);

    const actualizaFiltro = str => {
        setFiltro(str);
    }

    const handleTrashClick = (carga) => {
        // console.log(carga);
        setShow(true);
        setCarga(carga);
    }

    const handleGateClick = (carga) => {
        setShowPuerta(true);
        setCarga(carga);
    }

    const handleClose = () => setShow(false);
    const handleClosePuerta = () => setShowPuerta(false);

    const borrarCarga = () => {
        // console.log('Borrar ' + carga.remolque);
        axios.delete(BACKEND_SERVER + `/api/cargas/carga/${carga.id}/`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
            })
            .then(res => {
                const cargasActual = cargas.filter(carga => carga.id !== carga.id);
                setCargas(cargasActual);
                setShow(false);
                setCarga(null);
            })
            .catch(err => {console.log(err);})
    }

    const guardarPuerta = () => {
        axios.patch(BACKEND_SERVER + `/api/cargas/carga/${carga.id}/`,
            {puerta: Number(carga.puerta)},
            {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
            })
            .then(res => {
                setShowPuerta(false);
                //setCarga(null);
                actualiza_lista();
            })
            .catch(err => {console.log(err);})

        axios.post(BACKEND_SERVER + `/api/cargas/llamada/`,
            {   carga: carga.id,
                puerta: Number(carga.puerta)},
            {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
            })
            .then(res => {
                console.log(res.data);
            })
            .catch(err => {console.log(err);})
    }

    const handleInputChange = (event) => {
        setCarga({
            ...carga,
            [event.target.name] : event.target.value
        })
    }

    return (
        <Container >
            <Row className="justify-content-center">
                    <CargasFiltro actualizaFiltro={actualizaFiltro} />
            </Row>
            <Row>
                <h5>Lista de cargas</h5>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Empresa</th>
                            <th>Entrada</th>
                            <th>Hora</th>
                            <th>Matricula</th>
                            <th>Remolque</th>
                            <th>Agencia</th>
                            <th>Teléfono</th>
                            <th>Destino</th>
                            <th>Tara</th>
                            <th>Bruto</th>
                            <th>Neto</th>
                            <th>Salida</th>
                            <th>Puerta</th>
                            <th>Observaciones</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargas && cargas.map( carga => {
                            return (
                                <tr key={carga.id}>
                                    <td>{carga.empresa.nombre}</td>
                                    <td>{carga.fecha_entrada}</td>
                                    <td>{carga.hora_entrada}</td>
                                    <td>{carga.matricula}</td>
                                    <td>{carga.remolque}</td>
                                    <td>{carga.agencia && carga.agencia.nombre}</td>
                                    <td>{carga.telefono}</td>
                                    <td>{carga.destino}</td>
                                    <td>{carga.tara}</td>
                                    <td>{carga.bruto}</td>
                                    <td>{parseInt(carga.bruto)>parseInt(carga.tara) ? carga.bruto - carga.tara : null}</td>
                                    <td>{carga.fecha_salida}</td>
                                    <td>{carga.puerta}</td>
                                    <td>{carga.observaciones}</td>
                                    <td>
                                        <Link to={`/cargas/detalle/${carga.id}`}>
                                            <Truck className="mr-2 pencil"/>
                                        </Link>
                                        <Link to={`/cargas/editar/${carga.id}`}>
                                            <PencilFill className="mr-2 pencil"/>
                                        </Link>
                                        <DoorClosed className="trash" onClick={event => {handleGateClick(carga)}} />
                                        <Trash className="trash" onClick={event => {handleTrashClick(carga)}} />
                                    </td>
                                </tr>
                            )})
                        }
                    </tbody>
                </Table>
            </Row>

            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={ false }>
                <Modal.Header closeButton>
                    <Modal.Title>Borrar</Modal.Title>
                </Modal.Header>
                <Modal.Body>Está a punto de borrar la carga: <strong>{carga && carga.remolque}</strong></Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={borrarCarga}>
                        Borrar
                    </Button>
                    <Button variant="waring" onClick={handleClose}>
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showPuerta} onHide={null} backdrop="static" keyboard={ false }>
                <Modal.Header closeButton>
                    <Modal.Title>Asignar puerta de carga</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>Matrícula {carga&&carga.matricula} </h4>
                    <Form>
                        <Form.Group controlId="Puerta">
                            <Form.Label>Puerta nº</Form.Label>
                            <Form.Control type="text" 
                                        name='puerta' 
                                        value={carga&&carga.puerta}
                                        onChange={handleInputChange}
                                        />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={guardarPuerta}>
                        Guardar
                    </Button>
                    <Button variant="waring" onClick={handleClosePuerta}>
                        Cancelar
                    </Button>
                </Modal.Footer>
                
            </Modal>
        </Container>
    )
}

export default CargasLista;