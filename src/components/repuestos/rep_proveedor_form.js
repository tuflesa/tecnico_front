import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';

const RepProveedorForm = ({nombre, direccion, telefono, proveedor_id}) => {
    const [token] = useCookies(['tec-token']);

    const [datos, setDatos] = useState({
        proveedor_id: proveedor_id,
        nombre: nombre,
        direccion: direccion,
        telefono: telefono
    });

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value           
        });
    }
    const actualizarDatos = (event) => {
        event.preventDefault()
        console.log('Actualizar datos...' + proveedor_id + ' ' + datos.nombre + ' ' + datos.telefono + ' ' + datos.direccion);

        axios.put(BACKEND_SERVER + `/api/repuestos/proveedor/${proveedor_id}/`, {
            nombre: datos.nombre,
            direccion: datos.direccion,
            telefono: datos.telefono,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            console.log('esto es res' + res);
            window.location.href = "/repuestos/proveedores/";
        })
        .catch(err => { console.log(err);})
        
    }
    const nuevoDatos = (event) => {
        event.preventDefault()
        console.log('Nuevo datos...' + proveedor_id + ' ' + datos.nombre + ' ' + datos.telefono + ' ' + datos.direccion);

        axios.post(BACKEND_SERVER + `/api/repuestos/proveedor/`, {
            nombre: datos.nombre,
            direccion: datos.direccion,
            telefono: datos.telefono,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            console.log(res);
            window.location.href = "/repuestos/proveedores";
        })
        .catch(err => { console.log(err);})
        
    }


    return (
        <Container>
            <Row className="justify-content-center"> 
            {proveedor_id ?
                <h5 className="pb-3 pt-1 mt-2">proveedor Detalle</h5>:
                <h5 className="pb-3 pt-1 mt-2">Nuevo Proveedor</h5>}
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <Form >
                    <Row>
                        <Col>
                            <Form.Group controlId="nombre">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control type="text" 
                                            name='nombre' 
                                            value={datos.nombre}
                                            onChange={handleInputChange} 
                                            placeholder="Nombre"
                                />
                                </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="direccion">
                                <Form.Label>Dirección</Form.Label>
                                <Form.Control type="text" 
                                            name='direccion' 
                                            value={datos.direccion}
                                            onChange={handleInputChange} 
                                            placeholder="Direccion"
                                />
                                </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="telefono">
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control type="text" 
                                            name='telefono' 
                                            value={datos.telefono}
                                            onChange={handleInputChange} 
                                            placeholder="Telefono"
                                />
                                </Form.Group>
                        </Col>
                    </Row>
                    </Form>
                </Col>
            </Row>
            <Form.Row className="justify-content-center">                
                {proveedor_id ?
                    <Button variant="info" type="submit" className={'mr-1'} onClick={actualizarDatos}>Actualizar</Button> :
                    <Button variant="info" type="submit" className={'mr-1'} onClick={nuevoDatos}>Guardar</Button>
                }                       
                <Link to='/repuestos/proveedores'>
                    <Button variant="warning" className={'ml-1'} >
                        Cancelar
                    </Button>
                </Link>
            </Form.Row>
        </Container>
    )
}

export default RepProveedorForm;