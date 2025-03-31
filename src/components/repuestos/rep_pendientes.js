import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Button, Tabs, Tab } from 'react-bootstrap';
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
    const stock_por_empresa = [];
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
        total_pag:0,
        total_pag2:0,
        total_pag3:0,
    });

    const [filtro, setFiltro] = useState(`?empresa=${datos.empresa}&page=${datos.pagina}&finalizado=${false}&fecha_prevista_entrega__lte=${datos.hoy}&creado_por=${nosoyTecnico?user['tec-user'].perfil.usuario:''}`);
    const [filtro2, setFiltro2] = useState(`?almacen__empresa__id=${datos.empresa}&repuesto__descatalogado=${false}&page=${datos.pagina}&repuesto__tipo_repuesto=${1}`);
    const [filtro3, setFiltro3] = useState(`?almacen__empresa__id=${datos.empresa}&repuesto__descatalogado=${false}&page=${datos.pagina}&repuesto__tipo_repuesto=${2}`);

    useEffect(() => {
        setFiltro3(`?almacen__empresa__id=${datos.empresa}&repuesto__descatalogado=${false}&page=${datos.pagina2}&repuesto__tipo_repuesto=${2}`);
    },[datos.pagina3, token]);

    useEffect(() => {
        setFiltro2(`?almacen__empresa__id=${datos.empresa}&repuesto__descatalogado=${false}&page=${datos.pagina2}&repuesto__tipo_repuesto=${1}`);
    },[datos.pagina2, token]);

    useEffect(() => {
        setFiltro(`?empresa__id=${datos.empresa}&page=${datos.pagina}&finalizado=${false}&fecha_prevista_entrega__lte=${datos.hoy}&creado_por=${nosoyTecnico?user['tec-user'].perfil.usuario:''}`);
    },[datos.pagina, datos.empresa, datos.hoy, token]);
    
    useEffect(() => { //buscamos articulos con stock por debajo del stock mínimo
        axios.get(BACKEND_SERVER + `/api/repuestos/articulos_fuera_stock/` + filtro2,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => { 
            repuestos_consumibles(res.data.count, res.data.results, res.data.results[0].repuesto.tipo_repuesto);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro2]);  

    useEffect(() => { //buscamos articulos con stock por debajo del stock mínimo
        axios.get(BACKEND_SERVER + `/api/repuestos/articulos_fuera_stock/` + filtro3,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => { 
            repuestos_consumibles(res.data.count, res.data.results, res.data.results[0].repuesto.tipo_repuesto);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro3]); 

    const repuestos_consumibles = (res_data_count, res_data_results, tipo_rep)=>{        
        for(var x=0;x<res_data_results.length; x++){
            let repuesto_nombre = res_data_results[x].repuesto.nombre_comun?res_data_results[x].repuesto.nombre_comun:res_data_results[x].repuesto.nombre;
            let repuesto_tipo = res_data_results[x].repuesto.tipo_repuesto;
            let repuesto_critico = res_data_results[x].repuesto.es_critico;
            let id = res_data_results[x].repuesto.id;
            axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimo_detalle/?repuesto=${res_data_results[x].repuesto.id}&almacen__empresa__id=${datos.empresa}`, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }     
            })
            .then( r => {
                const stock_empresa = r.data.reduce((a, b) => a + b.stock_act, 0);
                const stock_minimo_empresa = r.data.reduce((a, b) => a + b.cantidad, 0);
                const stock_aconsejado_empresa = r.data.reduce((a, b) => a + b.cantidad_aconsejable, 0);
                if(stock_empresa<stock_minimo_empresa || stock_empresa<stock_aconsejado_empresa){
                    if(res_data_results.length>0){
                        stock_por_empresa.push({id: id, articulo: repuesto_nombre, tipo:repuesto_tipo, critico: repuesto_critico, stock: stock_empresa, stock_minimo: stock_minimo_empresa, stock_aconsejado: stock_aconsejado_empresa});            
                    }
                    if(stock_por_empresa){
                        let hash = {};
                        let sinduplicados = stock_por_empresa;
                        let sinduplicadosRep = stock_por_empresa;
                        let sinduplicadosCon = stock_por_empresa;
                        sinduplicadosRep = sinduplicadosRep.filter(o => o.tipo === 1 && (hash[o.id] ? false : hash[o.id] = true));
                        sinduplicadosCon = sinduplicadosCon.filter(o => o.tipo === 2 && (hash[o.id] ? false : hash[o.id] = true));
                        setPendientes(sinduplicados.sort(function(a, b){
                            if(a.articulo > b.articulo){
                                return 1;
                            }
                            if(a.articulo < b.articulo){
                                return -1;
                            }
                            return 0;
                        }));
                        if(tipo_rep===1){
                            setRepuestosPendientes(sinduplicadosRep.sort(function(a, b){
                                if(a.articulo > b.articulo){
                                    return 1;
                                }
                                if(a.articulo < b.articulo){
                                    return -1;
                                }
                                return 0;
                            }));
                            if(res_data_count>=20 && count2===null){
                                setCount2(res_data_count-(20-sinduplicadosRep.length));
                            }
                            else if(count2===null && res_data_count<20){
                                setCount2(res_data_count-(res_data_count-sinduplicadosRep.length));
                            }
                            
                        }
                        if(tipo_rep===2){
                            setConsumiblesPendientes(sinduplicadosCon.sort(function(a, b){
                                if(a.articulo > b.articulo){
                                    return 1;
                                }
                                if(a.articulo < b.articulo){
                                    return -1;
                                }
                                return 0;
                            }));
                            if(res_data_count>=20 && count3===null){
                                setCount3(res_data_count-(20-sinduplicadosCon.length));
                            }
                            else if(res_data_count<20 && count3===null){
                                setCount3(res_data_count-(res_data_count-sinduplicadosCon.length));
                            }
                        }
                    }
                }
            })
            .catch(err => { console.log(err);})
        }
    }

    useEffect(()=>{
        if(count % 20 === 0){
            setDatos({
                ...datos,
                total_pag:Math.trunc(count/20),
            })
        }
        else if(count % 20 !== 0){
            setDatos({
                ...datos,
                total_pag:Math.trunc(count/20)+1,
            })
        }
    }, [count, filtro]);

    useEffect(()=>{
        if(count2 % 20 === 0){
            setDatos({
                ...datos,
                total_pag2:Math.trunc(count2/20),
            })
        }
        else if(count2 % 20 !== 0){
            setDatos({
                ...datos,
                total_pag2:Math.trunc(count2/20)+1,
            })
        }
    }, [count2, filtro2]);

    useEffect(()=>{
        if(count3 % 20 === 0){
            setDatos({
                ...datos,
                total_pag3:Math.trunc(count3/20),
            })
        }
        else if(count3 % 20 !== 0){
            setDatos({
                ...datos,
                total_pag3:Math.trunc(count3/20)+1,
            })
        }
    }, [count3, filtro3]);
     
    useEffect(()=>{ //buscamos pedidos pasados de fecha de entrega
        axios.get(BACKEND_SERVER + `/api/repuestos/lista_pedidos_fuera_fecha/` + filtro,{
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
        datos.empresa && axios.get(BACKEND_SERVER + `/api/repuestos/linea_pedido_pend/?pedido__finalizado=${'false'}&pedido__empresa=${datos.empresa}`,{
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

    const comparar = (x) => {
        if(lineasPendientes){
            for(var y=0;y<lineasPendientes.length;y++){
                if(lineasPendientes[y].repuesto.id === x.id){                                      ;
                    return( "table-success");
                }
            }
        }
    }

    const comparar2 = (x) => {
        if(lineasPendientes){
            if(x.critico){
                for(var y=0;y<lineasPendientes.length;y++){
                    if(lineasPendientes[y].repuesto.id===x.id){
                        if(pedfueradefecha){
                            for(var z=0;z<pedfueradefecha.length;z++){
                                if(pedfueradefecha[z].id===lineasPendientes[y].pedido.id){
                                    return("table-success");
                                }
                            }
                        }
                    }              
                }
            }
        }
    }

    const cambioPagina = (pag) => {
        if(pag<=0){
            pag=1;
        }
        if(pag>count/20){
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

    const cambioPagina2 = (pag) => {
        if(pag<=0){
            pag=1;
        }
        if(pag>count2/20){
            if(count2 % 20 === 0){
                pag=Math.trunc(count2/20);
            }
            if(count2 % 20 !== 0){
                pag=Math.trunc(count2/20)+1;
            }
        }
        if(pag>0){
            setDatos({
                ...datos,
                pagina2: pag,
            })
        }
    } 

    const cambioPagina3 = (pag) => {
        if(pag<=0){
            pag=1;
        }
        if(pag>count3/20){
            if(count3 % 20 === 0){
                pag=Math.trunc(count3/20);
            }
            if(count3 % 20 !== 0){
                pag=Math.trunc(count3/20)+1;
            }
        }
        if(pag>0){
            setDatos({
                ...datos,
                pagina3: pag,
            })
        }
    }

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
                                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina2(datos.pagina2=datos.pagina2-1)}>Pág Anterior</button></th> 
                                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina2(datos.pagina2=datos.pagina2+1)}>Pág Siguiente</button></th> 
                                        <th>Número páginas: {datos.pagina2} / {datos.total_pag2} - Registros: {count2}</th>
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
                                    {repuestosPendientes && repuestosPendientes
                                        .filter(pendiente => pendiente.tipo === 1) //primero filtro solo los que sean REPUESTOS
                                        .map(pendiente => (
                                            <tr key={pendiente.id} className={comparar2(pendiente) ? "table-warning" : (comparar(pendiente)) ? "table-success" : pendiente.critico ? "table-danger" : ""}>
                                                <td>{pendiente.articulo}</td>
                                                <td>{pendiente.critico ? 'Si' : 'No'}</td>
                                                <td>{pendiente.stock}</td>
                                                <td>{pendiente.stock_minimo}</td> 
                                                <td>{pendiente.stock_aconsejado}</td> 
                                                <td>{lineasPendientes && lineasPendientes.map(linea => {
                                                    let suma = 0;
                                                    if (linea.repuesto.id === pendiente.id) {                                        
                                                        suma += parseInt(linea.por_recibir);
                                                    }
                                                    return suma;
                                                }).reduce((partialSum, a) => partialSum + a, 0)}
                                                </td>
                                                <td>
                                                    <Receipt className="mr-3 pencil" onClick={() => listarPedidos(pendiente.id)} />
                                                    <Link to={`/repuestos/${pendiente.id}`}>
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
    
                {/* TAB 2: Consumibles por debajo del stock mínimo */}
                <Tab eventKey="consumibles" title="Consumibles Bajo Stock Mínimo">
                    <Row>
                        <Col>
                            <h5 className="mb-3 mt-3">Consumibles por debajo del stock mínimo</h5>     
                            <table>
                                <tbody>
                                    <tr>
                                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina3(datos.pagina3=datos.pagina3-1)}>Pág Anterior</button></th> 
                                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina3(datos.pagina3=datos.pagina3+1)}>Pág Siguiente</button></th> 
                                        <th>Número páginas: {datos.pagina3} / {datos.total_pag3} - Registros: {count3}</th>
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
                                    {consumiblesPendientes && consumiblesPendientes
                                        .filter(pendiente => pendiente.tipo === 2) //primero filtro solo los que sean CONSUMIBLES
                                        .map(pendiente => (
                                            <tr key={pendiente.id} className={comparar2(pendiente) ? "table-warning" : (comparar(pendiente)) ? "table-success" : pendiente.critico ? "table-danger" : ""}>
                                                <td>{pendiente.articulo}</td>
                                                <td>{pendiente.critico ? 'Si' : 'No'}</td>
                                                <td>{pendiente.stock}</td>
                                                <td>{pendiente.stock_minimo}</td> 
                                                <td>{pendiente.stock_aconsejado}</td>
                                                <td>{lineasPendientes && lineasPendientes.map(linea => {
                                                    let suma = 0;
                                                    if (linea.repuesto.id === pendiente.id) {                                        
                                                        suma += parseInt(linea.por_recibir);
                                                    }
                                                    return suma;
                                                }).reduce((partialSum, a) => partialSum + a, 0)}
                                                </td>
                                                <td>
                                                    <Receipt className="mr-3 pencil" onClick={() => listarPedidos(pendiente.id)} />
                                                    <Link to={`/repuestos/${pendiente.id}`}>
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

                {/* TAB 3: Pedidos con fecha prevista vencida */}
                <Tab eventKey="pedidos" title="Pedidos Vencidos">
                    <Row>
                        <Col>
                            <h5 className="mb-3 mt-3">Pedidos con fecha prevista vencida</h5> 
                            <table>
                                <tbody>
                                    <tr>
                                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina(datos.pagina=datos.pagina-1)}>Pág Anterior</button></th> 
                                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina(datos.pagina=datos.pagina+1)}>Pág Siguiente</button></th> 
                                        <th>Número páginas: {datos.pagina} / {datos.total_pag} - Registros: {count}</th>
                                    </tr>
                                </tbody>
                            </table>                    
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th style={{ width: 130 }}>Num-Pedido</th>
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