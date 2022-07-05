import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import PedidosFiltro from './rep_pedidos_filtro';
import {invertirFecha} from '../utilidades/funciones_fecha';

const PedLista = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [pedidos, setPedidos] = useState(null);
    const [show, setShow] = useState(false);
    const [filtro, setFiltro] = useState(`?empresa=${user['tec-user'].perfil.empresa.id}&finalizado=${false}`);

    const actualizaFiltro = str => {
        setFiltro(str);
    } 
    
    const BorrarP = (pedido)=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/pedido_detalle/${pedido.id}/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            borrarPedido(res.data);    
        })
        .catch( err => {
            console.log(err);
        });
    }

    const borrarPedido = (pedido) =>{
        var y=0;
        do{
            if(pedido.lineas_pedido.length===0){
                y=pedido.lineas_pedido.length;
            }
            else if(pedido.lineas_pedido[y].cantidad === pedido.lineas_pedido[y].por_recibir){
                y++;
            }
            else{
                return alert ('no se puede borrar el pedido,hay lineas con movimientos de recepción');
            }
        }while (y<pedido.lineas_pedido.length);
        if (y===pedido.lineas_pedido.length||pedido.lineas_pedido.length===0){            
            var confirmacion = window.confirm('¿Deseas eliminar el pedido?');
            if(confirmacion){
                fetch (BACKEND_SERVER + `/api/repuestos/pedido_detalle/${pedido.id}/`,{
                    method: 'DELETE',
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then( res => {  
                    //return alert('Se va a borrar el pedido'); 
                })
                .catch( err => {
                    console.log(err);
                });
            }
            setShow(!show);
        }

    }

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/lista_pedidos/` + filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setPedidos(res.data.sort(function(a, b){
                if(a.numero > b.numero){
                    return 1;
                }
                if(a.numero < b.numero){
                    return -1;
                }
                return 0;
            }))
            setShow(true);
        })
        .catch( err => {
            console.log(err);
        });
    },[show, filtro]); 
   
    return (
        <Container className="mt-5">
            <Row>
                <Col>
                    <PedidosFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Pedidos</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th style={{width:130}}>Num-Pedido</th>
                                <th>Creado por</th>
                                <th>Empresa</th>
                                <th>Proveedor</th>
                                <th style={{width:110}}>Fecha Pedido</th>
                                <th style={{width:110}}>Fecha Entrega</th>
                                <th style={{width:110}}>Fecha Prevista Entrega</th>
                                <th>Finalizado</th>
                                <th style={{width:90}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos && pedidos.map( pedido => {
                                return (
                                    <tr key={pedido.id}>
                                        <td>{pedido.numero}</td>
                                        <td>{pedido.creado_por.get_full_name}</td>
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
                                            <Trash className="trash"  onClick={event =>{BorrarP(pedido)}} />
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row> 
        </Container>
    )
}

export default PedLista;