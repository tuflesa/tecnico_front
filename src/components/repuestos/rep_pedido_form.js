import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { PlusCircle, PencilFill, Trash, Truck } from 'react-bootstrap-icons';
import LineaForm from './rep_pedido_linea';
import MovimientoForm from './rep_pedido_movimiento';
import { Link } from 'react-router-dom';
import { now } from 'd3-timer';

const PedidoForm = ({pedido, setPedido}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [show_linea, setShowLinea] = useState(false);
    const [show_movimiento, setShowMovimiento] = useState(false);
    const [empresas, setEmpresas] = useState(null);
    const [lineaEditar, setLineaEtitar] = useState(null);
    const [lineaMovimiento, setLineaMovimiento] = useState(null);
    const [hoy] = useState(new Date);
    
    const [datos, setDatos] = useState({
        id: pedido ? pedido.id : null,
        proveedor: pedido ? pedido.proveedor.id : null,
        empresa: pedido ? pedido.empresa : user['tec-user'].perfil.empresa.id,
        numero: pedido ? pedido.numero : '',
        creado_por: pedido ? pedido.creado_por.get_full_name : '',
        fecha_creacion: pedido ? pedido.fecha_creacion : (hoy.getFullYear() + '-'+(hoy.getMonth()+1)+'-'+hoy.getDate()),
        fecha_cierre: pedido ? pedido.fecha_entrega : '',
        finalizado: pedido ? pedido.finalizado : false,
        lineas_pedido: pedido ? pedido.lineas_pedido : null
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
        setLineaEtitar(null);
        setShowLinea(true);
    }

    const editLinea = (linea) => {
        setLineaEtitar(linea);
        setShowLinea(true);
    }

    const creaMoviviento = (linea) => {
        setLineaMovimiento(linea);
        setShowMovimiento(true);
    }

    const cerrarAddLinea =() =>{        
        editLinea();
        setShowLinea(false);
    }

    const cerrarMovimiento =() =>{    
        setShowMovimiento(false);
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
            finalizado: datos.finalizado,
            creado_por: user['tec-user'].id
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setPedido(res.data);
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
        // console.log('Cambio en pedido, actualizando datos ...');
        pedido && setDatos({
            id: pedido ? pedido.id : null,
            proveedor: pedido ? pedido.proveedor.id : null,
            empresa: pedido ? pedido.empresa : user['tec-user'].perfil.empresa.id,
            numero: pedido ? pedido.numero : '',
            creado_por: pedido ? pedido.creado_por.get_full_name : '',
            fecha_creacion: pedido ? pedido.fecha_creacion : (hoy.getFullYear() + '-'+(hoy.getMonth()+1)+'-'+hoy.getDate()),
            fecha_cierre: pedido ? pedido.fecha_entrega : '',
            finalizado: pedido ? pedido.finalizado : false,
            lineas_pedido: pedido.lineas_pedido ? pedido.lineas_pedido : null
        });
            //console.log(datos);
    },[pedido]);

    const handleDeshabilitar = () =>{
        if (pedido){
            console.log('ya hay pedido....');
            console.log(pedido.id);
            return true
        } 
        else {
            console.log('No hay id de pedido');
            return false
        }
    }

    const handleDisabled = () => {
        return user['tec-user'].perfil.nivel_acceso.nombre === 'local' || handleDeshabilitar()
    }

    return (
        <Container>
            <Row className="justify-content-center"> 
            {pedido ?
                <h5 className="pb-3 pt-1 mt-2">Pedido Detalle</h5>:
                <h5 className="pb-3 pt-1 mt-2">Nuevo Pedido</h5>}
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <h5 className="pb-3 pt-1 mt-2">Datos básicos:</h5>
                    <Form >
                        <Row> 
                            <Col>
                                <Form.Group controlId="proveedor">
                                    <Form.Label>Proveedor</Form.Label>
                                    <Form.Control as="select"  
                                                name='proveedor' 
                                                value={datos.proveedor}
                                                onChange={handleInputChange}
                                                disabled={handleDeshabilitar()}
                                                placeholder="Elige Proveedor">
                                                    <option key={0} value={''}>
                                                        ----
                                                    </option>
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
                                                disabled
                                                value={datos.numero}/>
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="creado_por">
                                    <Form.Label>Creado por</Form.Label>
                                    <Form.Control type="text" 
                                                name='creado_por' 
                                                disabled
                                                value={pedido ? pedido.creado_por.get_full_name : user['tec-user'].get_full_name}/>
                                </Form.Group>
                            </Col> 
                        </Row>
                        <Row>                                             
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
                            {pedido ? 
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
                                                            <PencilFill className="mr-3 pencil" onClick={event => {editLinea(linea)}}/>
                                                            <Truck className="mr-3 pencil" onClick={event => {creaMoviviento(linea)}}/>
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
                        pedido_id={pedido ? pedido.id : null}
                        linea={lineaEditar}
                        handleCloseLinea ={cerrarAddLinea}
                        proveedor_id={datos.proveedor}
                        updateLinea={updateLinea}
            />
            <MovimientoForm show={show_movimiento}
                            handleCloseMovimiento ={cerrarMovimiento}
                            linea={lineaMovimiento}
                            empresa={datos.empresa}
                            pedido={pedido ? pedido.id : null}

            />
        </Container>
    )
}

export default PedidoForm;