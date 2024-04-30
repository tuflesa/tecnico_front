import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ManNotificacionesFiltro from './man_notificaciones_filtro';

const ManNotificacionesLista = () => {
    const [token] = useCookies(['tec-token']);
    
    const [notas, setNotas]  = useState(null);
    const [filtro, setFiltro] = useState(null);
    const [count, setCount] = useState(null);
    const [pagTotal, setPagTotal] = useState(null);

    const actualizaFiltro = (str) => {
        setFiltro(str);
    }

    const [datos, setDatos] = useState({
        pagina: 1,
    });
  
    useEffect(()=>{
        filtro && axios.get(BACKEND_SERVER + '/api/mantenimiento/notificaciones/' + filtro ,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setNotas(res.data.results);
            setCount(res.data.count);
            let pagT = res.data.count/20;
            if (res.data.count % 20 !== 0){
                pagT += 1;
            }
            setPagTotal(Math.trunc(pagT));
        })
        .catch( err => {
            console.log(err);
        });
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
        var filtro2=`&page=${datos.pagina}`;
        const filtro3 = filtro + filtro2;
        actualizaFiltro(filtro3);
    }

    return (
        <Container className='mt-5'>            
            <Row>
                <Col>
                    <ManNotificacionesFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <table>
                <tbody>
                    <tr>
                        <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                        <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                        <th>Página {datos.pagina} de {pagTotal} - Número registros totales: {count}</th>
                    </tr>
                </tbody>
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
                                            <Link to={`/mantenimiento/notificacion/${nota.id}`}><PencilFill className="mr-3 pencil"/></Link>
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
                <tbody>
                    <tr>
                        <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                        <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                        <th>Página {datos.pagina} de {pagTotal} - Número registros totales: {count}</th>
                    </tr>
                </tbody>
            </table>
        </Container>
    )
}

export default ManNotificacionesLista;
