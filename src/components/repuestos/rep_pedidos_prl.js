import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Link } from 'react-router-dom';
import { PencilFill } from 'react-bootstrap-icons';

const RepPedidosPRL = () => {
    const [token] = useCookies(['tec-token']);
    const [pedidos_intervencion, setPedidosIntervencion] = useState(null);
    const [pedidos_revisados, setPedidosRevisados] = useState(null);
    const [user] = useCookies(['tec-user']);
    
    useEffect(()=>{        
        axios.get(BACKEND_SERVER + `/api/repuestos/lista_pedidos/?intervencion=${true}&finalizado=${false}&revisado=${false}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            if(user['tec-user'].perfil.empresa.id === 1){
            setPedidosIntervencion(res.data.filter(pedido => pedido.empresa.id===1||pedido.empresa.id===3));
            }
            if(user['tec-user'].perfil.empresa.id ===2){
                setPedidosIntervencion(res.data.filter(pedido => pedido.empresa.id===2));
            }
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(()=>{        
        axios.get(BACKEND_SERVER + `/api/repuestos/lista_pedidos/?intervencion=${true}&finalizado=${false}&revisado=${true}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            if(user['tec-user'].perfil.empresa.id === 1){
                setPedidosRevisados(res.data.filter(pedido => pedido.empresa.id===1||pedido.empresa.id===3));}
                if(user['tec-user'].perfil.empresa.id ===2){
                    setPedidosRevisados(res.data.filter(pedido => pedido.empresa.id===2));
                }
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    return (  
        <Container className="mb-5 mt-5"> 
            <Row>     
                <Col>
                    <h5 className="mb-3 mt-3">Intervenciones por Revisar</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Num pedido</th>
                                <th>Proveedor</th>
                                <th>Fecha Ejecución</th>
                                <th>Creado por</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos_intervencion && pedidos_intervencion.map( pedido => {
                                return (
                                    <tr key={pedido.id}>
                                        <td>{pedido.numero}</td>
                                        <td>{pedido.proveedor.nombre}</td>
                                        <td>{pedido.fecha_prevista_entrega}</td>
                                        <td>{pedido.creado_por.get_full_name
                                        }</td>
                                        <td>
                                            <Link to={`/repuestos/pedido_detalle/${pedido.id}`}><PencilFill className="mr-3 pencil"/></Link>
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>          
                <Col>
                    <h5 className="mb-3 mt-3">Intervenciones Revisadas - sin ejecutar -</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Num pedido</th>
                                <th>Proveedor</th>
                                <th>Fecha Ejecución</th>
                                <th>Creado por</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos_revisados && pedidos_revisados.map( pedido => {
                                return (
                                    <tr key={pedido.id}>
                                        <td>{pedido.numero}</td>
                                        <td>{pedido.proveedor.nombre}</td>
                                        <td>{pedido.fecha_prevista_entrega}</td>
                                        <td>{pedido.creado_por.get_full_name
                                        }</td>
                                        <td>
                                            <Link to={`/repuestos/pedido_detalle/${pedido.id}`}><PencilFill className="mr-3 pencil"/></Link>
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

export default RepPedidosPRL;