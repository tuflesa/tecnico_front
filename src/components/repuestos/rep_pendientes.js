import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import ReactExport from 'react-data-export';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { PencilFill, Receipt } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { format } from 'd3';
import ListaPedidos from './rep_pendientes_pedidos';

const RepPendientes = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [pendientes, setPendientes] = useState(null);
    const [lineasPendientes, setLineasPendientes] = useState(null);
    const [pedfueradefecha, setPedFueradeFecha] = useState(null);
    const [show, setShow] = useState(false);
    const [repuesto_id, setRepuesto_id] = useState(null);
    var fecha = new Date();
    var LineasConRepuestos = '';
    
    const [datos, setDatos] = useState({
        empresa: user['tec-user'].perfil.empresa.id,
        hoy: (fecha.getFullYear() + "-" + (fecha.getMonth()+1) + "-" + fecha.getDate()),
    });

    const [filtro, setFiltro] = useState(`?empresa=${datos.empresa}&finalizado=${false}&fecha_prevista_entrega__lte=${datos.hoy}`);
    
    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/repuestos/articulos_fuera_stock/?almacen__empresa__id=${datos.empresa}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => { ;
            setPendientes(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);   
    
    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/lista_pedidos/` + filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setPedFueradeFecha(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    },[token]); 

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/repuestos/linea_pedido_pend/?pedido__finalizado=${'False'}&pedido__empresa=${datos.empresa}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( rs => {
            setLineasPendientes(rs.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    const listarPedidos = (repuesto)=>{
        setRepuesto_id(repuesto);
        setShow(true);
    }

    const handlerListCancelar = ()=>{
        setShow(false);
    }

    return (
        <Container>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Repuestos por debajo del stock mínimo</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Stock Actual</th>
                                <th>Stock Mínimo</th>
                                <th>Cant. por recibir</th>
                                <th>Pedidos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendientes && pendientes.map( pendiente => {
                                return (
                                    <tr key={pendiente.id}>
                                        <td>{pendiente.repuesto.nombre}</td>
                                        <td>{pendiente.stock_act}</td>
                                        <td>{pendiente.cantidad}</td> 
                                        <td>{lineasPendientes && lineasPendientes.map( linea => {
                                            let suma = 0;
                                            if(linea.repuesto === pendiente.repuesto.id){                                        
                                                suma = suma + parseInt(linea.por_recibir);
                                            }
                                            return suma;
                                        }).reduce((partialSum, a) => partialSum + a, 0)}                                            
                                        </td>
                                        <td>
                                        <Receipt className="mr-3 pencil" onClick={event =>{listarPedidos(pendiente.repuesto.id)}}/>
                                        </td>

                                    </tr>
                                )
                            })
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Pedidos con fecha prevista vencida</h5>                    
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                                <th>Num-Pedido</th>
                                <th>Empresa</th>
                                <th>Proveedor</th>
                                <th>Fecha Pedido</th>
                                <th>Fecha Entrega</th>
                                <th>Fecha Prevista Entrega</th>
                                <th>Finalizado</th>
                                <th>Ir al pedido</th>
                            </tr>
                        </thead>
                        <tbody>                        
                            {pedfueradefecha && pedfueradefecha.map( pedido => {
                                return (
                                    <tr key={pedido.id}>
                                        <td>{pedido.numero}</td>
                                        <td>{pedido.empresa.nombre}</td>
                                        <td>{pedido.proveedor.nombre}</td>
                                        <td>{invertirFecha(String(pedido.fecha_creacion))}</td>
                                        <td>{pedido.fecha_entrega && invertirFecha(String(pedido.fecha_entrega))}</td>                                        
                                        <td>{pedido.fecha_prevista_entrega && invertirFecha(String(pedido.fecha_prevista_entrega))}</td> 
                                        <td>{pedido.finalizado ? 'Si' : 'No'}</td>
                                        <td>
                                            <Link to={`/repuestos/pedido_detalle/${pedido.id}`}>
                                                <PencilFill className="mr-3 pencil"/>
                                            </Link>
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <ListaPedidos   show={show}
                            repuesto_id ={repuesto_id}
                            lineasPendientes={lineasPendientes}
                            handlerListCancelar={handlerListCancelar}
            />
        </Container>
    )
}
export default RepPendientes;