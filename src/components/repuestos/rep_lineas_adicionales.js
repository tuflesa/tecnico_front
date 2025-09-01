import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import LineasAdicionalesFiltro from './rep_lineas_adicionales_filtro';

const LineaAdicional = () => {
    
    const [token] = useCookies(['tec-token']);
    const [lineas_adicionales, setLineasAdicionales] = useState(null);
    const [filtroBase, setFiltroBase] = useState( `?page=${1}`);
    const [buscando, setBuscando] = useState(false);
    const [count, setCount] = useState(null);
    const [pagina, setPagina] = useState(1);
    const [totalPag, setTotalPag] = useState(0);

    const actualizaFiltro = (nuevoFiltro) => {
        if (nuevoFiltro !== filtroBase) {
            setFiltroBase(nuevoFiltro);
            setPagina(1); // Reset a página 1 cuando cambia el filtro
        }
    } 

    useEffect(()=>{
        let filtroCompleto;
        if (filtroBase) {
            // Si ya hay filtro base, agregar page con &
            const separador = filtroBase.includes('?') ? '&' : '?';
            filtroCompleto = `${filtroBase}${separador}page=${pagina}`;
        } else {
            // Si no hay filtro base, solo page
            filtroCompleto = `page=${pagina}`;
        }
        buscarLinea(filtroCompleto);
    },[filtroBase, pagina]);

    const buscarLinea = useCallback(async (filtroCompleto) => {
        if (buscando) return;

        setBuscando(true);
        try{
            const response = await axios.get(BACKEND_SERVER + '/api/repuestos/linea_adicional_detalle/?' + filtroCompleto,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            });
                setLineasAdicionales(response.data.results);
                setCount(response.data.count);
                // Calcular total de páginas
                const totalPaginas = response.data.count % 20 === 0 
                    ? Math.max(1, Math.trunc(response.data.count / 20))
                    : Math.trunc(response.data.count / 20) + 1;
                setTotalPag(totalPaginas);
            }catch(err){
                console.log(err);
            } finally {
            setBuscando(false);
        }
    }, [token, buscando]);

    const cambioPagina = (pag) => {
        if(pag<=0){
            pag=1;
        }
        let maxPag = 1;
        if(count){
            maxPag = count % 20 === 0 ? Math.trunc(count/20) : Math.trunc(count/20) + 1;
            if (maxPag === 0) maxPag = 1;
        }
        if(pag > maxPag){
            pag = maxPag;
        }
        if(pag !==pagina && pag>0){
            setPagina(pag);
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
                            <th><button type="button" class="btn btn-default" onClick={() => {cambioPagina(pagina-1)}}>Pág Anterior</button></th> 
                            <th><button type="button" class="btn btn-default" onClick={() => {cambioPagina(pagina+1)}}>Pág Siguiente</button></th> 
                            <th>Número páginas: {pagina} / {totalPag} - Registros: {count || 0}</th>
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
                    <th><button type="button" class="btn btn-default" onClick={() => {cambioPagina(pagina-1)}}>Pág Anterior</button></th> 
                    <th><button type="button" class="btn btn-default" onClick={() => {cambioPagina(pagina+1)}}>Pág Siguiente</button></th> 
                    <th>Número páginas: {pagina} / {totalPag} - Registros: {count || 0}</th>
                </tbody>
            </table>
        </Container>
    );
}

export default LineaAdicional;