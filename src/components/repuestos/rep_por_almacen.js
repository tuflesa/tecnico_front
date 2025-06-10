import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from 'react-bootstrap/Modal'
import { Button, Row, Col, Table, Container } from 'react-bootstrap';
import { PencilFill, HandThumbsUpFill, Receipt, Trash } from 'react-bootstrap-icons';
import ListaTrazabilidad from './rep_trazabilidad';
import { Link } from 'react-router-dom';
import {invertirFecha} from '../utilidades/funciones_fecha';

const RepPorAlmacen = ({empresa, repuesto, setRepuesto, cerrarListAlmacen, show})=>{
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [showTrazabilidad, setShowTrazabilidad] = useState(false);
    const [traza_repuesto, setTrazaRepuesto] = useState(null);
    const [almacentraza, setAlmacenTraza] = useState(null);
    const [showBorrar, setShowBorrar] = useState(false);
    const [pedidos_pendientes, setPedidosPendientes] = useState(null);
    const [editandoFila, setEditandoFila] = useState({});

    const nosoyTecnico = user['tec-user'].perfil.puesto.nombre!=='Mantenimiento'&&user['tec-user'].perfil.puesto.nombre!=='Operador'?false:true;

    const [datos, setDatos] = useState({
        stocks_minimos: repuesto ? repuesto.stocks_minimos : null,
        almacen: null,
        stock_actual: null,
        stock_minimo: null, 
        stock_aconsejable: null, 
        localizaciones: null,
        habilitar: true,   
    });  

    useEffect(()=>{
        empresa && axios.get(BACKEND_SERVER + `/api/repuestos/linea_pedido_pend/?repuesto=${repuesto.id}&pedido__empresa__id=${empresa}&pedido__finalizado=${false}` ,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            const pedidosPendientesPositivos = res.data.filter( p => p.por_recibir > 0);
            setPedidosPendientes(pedidosPendientesPositivos.sort(function(a, b){
                if(a.id > b.id){
                    return 1;
                }
                if(a.id < b.id){
                    return -1;
                }
                return 0;
            }));
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, empresa]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })        
    }
    
    const ActualizaStock = (r) =>{ 
        let r_id = r.id;
        let r_almacen = r.almacen.id;
        axios.patch(BACKEND_SERVER + `/api/repuestos/stocks_minimos/${r_id}/`, {
            cantidad: datos.stock_minimo ? datos.stock_minimo : repuesto.stocks_minimos.cantidad, 
            cantidad_aconsejable: datos.stock_aconsejable ? datos.stock_aconsejable : repuesto.stocks_minimos.cantidad_aconsejable,  
            stock_act: datos.stock_actual ? 0 : repuesto.stocks_minimos.stock_act,
            localizacion: datos.localizaciones ? datos.localizaciones : repuesto.stocks_minimos.localizacion,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            habilitar_linea(r);
            const updatedStock = { //actualiza la variable repuesto.stocks_minimos para mostrar el cambio y no el dato anterior.
                ...r,
                cantidad: datos.stock_minimo ? datos.stock_minimo : r.cantidad,
                cantidad_aconsejable: datos.stock_aconsejable ? datos.stock_aconsejable : r.cantidad_aconsejable,
                stock_act: datos.stock_actual ? datos.stock_actual : r.stock_act,
                localizacion: datos.localizaciones ? datos.localizaciones : r.localizacion
            };
            
            const nuevosStocks = repuesto.stocks_minimos.map(item => 
                item.id === r.id ? updatedStock : item
            );
        
            setRepuesto({
                ...repuesto,
                stocks_minimos: nuevosStocks
            });
            if (datos.stock_actual){
                const hoy = new Date();
                var dd = String(hoy.getDate()).padStart(2, '0');
                var mm = String(hoy.getMonth() + 1).padStart(2, '0'); //Enero es 0!
                var yyyy = hoy.getFullYear();
                
                axios.post(BACKEND_SERVER + `/api/repuestos/inventario/`, {
                    nombre : 'Ajuste de stock',
                    fecha_creacion : yyyy + '-' + mm + '-' + dd,
                    responsable : user['tec-user'].id
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }     
                })
                .then( res => { 
                        const inventario = res.data
                        axios.post(BACKEND_SERVER + `/api/repuestos/lineainventario/`, {
                            inventario : inventario.id,
                            repuesto : repuesto.id,
                            almacen : r_almacen,
                            cantidad : datos.stock_actual, 
                        }, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }     
                        })
                        .then( res => {
                            const linea_inventario = res.data;
                            axios.post(BACKEND_SERVER + `/api/repuestos/movimiento/`, {
                                fecha : yyyy + '-' + mm + '-' + dd,
                                cantidad : datos.stock_actual,
                                almacen : r_almacen,
                                usuario : user['tec-user'].id,
                                linea_inventario : linea_inventario.id
                            }, {
                                headers: {
                                    'Authorization': `token ${token['tec-token']}`
                                }     
                            })
                            .then( res => {
                            })
                            .catch( err => {console.log(err);})
                        })
                        .catch( err => {console.log(err);})
                    }
                )
            }
        })
        .catch(err => { console.log(err);})
    }

    const handlerListCancelar = () => {      
        cerrarListAlmacen();
        setDatos({
            ...datos,
            stock_actual: '',
            stock_minimo: '',
            localizaciones: '',
        });
        setEditandoFila({});
    } 

    const habilitar_linea = (r) => {
        if (user['tec-user'].perfil.puesto.nombre !== 'Operador') {
            setEditandoFila(prev => ({
                ...prev,
                [r.id]: !prev[r.id] // toggle edición por ID de la fila
            }));
        } else {
            alert('No tienes permisos');
        }
    };

    /* const habilitar_linea = (r) => {
        if (user['tec-user'].perfil.puesto.nombre !== 'Operador') {
            var input_min = document.getElementsByClassName(r.almacen.nombre);
            const currentlyDisabled = input_min[0].disabled; // Comprobar si actualmente están habilitados o deshabilitados
            for (var i = 0; i < input_min.length; i++) {
                let input = input_min[i];
                // Si estaban deshabilitados, aplicar condiciones específicas
                if (currentlyDisabled) {
                    if (repuesto.es_critico === true) {
                        input.disabled = input.name === 'stock_aconsejable';
                    } else {
                        input.disabled = input.name === 'stock_minimo';
                    }
                } 
                // Si estaban habilitados, deshabilitar todos
                else {
                    input.disabled = true;
                }
            }
        } else {
            alert('No tienes permisos');
        }
    }; */

    const BorrarAlmacen = (r)=>{
        if(r.stock_act>0){
            setShowBorrar(true);
        }
        else{
            var confirmacion = window.confirm('Se va a eliminar el almacén ¿desea continuar?');
                if(confirmacion){
                    fetch (BACKEND_SERVER + `/api/repuestos/stocks_minimos/${r.id}`,{
                        method: 'DELETE',
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }
                    })
                    .then( res => { 
                        //updatePedido();
                    })
                }
        }
    }

    const handleCloseTraza = () => setShowTrazabilidad(false);

    const trazabilidad = (almacen_id) => {
        setTrazaRepuesto(repuesto);
        setAlmacenTraza(almacen_id);
        setShowTrazabilidad(true);
    }

    const handlerClose = () => {
        setShowBorrar(false);
    } 

    const formatearNumero = (numero) => {
        return Number(numero) % 1 === 0 ? Number(numero) : Number(numero).toFixed(2);
    };
    
    return (
        <Container>
            <Modal index={1} show={show} backdrop="static" keyboard={ false } animation={false} size="xl" >
                <Modal.Header>                
                    <Modal.Title>Repuestos por almacén</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col>
                            <Row>
                                <Col>
                                <h5 className="pb-3 pt-1 mt-2">Stock por almacén:</h5>
                                </Col>                                            
                            </Row>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Almacén</th>
                                        <th>Ubicación</th>
                                        <th>Stock Actual</th>
                                        <th style={{ 
                                            fontStyle: repuesto.es_critico === false ? "italic" : "normal",
                                            color: repuesto?.es_critico === false ? "#808080" : "black" 
                                        }}>
                                            Stock Mínimo
                                        </th>
                                        <th style={{ 
                                            fontStyle: repuesto.es_critico === true ? "italic" : "normal",
                                            color: repuesto?.es_critico === true ? "#808080" : "black"
                                        }}>
                                                Stock Recomendado
                                        </th>
                                        {!nosoyTecnico?<th>Acciones</th>:null}
                                    </tr>
                                </thead>
                                {repuesto ?
                                    <tbody>
                                        {repuesto.stocks_minimos && repuesto.stocks_minimos.map( r => {                                                                      
                                                if(r.almacen.empresa === empresa){                                                
                                                    return (                                                    
                                                        <tr key={r.id}>
                                                            <td>{r.almacen.nombre}</td> 
                                                            <td>
                                                            <input          className={r.almacen.nombre} 
                                                                            type = "text" 
                                                                            name='localizaciones'
                                                                            value= {datos.localizaciones}
                                                                            onChange={handleInputChange}
                                                                            placeholder={r.localizacion}
                                                                            disabled={!editandoFila[r.id]}
                                                            />
                                                            </td>                                                                                                       
                                                            <td>
                                                            <input          className={r.almacen.nombre} 
                                                                            type = "text" 
                                                                            name='stock_actual'
                                                                            value= {editandoFila[r.id] ? datos.stock_actual : formatearNumero(r.stock_act)}
                                                                            onChange={handleInputChange}
                                                                            placeholder={r.stock_act}
                                                                            disabled={!editandoFila[r.id]}
                                                            />
                                                            </td>
                                                            <td>
                                                            <input  className={r.almacen.nombre}
                                                                    type = "text"                                                                      
                                                                    name='stock_minimo' 
                                                                    value= {editandoFila[r.id] ? datos.stock_minimo : formatearNumero(r.cantidad)}
                                                                    onChange={handleInputChange}
                                                                    placeholder={r.cantidad}
                                                                    disabled={!(editandoFila[r.id]&& r.repuesto.es_critico === true)}
                                                            />
                                                            </td> 
                                                            <td>
                                                            <input  className={r.almacen.nombre}
                                                                    type = "text"                                                                      
                                                                    name='stock_aconsejable'                                                             
                                                                    value= {editandoFila[r.id] ? datos.stock_aconsejable : formatearNumero(r.cantidad_aconsejable)}
                                                                    onChange={handleInputChange}
                                                                    placeholder={r.cantidad_aconsejable}
                                                                    disabled={!(editandoFila[r.id] && r.repuesto.es_critico === false)} 
                                                            />
                                                            </td>
                                                            {!nosoyTecnico?                                                     
                                                                <td>                                                            
                                                                    <PencilFill className="mr-3 pencil" onClick= {event => {habilitar_linea(r)}}/>                                               
                                                                    <HandThumbsUpFill className="mr-3 pencil" onClick= {async => {ActualizaStock(r)}}/>
                                                                    <Receipt className="mr-3 pencil" onClick={event => {trazabilidad(r.almacen.id)}}/>
                                                                    <Trash className="pencil"  onClick={event =>{BorrarAlmacen(r)}} />
                                                                </td>
                                                            :null}
                                                        </tr>
                                                    )}
                                                })
                                        }
                                    </tbody>
                                : null
                                }
                            </Table>
                        </Col>
                    </Row>
                </Modal.Body>
                <ListaTrazabilidad  showTrazabilidad={showTrazabilidad}
                                    repuesto ={traza_repuesto}
                                    handlerListCancelar={handleCloseTraza}
                                    almacen={almacentraza}
                />
                <Modal color="#FF4606" index={2} show={showBorrar} backdrop="static" keyboard={ false } animation={false} >
                    <Modal.Header>
                        <Modal.Title>Borrar Almacén, no permitido con stock ...</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>Por favor mueva el stock a otro almacén.</p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={handlerClose}>Cerrar</Button>
                    </Modal.Footer>
                </Modal>
                <Modal.Header>                
                    <Modal.Title>Pedidos pendientes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Numero Pedido</th>
                                        <th>Cantidad Pendiente</th>
                                        <th>Proveedor</th>
                                        <th>Fecha estimada</th>
                                        {!nosoyTecnico?<th>Acciones</th>:null}
                                    </tr>
                                </thead>
                                {repuesto ?
                                    <tbody>
                                        {pedidos_pendientes && pedidos_pendientes.map( pedidos => {
                                            return (
                                                <tr key={pedidos.id}>
                                                    <td>{pedidos.pedido.numero}</td>
                                                    <td>{pedidos.por_recibir}</td>
                                                    <td>{pedidos.pedido.proveedor.nombre}</td> 
                                                    <td>{invertirFecha(String(pedidos.pedido.fecha_prevista_entrega))}</td>                                     
                                                    {!nosoyTecnico?
                                                        <td>
                                                            <Link to={`/repuestos/pedido_detalle/${pedidos.pedido.id}`}>
                                                                <PencilFill className="mr-3 pencil"/>
                                                            </Link>
                                                        </td>
                                                    :null}
                                                </tr>
                                            )})
                                        }
                                    </tbody>
                                : null
                                }
                            </Table>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>                                               
                    <Button variant="info" onClick={handlerListCancelar}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>            
        </Container>
    )
}
export default RepPorAlmacen;