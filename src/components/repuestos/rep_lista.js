import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import RepListaFilto from './rep_lista_filtro';

const RepLista = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [repuestos, setRepuestos] = useState(null);
    const [show, setShow] = useState(false);
    const [repuestoBorrar, setRepuestoBorrar] = useState(null);
    const [filtro, setFiltro] = useState(`?equipos__seccion__zona__empresa__id=${user['tec-user'].perfil.empresa.id}&&descatalogado=${false}`);

    const actualizaFiltro = str => {
        // console.log(str);
        setFiltro(str);
    }

    useEffect(()=>{
        if (!show){
            axios.get(BACKEND_SERVER + '/api/repuestos/lista/' + filtro,{
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
        }
    }, [token, filtro, show]);

    const handleClose = () => setShow(false);

    const handleTrashClick = (repuesto) => {
        setShow(true);
        setRepuestoBorrar(repuesto);
    }

    const borrarRepuesto = () => {
        // console.log(repuestoBorrar);
        axios.patch(BACKEND_SERVER + `/api/repuestos/lista/${repuestoBorrar.id}/`,{
            descatalogado: true
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
            })
            .then(res => {
                // const repuestosActual = repuestos.filter(repuesto => repuesto.id !== repuestoBorrar.id);
                // setRepuestos(repuestosActual);
                // console.log(res.data);
                setShow(false);
                setRepuestoBorrar(null);
            })
            .catch(err => {console.log(err);})
    }

    return (
        <Container>
            <Row>
                <Col>
                    <RepListaFilto actualizaFiltro={actualizaFiltro}/>
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
                                <th>Descatalogado</th>
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
                                        <td>{repuesto.descatalogado ? 'Si' : 'No'}</td>
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
                    <Modal.Title>Descatalogar</Modal.Title>
                </Modal.Header>
                <Modal.Body>Está a punto de descatalogar el repuesto: <strong>{repuestoBorrar && repuestoBorrar.nombre}</strong></Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={borrarRepuesto}>
                        Descatalogar
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