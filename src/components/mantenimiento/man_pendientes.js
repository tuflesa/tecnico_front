import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';
import { PencilFill, Eye } from 'react-bootstrap-icons';

const ManPendientes = () => {
    const [token] = useCookies(['tec-token']);
    const [tareas, setTareas] = useState(null);
    const [partes, setPartes] = useState(null);
    const [user] = useCookies(['tec-user']); 
    var fecha_hoy=Date.parse(new Date());
    var semanaEnMilisegundos = 1000 * 60 * 60 * 24 * 7;
    var enunasemana=fecha_hoy-semanaEnMilisegundos;
    var dentrodeunasemana = new Date(enunasemana);
    var fechaenunasemanaString = (dentrodeunasemana.getFullYear() + '-' + ('0' + (dentrodeunasemana.getMonth()+1)).slice(-2) + '-' + ('0' + dentrodeunasemana.getDate()).slice(-2));  

    const [datos] = useState({
        fecha_plan_lte: fechaenunasemanaString,
        empresa: user['tec-user'].perfil.empresa.id,
    });
    const filtro = `?fecha_plan__lte=${datos.fecha_plan_lte}&parte__empresa__id=${datos.empresa}`;

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(()=>{        
        axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_activas_sinPaginar/`+ filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setTareas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]); 

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/mantenimiento/partes_filtrados/?empresa__id=${datos.empresa}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setPartes(res.data);     
        })
        .catch( err => {
            console.log(err); 
        })       
    }, [token]);
    /* eslint-disable react-hooks/exhaustive-deps */

    return (  
        <Container className="mb-5 mt-5"> 
            <Row>     
                <Col>
                    <h5 className="mb-3 mt-3">Tareas Retrasadas (+ 1 semana)</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Prioridad</th>
                                <th>Tarea</th>
                                <th>Máquina</th>
                                <th>Equipo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tareas && tareas.map( linea => {
                                return (
                                    <tr key={linea.id}>
                                        <td>{linea.tarea.prioridad}</td>
                                        <td>{linea.tarea.nombre}</td>
                                        <td>{linea.parte.seccion.siglas_zona}</td>
                                        <td>{linea.tarea.especialidad_nombre}</td>
                                        <td>
                                            <a href={`/mantenimiento/linea_tarea/${linea.id}`} target="_blank" rel="noopener noreferrer"><PencilFill className="mr-3 pencil"/></a>
                                            <a href={`/mantenimiento/parte/${linea.parte.id}`} target="_blank" rel="noopener noreferrer"><Eye className="mr-3 pencil"/></a>
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>          
                <Col>
                    <h5 className="mb-3 mt-3">Correctivos Mantenimiento</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Parte</th>
                                <th>Personal</th>
                                <th>Equipo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partes && partes.map( parte => {
                                return (
                                    <tr key={parte.id}>
                                        <td>{parte.nombre}</td>
                                        <td>{parte.creado_por.get_full_name}</td>
                                        <td>{parte.seccion.siglas_zona + '-' + parte.seccion.nombre}</td>
                                        <td><a href={`/mantenimiento/parte/${parte.id}`} target="_blank" rel="noopener noreferrer"><PencilFill className="mr-3 pencil"/></a></td>
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
export default ManPendientes;