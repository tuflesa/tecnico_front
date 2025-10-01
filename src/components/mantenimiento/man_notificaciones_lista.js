import React, { useEffect, useState, useCallback  } from 'react';
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
    const [filtroBase, setFiltroBase] = useState(`?empresa__id=${user['tec-user'].perfil.empresa.id}&finalizado=${false}&descartado=${false}&zona__id=${user['tec-user'].perfil.zona?user['tec-user'].perfil.zona.id:''}`);
    const [count, setCount] = useState(null);
    const [buscando, setBuscando] = useState(false);
    const [pagina, setPagina] = useState(1);
    const [totalPag, setTotalPag] = useState(0);

    const actualizaFiltro = (nuevoFiltro) => {
        if(nuevoFiltro !== filtroBase){
            setFiltroBase(nuevoFiltro);
            setPagina(1);
        }
    }
  
    useEffect(()=>{
        const filtroCompleto = `${filtroBase}&page=${pagina}`;
        buscarNotificaciones(filtroCompleto);
    },[filtroBase, pagina]);

    // Función para hacer la búsqueda
    const buscarNotificaciones = useCallback(async (filtroCompleto) => {
        if (buscando) return;
        setBuscando(true);
        
        try {
            const response = await axios.get(BACKEND_SERVER + '/api/mantenimiento/notificaciones/' + filtroCompleto, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            });
            
            setNotas(response.data.results);
            setCount(response.data.count);
            
            // Calcular total de páginas
            const totalPaginas = response.data.count % 20 === 0 
                ? Math.max(1, Math.trunc(response.data.count / 20))
                : Math.trunc(response.data.count / 20) + 1;
            setTotalPag(totalPaginas);
            
        } catch (err) {
            console.log(err);
        } finally {
            setBuscando(false);
        }
    }, [token, buscando]);

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
            
    const cambioPagina = (nuevaPag) => {
        if(nuevaPag<=0){
            nuevaPag=1;
        }
        let maxPag = 1;
        if(count){
            maxPag = count %20 === 0? Math.trunc(count/20) : Math.trunc(count/20) + 1;
            if( maxPag===0) maxPag = 1;
        }
        if(nuevaPag>maxPag){
            nuevaPag = maxPag;
        }
        if(nuevaPag !== pagina && nuevaPag > 0){
            setPagina(nuevaPag);
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
                <th><button type="button" className="btn btn-default" onClick={() => {cambioPagina(pagina-1)}}>Pág Anterior</button></th> 
                <th><button type="button" className="btn btn-default" onClick={() => {cambioPagina(pagina+1)}}>Pág Siguiente</button></th> 
                <th>Número páginas: {pagina} / {totalPag} - Registros: {count || 0}</th>
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
                <th><button type="button" className="btn btn-default" onClick={() => {cambioPagina(pagina-1)}}>Pág Anterior</button></th> 
                <th><button type="button" className="btn btn-default" onClick={() => {cambioPagina(pagina+1)}}>Pág Siguiente</button></th> 
                <th>Número páginas: {pagina} / {totalPag} - Registros: {count || 0}</th>
            </table>
        </Container>
    )
}

export default ManNotificacionesLista;
