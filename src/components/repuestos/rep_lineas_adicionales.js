import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import LineasAdicionalesFiltro from './rep_lineas_adicionales_filtro';

const LineaAdicional = () => {
    
    const [token] = useCookies(['tec-token']);
    const [filtro, setFiltro] = useState(``);
    const [lineas_adicionales, setLineasAdicionales] = useState(null);
    const [filtroII,setFiltroII] = useState( ``);
    const [buscando,setBuscando] = useState(false);

    const actualizaFiltro = str => {
        setFiltroII(str);
    } 

    useEffect(()=>{
        if (!buscando){
            setFiltro(filtroII);
        }
    },[buscando, filtroII]);

    useEffect(()=>{
        if (filtro){
            setBuscando(true);
            axios.get(BACKEND_SERVER + '/api/repuestos/linea_adicional_detalle/' + filtro,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }
            })
            .then( res => {
                setLineasAdicionales(res.data);
                setBuscando(false);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, filtro]);

    return (
        <Container className="mt-5">
            <Row>
                <Col>
                    <LineasAdicionalesFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista lineas adionales</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th style={{width:138}}>Num-Pedido</th>
                                <th>Proveedor</th>
                                <th>Descripción</th>
                                <th style={{width:110}}>Cantidad</th>
                                <th style={{width:110}}>Por Recibir</th>
                                <th style={{width:110}}>Precio</th>
                                <th style={{width:110}}>Dto.</th>
                                <th style={{width:110}}>Total</th>
                                <th style={{width:90}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineas_adicionales && lineas_adicionales.map( linea => {
                                return (
                                    <tr key={linea.id}>
                                        <td>{linea.pedido.numero}</td>
                                        <td>{linea.pedido.proveedor.nombre}</td>
                                        <td>{linea.descripcion}</td>                  
                                        <td>{linea.cantidad}</td> 
                                        <td>{linea.por_recibir}</td> 
                                        <td>{linea.precio}</td>
                                        <td>{linea.descuento}</td>
                                        <td>{linea.total}</td>
                                        <td>
                                            <Link to={`/repuestos/pedido_detalle/${linea.pedido.id}`}>
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
        </Container>
    );
}

export default LineaAdicional;