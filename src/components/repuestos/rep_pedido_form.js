import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { PlusCircle, PencilFill, Trash } from 'react-bootstrap-icons';
import LineaForm from './rep_pedido_linea';
import { Link } from 'react-router-dom';
import { now } from 'd3-timer';

const PedidoForm = ({pedido, setPedido}) => {
    const [token] = useCookies(['tec-token']);
    const [show_linea, setShowLinea] = useState(false);
    const [empresas, setEmpresas] = useState(null);
    const [user] = useCookies(['tec-user']);
    const [hoy] = useState(new Date);
    
    const [datos, setDatos] = useState({
        id: pedido.id ? pedido.id : null,
        proveedor: pedido ? pedido.proveedor.id : null,
        empresa: pedido ? pedido.empresa : user['tec-user'].perfil.empresa.id,
        numero: pedido ? pedido.numero : '',
        fecha_creacion: pedido ? pedido.fecha_creacion : (hoy.getFullYear() + '-'+(hoy.getMonth()+1)+'-'+hoy.getDate()),
        fecha_cierre: pedido ? pedido.fecha_entrega : '',
        finalizado: pedido ? pedido.finalizado : false,
        lineas_pedido: pedido.lineas_pedido ? pedido.lineas_pedido : null
    }); 
    
    const [proveedores, setProveedores]= useState(null);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleFinalizado = (event) => {
        setDatos({
            ...datos,
            finalizado : !datos.finalizado
        })
    }

    const abrirAddLinea =() =>{
        setShowLinea(true);
    }

    const cerrarAddLinea =() =>{
        setShowLinea(false);
    }

    const handleDisabled = () => {
        return user['tec-user'].perfil.nivel_acceso.nombre === 'local'
    }

    const crearPedido = (event) => {
        event.preventDefault();
        console.log('que entra en crear pedido????....');
        console.log(datos);
        axios.post(BACKEND_SERVER + `/api/repuestos/pedido/`, {
            proveedor: datos.proveedor,
            empresa: datos.empresa,
            fecha_cierre: datos.fecha_cierre,
            fecha_creacion: datos.fecha_creacion,
            finalizado: datos.finalizado
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setDatos(res.data);
            console.log(res);
        })
        .catch(err => { console.log(err);})
    }

    const actualizarDatos = (event) => {
        event.preventDefault();
        axios.put(BACKEND_SERVER + `/api/repuestos/pedido_detalle/${pedido.id}/`, {
            proveedor: datos.proveedor,
            empresa: datos.empresa,
            fecha_cierre: datos.fecha_cierre,
            fecha_creacion: datos.fecha_creacion,
            finalizado: datos.finalizado
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setPedido(res.data);
            window.location.href = "/repuestos/pedidos";
        })
        .catch(err => { console.log(err);})

    }

    const updateLinea = () => {
        axios.get(BACKEND_SERVER + `/api/repuestos/pedido_detalle/${pedido.id}/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {  
            setPedido(res.data); 
        })
        .catch(err => { console.log(err);})
    }

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/proveedor/`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setProveedores(res.data);
        })
        .catch(err => { console.log(err);})
    },[token]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(()=>{
        // console.log('Cambio en repuesto, actualizando datos ...');
        setDatos({
        proveedor: pedido ? pedido.proveedor.id : null,
        empresa: pedido ? pedido.empresa : user['tec-user'].perfil.empresa.id,
        numero: pedido ? pedido.numero : '',
        fecha_creacion: pedido ? pedido.fecha_creacion : (hoy.getFullYear() + '-'+(hoy.getMonth()+1)+'-'+hoy.getDate()),
        fecha_cierre: pedido ? pedido.fecha_entrega : '',
        finalizado: pedido ? pedido.finalizado : false,
        lineas_pedido: pedido.lineas_pedido ? pedido.lineas_pedido : null
        });
            //console.log(datos);
    },[pedido]);

    return (
        <Container>
            <Row className="justify-content-center"> 
            {pedido.id ?
                <h5 className="pb-3 pt-1 mt-2">Pedido Detalle</h5>:
                <h5 className="pb-3 pt-1 mt-2">Nuevo Pedido</h5>}
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <h5 className="pb-3 pt-1 mt-2">Datos básicos:</h5>
                    <Form >
                        <Row>
                        {pedido.id ?
                            <React.Fragment>
                            <Col>
                                <Form.Group controlId="proveedor">
                                    <Form.Label>Proveedor</Form.Label>
                                    <Form.Control type="text"  
                                                name='proveedor' 
                                                value={pedido.proveedor.nombre}>  
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="empresa">
                                    <Form.Label>Empresa</Form.Label>
                                    <Form.Control type="text" 
                                                name='empresa' 
                                                value={datos.empresa.nombre}/>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="numero">
                                    <Form.Label>Numero Pedido</Form.Label>
                                    <Form.Control type="text" 
                                                name='numero' 
                                                value={datos.numero}/>
                                </Form.Group>
                            </Col>
                            </React.Fragment>
                            :
                            <React.Fragment>     
                                <Col>
                                    <Form.Group controlId="proveedor">
                                        <Form.Label>Proveedor</Form.Label>
                                        <Form.Control as="select"  
                                                    name='proveedor' 
                                                    value={datos.proveedor}
                                                    onChange={handleInputChange}
                                                    placeholder="Elige Proveedor">
                                                    {proveedores && proveedores.map( proveedor => {
                                                        return (
                                                        <option key={proveedor.id} value={proveedor.id}>
                                                            {proveedor.nombre}
                                                        </option>
                                                        )
                                                    })}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>                            
                                <Col>
                                    <Form.Group controlId="empresa">
                                        <Form.Label>Empresa</Form.Label>
                                        <Form.Control as="select"  
                                                    name='empresa' 
                                                    value={datos.empresa}
                                                    onChange={handleInputChange}
                                                    disabled={handleDisabled()}
                                                    placeholder="Empresa">
                                                    <option key={0} value={''}>Todas</option>    
                                                    {empresas && empresas.map( empresa => {
                                                        return (
                                                        <option key={empresa.id} value={empresa.id}>
                                                            {empresa.nombre}
                                                        </option>
                                                        )
                                                    })}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group controlId="numero">
                                        <Form.Label>Numero Pedido</Form.Label>
                                        <Form.Control type="text" 
                                                    name='numero' 
                                                    value={datos.numero}/>
                                    </Form.Group>
                                </Col>
                            </React.Fragment> 
                            }                                                 
                            <Col>
                                <Form.Group controlId="fecha_creacion">
                                    <Form.Label>Fecha Creación</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_creacion' 
                                                value={datos.fecha_creacion}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha creación" />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="fecha_cierre">
                                    <Form.Label>Fecha Cierre</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_cierre' 
                                                value={datos.fecha_cierre}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha cierre" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3" controlId="finalizado">
                                    <Form.Check type="checkbox" 
                                                label="Finalizado"
                                                checked = {datos.finalizado}
                                                onChange = {handleFinalizado} />
                                </Form.Group>
                            </Col>
                        </Row>                        
                        <Form.Row className="justify-content-center">
                            {pedido.id ? 
                                <Button variant="info" type="submit" className={'mx-2'} onClick={actualizarDatos}>Actualizar</Button> :
                                <Button variant="info" type="submit" className={'mx-2'} onClick={crearPedido}>Guardar</Button>
                            }
                            <Link to='/repuestos/pedidos'>
                                <Button variant="warning" >
                                    Cancelar
                                </Button>
                            </Link>
                        </Form.Row> 
                        {datos.numero ? 
                        <React.Fragment>
                            <Form.Row>
                                <Col>
                                    <Row>
                                        <Col>
                                        <h5 className="pb-3 pt-1 mt-2">Lineas de pedido:</h5>
                                        </Col>
                                        <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                                <PlusCircle className="plus mr-2" size={30} onClick={abrirAddLinea}/>
                                        </Col>
                                    </Row>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>repuesto</th>
                                                <th>Cantidad</th>
                                                <th>Precio</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead> 
                                                                                  
                                        <tbody>
                                            {datos.lineas_pedido && datos.lineas_pedido.map( linea => {
                                                return (
                                                    <tr key={linea.id}>
                                                        <td>{linea.repuesto.nombre}</td>
                                                        <td>{linea.cantidad}</td>
                                                        <td>{linea.precio}</td>
                                                        <td>
                                                            <PencilFill className="mr-3 pencil"/>
                                                            {/* <Trash className="trash"  onClick={null} /> */}
                                                        </td>
                                                    </tr>
                                                )})
                                            }
                                        </tbody>
                                    </Table>                                     
                                </Col>
                            </Form.Row>                                                
                        </React.Fragment> 
                        : null}                       
                    </Form>
                </Col>
            </Row>    
            <LineaForm  show={show_linea}
                        pedido_id={pedido.id}
                        handleCloseLinea ={cerrarAddLinea}
                        proveedor_id={datos.proveedor}
                        updateLinea={updateLinea}
            />
        </Container>
    )
}

export default PedidoForm;