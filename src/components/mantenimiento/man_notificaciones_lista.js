import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { PencilFill } from 'react-bootstrap-icons';
import ManNotificacionesFiltro from './man_notificaciones_filtro';

const ManNotificacionesLista = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    
    const [notas, setNotas]  = useState(null);
    const [filtro, setFiltro] = useState(`?empresa=${user['tec-user'].perfil.empresa.id}`);
    const [filtroII, setFiltroII] = useState(`?empresa=${user['tec-user'].perfil.empresa.id}`);
    const [count, setCount] = useState(null);
    const [buscando, setBuscando] = useState(false);
    let filtroPag=(null);

    const actualizaFiltro = (str) => {
        setFiltroII(str);
    }

    const [datos, setDatos] = useState({
        pagina: 1,
        total_pag:0,
    });
  
    useEffect(()=>{
        filtroPag = (`&page=${datos.pagina}`);
        if (!buscando){
            setFiltro(filtroII + filtroPag);
        }
    },[buscando, filtroII, datos.pagina]);

    useEffect(()=>{
        if(filtro){
            setBuscando(true);
            axios.get(BACKEND_SERVER + '/api/mantenimiento/notificaciones/?' + filtro ,{
                headers: {'Authorization': `token ${token['tec-token']}`}
            })
            .then( res => {
                setNotas(res.data.results);
                setCount(res.data.count);
                setBuscando(false);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, filtro]);

    const comparar_finalizados = (x) => {
        if(x.descartado || x.finalizado){
            return( "table-primary");
        }
    }

    const comparar_revisados = (x) => {
        if(x.revisado && !x.finalizado && !x.descartado){
            return( "table-success");
        }
    }

    /* eslint-disable react-hooks/exhaustive-deps */
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
    /* eslint-disable react-hooks/exhaustive-deps */
            
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

    return (
        <Container className='mt-5'>            
            <Row>
                <Col>
                    <ManNotificacionesFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <table>
                <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                <th>Número páginas: {datos.pagina} / {datos.total_pag===0?1:datos.total_pag} - Registros: {count}</th>
            </table>
            <Row>                
                <Col>
                    <h5 className="mb-3 mt-3">Listado de Notificaciones</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th style={{width:150}}>Numero</th>
                                <th>Creado Por</th>
                                <th>Que ocurre</th>
                                <th>Zona</th>
                                <th>Conclusiones</th>
                                <th>Revisado</th>
                                <th>Descartado</th>
                                <th>Finalizado</th>
                                <th style={{width:80}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notas && notas.map( nota => {
                                return (
                                    <tr key={nota.id}className = {comparar_finalizados(nota)? "table-success" : comparar_revisados(nota)? "table-primary": nota.peligrosidad===true? "table-danger":nota.seguridad===true? "table-danger":''}>
                                        <td>{nota.numero}</td>
                                        <td>{nota.quien.get_full_name}</td>
                                        <td>{nota.que}</td>
                                        <td>{nota.zona?nota.zona.siglas:''}</td>
                                        <td>{nota.conclusion}</td>
                                        <td>{nota.revisado?'Si':'No'}</td>
                                        <td>{nota.descartado?'Si':'No'}</td>
                                        <td>{nota.finalizado?'Si':'No'}</td>
                                        <td style={{width:115}}>
                                            <a href={`/mantenimiento/notificacion/${nota.id}`} target="_blank" rel="noopener noreferrer"><PencilFill className="mr-3 pencil"/></a>
                                            {/* <Trash className="trash"  onClick={event =>{BorrarNota(nota)}} />  */}
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <table>
                <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                <th>Número páginas: {datos.pagina} / {datos.total_pag===0?1:datos.total_pag} - Registros: {count}</th>
            </table>
        </Container>
    )
}

export default ManNotificacionesLista;
