import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { PlusCircle, Trash, PencilFill } from 'react-bootstrap-icons';
import ContactoForm from './rep_contacto';

const RepProveedorForm = ({proveedor}) => {
    const [token] = useCookies(['tec-token']);
    const [show_contacto, setShowContacto] = useState(false);
    const [contactoEditar, setContactoEditar]=useState(null);
    const [newProveedor, setNewProveedor]=useState(null);
    
    const [datos, setDatos] = useState({     
        nombre: proveedor.nombre,
        cif: proveedor.cif,
        direccion: proveedor.direccion,
        poblacion: proveedor.poblacion,
        pais: proveedor.pais? proveedor.pais:'España',
        telefono: proveedor.telefono,
        contactos: proveedor.contactos ? proveedor.contactos : null,
        condicion_pago: proveedor.condicion_pago? proveedor.condicion_pago : '',
        condicion_entrega: proveedor.condicion_entrega? proveedor.condicion_entrega : '',
        cod_ekon: proveedor.cod_ekon,
    });

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value           
        });
    }

    const actualizarDatos = (event) => {
        event.preventDefault()       
        axios.patch(BACKEND_SERVER + `/api/repuestos/proveedor/${proveedor.id}/`, {
            nombre: datos.nombre,
            cif: datos.cif,
            direccion: datos.direccion,
            poblacion: datos.poblacion,
            pais: datos.pais,
            telefono: datos.telefono,
            condicion_entrega: datos.condicion_entrega,
            condicion_pago: datos.condicion_pago,
            cod_ekon: datos.cod_ekon,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            alert('Proveedor actualizado.');
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
            cif: datos.cif,
            direccion: datos.direccion,
            poblacion: datos.poblacion,
            pais: datos.pais,
            telefono: datos.telefono,
            condicion_entrega: datos.condicion_entrega,
            condicion_pago: datos.condicion_pago,
            cod_ekon: datos.cod_ekon,
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
                            <Col>
                                <Form.Group controlId="cif">
                                    <Form.Label>CIF</Form.Label>
                                    <Form.Control type="text" 
                                                name='cif' 
                                                value={datos.cif}
                                                onChange={handleInputChange} 
                                                placeholder="CIF"
                                    />
                                    </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="cod_ekon">
                                    <Form.Label>COD EKON</Form.Label>
                                    <Form.Control type="text" 
                                                name='cod_ekon' 
                                                value={datos.cod_ekon}
                                                onChange={handleInputChange} 
                                                placeholder="COD EKON"
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
                            <Col>
                                <Form.Group controlId="poblacion">
                                    <Form.Label>Población</Form.Label>
                                    <Form.Control type="text" 
                                                name='poblacion' 
                                                value={datos.poblacion}
                                                onChange={handleInputChange} 
                                                placeholder="Población"
                                    />
                                    </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="pais">
                                    <Form.Label>Pais</Form.Label>
                                    <Form.Control type="text" 
                                                name='pais' 
                                                value={datos.pais}
                                                onChange={handleInputChange} 
                                                placeholder="Pais"
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
                        <Row>
                            <Col>
                                <Form.Group controlId="condicion_pago">
                                    <Form.Label>Condición de Pago: </Form.Label>
                                    <Form.Control as="textarea"
                                                rows={1}
                                                name='condicion_pago' 
                                                value={datos.condicion_pago}
                                                onChange={handleInputChange} 
                                                placeholder="Condición de pago"
                                    />
                                    </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="condicion_entrega">
                                    <Form.Label>Condición de Entrega: Según Icoterm 2020 </Form.Label>
                                    <Form.Control type="text" 
                                                name='condicion_entrega' 
                                                value={datos.condicion_entrega}
                                                onChange={handleInputChange} 
                                                placeholder="Condición de entrega"
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