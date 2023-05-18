import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ManPartesFiltro from './man_partes_filtro';

const ManListaPartes = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    
    const soyTecnico = user['tec-user'].perfil.destrezas.filter(s => s === 6);
    const [partes, setPartes]  = useState(null);
    const [filtro, setFiltro] = useState(`?estado=${''}&empresa__id=${user['tec-user'].perfil.empresa.id}&creado_por=${user['tec-user'].perfil.usuario}`);
    const [activos, setActivos] = useState(true);
    const [actualizar, setActualizar] = useState('');
    const [count, setCount] = useState(null);
    const [pagTotal, setPagTotal] = useState(null);

    const actualizaFiltro = (str, act) => {
        setActivos(act);
        setFiltro(str);
    }

    const [datos, setDatos] = useState({
        pagina: 1,
    });
    
    useEffect(()=>{
        //estamos filtrando y ordenando en el back
        if(activos){
            //opción partes activos, excluidos los finalizados y los pendientes
            axios.get(BACKEND_SERVER + '/api/mantenimiento/parte_activos_trabajo/' + filtro ,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }
            })
            .then( res => {
                    setPartes(res.data.results);
                    setCount(res.data.count);
                    let pagT = res.data.count/20;
                    if (res.data.count % 20 !== 0){
                        pagT += 1;
                    }
                    setPagTotal(Math.trunc(pagT));
            })
        }
        else{
            //Cuando activamos el filtro y queremos cualquier parte, llamamos desde aquí sin filtrar estado
            axios.get(BACKEND_SERVER + '/api/mantenimiento/parte_trabajo_detalle/' + filtro ,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }
            })
            .then( res => {
                setPartes(res.data.results);
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
        }
    }, [token, filtro, activos, actualizar]);

    const BorrarParte =(parte) =>{ 
        if(parte.tarea.length===0){
            var eliminarParte = window.confirm('Se va a eliminar el parte de trabajo ¿Desea continuar?');
            if(eliminarParte){
                axios.delete(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo/${parte.id}/`,{            
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    } 
                })
                .then(res =>{
                    alert('Parte eliminado');
                    setActualizar(parte); 
                })
                .catch (err=>{console.log((err));});
            }
        }
        else{
            axios.get(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/?parte=${parte.id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }
            })
            .then( res => {
                for(var x=0;x<res.data.length;x++){
                    if(res.data[x].estado===3){
                        return(alert('No se puede elimnar, este parte tiene trabajos finalizados. Si es un preventivo en curso, puede finalizar sus tareas.'));
                    }
                }
                if(x===res.data.length){
                    var eliminarParteLineasTareas = window.confirm('Se va a eliminiar el parte con sus tareas ¿Deseas continuar?');
                    if(eliminarParteLineasTareas){
                        //eliminamos todas la tareas del parte y en cascada se eliminan sus lineas
                        for(var y=0; y<res.data.length;y++){
                            axios.delete(BACKEND_SERVER + `/api/mantenimiento/tarea_nueva/${res.data[y].tarea}/`,{            
                                headers: {
                                    'Authorization': `token ${token['tec-token']}`
                                } 
                            })
                            .then(res =>{
                                console.log(res.data);
                            })
                            .catch (err=>{console.log((err));});
                        } 
                        //por último eliminamos el parte
                        axios.delete(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo/${parte.id}/`,{            
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            } 
                        })
                        .then(res =>{
                            alert('Parte y trabajos eliminados satisfactoriamente');
                            setActualizar(parte); 
                        })
                        .catch (err=>{console.log((err));});
                    }
                }
            })
            .catch( err => {
                console.log(err); 
            })
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
        actualizaFiltro(filtro3, activos);
    }

    return (
        <Container className='mt-5'>            
            <Row>
                <Col>
                    <ManPartesFiltro actualizaFiltro={actualizaFiltro}/>
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
                    <h5 className="mb-3 mt-3">Listado de Partes</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th style={{width:150}}>Numero</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Creado Por</th>
                                <th>Estado</th>
                                <th style={{width:80}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partes && partes.map( parte => {
                                return (
                                    <tr key={parte.id}>
                                        <td>{parte.num_parte}</td>
                                        <td>{parte.nombre}</td>
                                        <td>{parte.tipo_nombre}</td>
                                        <td>{parte.creado_por.get_full_name}</td>
                                        <td>{parte.estado_nombre}</td>
                                        <td>
                                            <Link to={`/mantenimiento/parte/${parte.id}`}><PencilFill className="mr-3 pencil"/></Link>
                                            <Trash className="trash"  onClick={event =>{BorrarParte(parte)}} /> 
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

export default ManListaPartes;