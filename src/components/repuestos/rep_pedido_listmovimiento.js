import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Button, Row, Form, Modal, Col, Table } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { PencilFill, HandThumbsUpFill } from 'react-bootstrap-icons';

const MovLista = ({linea, handleCloseListMovimiento, show}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [listados, setListados] = useState(null);
    const [lineaElegida, setLineaElegida]=useState(null);
    const [almacenes, setAlmacenes]=useState(null);
    const [reset, setReset]=useState(null);
    const [lineaActiva, setLineaActiva] = useState(null);
    const [actualizar_listado, setActualizarListado] = useState(false);

    const [datos, setDatos] = useState({
        fecha: null,
        cantidad: '',
        albaran: '',
        almacen: null, 
        localizaciones: null,
        habilitar: true,  
        usuario: user['tec-user'].id, 
    });

    //muestra las líneas de entrega en cada pedido
    useEffect(()=>{
        linea && axios.get(BACKEND_SERVER + `/api/repuestos/movimiento_detalle/?linea_pedido__id=${linea.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setListados(res.data); 
        })    
        .catch( err => {
            console.log(err);
        });
    },[linea, token, actualizar_listado]);

    useEffect(()=>{
        linea && axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimo_detalle/?repuesto=${linea.repuesto.id}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setAlmacenes(res.data);
        })
        .catch(err => { console.log(err);})
    },[token, linea]);

    useEffect(()=>{
        if(lineaElegida){
            for(var x=0;x<almacenes.length;x++){
                if(lineaElegida.almacen.id===almacenes[x].almacen.id){
                    if(lineaElegida.cantidad>almacenes[x].stock_act || datos.cantidad>almacenes[x].stock_act){
                        alert('No tienes suficiente cantidad en el almacen para hacer el cambio');
                        setReset(linea);
                        handlerCancelar();
                        habilitar_linea(lineaElegida);
                        handleCloseListMovimiento(false);
                        
                    }
                }
                if(reset){
                    //cancela el for para que no de más vueltas
                    actualizarDatos();
                    break;
                }
            }
        } 
    },[datos.almacen]);

    // activa y desactiva la escritura en la línea
    const habilitar_linea = (linea) => {
        setLineaActiva(linea.id);
        setLineaElegida(linea);
        setDatos({
            fecha: null,
            cantidad: '',
            albaran: '',
            almacen: null,
        });    
        const inputs = document.getElementsByClassName(linea.id);
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].disabled = false;
        }
    }

    const guardarMovimiento = () => {
        if (!lineaElegida) return;
    
        const nuevaCantidad = parseFloat(datos.cantidad || lineaElegida.cantidad).toFixed(2);
        const cantidadAnterior = parseFloat(lineaElegida.cantidad).toFixed(2);
        const cantidadCambio = nuevaCantidad !== cantidadAnterior;
    
        const nuevoAlbaran = datos.albaran || lineaElegida.albaran;
        const nuevoAlmacen = datos.almacen || lineaElegida.almacen.id;
        const nuevaFecha = datos.fecha || lineaElegida.fecha;
    
        const sinCambios =
            !cantidadCambio &&
            nuevoAlbaran === lineaElegida.albaran &&
            nuevoAlmacen === lineaElegida.almacen.id &&
            nuevaFecha === lineaElegida.fecha;
    
        if (sinCambios) {
            alert('⚠️ No se han realizado cambios.');
            return;
        }
    
        axios.patch(`${BACKEND_SERVER}/api/repuestos/movimiento/${lineaElegida.id}/`, {
            fecha: nuevaFecha,
            cantidad: nuevaCantidad,
            almacen: nuevoAlmacen,
            usuario: user['tec-user'].id,
            linea_pedido: lineaElegida.linea_pedido,
            linea_inventario: lineaElegida.linea_inventario,
            albaran: nuevoAlbaran
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        }).then(res => {
            const nuevaCantidadGuardada = parseFloat(res.data.cantidad);
            axios.get(`${BACKEND_SERVER}/api/repuestos/stocks_minimos/?repuesto=${linea.repuesto.id}&almacen=${lineaElegida.almacen.id}`, {
                headers: { 'Authorization': `token ${token['tec-token']}` }
            }).then(r => {
                const stockActual = parseFloat(r.data[0].stock_act);
                const stockId = r.data[0].id;
                const diferenciaStock = nuevaCantidadGuardada - parseFloat(lineaElegida.cantidad);
                const nuevoStock = (stockActual-nuevaCantidadGuardada) + diferenciaStock;
    
                axios.patch(`${BACKEND_SERVER}/api/repuestos/stocks_minimos/${stockId}/`, {
                    stock_act: nuevoStock.toFixed(2)
                }, {
                    headers: { 'Authorization': `token ${token['tec-token']}` }
                });
                // Actualizar por_recibir si la cantidad cambia
                if (cantidadCambio) {
                    const nuevoPorRecibir = parseFloat(linea.por_recibir) + (parseFloat(lineaElegida.cantidad) - nuevaCantidadGuardada);
                    axios.patch(`${BACKEND_SERVER}/api/repuestos/linea_pedido/${linea.id}/`, {
                        por_recibir: nuevoPorRecibir.toFixed(2)
                    }, {
                        headers: { 'Authorization': `token ${token['tec-token']}` }
                    });
                }
    
                alert("✅ Movimiento actualizado correctamente.");
                actualizarRecibir();
                handlerCancelar();
                setActualizarListado(!actualizar_listado);
            });
        }).catch(err => {
            console.error(err);
        });
    };
        
        
    
    const handlerCancelar = () => {
        setDatos({
            fecha: null,
            cantidad: '',
            albaran: '',
            almacen: null,
            habilitar: true,
            usuario: user['tec-user'].id
        });
        setLineaActiva(null);
        setLineaElegida(null);
    };
    

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })        
    }
    
    const actualizarDatos = () => {
        setDatos({
            ...datos,
                fecha: null,
                cantidad: '',
                albaran: '',
                almacen: null, 
                localizaciones: null,
                habilitar: true,  
        })    
    }

    const handlerListCancelar = () => {      
        handleCloseListMovimiento();
        setLineaActiva(null);
    } 

    // lo necesitaremos por si ponemos una cantidad menor a la inicial, que vuelva estar pendiente de recibir
    const actualizarRecibir = () =>{
        if((lineaElegida.cantidad -datos.cantidad)>linea.cantidad){
            datos.precio = linea.precio * datos.cantidad;
        }
        
    }

    return (
        <Modal show={show} backdrop="static" keyboard={ false } animation={false} size="xl">
                <Modal.Header>                
                    <Modal.Title>Listado de Entregas</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col>
                            { linea ? 
                            <Form.Group controlId="repuesto">
                                    <Form.Label>Repuesto</Form.Label>
                                    <Form.Control type="text"  
                                                name='repuesto' 
                                                value={linea.repuesto.nombre}
                                                disabled>  
                                    </Form.Control>
                            </Form.Group>
                            :null
                            }
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Nueva Fecha</th>
                                        <th>Cantidad Recibida</th>
                                        <th>Albarán</th>
                                        <th>Almacén</th>
                                        <th>Cambio Almacén</th>                                      
                                    </tr>
                                </thead>                                
                                <tbody> 
                                    {listados && listados.map( lista => {                                              
                                        return (                                                    
                                            <tr key={lista.id}>
                                                <td>{invertirFecha(String(lista.fecha))}</td>
                                                    <td>
                                                        <input  className={lista.id} 
                                                                type = "date" 
                                                                name='fecha'
                                                                value= {datos.fecha}
                                                                onChange={handleInputChange}
                                                                placeholder={datos.fecha}
                                                                disabled={lineaActiva !== lista.id}/>
                                                    </td>  
                                                <td>
                                                    <input
                                                        className={lista.id}
                                                        type="number"
                                                        name="cantidad"
                                                        step="0.01"
                                                        value={lineaActiva === lista.id ? datos.cantidad : ''}
                                                        onChange={handleInputChange}
                                                        placeholder={lista.cantidad}
                                                        disabled={lineaActiva !== lista.id}
                                                    />

                                                </td>
                                                <td>
                                                    <input  className={lista.id}
                                                            type = "text"                                                                      
                                                            name='albaran'                                                             
                                                            value= {datos.albaran}
                                                            onChange={handleInputChange}
                                                            placeholder={lista.albaran}
                                                            disabled={lineaActiva !== lista.id}/>
                                                </td> 
                                                <td>{lista.almacen.nombre}</td> 
                                                <td>
                                                    <Form.Group id={lista.id}>
                                                        <Form.Control as="select" 
                                                                    className={lista.id} 
                                                                    name='almacen' 
                                                                    value={datos.almacen}
                                                                    onChange={handleInputChange}
                                                                    disabled={lineaActiva !== lista.id}>
                                                                    <option key={0} value={''}>
                                                                        ----
                                                                    </option>
                                                                    {almacenes && almacenes.map( al => {
                                                                        return (
                                                                        <option key={al.almacen.id} value={al.almacen.id}>
                                                                            {al.almacen.nombre}
                                                                        </option>
                                                                        )
                                                                    })}
                                                        </Form.Control>
                                                    </Form.Group>
                                                </td>                                                    
                                                <td>                                                            
                                                    <PencilFill className="mr-3 pencil" onClick= {event => {habilitar_linea(lista)}}/>                                               
                                                    <HandThumbsUpFill
                                                        onClick={() => {
                                                            if (lineaActiva === lista.id) guardarMovimiento();
                                                        }}
                                                        className={`mr-3 pencil ${lineaActiva === lista.id ? '' : 'text-muted'}`}
                                                        style={{ cursor: lineaActiva === lista.id ? 'pointer' : 'not-allowed' }}
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    }
                                )}                                                                   
                                </tbody>                                
                            </Table>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>                                               
                    <Button variant="info" onClick={handlerListCancelar}>
                        Cancelar
                    </Button>
                </Modal.Footer>
        </Modal>
    )

}
export default MovLista;