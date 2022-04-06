import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { Tools, StopCircle, UiChecks, FileCheck } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';


const ManPorEquipos = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [lineas, setLineas] = useState(null);
    //const [lineas_finalizadas, setLineasFinalizadas] = useState(null);
    const [filtro, setFiltro] = useState(`?parte__empresa__id=${user['tec-user'].perfil.empresa.id}`);
    const [hoy] = useState(new Date);

    const [datos, setDatos] = useState({
        fecha_inicio: null,
        fecha_fin: null,
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
            console.log('listado_lineas_activas');
            console.log(res.data);
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
    
    const InicioTarea = (linea) => { 
        console.log(datos.trabajador);
        datos.fecha_inicio=(hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0'));
        if(linea.fecha_inicio===null){
            axios.patch(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/${linea.id}/`, {
                fecha_inicio:datos.fecha_inicio,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }     
            })
            .then( res => { 
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
                .then( res => {
                    //updateTarea();
                })
                .catch(err => { console.log(err);})
            })
            .catch(err => { console.log(err);})
        }
    }
        
    return (
        <Container>
            <Row>                
                <Col>
                    <h5 className="mb-3 mt-3">Listado de Trabajos {user['tec-user'].get_full_name}</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Prioridad</th>
                                <th>Nombre Tarea</th>
                                <th>Observaciones</th>
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
                                        <td>{linea.tarea.nombre}</td>
                                        <td>{linea.tarea.observaciones}</td>
                                        <td>{linea.tarea.especialidad_nombre}</td>
                                        <td>{linea.fecha_plan? invertirFecha(String(linea.fecha_plan)):''}</td>
                                        <td>{linea.fecha_inicio?invertirFecha(String(linea.fecha_inicio)):''}</td>
                                        <td>{linea.fecha_fin?invertirFecha(String(linea.fecha_fin)):''}</td>
                                        <td>
                                        <Tools className="mr-3 pencil"  onClick={event =>{InicioTarea(linea)}}/>
                                        <StopCircle className="mr-3 pencil"  onClick={null} />
                                        <FileCheck className="mr-3 pencil"  onClick={null} />
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

export default ManPorEquipos;