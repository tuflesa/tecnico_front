import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Trash, PencilFill, Receipt } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ManListaFiltro from './man_list_filtro';


const ManTarea = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [tareas, setTareas] = useState(null);
    const [filtro, setFiltro] = useState(`?equipo__seccion__zona__empresa__id=${user['tec-user'].perfil.empresa.id}`);

    const actualizaFiltro = str => {
        setFiltro(str);
    }
    
    useEffect(()=>{
        axios.get(BACKEND_SERVER + '/api/mantenimiento/tareas/'+ filtro,{
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
    }, [token, filtro]);    

    return (
        <Container>            
            <Row>
                <Col>
                    <ManListaFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <Row>                
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Tareas</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Equipo</th>
                                <th>Tipo</th>
                                <th>Especialidad</th>                               
                                <th>Prioridad</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tareas && tareas.map( tarea => {
                                return (
                                    <tr key={tarea.id}>
                                        <td>{tarea.nombre}</td>
                                        <td>{tarea.equipo_nombre}</td>
                                        <td>{tarea.tipo_nombre}</td>
                                        <td>{tarea.especialidad_nombre}</td>
                                        <td>{tarea.prioridad}</td>
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

export default ManTarea;