import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ManLineasFiltro from './man_lineas_filtro';
import { filter } from 'd3';


const ManLineasListado = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [lineas, setLineas] = useState(null);
    const [filtro, setFiltro] = useState(`?parte__empresa__id=${user['tec-user'].perfil.empresa.id}&finalizada=${false}`);

    const actualizaFiltro = str => {
        setFiltro(str);
    }
    
    useEffect(()=>{
        axios.get(BACKEND_SERVER + '/api/mantenimiento/listado_lineas_partes/'+ filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
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
                                        <td>{linea.fecha_inicio}</td>
                                        <td>{linea.fecha_fin}</td>
                                        <td>                                            
                                            <Link to={`/mantenimiento/tarea/${linea.id}`}>
                                                <PencilFill className="mr-3 pencil"/>                                                
                                            </Link>                                         
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