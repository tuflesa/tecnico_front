import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import { PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import RodRectificacionesFiltro from './rod_rectificaciones_filtro';
import logo from '../../assets/logo_bornay.svg';
import RodBuscarInstanciaCodBarras from './rod_buscar_instancia_codbarras';

const RodListaRectificaciones = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [count, setCount] = useState(null);
    const [lista_rectificaciones, setListaRectificaciones] = useState(null);
    const [lineas_rectificacion, setLineasRectificacion] = useState(null);
    const [filtro, setFiltro] = useState(`?empresa=${user['tec-user'].perfil.empresa.id}`);
    const [filtroPag, setFiltroPag] = useState(`&page=${1}`);

    const [datos, setDatos] = useState({
        pagina: 1,
        total_pag:0,
    });

    useEffect(()=>{
        setFiltroPag(`&page=${datos.pagina}`);
    },[datos.pagina]);

    useEffect(()=>{
        setFiltro(filtro + filtroPag);
    },[filtroPag]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/rodillos/rectificacion_lista/'+filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setCount(res.data.count);
            setListaRectificaciones(res.data.results);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro]);

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
    }, [count]);

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

    const modificar_rectificado = (id) => {
        console.log('vamos al modificado');
        axios.get(BACKEND_SERVER + `/api/rodillos/listado_linea_rectificacion/?rectificado=${id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setLineasRectificacion(res.data);
            console.log('ESTO ES EL RESULTADO DE LA BUSQUEDA: ', res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }

    const actualizaFiltro = str => {
        datos.pagina=1;
        setFiltro(str);
    }

    return (
        <Container className='mt-5'>
            <img src ={logo} width="200" height="200"></img>
            <Row>
                <Col>
                    <RodRectificacionesFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Rectificaciones</h5>
                    <table>
                        <tbody>
                            <tr>
                                <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina-1)}}>Pág Anterior</button></th> 
                                <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina+1)}}>Pág Siguiente</button></th> 
                                <th>Número páginas: {datos.pagina} / {datos.total_pag} - Registros: {count}</th>
                                <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
                            </tr>
                        </tbody>
                    </table>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Empresa</th>
                                <th>Creado por</th>
                                <th>Máquina</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            { lista_rectificaciones && lista_rectificaciones.map( lista => {
                                return (
                                    <tr key={lista.id}>
                                        <td>{lista.id}</td>
                                        <td>{lista.numero}</td>
                                        <td>{lista.maquina.empresa.nombre}</td>
                                        <td>{lista.creado_por.get_full_name}</td>
                                        <td>{lista.maquina.siglas}</td>
                                        <td>{lista.fecha}</td>
                                        {/* <td>
                                            <Link onClick={() => modificar_rectificado(lista.id)}><PencilFill className="mr-3 pencil"/></Link>
                                        </td> */}
                                        <td>
                                            <Link to={`/rodillos/editar_rectificacion/${lista.id}`}><PencilFill className="mr-3 pencil"/></Link>
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row>
                <table>
                    <tbody>
                        <tr>
                            <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                            <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                            <th>Número páginas: {datos.pagina} / {datos.total_pag}</th>
                            <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
                        </tr>
                    </tbody>
                </table>
            </Row>
            {lineas_rectificacion?
                <RodBuscarInstanciaCodBarras    
                        listado_instancias={lineas_rectificacion}/>
            :null}
        </Container>
    )
}

export default RodListaRectificaciones;