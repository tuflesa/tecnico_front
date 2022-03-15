import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Trash, PencilFill, Receipt } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ManListaFiltro from './man_tareas_filtro';
import { filter } from 'd3';


const ManTarea = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [tareas, setTareas] = useState(null);
    const [filtro, setFiltro] = useState(`?equipo__seccion__zona__empresa__id=${user['tec-user'].perfil.empresa.id}`);
    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);
    const [tareaBorrar, setTareaBorrar] = useState(null);

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
            setTareas(res.data.sort(function(a, b){
                if(a.nombre > b.nombre){
                    return 1;
                }
                if(a.nombre < b.nombre){
                    return -1;
                }
                return 0;
            }))
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro]);      

    const BorrarT = ()=>{
        axios.delete(BACKEND_SERVER + `/api/mantenimiento/tareas/${tareaBorrar.id}/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            const tareasActuales = tareas.filter(tarea => tarea.id !== tareaBorrar.id);
            setTareas(tareasActuales);
            setShow(false);
        })
        .catch( err => {
            console.log(err);
        });
    }

    const handleClose = () => setShow(false);
    const handleClose2 = () => setShow2(false);

    const handleTrashClick = (tarea) => {
        axios.get(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo_lineas/?tarea=${tarea.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            if(res.data.length===0){
                setTareaBorrar(tarea);
                setShow(true);                
            }
            else{
                setShow2(true)
                setTareaBorrar(tarea);
            }
        })
        .catch( err => {
            console.log(err); 
        })
    }

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
                                        <td>{tarea.especialidad_nombre}</td>
                                        <td>{tarea.prioridad}</td>
                                        <td>                                            
                                            <Link to={`/mantenimiento/tarea/${tarea.id}`}>
                                                <PencilFill className="mr-3 pencil"/>                                                
                                            </Link>                                              
                                            {/* <input className="mr-3 pencil"  type="checkbox" name={tarea.id} checked={tarea.checked}/>                                                                             */}
                                            <Trash className="pencil"  onClick={event =>{handleTrashClick(tarea)}} />                                            
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={ false }>
                <Modal.Header closeButton>
                    <Modal.Title>Borrar</Modal.Title>
                </Modal.Header>
                <Modal.Body>Está a punto de borrar la tarea: <strong>{tareaBorrar && tareaBorrar.nombre}</strong></Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={BorrarT}>
                        Borrar
                    </Button>
                    <Button variant="waring" onClick={handleClose}>
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={show2} onHide={handleClose2} backdrop="static" keyboard={ false }>
                <Modal.Header closeButton>
                    <Modal.Title>Borrar</Modal.Title>
                </Modal.Header>
                <Modal.Body>NO se puede borrar la tarea: <strong>{tareaBorrar && tareaBorrar.nombre}</strong> tiene partes asociados</Modal.Body>
                <Modal.Footer>
                    <Button variant="waring" onClick={handleClose2}>
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}

export default ManTarea;