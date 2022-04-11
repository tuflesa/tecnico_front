import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button  } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { Tools, StopCircle, UiChecks, FileCheck, Receipt, TruckFlatbed } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ListaDePersonal from './man_equipo_trabajadores';


const ManPorEquipos = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [lineas, setLineas] = useState(null);
    const [trabajadores_lineas, setTrabajadoresLineas] = useState(null);
    const [filtro, setFiltro] = useState(`?parte__empresa__id=${user['tec-user'].perfil.empresa.id}`);
    const [hoy] = useState(new Date);
    const [show, setShow] = useState(false);
    const [linea_id, setLinea_id] = useState(null);

    const [datos, setDatos] = useState({
        fecha_inicio: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
        fecha_fin: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
        linea: '',
        trabajador: user['tec-user'].perfil.usuario,
    });
    
    useEffect(()=>{
        axios.get(BACKEND_SERVER + '/api/mantenimiento/listado_lineas_activas/'+ filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setLineas(res.data.sort(function(a, b){
                if(a.tarea.prioridad < b.tarea.prioridad){
                    return 1;
                }
                if(a.tarea.prioridad > b.tarea.prioridad){
                    return -1;
                }
                return 0;
            }))    
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro]); 

    const updateTarea = () => {
        axios.get(BACKEND_SERVER + '/api/mantenimiento/listado_lineas_activas/'+ filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setLineas(res.data.sort(function(a, b){
                if(a.tarea.prioridad < b.tarea.prioridad){
                    return 1;
                }
                if(a.tarea.prioridad > b.tarea.prioridad){
                    return -1;
                }
                return 0;
            }))            
        })
        .catch( err => {
            console.log(err);
        });
    }
    
    const InicioTarea = (linea) => { 
        axios.get(BACKEND_SERVER + `/api/mantenimiento/trabajadores_linea/?linea=${linea.id}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {
            if(linea.fecha_inicio===null){
                axios.patch(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/${linea.id}/`, {
                    fecha_inicio:datos.fecha_inicio,
                    estado: 2,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                      }     
                })
                .then( r => { 
                    axios.post(BACKEND_SERVER + `/api/mantenimiento/trabajadores_linea/`, {
                        linea:linea.id,
                        fecha_inicio:datos.fecha_inicio,
                        fecha_fin:datos.fecha_fin,
                        trabajador:datos.trabajador,
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                          }     
                    })
                    .then( ress => {
                        updateTarea(); 
                    })
                    .catch(err => { console.log(err);})
                })
                .catch(err => { console.log(err);})
            }
            else{
                const trabajador_activo = res.data.filter(s => s.trabajador === user['tec-user'].perfil.usuario);
                if(trabajador_activo.length===0){
                    axios.post(BACKEND_SERVER + `/api/mantenimiento/trabajadores_linea/`, {
                        linea:linea.id,
                        fecha_inicio:datos.fecha_inicio,
                        fecha_fin:null,
                        trabajador:datos.trabajador,
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                          }     
                    })
                    .then( ress => {
                        updateTarea(); 
                    })
                    .catch(err => { console.log(err);})
                }
                else if(trabajador_activo.length!==0){
                    alert('Usted ya tiene este trabajo iniciado');
                }
            }
        })
        .catch(err => { console.log(err);}) 
    }

    const FinalizarTarea = (linea) => { 
        axios.get(BACKEND_SERVER + `/api/mantenimiento/trabajadores_linea/?linea=${linea.id}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {
            if(linea.fecha_inicio===null){
                alert('Esta tarea todavía no se ha iniciado');
            }
            else{
                const trabajador_activo = res.data.filter(s => s.trabajador === user['tec-user'].perfil.usuario);
                if(trabajador_activo.length===0){
                    alert('No tienes esta tarea inicada, no la puedes finalizar');
                }
                else if(trabajador_activo.length!==0){
                    var FinalizarTarea = window.confirm('Vas a finalizar la tarea ¿Desea continuar?');
                    if (FinalizarTarea){
                        for(var x=0;x<res.data.length;x++){
                            axios.patch(BACKEND_SERVER + `/api/mantenimiento/trabajadores_linea/${res.data[x].id}/`,{
                                fecha_fin: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
                            },
                            {
                                headers: {
                                    'Authorization': `token ${token['tec-token']}`
                                }
                            })
                            .then( r => {
                                console.log(r.data);
                            })
                            .catch( err => {
                                console.log(err);
                            });
                        }
                        axios.patch(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/${linea.id}/`,{
                            fecha_fin: datos.fecha_fin,
                            estado: 3,
                        },
                        {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }
                        })
                        .then( re => {
                            console.log(re.data);
                        })
                        .catch( err => {
                            console.log(err);
                        });
                    }
                }
            }
        })
        .catch(err => { console.log(err);}) 
    }

    const listarTrabajadores = (linea_id)=>{
        setLinea_id(linea_id);
        setShow(true);
    }
    
    const handlerClose = () => {
        setShow(false);
    }

    return(
        <Container class extends>
            <Row class extends>                
                <Col>
                    <h5 className="mb-3 mt-3">Listado de Trabajos {user['tec-user'].get_full_name}</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Prioridad</th>
                                <th>Nombre Tarea</th>
                                <th>Observaciones</th>
                                {/* <th>Especialidad</th> */}
                                <th>Estado</th>
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
                                        <td>{linea.tarea.nombre}</td>
                                        <td>{linea.tarea.observaciones}</td>
                                        {/* <td>{linea.tarea.especialidad_nombre}</td> */}
                                        <td>{linea.estado.nombre}</td>
                                        <td>{linea.fecha_plan? invertirFecha(String(linea.fecha_plan)):''}</td>
                                        <td>{linea.fecha_inicio?invertirFecha(String(linea.fecha_inicio)):''}</td>
                                        <td>{linea.fecha_fin?invertirFecha(String(linea.fecha_fin)):''}</td>
                                        <td>
                                        <Tools className="mr-3 pencil"  onClick={event =>{InicioTarea(linea)}}/>
                                        {/* <StopCircle className="mr-3 pencil"  onClick={null} /> */}
                                        <FileCheck className="mr-3 pencil"  onClick={event =>{FinalizarTarea(linea)}} />
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

export default ManPorEquipos;