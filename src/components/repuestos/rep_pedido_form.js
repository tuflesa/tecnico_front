import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { PlusCircle, PencilFill, Trash, Truck, Receipt, Eye } from 'react-bootstrap-icons';
import LineaForm from './rep_pedido_linea';
import LineaAdicionalForm from './rep_pedido_linea_adicional';
import MovimientoForm from './rep_pedido_movimiento';
import MovLista from './rep_pedido_listmovimiento';
import EntLista from './rep_pedido_listentrega';
import EntregaForm from './rep_pedido_entrega';
import { Link } from 'react-router-dom';
import VistaPdf from './rep_pedidoPdf';
import { PDFViewer } from '@react-pdf/renderer';
import VistaIngPdf from './rep_pedidoIngPdf';
import moment from 'moment';
import CerrarTodoElPedido from './rep_cerrar_todoelpedido';

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
    const [hoy] = useState(new Date());
    const nextMonth = new Date(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());
    const [proveedores, setProveedores]= useState(null);
    const [verPdf, setVerPdf] = useState(false);
    const [verIngPdf, setVerIngPdf] = useState(false);
    const [direcciones, setDirecciones]= useState(null);
    const [contactos, setContactos]= useState(null);
    var total_pedido= 0;
    const [errores, setErrores] = useState({}); // Estado para guardar errores
    const [show_cerrar, setShowCerrar] = useState(false);

    const [datos, setDatos] = useState({
        id: pedido ? pedido.id : null,
        proveedor: pedido ? pedido.proveedor.id : null,
        empresa_id: pedido ? pedido.empresa.id : user['tec-user'].perfil.empresa.id,
        numero: pedido ? pedido.numero : '',
        creado_por: pedido ? pedido.creado_por.get_full_name : '',
        fecha_creacion: pedido ? pedido.fecha_creacion : (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
        fecha_entrega: pedido ? pedido.fecha_entrega : null,
        /* fecha_prevista_entrega: pedido
        ? pedido.fecha_prevista_entrega
        : `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(nextMonth.getDate()).padStart(2, '0')}`, */
        fecha_prevista_entrega: pedido ? pedido.fecha_prevista_entrega : '',
        finalizado: pedido ? pedido.finalizado : false,
        lineas_pedido: pedido ? pedido.lineas_pedido : null,
        lineas_adicionales: pedido ? pedido.lineas_adicionales : null,
        direccion_envio: pedido ? (pedido.direccion_envio ? pedido.direccion_envio.id : null) : null,
        contacto: pedido ? (pedido.contacto ? pedido.contacto.id : null) : null,
        observaciones: pedido ? pedido.observaciones : '',
        observaciones2: pedido ? pedido.observaciones2 : '',
        descripcion: pedido ? pedido.descripcion : '',
        finalizado_auto: pedido ? pedido.finalizado : false,
        intervencion: pedido ? pedido.intervencion : false,
        revisado: pedido ? pedido.revisado : false,
    });

    useEffect(()=>{
        pedido && setDatos({
            id: pedido ? pedido.id : null,
            proveedor: pedido ? pedido.proveedor.id : null,
            empresa_id: pedido ? pedido.empresa.id : user['tec-user'].perfil.empresa.id,
            numero: pedido ? pedido.numero : '',
            creado_por: pedido ? pedido.creado_por.get_full_name : '',
            fecha_creacion: pedido ? pedido.fecha_creacion : (hoy.getFullYear() + '-'+(hoy.getMonth()+1)+'-'+hoy.getDate()),
            //fecha_prevista_entrega: pedido ? pedido.fecha_prevista_entrega : (hoy.getFullYear() + '-'+(hoy.getMonth()+2)+'-'+hoy.getDate()),
            fecha_prevista_entrega: pedido ? pedido.fecha_prevista_entrega : '',
            fecha_entrega: pedido ? pedido.fecha_entrega : '',
            finalizado: pedido ? pedido.finalizado : false,
            lineas_pedido: pedido.lineas_pedido ? pedido.lineas_pedido : null,
            lineas_adicionales: pedido ? pedido.lineas_adicionales : null,
            direccion_envio: pedido ? (pedido.direccion_envio ? pedido.direccion_envio.id : null) : direcciones[0].id,
            contacto: pedido ? (pedido.contacto ? pedido.contacto.id : null) : null,
            observaciones: pedido ? pedido.observaciones : '',
            observaciones2: pedido ? pedido.observaciones2 : '',
            descripcion: pedido ? pedido.descripcion : '',
            finalizado_auto: pedido ? pedido.finalizado : false,
            intervencion: pedido ? pedido.intervencion : false,
            revisado: pedido ? pedido.revisado : false,

        });
    },[pedido]);

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

    useEffect(()=>{
        datos.proveedor && axios.get(BACKEND_SERVER + `/api/repuestos/contacto/?proveedor=${datos.proveedor}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {
            setContactos(res.data);
        })
        .catch(err => { console.log(err);})
    },[token, datos.proveedor]);
    
    useEffect(()=>{
        datos.empresa_id && axios.get(BACKEND_SERVER + `/api/estructura/direcciones/?empresa=${datos.empresa_id}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {                       
            setDirecciones(res.data);
        })
        .catch(err => { 
            console.log(err);
        })
    },[datos.empresa_id]);

    useEffect(()=>{
        direcciones && setDatos({
            ...datos,
            direccion_envio: pedido ? (pedido.direccion_envio ? pedido.direccion_envio.id : null) : direcciones[0].id
        })
    },[direcciones]);

    useEffect(()=>{
        contactos && setDatos({
            ...datos,
            contacto: pedido ? (pedido.contacto ? pedido.contacto.id : null) : (contactos [0] ? contactos[0].id : null)
        })
    },[contactos]);

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

    const abrirModal =() =>{
        setShowCerrar(true);
    }
    const cerrarModal =() =>{
        setShowCerrar(false);
    }

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

    const handleRecibido = (event) => {
        setDatos({
            ...datos,
            recibido : !datos.recibido
        })
    }

    const handleRevisado = (event) => {
        setDatos({
            ...datos,
            revisado : !datos.revisado
        })
    }

    const handleIntervencion = (event) => {
        setDatos({
            ...datos,
            intervencion : !datos.intervencion
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
            var confirmacion = window.confirm('¿Deseas eliminar la línea?');
            if(confirmacion){
                fetch (BACKEND_SERVER + `/api/repuestos/linea_pedido/${linea.id}`,{
                    method: 'DELETE',
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then( res => { 
                    updatePedido();
                })
            }
        }
    }
    const BorrarLineaAdicional =(lineaAdicional) =>{     
        if (lineaAdicional.cantidad>lineaAdicional.por_recibir){
            alert('No se puede eliminar la linea, ya tiene movimientos de recepción');            
        }
        else{  
            var confirmacion = window.confirm('¿Deseas eliminar la línea?');
            if(confirmacion){
                fetch (BACKEND_SERVER + `/api/repuestos/linea_adicional_pedido/${lineaAdicional.id}`,{
                    method: 'DELETE',
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                /* .then( res => { 
                    alert('Se va a eliminar la linea');
                }) */ 
                .then( res => { 
                    updatePedido();
                })
            }
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

    const visualizarPdf = () =>{
        setVerPdf(true); 
    }

    const visualizarIngPdf = () =>{
        setVerIngPdf(true); 
    }

    const cerrarPdf = () =>{
        setVerPdf(false);
    }

    const cerrarIngPdf = () =>{
        setVerIngPdf(false);
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
        updatePedido();
    }

    const cerrarListEntrega =() =>{   
        setShowListEntrega(false);
    }

    const crearPedido = (event) => {
        event.preventDefault();
        axios.post(BACKEND_SERVER + `/api/repuestos/pedido/`, {
            proveedor: datos.proveedor,
            empresa: datos.empresa_id,
            fecha_entrega: datos.fecha_entrega,
            fecha_creacion: datos.fecha_creacion,
            fecha_prevista_entrega: datos.fecha_prevista_entrega,
            finalizado: datos.finalizado,
            creado_por: user['tec-user'].id,
            direccion_envio: datos.direccion_envio,
            contacto: datos.contacto,
            observaciones: datos.observaciones,
            observaciones2: datos.observaciones2,
            descripcion: datos.descripcion,
            intervencion: datos.intervencion,
            revisado: datos.revisado,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setPedido(res.data);
            axios.get(BACKEND_SERVER + `/api/repuestos/pedido_detalle/${res.data.id}/`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }     
            })
            .then( res => {
                setPedido(res.data);
                setErrores({}); // Reiniciar errores si la petición es exitosa
            })
            .catch(err => { console.log(err);})
        })
        .catch(err => { 
            if (err.response && err.response.data) {
                setErrores(err.response.data); // Guardar los errores del backend
            } else {
                console.log(err);
            }
            alert('Faltan datos, por favor, introduce todos los datos obligatorios.')
        })
    }

    const actualizarDatos = (event) => {
        event.preventDefault();
        axios.patch(BACKEND_SERVER + `/api/repuestos/pedido/${pedido.id}/`, {
            proveedor: datos.proveedor,
            empresa: datos.empresa_id,
            fecha_entrega: datos.fecha_entrega,
            fecha_creacion: datos.fecha_creacion,
            fecha_prevista_entrega: datos.fecha_prevista_entrega,
            finalizado: datos.finalizado,
            direccion_envio: datos.direccion_envio,
            contacto: datos.contacto,
            observaciones: datos.observaciones,
            observaciones2: datos.observaciones2,
            descripcion: datos.descripcion,
            intervencion: datos.intervencion,
            revisado: datos.revisado,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setPedido(res.data);
            updatePedido();
            //window.location.href = "/repuestos/pedidos";
        })
        .catch(err => { console.log(err);})

    }

    const updatePedido = () => {
        axios.get(BACKEND_SERVER + `/api/repuestos/pedido_detalle/${pedido.id}/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {
            setPedido(res.data);
            finalizarPedido(res.data);
        })
        .catch(err => { console.log(err);})
    }

    const updateFinalizado = () => {
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

    const finalizarPedido = (pedido) =>{
        var x = 0;
        var y = 0;
        if(datos.finalizado_auto===datos.finalizado){
            if(datos.finalizado===true){
                for(y=0; y<pedido.lineas_pedido.length;y++){
                    if(pedido.lineas_pedido[y].por_recibir>0){
                        datos.finalizado=false;
                        datos.fecha_entrega=null;
                        break;
                    } 
                    if(pedido.lineas_adicionales[x].por_recibir>0){
                        datos.finalizado=false;
                        datos.fecha_entrega=null;
                        break;
                    } 
                }
            }
            else{
                for(y=0; y<pedido.lineas_pedido.length;y++){
                    if(pedido.lineas_pedido[y].por_recibir>0){
                        datos.finalizado=false;
                        datos.fecha_entrega=null;
                        break;
                    } 
                }
                if(y>=pedido.lineas_pedido.length){
                    if(pedido.lineas_adicionales!=''){
                        for(x=0; x<pedido.lineas_adicionales.length;x++){                

                            if(pedido.lineas_adicionales[x].por_recibir>0){
                                datos.finalizado=false;
                                datos.fecha_entrega=null;
                                break;
                            } 
                            else{
                                datos.finalizado=true;
                                datos.fecha_entrega= (hoy.getFullYear() + '-'+(hoy.getMonth()+1)+'-'+hoy.getDate());
                            }
                        }
                    }
                    else{
                            datos.finalizado=true;
                            datos.fecha_entrega= (hoy.getFullYear() + '-'+(hoy.getMonth()+1)+'-'+hoy.getDate())
                        }
                }
                
            }
        }
        else{
            var continuar = window.confirm('Va a cambiar el estado del pedido de forma manual ¿Desea continuar?');
            if(continuar===false){
                datos.finalizado=!datos.finalizado;
            }
        }
        axios.patch(BACKEND_SERVER + `/api/repuestos/pedido/${pedido.id}/`, {
            finalizado: datos.finalizado, 
            fecha_entrega: datos.fecha_entrega,           
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }     
        })
        .then( res => {
            updateFinalizado();
        })
        .catch(err => { console.log(err);})
    }

    
    const handleDeshabilitar = () =>{
        if (pedido){
            return true
        } 
        else {
            return false
        }
    }

    const formatNumber = (numero) =>{
        return new Intl.NumberFormat('de-DE',{ style: 'currency', currency: 'EUR' }).format(numero)
    }

    const formatPorcentaje = (numero) =>{
        return new Intl.NumberFormat('de-DE').format(numero)
    }

    const handleDisabled = () => {
        return user['tec-user'].perfil.nivel_acceso.nombre === 'local' || handleDeshabilitar()
    }

    const formatearNumero = (numero) => {
        const num = Number(numero);
        return num % 1 === 0
            ? num.toLocaleString('es-ES')
            : num.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    };      

    return (
        <Container className='mt-5'>
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
                                <Form.Group controlId="numero">
                                    <Form.Label>Número Pedido</Form.Label>
                                    <Form.Control type="text" 
                                                name='numero' 
                                                disabled
                                                value={datos.numero}/>
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="creado_por">
                                    <Form.Label>Creado por (*)</Form.Label>
                                    <Form.Control type="text" 
                                                name='creado_por' 
                                                disabled
                                                value={pedido ? pedido.creado_por.get_full_name : user['tec-user'].get_full_name}/>
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="fecha_creacion">
                                    <Form.Label>Fecha Creación (*)</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_creacion' 
                                                value={datos.fecha_creacion}
                                                onChange={handleInputChange} 
                                                className={`form-control ${errores.fecha_creacion ? 'border-red' : ''}`}
                                                placeholder="Fecha creación" />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="fecha_entrega">
                                    <Form.Label>Fecha Cierre</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_entrega' 
                                                value={datos.fecha_entrega}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha cierre" />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="fecha_prevista_entrega">
                                    <Form.Label>Fecha Prevista Entrega (*)</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_prevista_entrega' 
                                                value={datos.fecha_prevista_entrega}
                                                onChange={handleInputChange} 
                                                className={`form-control ${errores.fecha_prevista_entrega ? 'border-red' : ''}`}
                                                placeholder="Fecha prevista entrega" />
                                </Form.Group>
                            </Col>                            
                        </Row>
                        <Row>                                                        
                            <Col>
                                <Form.Group controlId="empresa_id">
                                    <Form.Label>Empresa (*)</Form.Label>
                                    <Form.Control as="select"  
                                                name='empresa_id' 
                                                value={datos.empresa_id}
                                                onChange={handleInputChange}
                                                disabled={handleDisabled()}
                                                placeholder="Empresa">                                                    
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
                                <Form.Group controlId="direccion_envio">
                                    <Form.Label>Dirección de Envío (*)</Form.Label>
                                    <Form.Control as="select"  
                                                name='direccion_envio' 
                                                value={datos.direccion_envio}
                                                onChange={handleInputChange}                                            
                                                placeholder="Direccion de Envío">                                                   
                                                {direcciones && direcciones.map( direccion => {
                                                    return (
                                                    <option key={direccion.id} value={direccion.id}>
                                                        {direccion.direccion}
                                                    </option>
                                                    )
                                                })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                        <Col>
                                <Form.Group controlId="proveedor">
                                    <Form.Label>Proveedor (*)</Form.Label>
                                    <Form.Control as="select"  
                                                name='proveedor' 
                                                value={datos.proveedor}
                                                onChange={handleInputChange}
                                                disabled={handleDeshabilitar()}
                                                className={`form-control ${errores.proveedor ? 'border-red' : ''}`} 
                                                placeholder="Elige Proveedor"
                                                autoFocus >
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
                                <Form.Group controlId="contacto">
                                    <Form.Label>Contacto</Form.Label>
                                    <Form.Control as="select"  
                                                name='contacto' 
                                                value={datos.contacto}
                                                onChange={handleInputChange}                                                
                                                placeholder="Contacto">                                                   
                                                {contactos && contactos.map( contacto => {
                                                    return (
                                                    <option key={contacto.id} value={contacto.id}>
                                                        {contacto.nombre}
                                                    </option>
                                                    )
                                                })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            {pedido?
                            <Col>
                                <Row>
                                    <Form.Label>Ficha Proveedor</Form.Label>
                                </Row>
                                <Row>
                                    <Link to= {`/repuestos/proveedor/${pedido.proveedor.id}`}>
                                        <Button variant="info" type="submit">Datos Proveedor</Button>
                                    </Link>
                                </Row>
                            </Col>
                            :null}
                        </Row>
                        <Row>     
                            <Col>
                                <Form.Group controlId="descripcion">
                                    <Form.Label>Descripción pedido (*)</Form.Label>
                                    <Form.Control imput type="text" 
                                                name='descripcion'
                                                value = {datos.descripcion}
                                                onChange = {handleInputChange}
                                                className={`form-control ${errores.descripcion ? 'border-red' : ''}`}
                                                placeholder="Descripción Pedido">
                                    </Form.Control>
                                </Form.Group>
                            </Col>  
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="observaciones">
                                    <Form.Label>Observaciones pedido</Form.Label>
                                    <Form.Control as="textarea" 
                                                name='observaciones'
                                                value = {datos.observaciones}
                                                onChange = {handleInputChange}
                                                placeholder="Observaciones"
                                                rows={3}>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="observaciones2">
                                    <Form.Label>Observaciones final pedido</Form.Label>
                                    <Form.Control as="textarea" 
                                                name='observaciones2'
                                                value = {datos.observaciones2}
                                                onChange = {handleInputChange}
                                                placeholder="Observaciones final del pedido"
                                                rows={3}>
                                    </Form.Control>
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
                        <Row>
                            <Col>
                                <Form.Group className="mb-3" controlId="intervencion" style={{color:'red'}}>
                                    <Form.Check type="checkbox" 
                                                label="¿Intervención Externa?"
                                                checked = {datos.intervencion}
                                                onChange = {handleIntervencion} />
                                </Form.Group>
                            </Col>
                            {datos.intervencion?
                                <Col>
                                    <Form.Group className="mb-3" controlId="revisado" style={{color:'blue'}}>
                                        <Form.Check type="checkbox" 
                                                    label="Documentación revisada por PRL"
                                                    checked = {datos.revisado}
                                                    onChange = {handleRevisado} />
                                    </Form.Group>
                                </Col>
                            :''}
                        </Row>                     
                        <Form.Row className="justify-content-center">
                            {pedido ? 
                                <Button variant="info" type="submit" className={'mx-2'} onClick={actualizarDatos}>Actualizar</Button> :
                                <Button variant="info" type="submit" className={'mx-2'} onClick={crearPedido}>Guardar</Button>                                
                            }
                            <Button variant="info" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
                            {pedido ? 
                                <Button variant="danger" type="button" className={'mx-2'} onClick={abrirModal}>Recepcionar todo</Button> :''                               
                            }
                        </Form.Row> 
                        <Form className="justify-content-center">
                            {!verPdf && !verIngPdf && datos.numero ?  
                                <Form>
                                    <Button variant="info" type="submit" className={'mx-2'} onClick={visualizarPdf}>Ver Pdf</Button>
                                    <Button variant="info" type="submit" className={'mx-2'} onClick={visualizarIngPdf}>Pdf Ing</Button> 
                                </Form>:
                                <Form>
                                    {verPdf ?
                                    <Form>
                                        <Button variant="info" type="submit" className={'mx-2'} onClick={cerrarPdf}>Cancelar Pdf</Button>
                                        <PDFViewer style={{width: "100%", height: "90vh"}}>
                                            <VistaPdf   pedido={pedido}
                                                        fecha_creacion = {moment(pedido.fecha_creacion).format('DD-MM-YYYY')}
                                                        linea={datos.lineas_pedido} 
                                                        VerPdf={verPdf}
                                                        // empresa={empresas.filter( s => s.id === pedido.empresa)[0]} 
                                                        proveedor={pedido.proveedor}                                                   
                                                        lineas_adicionales={pedido.lineas_adicionales}
                                                        contacto={pedido.contacto}
                                                        direccion_envio={pedido.direccion_envio}/>
                                        </PDFViewer> 
                                    </Form>:                                    
                                    <Form>
                                        {verIngPdf ?
                                            <Form>
                                                <Button variant="info" type="submit" className={'mx-2'} onClick={cerrarIngPdf}>Cancelar Pdf Ing</Button>
                                                <PDFViewer style={{width: "100%", height: "90vh"}}>
                                                    <VistaIngPdf    pedido={pedido}
                                                                    fecha_creacion = {moment(pedido.fecha_creacion).format('DD-MM-YYYY')}
                                                                    linea={datos.lineas_pedido} 
                                                                    VerPdf={verPdf}
                                                                    // empresa={empresas.filter( s => s.id === pedido.empresa)[0]} 
                                                                    proveedor={pedido.proveedor}                                                   
                                                                    lineas_adicionales={pedido.lineas_adicionales}
                                                                    contacto={pedido.contacto}
                                                                    direccion_envio={pedido.direccion_envio}/>
                                                </PDFViewer> 
                                            </Form>
                                            :null}
                                    </Form>
                                    }
                                </Form>                                                                  
                            }                                
                        </Form>
                        {datos.numero && !verPdf && !verIngPdf ? 
                        <React.Fragment>
                            <Form.Row>
                                <Col>
                                    <Row>
                                        <Col>
                                        <h5 className="pb-3 pt-1 mt-2">Líneas de pedido:</h5>
                                        </Col>
                                        <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                                <PlusCircle className="plus mr-2" size={30} onClick={abrirAddLinea}/>
                                        </Col>
                                    </Row>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>Repuesto</th>
                                                <th style={{width:20}}>Cantidad</th>
                                                <th style={{width:20}}>Unidad Medida</th>
                                                <th style={{width:30}}>Precio</th>
                                                <th style={{width:20}}>Dto.</th>
                                                <th style={{width:30}}>Total</th>
                                                <th style={{width:20}}>Recibido</th>
                                                <th style={{width:20}}>Pendiente Recibir</th>
                                                <th style={{width:190}}>Acciones</th>
                                            </tr>
                                        </thead> 
                                                                                  
                                        <tbody>
                                            {datos.lineas_pedido && datos.lineas_pedido.map( linea => {
                                                {total_pedido+=Number(linea.total)}
                                                return (
                                                    <tr key={linea.id} className = {((parseFloat(linea.por_recibir)===0) && (parseFloat(linea.cantidad)!=parseFloat(linea.por_recibir)) || (parseFloat(linea.cantidad)<(parseFloat(linea.cantidad)-parseFloat(linea.por_recibir))))? "table-success" : (linea.cantidad - linea.por_recibir)>0? "table-primary" : " "}>
                                                        <td>{linea.descripcion_proveedor!==null?linea.descripcion_proveedor + ' - ' + linea.modelo_proveedor:linea.repuesto.nombre + (linea.repuesto.fabricante? ' - ' + linea.repuesto.fabricante:'') + (linea.modelo_proveedor? ' - ' + linea.modelo_proveedor:'')}</td>
                                                        <td>{formatearNumero(parseFloat(linea.cantidad))}</td>
                                                        <td>{linea.tipo_unidad_nombre}</td>
                                                        <td>{formatNumber(linea.precio)}</td>
                                                        <td>{formatPorcentaje(linea.descuento)+'%'}</td>
                                                        <td>{formatNumber(linea.total)}</td>
                                                        <td>{formatearNumero(parseFloat(linea.cantidad - linea.por_recibir))}</td>
                                                        <td>{parseFloat(linea.por_recibir)}</td>
                                                        <td>
                                                            <PencilFill className="mr-3 pencil" onClick={event => {editLinea(linea)}}/>
                                                            <Truck className="mr-3 pencil" onClick={event =>{creaMoviviento(linea)}}/>
                                                            <Receipt className="mr-3 pencil" onClick={event =>{listarMovimiento(linea)}}/>
                                                            <Trash className="mr-3 pencil"  onClick={event =>{BorrarLinea(linea)}} />
                                                            <Link to={`/repuestos/${linea.repuesto.id}`}><Eye className="mr-3 pencil"/></Link>
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
                        {datos.numero && !verPdf && !verIngPdf ? 
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
                                                <th style={{width:20}}>Cantidad</th>
                                                <th style={{width:30}}>Precio</th>
                                                <th style={{width:20}}>Dto.</th>
                                                <th style={{width:30}}>Total</th>
                                                <th style={{width:20}}>Recibido</th>
                                                <th style={{width:20}}>Pendiente Recibir</th>
                                                <th style={{width:150}}>Acciones</th>
                                            </tr>
                                        </thead> 
                                                                                  
                                        <tbody>                                            
                                            {datos.lineas_adicionales && datos.lineas_adicionales.map( lineaAdicional => {
                                                {total_pedido+=Number(lineaAdicional.total)}
                                                return (
                                                    <tr key={lineaAdicional.id}  className = {((parseFloat(lineaAdicional.por_recibir)===0) && (parseFloat(lineaAdicional.cantidad)!=parseFloat(lineaAdicional.por_recibir)) || (parseFloat(lineaAdicional.cantidad)<(parseFloat(lineaAdicional.cantidad)-parseFloat(lineaAdicional.por_recibir))))? "table-success" : (parseFloat(lineaAdicional.cantidad) - parseFloat(lineaAdicional.por_recibir))>0? "table-primary" : " "}>
                                                        <td>{lineaAdicional.descripcion}</td>
                                                        <td>{parseFloat(lineaAdicional.cantidad)}</td>
                                                        <td>{formatNumber(lineaAdicional.precio)}</td>
                                                        <td>{lineaAdicional.descuento + '%'}</td>
                                                        <td>{formatNumber(lineaAdicional.total)}</td>
                                                        <td>{parseFloat(lineaAdicional.cantidad - lineaAdicional.por_recibir).toFixed(2)}</td>
                                                        <td>{parseFloat(lineaAdicional.por_recibir)}</td>
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
                        {datos.numero && !verPdf && !verIngPdf ?  
                            <Row>
                                <h5 className="pb-3 pt-1 mt-2"><strong>Total Pedido: {Number.parseFloat(total_pedido).toFixed(2)}€</strong></h5>
                            </Row>   
                        :null}                                      
                    </Form>
                </Col>
            </Row>    
            <LineaForm  show={show_linea}
                        pedido_id={pedido ? pedido.id : null}
                        linea={lineaEditar}
                        handleCloseLinea ={cerrarAddLinea}
                        proveedor_id={datos.proveedor}
                        updatePedido={updatePedido}
            />
            <LineaAdicionalForm show={show_linea_adicional}
                                pedido_id={pedido ? pedido.id : null}
                                linea_adicional={linea_adicionalEditar}
                                handleCloseLineaAdicional ={cerrarAddLineaAdicional}
                                proveedor_id={datos.proveedor}
                                updatePedido={updatePedido}
            />
            <MovimientoForm show={show_movimiento}
                            handleCloseMovimiento ={cerrarMovimiento}
                            linea={lineaMovimiento}
                            empresa={datos.empresa_id}
                            updatePedido={updatePedido}
            />
            <EntregaForm show={show_entrega}
                            handleCloseEntrega ={cerrarEntrega}
                            linea_adicional={lineaEntrega}
                            //empresa={datos.empresa_id}
                            updatePedido={updatePedido}
            />
            <MovLista   show={show_listmovimiento}
                        handleCloseListMovimiento ={cerrarListMovimiento}
                        linea={listMovimiento}
            />
            <EntLista   show={show_listentrega}
                        handleCloseListEntrega ={cerrarListEntrega}
                        linea_adicional={listEntrega}
            />
            {pedido? <CerrarTodoElPedido
                show ={show_cerrar}
                pedido={pedido}
                onClose={cerrarModal}
                updatePedido={updatePedido}
            />:''}
        </Container>
    )
}

export default PedidoForm;