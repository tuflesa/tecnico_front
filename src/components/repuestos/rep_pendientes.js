import React, { useEffect, useState, useCallback, useRef  } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Tabs, Tab } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { PencilFill, Receipt } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ListaPedidos from './rep_pendientes_pedidos';

const RepPendientes = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [pendientes, setPendientes] = useState(null);
    const [lineasPendientes, setLineasPendientes] = useState(null);
    const [consumiblesPendientes, setConsumiblesPendientes] = useState(null);
    const [repuestosPendientes, setRepuestosPendientes] = useState(null);
    const [pedfueradefecha, setPedFueradeFecha] = useState(null);
    const [show, setShow] = useState(false);
    const [repuesto_id, setRepuesto_id] = useState(null);

    var fecha = new Date();
    const nosoyTecnico = user['tec-user'].perfil.puesto.nombre!=='Técnico'?false:true;

    const [count, setCount] = useState(null);
    const [count2, setCount2] = useState(null);
    const [count3, setCount3] = useState(null);
    
    const [datos, setDatos] = useState({
        empresa: user['tec-user'].perfil.empresa.id,
        hoy: (fecha.getFullYear() + "-" + (fecha.getMonth()+1) + "-" + fecha.getDate()),
        pagina: 1,
        pagina2: 1,
        pagina3: 1,
    });

    //const stockPorEmpresaRef = useRef({});

    const filtro = `&page=${datos.pagina}&finalizado=${false}&fecha_prevista_entrega__lte=${datos.hoy}&creado_por=${nosoyTecnico?user['tec-user'].perfil.usuario:''}`;
    const filtro2 = `?almacen__empresa__id=${user['tec-user'].perfil.empresa.id}&repuesto__descatalogado=${false}&page=${datos.pagina2}&repuesto__tipo_repuesto=${1}`;
    const filtro3 = `?almacen__empresa__id=${user['tec-user'].perfil.empresa.id}&repuesto__descatalogado=${false}&page=${datos.pagina3}&repuesto__tipo_repuesto=${2}`;

    const total_pag = count === 0 ? 1 : Math.ceil(count/20);
    const total_pag2 = count2 === 0 ? 1 : Math.ceil(count2/20);
    const total_pag3 = count3 === 0 ? 1 : Math.ceil(count3/20);

    const procesarArticulos  = useCallback(async(resultados, tipo_rep) => {
        const promesas = resultados.map(async (item) => {
            try {
                const repuesto_nombre = item.repuesto.nombre_comun || item.repuesto.nombre;
                const repuesto_tipo = item.repuesto.tipo_repuesto;
                const repuesto_critico = item.repuesto.es_critico;
                const id = item.repuesto.id;
                
                const response = await axios.get(
                    `${BACKEND_SERVER}/api/repuestos/stocks_minimo_detalle/?repuesto=${id}&almacen__empresa__id=${datos.empresa}`,
                    {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }
                    }
                );
                
                const stock_empresa = response.data.reduce((a, b) => a + parseFloat(b.stock_act), 0);
                const stock_minimo_empresa = response.data.reduce((a, b) => a + parseFloat(b.cantidad), 0);
                const stock_aconsejado_empresa = response.data.reduce((a, b) => a + parseFloat(b.cantidad_aconsejable), 0);
                
                if (stock_empresa < stock_minimo_empresa || stock_empresa < stock_aconsejado_empresa) {
                    return{
                        id,
                        articulo: repuesto_nombre,
                        tipo: repuesto_tipo,
                        critico: repuesto_critico,
                        stock: stock_empresa,
                        stock_minimo: stock_minimo_empresa,
                        stock_aconsejado: stock_aconsejado_empresa
                    };
                }
                return null;
            } catch (err) {
                console.error('Error procesando artículo:', err);
            }
        });
        const resultadosProcesados = await Promise.all(promesas);
        const articulosValidos = resultadosProcesados.filter(art => art !== null);
        // Ordenar alfabéticamente
        const articulosOrdenados = articulosValidos.sort((a, b) => 
            a.articulo.localeCompare(b.articulo)
        );
        
        if (tipo_rep === 1) {
            setRepuestosPendientes(articulosOrdenados);
        } else if (tipo_rep === 2) {
            setConsumiblesPendientes(articulosOrdenados);
        }

    }, [datos.empresa, token]);
    
    useEffect(() => { //buscamos articulos con stock por debajo del stock mínimo
        let isMounted = true;
        axios.get(BACKEND_SERVER + `/api/repuestos/articulos_fuera_stock/` + filtro2,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => { 
            if (isMounted && res.data.results.length > 0) {
                setCount2(res.data.count);
                procesarArticulos(res.data.results, 1);
            }
        })
        .catch( err => {
            console.log(err);
        });
        return () => { isMounted = false; };
    }, [token, filtro2, procesarArticulos]);  

    useEffect(() => { //buscamos articulos con stock por debajo del stock mínimo
        let isMounted = true;
        axios.get(BACKEND_SERVER + `/api/repuestos/articulos_fuera_stock/` + filtro3,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => { 
            if (isMounted && res.data.results.length > 0) {
                setCount3(res.data.count);
                procesarArticulos(res.data.results, 2);
            }
        })
        .catch( err => {
            console.log(err);
        });
        return () => { isMounted = false; };
    }, [token, filtro3, procesarArticulos]); 

    useEffect(()=>{ //buscamos pedidos pasados de fecha de entrega
        axios.get(BACKEND_SERVER + `/api/repuestos/lista_pedidos_fuera_fecha/?empresa__id=${user['tec-user'].perfil.empresa.id}` + filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setPedFueradeFecha(res.data.results);
            setCount(res.data.count);
        })
        .catch( err => {
            console.log(err);
        });
    },[token, filtro]); 

    useEffect(() => { //buscamos las lineas de los pedidos pendientes para mostrar en las lineas de los articulos fuera de stock
        if (datos.empresa) {
            axios.get(BACKEND_SERVER + `/api/repuestos/linea_pedido_pend/?pedido__finalizado=${'false'}&pedido__empresa=${datos.empresa}`,{
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
        }
    }, [datos.empresa, token]);

    const listarPedidos = (repuesto)=>{
        setRepuesto_id(repuesto);
        setShow(true);
    }

    const handlerListCancelar = ()=>{
        setShow(false);
    }

    const comparar = (x) => {
        if(lineasPendientes){
            return lineasPendientes.some(linea => linea.repuesto.id === x.id) ? "table-success" : "";
        }
        return "";
    }

    const comparar2 = (x) => {
        if (lineasPendientes && x.critico && pedfueradefecha) {
            const tieneLineaPendiente = lineasPendientes.find(linea => linea.repuesto.id === x.id);
            if (tieneLineaPendiente) {
                const pedidoVencido = pedfueradefecha.find(ped => ped.id === tieneLineaPendiente.pedido.id);
                if (pedidoVencido) return "table-success";
            }
        }
        return "";
    }

    const cambioPagina = (nuevaPag) => {
        const pag = Math.max(1, Math.min(nuevaPag, total_pag));
        setDatos(prev => ({ ...prev, pagina: pag }));
    } 

    const cambioPagina2 = (nuevaPag) => {
        const pag = Math.max(1, Math.min(nuevaPag, total_pag2));
        setDatos(prev => ({ ...prev, pagina2: pag }));
    } 

    const cambioPagina3 = (nuevaPag) => {
        const pag = Math.max(1, Math.min(nuevaPag, total_pag3));
        setDatos(prev => ({ ...prev, pagina3: pag }));
    }

    const formatearNumero = (numero) => {
        return Number(numero) % 1 === 0 ? Number(numero) : Number(numero).toFixed(2);
    };    

    return (
        <Container className="mt-5 pt-4">
            <Tabs defaultActiveKey="repuestos" id="tab-control" className="mb-3">
                {/* TAB 1: Repuestos por debajo del stock mínimo */}
                <Tab eventKey="repuestos" title="Repuestos Bajo Stock Mínimo">
                    <Row>
                        <Col>
                            <h5 className="mb-3 mt-3">Repuestos por debajo del stock mínimo</h5>     
                            <table>
                                <tbody>
                                    <tr>
                                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina2(datos.pagina2 - 1)}>Pág Anterior</button></th> 
                                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina2(datos.pagina2 + 1)}>Pág Siguiente</button></th> 
                                        <th>Número páginas: {datos.pagina2} / {total_pag2} - Registros: {count2}</th>
                                    </tr>
                                </tbody>
                            </table>               
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Crítico</th>
                                        <th>Stock Actual</th>
                                        <th>Stock Mínimo</th>
                                        <th>Stock Recomendado</th>
                                        <th>Cant. por recibir</th>
                                        <th style={{ width: 90 }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {repuestosPendientes && lineasPendientes && repuestosPendientes.map(pendiente => {
                                        const cantidadPorRecibir = lineasPendientes
                                            .filter(linea => linea.repuesto.id === pendiente.id) //primero filtro solo los que sean REPUESTOS
                                            .reduce((sum, linea) => sum + parseFloat(linea.por_recibir), 0);
                                        return(
                                                <tr key={pendiente.id} className={comparar2(pendiente) ? "table-warning" : (comparar(pendiente)) ? "table-success" : pendiente.critico ? "table-danger" : ""}>
                                                    <td>{pendiente.articulo}</td>
                                                    <td>{pendiente.critico ? 'Si' : 'No'}</td>
                                                    <td>{formatearNumero(pendiente.stock)}</td>
                                                    <td>{formatearNumero(pendiente.stock_minimo)}</td> 
                                                    <td>{formatearNumero(pendiente.stock_aconsejado)}</td> 
                                                    <td>{formatearNumero(cantidadPorRecibir)}</td>
                                                    <td>
                                                        <Receipt className="mr-3 pencil" onClick={() => listarPedidos(pendiente.id)} />
                                                        <Link to={`/repuestos/${pendiente.id}`}>
                                                            <PencilFill className="mr-3 pencil" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Tab>
    
                {/* TAB 2: Consumibles por debajo del stock mínimo */}
                <Tab eventKey="consumibles" title="Consumibles Bajo Stock Mínimo">
                    <Row>
                        <Col>
                            <h5 className="mb-3 mt-3">Consumibles por debajo del stock mínimo</h5>     
                            <table>
                                <tbody>
                                    <tr>
                                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina3(datos.pagina3-1)}>Pág Anterior</button></th> 
                                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina3(datos.pagina3+1)}>Pág Siguiente</button></th> 
                                        <th>Número páginas: {datos.pagina3} / {total_pag3} - Registros: {count3}</th>
                                    </tr>
                                </tbody>
                            </table>               
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Crítico</th>
                                        <th>Stock Actual</th>
                                        <th>Stock Mínimo</th>
                                        <th>Stock Recomendado</th>
                                        <th>Cant. por recibir</th>
                                        <th style={{ width: 90 }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {consumiblesPendientes && lineasPendientes && consumiblesPendientes.map(pendiente => {
                                        const cantidadPorRecibir = lineasPendientes
                                            .filter(linea => linea.repuesto.id === pendiente.id) //primero filtro solo los que sean CONSUMIBLES
                                            .reduce((sum, linea) => sum + parseFloat(linea.por_recibir), 0);
                                        return(
                                            <tr key={pendiente.id} className={comparar2(pendiente) ? "table-warning" : (comparar(pendiente)) ? "table-success" : pendiente.critico ? "table-danger" : ""}>
                                                <td>{pendiente.articulo}</td>
                                                <td>{pendiente.critico ? 'Si' : 'No'}</td>
                                                <td>{formatearNumero(pendiente.stock)}</td>
                                                <td>{formatearNumero(pendiente.stock_minimo)}</td> 
                                                <td>{formatearNumero(pendiente.stock_aconsejado)}</td>
                                                <td>{formatearNumero(cantidadPorRecibir)}</td>
                                                <td>
                                                    <Receipt className="mr-3 pencil" onClick={() => listarPedidos(pendiente.id)} />
                                                    <Link to={`/repuestos/${pendiente.id}`}>
                                                        <PencilFill className="mr-3 pencil" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Tab>

                {/* TAB 3: Pedidos con fecha prevista vencida */}
                <Tab eventKey="pedidos" title="Pedidos Vencidos">
                    <Row>
                        <Col>
                            <h5 className="mb-3 mt-3">Pedidos con fecha prevista vencida</h5> 
                            <table>
                                <tbody>
                                    <tr>
                                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina(datos.pagina-1)}>Pág Anterior</button></th> 
                                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina(datos.pagina+1)}>Pág Siguiente</button></th> 
                                        <th>Número páginas: {datos.pagina} / {total_pag} - Registros: {count}</th>
                                    </tr>
                                </tbody>
                            </table>                    
                            <Table striped bordered hover style={{tableLayout: 'fixed', width: '100%'}}>
                                <thead>
                                    <tr>
                                        <th style={{width:140, whiteSpace: 'nowrap'}}>Num-Pedido</th>
                                        <th>Empresa</th>
                                        <th>Proveedor</th>
                                        <th>Descripción</th>
                                        <th style={{ width: 110 }}>Fecha Pedido</th>
                                        <th style={{ width: 110 }}>Fecha Entrega</th>
                                        <th style={{ width: 150 }}>Fecha Prevista Entrega</th>
                                        <th>Creado por</th>
                                        <th>Ir al pedido</th>
                                    </tr>
                                </thead>
                                <tbody>                        
                                    {pedfueradefecha && pedfueradefecha.map(pedido => (
                                        <tr key={pedido.id}>
                                            <td>{pedido.numero}</td>
                                            <td>{pedido.empresa.nombre}</td>
                                            <td>{pedido.proveedor.nombre}</td>
                                            <td>{pedido.descripcion}</td>
                                            <td>{invertirFecha(String(pedido.fecha_creacion))}</td>
                                            <td>{pedido.fecha_entrega && invertirFecha(String(pedido.fecha_entrega))}</td>                                        
                                            <td>{pedido.fecha_prevista_entrega && invertirFecha(String(pedido.fecha_prevista_entrega))}</td> 
                                            <td>{pedido.creado_por.get_full_name}</td>
                                            <td>
                                                <Link to={`/repuestos/pedido_detalle/${pedido.id}`}>
                                                    <PencilFill className="mr-3 pencil" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Tab>
            </Tabs>
    
            <ListaPedidos 
                show={show}
                repuesto_id={repuesto_id}
                lineasPendientes={lineasPendientes}
                handlerListCancelar={handlerListCancelar}
            />
        </Container>
    );
}
export default RepPendientes;