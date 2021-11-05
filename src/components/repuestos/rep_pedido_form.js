import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { PlusCircle, PencilFill, Trash, Truck, Receipt } from 'react-bootstrap-icons';
import LineaForm from './rep_pedido_linea';
import LineaAdicionalForm from './rep_pedido_linea_adicional';
import MovimientoForm from './rep_pedido_movimiento';
import MovLista from './rep_pedido_listmovimiento';
import EntLista from './rep_pedido_listentrega';
import EntregaForm from './rep_pedido_entrega';
import { Link } from 'react-router-dom';
import { now } from 'd3-timer';

const PedidoForm = ({pedido, setPedido}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [show_linea, setShowLinea] = useState(false);
    const [show_linea_adicional, setShowLineaAdicional] = useState(false);
    const [show_listmovimiento, setShowListMovimiento] = useState(false);
    const [show_listentrega, setShowListEntrega] = useState(false);
    const [show_movimiento, setShowMovimiento] = useState(false); 
    const [show_entrega, setShowEntrega] = useState(false);   
    const [empresas, setEmpresas] = useState(null);
    const [lineaEditar, setLineaEtitar] = useState(null);
    const [linea_adicionalEditar, setLineaAdicionalEditar] = useState(null);
    const [lineaMovimiento, setLineaMovimiento] = useState(null);
    const [lineaEntrega, setLineaEntrega] = useState(null);
    const [listMovimiento, setListMovimiento] = useState(null);
    const [listEntrega, setListEntrega] = useState(null);
    const [hoy] = useState(new Date);
    const [borrar] = useState(false);
    
    const [datos, setDatos] = useState({
        id: pedido ? pedido.id : null,
        proveedor: pedido ? pedido.proveedor.id : null,
        empresa: pedido ? pedido.empresa : user['tec-user'].perfil.empresa.id,
        numero: pedido ? pedido.numero : '',
        creado_por: pedido ? pedido.creado_por.get_full_name : '',
        fecha_creacion: pedido ? pedido.fecha_creacion : (hoy.getFullYear() + '-'+(hoy.getMonth()+1)+'-'+hoy.getDate()),
        fecha_cierre: pedido ? pedido.fecha_entrega : '',
        finalizado: pedido ? pedido.finalizado : false,
        lineas_pedido: pedido ? pedido.lineas_pedido : null,
        lineas_adicionales: pedido ? pedido.lineas_adicionales : null
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

    const abrirAddLineaAdi =() =>{
        setLineaAdicionalEditar(null);
        setShowLineaAdicional(true);
    }

    const editLinea = (linea) => {
        setLineaEtitar(linea);
        setShowLinea(true);
    }

    const editLineaAdicional = (lineaAdicional) => {
        setLineaAdicionalEditar(lineaAdicional);
        setShowLineaAdicional(true);
    }

    const BorrarLinea =(linea) =>{     
        if (linea.cantidad>linea.por_recibir){
            alert('No se puede eliminar la linea, ya tiene movimientos de recepción');            
        }
        else{  
            fetch (BACKEND_SERVER + `/api/repuestos/linea_pedido/${linea.id}`,{
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => { 
                alert('Se va a eliminar la linea');
            }) 
            .then( res => { 
                updateLinea();
            })
        }
    }
    const BorrarLineaAdicional =(lineaAdicional) =>{     
        if (lineaAdicional.cantidad>lineaAdicional.por_recibir){
            alert('No se puede eliminar la linea, ya tiene movimientos de recepción');            
        }
        else{  
            fetch (BACKEND_SERVER + `/api/repuestos/linea_adicional_pedido/${lineaAdicional.id}`,{
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => { 
                alert('Se va a eliminar la linea');
            }) 
            .then( res => { 
                updateLinea();
            })
        }
    }

    const creaMoviviento = (linea) => {
        setLineaMovimiento(linea);
        setShowMovimiento(true);
    }

    const creaEntrega = (lineaAdicional) => {
        setLineaEntrega(lineaAdicional);
        setShowEntrega(true);
    }

    const listarMovimiento = (linea)=>{
        setListMovimiento(linea);
        setShowListMovimiento(true);
    }

    const listarEntrega = (lineaAdicional)=>{
        setListEntrega(lineaAdicional);
        setShowListEntrega(true);
    }

    const cerrarAddLinea =() =>{        
        editLinea();
        setShowLinea(false);
    }

    const cerrarAddLineaAdicional =() =>{        
        editLineaAdicional();
        setShowLineaAdicional(false);
    }

    const cerrarMovimiento =() =>{   
        setShowMovimiento(false);
    }

    const cerrarEntrega =() =>{   
        setShowEntrega(false);
    }

    const cerrarListMovimiento =() =>{   
        setShowListMovimiento(false);
    }

    const cerrarListEntrega =() =>{   
        setShowListEntrega(false);
    }

    const crearPedido = (event) => {
        event.preventDefault();
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
            //console.log(res);
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
            lineas_pedido: pedido.lineas_pedido ? pedido.lineas_pedido : null,
            lineas_adicionales: pedido ? pedido.lineas_adicionales : null
        });
            //console.log(datos);
    },[pedido]);

    const handleDeshabilitar = () =>{
        if (pedido){
            //console.log('ya hay pedido....');
            //console.log(pedido.id);
            return true
        } 
        else {
            //console.log('No hay id de pedido');
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
                                                <th>Recibido</th>
                                                <th>Pendiente Recibir</th>
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
                                                        <td>{linea.cantidad - linea.por_recibir}</td>
                                                        <td>{linea.por_recibir}</td>
                                                        <td>
                                                            <PencilFill className="mr-3 pencil" onClick={event => {editLinea(linea)}}/>
                                                            <Truck className="mr-3 pencil" onClick={event => {creaMoviviento(linea)}}/>
                                                            <Receipt className="mr-3 pencil" onClick={event =>{listarMovimiento(linea)}}/>
                                                            <Trash className="trash"  onClick={event =>{BorrarLinea(linea)}} />
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
                        {datos.numero ? 
                        <React.Fragment>
                            <Form.Row>
                                <Col>
                                    <Row>
                                        <Col>
                                        <h5 className="pb-3 pt-1 mt-2">Lineas Adicionales:</h5>
                                        </Col>
                                        <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                                <PlusCircle className="plus mr-2" size={30} onClick={abrirAddLineaAdi}/>
                                        </Col>
                                    </Row>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>Descripción</th>
                                                <th>Cantidad</th>
                                                <th>Precio</th>
                                                <th>Recibido</th>
                                                <th>Pendiente Recibir</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead> 
                                                                                  
                                        <tbody>
                                            {datos.lineas_adicionales && datos.lineas_adicionales.map( lineaAdicional => {
                                                return (
                                                    <tr key={lineaAdicional.id}>
                                                        <td>{lineaAdicional.descripcion}</td>
                                                        <td>{lineaAdicional.cantidad}</td>
                                                        <td>{lineaAdicional.precio}</td>
                                                        <td>{lineaAdicional.cantidad - lineaAdicional.por_recibir}</td>
                                                        <td>{lineaAdicional.por_recibir}</td>
                                                        <td>
                                                            <PencilFill className="mr-3 pencil" onClick={event => {editLineaAdicional(lineaAdicional)}}/>
                                                            <Truck className="mr-3 pencil" onClick={event => {creaEntrega(lineaAdicional)}}/>
                                                            <Receipt className="mr-3 pencil" onClick={event =>{listarEntrega(lineaAdicional)}}/>
                                                            <Trash className="trash"  onClick={event =>{BorrarLineaAdicional(lineaAdicional)}} />
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
            <LineaAdicionalForm show={show_linea_adicional}
                                pedido_id={pedido ? pedido.id : null}
                                linea_adicional={linea_adicionalEditar}
                                handleCloseLineaAdicional ={cerrarAddLineaAdicional}
                                proveedor_id={datos.proveedor}
                                updateLinea={updateLinea}
            />
            <MovimientoForm show={show_movimiento}
                            handleCloseMovimiento ={cerrarMovimiento}
                            linea={lineaMovimiento}
                            empresa={datos.empresa}
                            updateLinea={updateLinea}
            />
            <EntregaForm show={show_entrega}
                            handleCloseEntrega ={cerrarEntrega}
                            linea_adicional={lineaEntrega}
                            //empresa={datos.empresa}
                            updateLinea={updateLinea}
            />
            <MovLista   show={show_listmovimiento}
                        handleCloseListMovimiento ={cerrarListMovimiento}
                        linea={listMovimiento}
            />
            <EntLista   show={show_listentrega}
                        handleCloseListEntrega ={cerrarListEntrega}
                        linea_adicional={listEntrega}
            />
        </Container>
    )
}

export default PedidoForm;