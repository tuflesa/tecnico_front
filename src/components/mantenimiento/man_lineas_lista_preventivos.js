import React, { useEffect, useState, useMemo } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table} from 'react-bootstrap';
import { Receipt, Eye} from 'react-bootstrap-icons';
import {invertirFecha} from '../utilidades/funciones_fecha';
import ListaDePersonal from './man_equipo_trabajadores';

const ManLineasListadoPreventivos = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [lineas, setLineas] = useState(null);
    
    // Estados para los filtros
    const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
    const [filtroParte, setFiltroParte] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('');

    const calcularFechaHaceMes = () => {
        const hoy = new Date();
        const haceMes = new Date(hoy.getTime() - (30 * 24 * 60 * 60 * 1000));
        return haceMes.getFullYear() + '-' + 
               ('0' + (haceMes.getMonth()+1)).slice(-2) + '-' + 
               ('0' + haceMes.getDate()).slice(-2);
    };
 
    const [linea_id, setLinea_id] = useState(null);
    const [show, setShow] = useState(false);
    const [actualizar_seg, setActualizarSeg] = useState(false);

    // FUNCIÓN PARA ACTUALIZAR LA TABLA
    useEffect(() => {
        console.log('al useEffect si que entras no??? ');
        axios.get(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_cerradas_preventivas/?parte__empresa__id=${user['tec-user'].perfil.empresa.id}&fecha_inicio__gte=${calcularFechaHaceMes()}&parte__tipo=${1}&finalizada=${true}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setLineas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    // Obtener valores únicos para los filtros
    const valoresUnicos = useMemo(() => {
        if (!lineas) return { especialidades: [], partes: [], tipos: [], prioridades: [] };
        
        const especialidades = [...new Set(lineas.map(l => l.tarea.especialidad_nombre).filter(Boolean))].sort();
        const partes = [...new Set(lineas.map(l => l.parte.nombre).filter(Boolean))].sort();
        const tipos = [...new Set(lineas.map(l => l.parte.tipo_nombre).filter(Boolean))].sort();
        const prioridades = [...new Set(lineas.map(l => l.tarea.prioridad).filter(Boolean))].sort((a, b) => a - b);
        
        return { especialidades, partes, tipos, prioridades };
    }, [lineas]);

    // Filtrar líneas
    const lineasFiltradas = useMemo(() => {
        if (!lineas) return [];
        
        return lineas.filter(linea => {
            const cumpleEspecialidad = !filtroEspecialidad || linea.tarea.especialidad_nombre === filtroEspecialidad;
            const cumpleParte = !filtroParte || linea.parte.nombre === filtroParte;
            const cumpleTipo = !filtroTipo || linea.parte.tipo_nombre === filtroTipo;
            const cumplePrioridad = !filtroPrioridad || String(linea.tarea.prioridad) === filtroPrioridad;
            
            return cumpleEspecialidad && cumpleParte && cumpleTipo && cumplePrioridad;
        });
    }, [lineas, filtroEspecialidad, filtroParte, filtroTipo, filtroPrioridad]);

    const count = lineasFiltradas?.length || 0;

    const listarTrabajadores = (linea_id)=>{
        setLinea_id(linea_id);
        setShow(true);
    }

    const handlerClose = () => {
        setShow(false);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setActualizarSeg(true);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const limpiarFiltros = () => {
        setFiltroEspecialidad('');
        setFiltroParte('');
        setFiltroTipo('');
        setFiltroPrioridad('');
    };

    return (
        <Container className='mt-3'>
            <Row className="mb-3">
                <Col>
                    <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={limpiarFiltros}
                        disabled={!filtroEspecialidad && !filtroParte && !filtroTipo && !filtroPrioridad}
                    >
                        Limpiar Filtros
                    </button>
                </Col>
                <Col className="text-end">
                    <strong>Registros: {count} {lineas && count !== lineas.length && `de ${lineas.length}`}</strong>
                </Col>
            </Row>
            <Row>                
                <Col>
                    <h5 className="mb-3">Listado de Trabajos</h5>
                    <h5 style={{ color: 'green' }}>Tareas preventivas cerradas en el último mes</h5>  
                    <table>
                        <tbody>
                            <tr>
                                <th>Número registros totales: {count}</th>
                            </tr>
                        </tbody>
                    </table>
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>Pr.
                                    <select 
                                        className="form-select form-select-sm"
                                        value={filtroPrioridad}
                                        onChange={(e) => setFiltroPrioridad(e.target.value)}
                                    >
                                        <option value="">Todos</option>
                                        {valoresUnicos.prioridades.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </th>
                                <th>Parte
                                    <select 
                                        className="form-select form-select-sm"
                                        value={filtroParte}
                                        onChange={(e) => setFiltroParte(e.target.value)}
                                    >
                                        <option value="">Todos</option>
                                        {valoresUnicos.partes.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </th>
                                <th>Tarea</th>
                                <th>Especialidad 
                                    <select 
                                        className="form-select form-select-sm"
                                        value={filtroEspecialidad}
                                        onChange={(e) => setFiltroEspecialidad(e.target.value)}
                                    >
                                        <option value="">Todas</option>
                                        {valoresUnicos.especialidades.map(e => (
                                            <option key={e} value={e}>{e}</option>
                                        ))}
                                    </select>
                                </th>
                                <th>Equipo</th>
                                <th>Observaciones Mantenimiento</th>
                                <th style={{width:110}}>Fecha Plan</th>
                                <th style={{width:110}}>Fecha Inicio</th>
                                <th style={{width:110}}>Fecha Fin</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineasFiltradas && lineasFiltradas.map( linea => {
                                return (
                                    <tr key={linea.id}>
                                        <td>{linea.tarea.prioridad}</td>
                                        <td>{linea.parte.nombre}</td>
                                        <td>{linea.tarea.nombre}</td>
                                        <td>{linea.tarea.especialidad_nombre}</td>
                                        <td>{linea.parte.seccion?linea.parte.seccion.siglas_zona +' - '+linea.parte.seccion.nombre + (linea.parte.equipo?' - ' + linea.parte.equipo.nombre:''):null}</td>
                                        <td>{linea.observaciones_trab}</td>
                                        <td>{linea.fecha_plan? invertirFecha(String(linea.fecha_plan)):''}</td>
                                        <td>{linea.fecha_inicio?invertirFecha(String(linea.fecha_inicio)):''}</td>
                                        <td>{linea.fecha_fin?invertirFecha(String(linea.fecha_fin)):''}</td>
                                        <td>                                   
                                            <Receipt className="mr-3 pencil" onClick={event =>{listarTrabajadores(linea)}}/>
                                            <a href={`/mantenimiento/parte/${linea.parte.id}`} target="_blank" rel="noopener noreferrer">
                                                <Eye className="mr-3 pencil"/>
                                            </a>
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <ListaDePersonal    show={show}
                                lineas_trab ={linea_id}
                                handlerClose={handlerClose}
            />
        </Container>
    )
}

export default ManLineasListadoPreventivos;