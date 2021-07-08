import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const RepLista = () => {
    const [token] = useCookies(['tec-token']);
    const [repuestos, setRepuestos] = useState(null);
    const [show, setShow] = useState(false);
    const [repuestoBorrar, setRepuestoBorrar] = useState(null);

    useEffect(()=>{
            axios.get(BACKEND_SERVER + '/api/repuestos/lista',{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }
            })
            .then( res => {
                setRepuestos(res.data);
            })
            .catch( err => {
                console.log(err);
            });
        }, [token]);

        const handleClose = () => setShow(false);

        const handleTrashClick = (repuesto) => {
            setShow(true);
            setRepuestoBorrar(repuesto);
        }

        const borrarRepuesto = () => {
            // console.log(repuestoBorrar);
            axios.delete(BACKEND_SERVER + `/api/repuestos/lista/${repuestoBorrar.id}/`, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }
                })
                .then(res => {
                    const repuestosActual = repuestos.filter(repuesto => repuesto.id !== repuestoBorrar.id);
                    setRepuestos(repuestosActual);
                    setShow(false);
                    setRepuestoBorrar(null);
                })
                .catch(err => {console.log(err);})
        }

    return (
        <Container>
            <Row>
                <Col>
                    <h5>Filtro</h5>
                </Col>
            </ Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Repuestos</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Fabricante</th>
                                <th>Modelo</th>
                                {/* <th>Stock</th> */}
                                <th>Crítico</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {repuestos && repuestos.map( repuesto => {
                                return (
                                    <tr key={repuesto.id}>
                                        <td>{repuesto.nombre}</td>
                                        <td>{repuesto.fabricante}</td>
                                        <td>{repuesto.modelo}</td>
                                        {/* <td>{repuesto.stock}</td> */}
                                        <td>{repuesto.es_critico ? 'Si' : 'No'}</td>
                                        <td>
                                            <Link to={`/repuestos/${repuesto.id}`}>
                                                <PencilFill className="mr-3 pencil"/>
                                            </Link>
                                            <Trash className="trash"  onClick={event => {handleTrashClick(repuesto)}} />
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Borrar</Modal.Title>
                </Modal.Header>
                <Modal.Body>Está a punto de borrar el repuesto: <strong>{repuestoBorrar && repuestoBorrar.nombre}</strong></Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={borrarRepuesto}>
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

export default RepLista;