import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ManLineasFiltro from './man_lineas_filtro';
import { filter } from 'd3';
import {invertirFecha} from '../utilidades/funciones_fecha';


const ManLineasListado = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [lineas, setLineas] = useState(null);
    const [lineas_finalizadas, setLineasFinalizadas] = useState(null);
    const [filtro, setFiltro] = useState(`?parte__empresa__id=${user['tec-user'].perfil.empresa.id}`);
    const [activos, setActivos] = useState(null);

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
    }, [token, filtro, activos]);     

    const BorrarLinea =(linea) =>{  
        console.log(linea);
        axios.get(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/?tarea=${linea.tarea.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            console.log(res.data.length);
            console.log(res.data.fecha_fin);
            setLineasFinalizadas(res.data);
            if(res.data.length===1 && setLineasFinalizadas.data.fecha_fin==='null'){
                console.log('vamos a eliminar la tarea y linea');
            }
            else{
                console.log('no se puede eliminar ya que tiene lineas cerradas');
            }
            console.log('lineas con esta tarea');
            console.log(res.data);
            
        })
        .catch( err => {
            console.log(err);
        });
        /* if (linea.cantidad>linea.por_recibir){
            alert('No se puede eliminar la linea, ya tiene movimientos de recepción');            
        }
        else{  
            var confirmacion = window.confirm('¿Deseas eliminar la línea?');
            if(confirmacion){
                fetch (BACKEND_SERVER + `/api/repuestos/linea_pedido/${linea.id}`,{
                    method: 'DELETE',
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then( res => { 
                    updatePedido();
                })
            }
        } */
    }
    
    return (
        <Container>            
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
                                <th>Prioridad</th>
                                <th>Nombre Parte</th>
                                <th>Nombre Tarea</th>
                                <th>Tipo</th>
                                <th>Especialidad</th>
                                <th>Fecha Plan</th>
                                <th>Fecha Inicio</th>
                                <th>Fecha Fin</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineas && lineas.map( linea => {
                                return (
                                    <tr key={linea.id}>
                                        <td>{linea.tarea.prioridad}</td>
                                        <td>{linea.parte.nombre}</td>
                                        <td>{linea.tarea.nombre}</td>
                                        <td>{linea.parte.tipo_nombre}</td>
                                        <td>{linea.tarea.especialidad_nombre}</td>
                                        <td>{linea.fecha_plan? invertirFecha(String(linea.fecha_plan)):''}</td>
                                        <td>{linea.fecha_inicio?invertirFecha(String(linea.fecha_inicio)):''}</td>
                                        <td>{linea.fecha_fin?invertirFecha(String(linea.fecha_fin)):''}</td>
                                        <td>                                            
                                            <Link to={`/mantenimiento/linea_tarea/${linea.id}`}>
                                                <PencilFill className="mr-3 pencil"/>                                                
                                            </Link>  
                                            <Trash className="trash"  onClick={event =>{BorrarLinea(linea)}} />                                       
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    )
}

export default ManLineasListado;