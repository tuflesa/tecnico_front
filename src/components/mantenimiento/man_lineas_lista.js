import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Trash, PencilFill, Receipt } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ManLineasFiltro from './man_lineas_filtro';
import { filter } from 'd3';
import {invertirFecha} from '../utilidades/funciones_fecha';
import ListaDePersonal from './man_equipo_trabajadores';


const ManLineasListado = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [lineas, setLineas] = useState(null);
    //const [lineas_finalizadas, setLineasFinalizadas] = useState(null);
    //const [hoy] = useState(new Date);
    var fecha_hoy=Date.parse(new Date);
    var mesEnMilisegundos = 1000 * 60 * 60 * 24 * 30;
    var enunmes=fecha_hoy+mesEnMilisegundos;
    var dentrodeunmes = new Date(enunmes);
    var fechaenunmesString = dentrodeunmes.getFullYear() + '-' + ('0' + (dentrodeunmes.getMonth()+1)).slice(-2) + '-' + ('0' + dentrodeunmes.getDate()).slice(-2);
    const [filtro, setFiltro] = useState(`?parte__empresa__id=${user['tec-user'].perfil.empresa.id}&estado=${''}&fecha_plan__lte=${fechaenunmesString}`);
    const [activos, setActivos] = useState('');
    const [linea_id, setLinea_id] = useState(null);
    const [show, setShow] = useState(false);
    const [actualizar, setActualizar] = useState('');

    const actualizaFiltro = (str, act) => {        
        setActivos(act);
        setFiltro(str);
    }

    useEffect(()=>{
        axios.get(BACKEND_SERVER + '/api/mantenimiento/listado_lineas_partes/'+ filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            //variable para filtrar en Activos las 2 opciones
            if(activos===''){
                //listaFil recoge toda las lineas para luego filtrarlas.
                const listaFil=res.data;
                //cogemos de todas solo las que estén planificadas
                const planificadas = listaFil.filter(s=>s.estado===1);
                //cogemos de todas solo las que estén en ejecución
                const ejecucion = listaFil.filter(s=>s.estado===2);
                //anidamos planificadas y en ejecución
                const activas = planificadas.concat(ejecucion);
                //las ordenamos pasandolas a la variable que muestra los datos 'lineas'
                setLineas(activas.sort(function(a, b){
                    if(a.tarea.prioridad < b.tarea.prioridad){
                        return 1;
                    }
                    if(a.tarea.prioridad > b.tarea.prioridad){
                        return -1;
                    }
                    return 0;
                }));
            }
            else{
                //si no hay opción 5 (Activos) filtramos de forma normal y aquí ordenamos
                setLineas(res.data.sort(function(a, b){
                    if(a.tarea.prioridad < b.tarea.prioridad){
                        return 1;
                    }
                    if(a.tarea.prioridad > b.tarea.prioridad){
                        return -1;
                    }
                    return 0;
                }))
            }
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro, activos, actualizar]); 

    const BorrarLinea =(linea) =>{ 
        axios.get(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_partes/?tarea=${linea.tarea.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            //si solo hay una linea y la fecha fin esta vacía, podemos eliminar linea y tarea.
            if(res.data.length===1 && res.data[0].fecha_fin===null){
                var confirmacion = window.confirm('¿Deseas eliminar la línea?');
                if(confirmacion){
                    axios.delete(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_partes/${res.data[0].id}/`,{            
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        } 
                    })
                    .then(re =>{
                        axios.delete(BACKEND_SERVER + `/api/mantenimiento/tareas/${res.data[0].tarea.id}/`,{            
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            } 
                        })
                        .then(r =>{
                            alert('tarea eliminada');
                            setActualizar(linea);  
                        })
                        .catch (err=>{console.log((err));});
                    })
                    .catch (err=>{console.log((err));});
                }
            }
            else{
                //Si la ultima linea tiene fecha fin, no se puede eliminar
                if(res.data[res.data.length-1].fecha_fin!==null){
                    alert('No se puede elimnar, trabajo ya ejecutado y terminado');
                }
                //en un preventivo, queremos detener el ciclo del trabajo.
                else{
                    var detenerTrabajo = window.confirm('No se puede eliminar, tiene trabajos finalizados. ¿Deseas detener el proceso?');
                    if(detenerTrabajo){
                        //eliminamos la linea que es la que ejecuta de nuevo la tarea'
                        axios.delete(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_partes/${res.data[res.data.length-1].id}/`,{            
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            } 
                        })
                        .then(ress =>{
                            alert('Trabajo detenido, no volverá a generar linea');
                            setActualizar(linea);  
                        })
                        .catch (err=>{console.log((err));});
                    }
                }
            }       
        })
        .catch( err => {
            console.log(err);
        });                 
    }

    const listarTrabajadores = (linea_id)=>{
        setLinea_id(linea_id);
        setShow(true);
    }

    const handlerClose = () => {
        setShow(false);
    }
    
    return (
        <Container className='mt-5'>            
            <Row>
                <Col>
                    <ManLineasFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <Row>                
                <Col>
                    <h5 className="mb-3 mt-3">Listado de Trabajos</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Pr.</th>
                                <th>Parte</th>
                                <th>Tarea</th>
                                <th>Tipo</th>
                                <th>Especialidad</th>
                                <th>Equipo</th>
                                <th style={{width:110}}>Fecha Plan</th>
                                <th style={{width:110}}>Fecha Inicio</th>
                                <th style={{width:110}}>Fecha Fin</th>
                                <th style={{width:130}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineas && lineas.map( linea => {
                                return (
                                    <tr key={linea.id} class={ linea.fecha_fin?"table-success":linea.fecha_inicio?"table-info":"" }>
                                        <td>{linea.tarea.prioridad}</td>
                                        <td>{linea.parte.nombre}</td>
                                        <td>{linea.tarea.nombre}</td>
                                        <td>{linea.parte.tipo_nombre}</td>
                                        <td>{linea.tarea.especialidad_nombre}</td>
                                        <td>{linea.parte.seccion?linea.parte.seccion.siglas_zona +' - '+linea.parte.seccion.nombre + (linea.parte.equipo?' - ' + linea.parte.equipo.nombre:''):null}</td>
                                        <td>{linea.fecha_plan? invertirFecha(String(linea.fecha_plan)):''}</td>
                                        <td>{linea.fecha_inicio?invertirFecha(String(linea.fecha_inicio)):''}</td>
                                        <td>{linea.fecha_fin?invertirFecha(String(linea.fecha_fin)):''}</td>
                                        <td>                                            
                                            <Link to={`/mantenimiento/linea_tarea/${linea.id}`}>
                                                <PencilFill className="mr-3 pencil"/>                                                
                                            </Link>  
                                            <Trash className="mr-3 pencil"  onClick={event =>{BorrarLinea(linea)}} />                                       
                                            <Receipt className="mr-3 pencil" onClick={event =>{listarTrabajadores(linea.id)}}/>
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <ListaDePersonal    show={show}
                                linea_id ={linea_id}
                                handlerClose={handlerClose}
        />
        </Container>
    )
}

export default ManLineasListado;