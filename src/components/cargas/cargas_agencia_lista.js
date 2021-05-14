import React , { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Table, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import AgenciaFiltro from './cargas_agencia_filtro';

const AgenciaLista = () => {
    const [token] = useCookies(['tec-token']);
    const [agencias, setAgencias] = useState([]);
    const [filtro, setFiltro] = useState(null);
    const [show, setShow] = useState(false);
    const [agenciaBorrar, setAgenciaBorrar] = useState(null);

    useEffect(()=>{
        filtro && axios.get(BACKEND_SERVER + '/api/cargas/agencia/' + filtro, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then(res => {
            console.log(res.data);
            setAgencias(res.data);
        })
    },[token, filtro]);

    const actualizaFiltro = str => {
        setFiltro(str);
    }

    const handleTrashClick = (carga) => {
        console.log(carga);
        setShow(true);
        setAgenciaBorrar(carga);
    }

    const handleClose = () => setShow(false);

    const borrarCarga = () => {
        console.log('Borrar ' + agenciaBorrar.nombre);
        axios.delete(BACKEND_SERVER + `/api/cargas/agencia/${agenciaBorrar.id}/`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
            })
            .then(res => {
                // console.log(res);
                // Actualiza la lista de empresas
                const agenciasActual = agencias.filter(agencia => agencia.id !== agenciaBorrar.id);
                setAgencias(agenciasActual);
                setShow(false);
                setAgenciaBorrar(null);
            })
            .catch(err => {console.log(err);})
    }

    return (
        <Container>
            <Row className="justify-content-center">
                    <AgenciaFiltro actualizaFiltro={actualizaFiltro} />
            </Row>
            <Row>
                <h5>Lista de agencias</h5>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Teléfono</th>
                            <th>Persona de contacto</th>
                            <th>Observaciones</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agencias && agencias.map( agencia => {
                            return (
                                <tr key={agencia.id}>
                                    <td>{agencia.nombre}</td>
                                    <td>{agencia.telefono}</td>
                                    <td>{agencia.contacto}</td>
                                    <td>{agencia.observaciones}</td>
                                    <td>
                                        <Link to={`/cargas/agencia/${agencia.id}`}>
                                            <PencilFill className="mr-3 pencil"/>
                                        </Link>
                                        <Trash className="trash" onClick={event => {handleTrashClick(agencia)}} />
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
                <Modal.Body>Está a punto de borrar la agencia: <strong>{agenciaBorrar && agenciaBorrar.nombre}</strong></Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={borrarCarga}>
                        Borrar
                    </Button>
                    <Button variant="waring" onClick={handleClose}>
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}

export default AgenciaLista;