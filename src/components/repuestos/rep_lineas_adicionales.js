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
    const [filtroII, setFiltroII] = useState( `?page=${1}`);
    const [buscando, setBuscando] = useState(false);
    const [count, setCount] = useState(null);
    let filtroPag=(null);

    const actualizaFiltro = str => {
        setFiltroII(str);
    } 

    const [datos, setDatos] = useState({
        pagina: 1,
    });

    useEffect(()=>{
        filtroPag = (`&page=${datos.pagina}`);
        if (!buscando){
            setFiltro(filtroII + filtroPag);
        }
    },[buscando, filtroII, datos.pagina]);

    useEffect(()=>{
        if (filtro){
            setBuscando(true);
            axios.get(BACKEND_SERVER + '/api/repuestos/linea_adicional_detalle/' + filtro,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }
            })
            .then( res => {;
                setLineasAdicionales(res.data.results);
                setCount(res.data.count);
                setBuscando(false);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, filtro]);

    const cambioPagina = (pag) => {
        if(pag<=0){
            pag=1;
        }
        else if(pag>count/20){
            if(count % 20 === 0){
                pag=Math.trunc(count/20);
            }
            if(count % 20 !== 0){
                pag=Math.trunc(count/20)+1;
            }
        }
        if(pag>0){
            setDatos({
                ...datos,
                pagina: pag,
            })
        }
    } 

    return (
        <Container className="mt-5">
            <Row>
                <Col>
                    <LineasAdicionalesFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista líneas adicionales</h5>
                    <table>
                        <tbody>
                            <th><button type="button" class="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                            <th><button type="button" class="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                            <th>Número registros: {count}</th>
                        </tbody>
                    </table>
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
            <table>
                <tbody>
                    <th><button type="button" class="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                    <th><button type="button" class="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                    <th>Número registros: {count}</th>
                </tbody>
            </table>
        </Container>
    );
}

export default LineaAdicional;