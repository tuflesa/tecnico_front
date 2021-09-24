import React, {useEffect, useState} from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ProveedorFiltro from './rep_proveedores_filtro';


const RepProveedoresLista = () => {
    const [token] = useCookies(['tec-token']);

    const [filtro, setFiltro] = useState('');
    const [proveedores, setProveedores] = useState(null);
    const [show, setShow] = useState(false);
    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/proveedor/` + filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            console.log(res.data); 
            setProveedores(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro]);

     const actualizaFiltro = str => {
        setFiltro(str);
    } 

     const handlerBorrar = () => {
        setShow(true);
    }

    const handlerClose = () => {
        setShow(false);
    } 

    return (
        <Container>
            <Row className="justify-content-center">
                <ProveedorFiltro actualizaFiltro={actualizaFiltro} />
            </Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Proveedores</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Dirección</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proveedores && proveedores.map( proveedor => {
                                return (
                                    <tr key={proveedor.id}>
                                        <td>{proveedor.nombre}</td>
                                        <td>{proveedor.telefono}</td>
                                        <td>{proveedor.direccion}</td>
                                        <td>
                                            <Link to={`/repuestos/proveedor/${proveedor.id}`}>
                                                <PencilFill className="mr-3 pencil"/>
                                            </Link>
                                            <Trash className="trash"  onClick={handlerBorrar} />
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Modal show={show} onHide={handlerClose} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Borrar Proveedor no permitido ...</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>Por favor pongase en contacto con el administrador de la base de datos para borrar el proveedor.</p>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handlerClose}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}

export default RepProveedoresLista;