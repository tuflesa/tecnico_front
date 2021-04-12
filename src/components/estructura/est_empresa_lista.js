import React , { useEffect, useState } from 'react';
import './estructura.css';
import {Container, Row, Col, Modal, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import { BACKEND_SERVER } from '../../constantes';

const EstEmpresaLista = () => {
    const [empresas, setEmpresas] = useState([])
    const [token] = useCookies(['tec-token']);
    const [show, setShow] = useState(false);
    const [empresaBorrar, setEmpresaBorrar] = useState(null);

    const handleClose = () => setShow(false);

    const handleTrashClick = (emp) => {
        console.log(emp.siglas);
        setEmpresaBorrar(emp);
        setShow(true);
    }

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            //console.log(res.data);
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    const borrarEmpresa = () => {
        console.log('Borrar ' + empresaBorrar.nombre);
        axios.delete(BACKEND_SERVER + `/api/estructura/empresa/${empresaBorrar.id}/`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
            })
            .then(res => {
                // console.log(res);
                // Actualiza la lista de empresas
                const empresasActual = empresas.filter(emp => emp.id !== empresaBorrar.id);
                setEmpresas(empresasActual);
                setShow(false);
                setEmpresaBorrar(null);
            })
            .catch(err => {console.log(err);})
    }

    return (
        <Container className="mt-4" >
            <Row>
                <Col sm="12" lg="8">
                    <h4 className="mb-3">Lista de empresas</h4>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>Siglas</th>
                        <th>Nombre</th>
                        <th>Acciones</th>
                        </tr>
                    </thead>
                            <tbody>
                                {empresas && empresas.map( emp => {
                                    return (
                                        <tr key={emp.id}>
                                            <td>{emp.siglas}</td>
                                            <td>{emp.nombre}</td>
                                            <td>
                                                <Link to={`/estructura/empresa/${emp.id}`}>
                                                    <PencilFill className="mr-3 pencil"/>
                                                </Link>
                                                <Trash className="trash" onClick={event => {handleTrashClick(emp)}} />
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
                <Modal.Body>Está a punto de borrar la empresa: <strong>{empresaBorrar && empresaBorrar.nombre}</strong></Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={borrarEmpresa}>
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
 
export default EstEmpresaLista;