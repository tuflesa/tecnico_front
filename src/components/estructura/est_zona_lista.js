import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import EstZonaFiltro from './est_zona_filtro';

const EstZonaLista = () => {
    const [token] = useCookies(['tec-token']);
    const [zonas, setZonas] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [show, setShow] = useState(false);
    const [zonaBorrar, setZonaBorrar] = useState(null);

    const actualizaFiltro = str => {
        setFiltro(str);
    }

    useEffect(()=>{
        axios.get(BACKEND_SERVER + '/api/estructura/zona/' + filtro, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then(res => {
            // console.log(res.data);
            setZonas(res.data);
        })
    },[token, filtro]);

    const handleTrashClick = (zona) => {
        console.log(zona.siglas);
        setZonaBorrar(zona);
        setShow(true);
    }

    const handleClose = () => setShow(false);

    const borrarZona = () => {
        console.log('Borrar ' + zonaBorrar.nombre);
        axios.delete(BACKEND_SERVER + `/api/estructura/zona/${zonaBorrar.id}/`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
            })
            .then(res => {
                // console.log(res);
                // Actualiza la lista de empresas
                const zonasActual = zonas.filter(zona => zona.id !== zonaBorrar.id);
                setZonas(zonasActual);
                setShow(false);
                setZonaBorrar(null);
            })
            .catch(err => {console.log(err);})
    }

    return ( 
        <Container>
            <Row>
                <Col xs="12" sm="4">
                    <EstZonaFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de zonas</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                            <th>Siglas</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zonas && zonas.map( zona => {
                                return (
                                    <tr key={zona.id}>
                                        <td>{zona.siglas}</td>
                                        <td>{zona.nombre}</td>
                                        <td>
                                            <Link to={`/estructura/zona/${zona.id}`}>
                                                <PencilFill className="mr-3 pencil"/>
                                            </Link>
                                            <Trash className="trash"  onClick={event => {handleTrashClick(zona)}} />
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
                <Modal.Body>Está a punto de borrar la zona: <strong>{zonaBorrar && zonaBorrar.nombre}</strong></Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={borrarZona}>
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
 
export default EstZonaLista;