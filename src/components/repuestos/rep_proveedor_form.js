import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { PlusCircle, Trash, PencilFill } from 'react-bootstrap-icons';
import ContactoForm from './rep_contacto';

const RepProveedorForm = ({proveedor}) => {
    const [token] = useCookies(['tec-token']);
    const [show_contacto, setShowContacto] = useState(false);
    const [contactoEditar, setContactoEditar]=useState(null);
    const [newProveedor, setNewProveedor]=useState(null);
    
    const [datos, setDatos] = useState({     
        nombre: proveedor.nombre,
        direccion: proveedor.direccion,
        telefono: proveedor.telefono,
        contactos: proveedor.contactos ? proveedor.contactos : null
    });

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value           
        });
    }

    const actualizarDatos = (event) => {
        event.preventDefault()       
        axios.put(BACKEND_SERVER + `/api/repuestos/proveedor/${proveedor.id}/`, {
            nombre: datos.nombre,
            direccion: datos.direccion,
            telefono: datos.telefono,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            window.location.href = "/repuestos/proveedores/";
        })
        .catch(err => { console.log(err);})
        
    }
    const updateProveedorCont = () => {
        axios.get(BACKEND_SERVER + `/api/repuestos/proveedor_detalle/${proveedor.id}/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setDatos(res.data);
        })
        .catch(err => { console.log(err);})
    }

    const nuevoDatos = (event) => {
        event.preventDefault()
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
            setNewProveedor(res.data);
            window.location.href = `/repuestos/proveedor/${res.data.id}`;
           // window.location.href = "/repuestos/proveedores";
        })
        .catch(err => { console.log(err);})
        
    }
    const abrirAddContacto =() =>{
        setShowContacto(true);
    }
    const cerrarAddContacto =() =>{
        setShowContacto(false);
    }
    const BorrarContacto = (id) =>{
        axios.delete(BACKEND_SERVER + `/api/repuestos/contacto/${id}/`,{            
            headers: {
                'Authorization': `token ${token['tec-token']}`
            } 
        })
        .then(res =>{
            updateProveedorCont();
        })
        .catch (err=>{console.log((err));});
    }
    const RecogerContacto = (id) =>{        
        const contacto_editar = datos.contactos.filter(c => c.id === id)[0];
        setContactoEditar(contacto_editar);
        setShowContacto(true);
    }
    const AnularContacto =()=>{
        setContactoEditar(null);
    } 

    return (
        <Container className="mt-5">
            <Row className="justify-content-center"> 
            {proveedor.id?
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
                                                autoFocus
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
                        <Form.Row className="justify-content-center">                
                            {proveedor.id?
                                <Button variant="info" type="submit" className={'mr-1'} onClick={actualizarDatos}>Actualizar</Button> :
                                <Button variant="info" type="submit" className={'mr-1'} onClick={nuevoDatos}>Guardar</Button>
                            }    
                            <Button variant="info" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>                   
                            {/* <Link to='/repuestos/proveedores'>
                                <Button variant="warning" className={'ml-1'} >
                                    Cancelar
                                </Button>
                            </Link> */}
                        </Form.Row>
                        {datos.contactos ?
                            <React.Fragment>
                                <Form.Row>
                                    <Col>
                                        <Row>
                                            <Col>
                                            <h5 className="pb-3 pt-1 mt-2"> Contactos:</h5>
                                            </Col>
                                            <Col className="d-flex flex-row-reverse align-content-center flex-wrap"> 
                                                <PlusCircle className="plus mr-2" size={30} onClick={abrirAddContacto}/>
                                            </Col>
                                        </Row>
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Nombre</th>
                                                    <th>Departamento</th>
                                                    <th>Teléfono</th>
                                                    <th>Email</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {datos.contactos && datos.contactos.map( contacto => {
                                                    return (
                                                        <tr key={contacto.id}>
                                                            <td>{contacto.nombre}</td>
                                                            <td>{contacto.departamento}</td>
                                                            <td>{contacto.telefono}</td>
                                                            <td>{contacto.correo_electronico}</td>
                                                            <td>                                                                
                                                                <PencilFill className="mr-3 pencil" onClick={event => {RecogerContacto(contacto.id)}}/>                                                              
                                                                <Trash className="trash"  onClick={event => {BorrarContacto(contacto.id)}}/>
                                                            </td>
                                                        </tr>
                                                    )})
                                                }
                                            </tbody>
                                        </Table>                                        
                                    </Col>
                                </Form.Row>
                            </React.Fragment>
                        :null}
                    </Form>
                </Col>
            </Row>
            <ContactoForm show={show_contacto}
                            proveedor_id={proveedor.id}
                            handleCloseContacto ={cerrarAddContacto}
                            updateProveedorCont ={updateProveedorCont}
                            contacto = {contactoEditar}
                            AnularContacto={AnularContacto}

            />
        </Container>
    )
}

export default RepProveedorForm;