import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import EstEquipoFiltro from './est_equipo_filtro';


const EstEquipoLista = () => {
    const [token] = useCookies(['tec-token']);

    const [equipos, setEquipos] = useState([]);
    const [equipoBorrar, setEquipoBorrar] = useState(null);
    const [show, setShow] = useState(false);
    const [user] = useCookies(['tec-user']);
    const [filtro, setFiltro] = useState({empresa: user['tec-user'].perfil.empresa.id});

    const actualizaFiltro = str => {
        setFiltro(str);
    }

    useEffect(()=>{
        axios.get(BACKEND_SERVER + '/api/estructura/equipo/' + filtro, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then(res => {
            // console.log(res.data);
            setEquipos(res.data);
        })
    },[token, filtro]);

    const handleTrashClick = (equipo) => {
        console.log(equipo.nombre);
        setEquipoBorrar(equipo);
        setShow(true);
    }

    const handleClose = () => setShow(false);

    const borrarEquipo = () => {
        console.log('Borrar ' + equipoBorrar.nombre);
        axios.delete(BACKEND_SERVER + `/api/estructura/equipo/${equipoBorrar.id}/`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
            })
            .then(res => {
                // console.log(res);
                // Actualiza la lista de empresas
                const equiposActual = equipos.filter(equipo => equipo.id !== equipoBorrar.id);
                setEquipos(equiposActual);
                setShow(false);
                setEquipoBorrar(null);
            })
            .catch(err => {console.log(err);})
    }

    return ( 
        <Container>
            <Row>
                <Col xs="12" sm="4">
                    <EstEquipoFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de equipos</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                            <th>Zona</th>
                            <th>Seccion</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipos && equipos.map( equipo => {
                                return (
                                    <tr key={equipo.id}>
                                        <td>{equipo.siglas_zona}</td>
                                        <td>{equipo.seccion_nombre}</td>
                                        <td>{equipo.nombre}</td>
                                        <td>
                                            <Link to={`/estructura/equipo/${equipo.id}`}>
                                                <PencilFill className="mr-3 pencil"/>
                                            </Link>
                                            <Trash className="trash" onClick={event => {handleTrashClick(equipo)}}/>
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={ false }>
                <Modal.Header closeButton>
                    <Modal.Title>Borrar</Modal.Title>
                </Modal.Header>
                <Modal.Body>Está a punto de borrar el equipo: <strong>{equipoBorrar && equipoBorrar.nombre}</strong></Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={borrarEquipo}>
                        Borrar
                    </Button>
                    <Button variant="waring" onClick={handleClose}>
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
     );
}
 
export default EstEquipoLista;