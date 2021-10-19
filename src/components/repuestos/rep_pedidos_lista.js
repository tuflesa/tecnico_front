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
    const [filtro, setFiltro] = useState('');

    const actualizaFiltro = str => {
        setFiltro(str);
    } 
    
    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/lista_pedidos/` + filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            console.log(res.data);
            setPedidos(res.data);
            setShow(true);
        })
        .catch( err => {
            console.log(err);
        });
    },[show, filtro]);   

    return (
        <Container>
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
                                <th>Num-Pedido</th>
                                <th>Empresa</th>
                                <th>Proveedor</th>
                                <th>Fecha Pedido</th>
                                <th>Fecha Entrega</th>
                                <th>Finalizado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos && pedidos.map( pedido => {
                                return (
                                    <tr key={pedido.id}>
                                        <td>{pedido.numero}</td>
                                        <td>{pedido.empresa.nombre}</td>
                                        <td>{pedido.proveedor.nombre}</td>
                                        <td>{invertirFecha(String(pedido.fecha_creacion))}</td>
                                        <td>{pedido.fecha_entrega && invertirFecha(String(pedido.fecha_entrega))}</td>                                        
                                        <td>{pedido.finalizado ? 'Si' : 'No'}</td>
                                        <td>
                                            <Link to={`/repuestos/pedido_detalle/${pedido.id}`}>
                                                <PencilFill className="mr-3 pencil"/>
                                            </Link>
                                            <Trash className="trash" />
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