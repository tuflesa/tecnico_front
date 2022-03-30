import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Trash, PencilFill, Receipt } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ManPartesFiltro from './man_partes_filtro';

const ManListaPartes = () => {
    const [token] = useCookies(['tec-token']);
    
    const [partes, setPartes]  = useState(null);
    const [filtro, setFiltro] = useState(`?estado=${''}`);
    const [activos, setActivos] = useState('');

    const actualizaFiltro = (str, act) => {
        setActivos(act);
        setFiltro(str);
    }
    
    useEffect(()=>{
        axios.get(BACKEND_SERVER + '/api/mantenimiento/parte_trabajo_detalle/' + filtro ,{
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
                setPartes(activas.sort(function(a, b){
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
                setPartes(res.data.sort(function(a, b){
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

    const BorrarParte =(parte) =>{ 
        if(parte.tarea.length===0){
            var eliminarParte = window.confirm('Se va a eliminar el parte de trabajo');
            if(eliminarParte){
                axios.delete(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo/${parte.id}/`,{            
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    } 
                })
                .then(res =>{
                    alert('Parte eliminado');
                })
                .catch (err=>{console.log((err));});
            }
        }
        else{alert('No se puede elimnar, este parte tiene lineas de trabajos');}
    }

    return (
        <Container>            
            <Row>
                <Col>
                    <ManPartesFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <Row>                
                <Col>
                    <h5 className="mb-3 mt-3">Listado de Partes</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Creado Por</th>                               
                                <th>Observaciones</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partes && partes.map( parte => {
                                return (
                                    <tr key={parte.id}>
                                        <td>{parte.nombre}</td>
                                        <td>{parte.tipo_nombre}</td>
                                        <td>{parte.creado_por.get_full_name}</td>
                                        <td>{parte.observaciones}</td>
                                        <td>
                                            <Link to={`/mantenimiento/parte/${parte.id}`}>
                                                <PencilFill className="mr-3 pencil"/>                                                
                                            </Link>
                                            <Trash className="trash"  onClick={event =>{BorrarParte(parte)}} /> 
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

export default ManListaPartes;