import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Button, Row, Form, Modal, Col, Table } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { PencilFill, HandThumbsUpFill, Receipt } from 'react-bootstrap-icons';
import { curveLinearClosed } from 'd3';
import { constants } from 'buffer';

const MovLista = ({linea, handleCloseListMovimiento, show}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [listados, setListados] = useState(null);
    const [lineaElegida, setLineaElegida]=useState(null);
    const [almacenes, setAlmacenes]=useState(null);
    const [reset, setReset]=useState(null);

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
    },[linea, token]);

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
    const habilitar_linea = (r)=>{;
        setLineaElegida(r);
        if(user['tec-user'].perfil.puesto.nombre!=='Operador'){
            var input_min =  document.getElementsByClassName(r.id);
            for(var i = 0; i < input_min.length; i++) {
                input_min[i].disabled = !input_min[i].disabled;
            }
        }
        else (alert('no tienes permisos'))
    }

    const guardarMovimiento = () => {
        habilitar_linea(lineaElegida);
        axios.patch(BACKEND_SERVER + `/api/repuestos/movimiento/${lineaElegida.id}/`, { 
            fecha: datos.fecha? datos.fecha : lineaElegida.fecha,
            cantidad: datos.cantidad !==''? datos.cantidad : lineaElegida.cantidad,
            almacen: datos.almacen? datos.almacen : lineaElegida.almacen.id,
            usuario: user['tec-user'].id,
            linea_pedido: lineaElegida.linea_pedido,
            linea_inventario: lineaElegida.linea_inventario,
            albaran: datos.albaran? datos.albaran : lineaElegida.albaran,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimos/?repuesto=${linea.repuesto.id}&almacen=${lineaElegida.almacen.id}`, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }     
            })
            .then( r => { 
                axios.patch(BACKEND_SERVER + `/api/repuestos/stocks_minimos/${r.data[0].id}/`, {
                    stock_act: (r.data[0].stock_act - res.data.cantidad) - (listados[0].cantidad - res.data.cantidad), 
                    }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                      }     
                })
                .then( rs => { 
                    if(lineaElegida.cantidad!==res.data.cantidad){ //de momento funciona bien
                        axios.patch(BACKEND_SERVER + `/api/repuestos/linea_pedido/${linea.id}/`, {
                            por_recibir: linea.por_recibir + (lineaElegida.cantidad - datos.cantidad),            
                        }, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }     
                        })
                        .then( res => {    
                            habilitar_linea(lineaElegida);
                        })
                        .catch(err => { console.log(err);})
                    }
                })
                .catch(err => { console.log(err);})
            })
            .catch(err => { console.log(err);})
            actualizarRecibir();           
            handlerCancelar();
        })
        .catch(err => { console.log(err);})
    }

    const handlerCancelar = () => {  
        datos.recibido= '';
        datos.albaran = '';
        datos.almacen = '';
    } 

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
                                                                value= {datos.fech}
                                                                onChange={handleInputChange}
                                                                placeholder={datos.fecha}
                                                                disabled/>
                                                    </td>  
                                                <td>
                                                    <input  className={lista.id} 
                                                            type = "text" 
                                                            name='cantidad'
                                                            value= {datos.cantida}
                                                            onChange={handleInputChange}
                                                            placeholder={lista.cantidad}
                                                            disabled/>
                                                </td>
                                                <td>
                                                    <input  className={lista.id}
                                                            type = "text"                                                                      
                                                            name='albaran'                                                             
                                                            value= {datos.albara}
                                                            onChange={handleInputChange}
                                                            placeholder={lista.albaran}
                                                            disabled/>
                                                </td> 
                                                <td>{lista.almacen.nombre}</td> 
                                                <td>
                                                    <Form.Group id={lista.id}>
                                                        <Form.Control as="select" 
                                                                    className={lista.id} 
                                                                    name='almacen' 
                                                                    value={datos.alma}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Almacén"
                                                                    disabled>
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
                                                    <HandThumbsUpFill className="mr-3 pencil" onClick= {async => {guardarMovimiento()}}/>
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