import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
//import LineasAdicionalesFiltro from './rep_lineas_adicionales_filtro';
import LineasPorAlbaranFiltro from './rep_lineas_por_albaran_filtro';

const LineaPorAlbaran = () => {
    
    const [token] = useCookies(['tec-token']);
    const [filtro, setFiltro] = useState(``);
    const [pedidos, setPedidos] = useState([]);
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

    useEffect(() => {
        if (!filtro) return;

        const source = axios.CancelToken.source();
        setBuscando(true);
        axios.get(BACKEND_SERVER + '/api/repuestos/pedidos_por_albaran/' + filtro, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            },
            cancelToken: source.token
        })
        .then(res => {
            setPedidos(res.data.results);
            setCount(res.data.count);
            setBuscando(false);
        })
        .catch(err => {
            if (axios.isCancel(err)) {
                console.log("Petición cancelada");
            } else {
                console.error(err);
            }
        });

        return () => {
            source.cancel();
        };
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
                    <LineasPorAlbaranFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Búsquedas por albarán</h5>
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
                                <th>Creado por</th>
                                <th style={{width:90}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.length > 0 ? (
                                pedidos && pedidos.map( pedido => {
                                    return (
                                        <tr key={pedido.id}>
                                            <td>{pedido.numero}</td>
                                            <td>{pedido.proveedor.nombre}</td>
                                            <td>{pedido.creado_por.get_full_name}</td>
                                            <td>
                                                <Link to={`/repuestos/pedido_detalle/${pedido.id}`}>
                                                    <PencilFill className="mr-3 pencil"/>
                                                </Link>
                                            </td>
                                        </tr>
                                    )})
                                ): (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center' }}>No hay resultados</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row> 
            <table>
                <tbody>
                    <td><button type="button" class="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina-1)}}>Pág Anterior</button></td> 
                    <td><button type="button" class="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina+1)}}>Pág Siguiente</button></td> 
                    <td>Número registros: {count}</td>
                </tbody>
            </table>
        </Container>
    );
}

export default LineaPorAlbaran;