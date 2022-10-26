import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Form, Col, Table } from 'react-bootstrap';
import FiltroTareasTrabajador from './man_tareas_trabajador_filtro';
import {invertirFecha} from '../utilidades/funciones_fecha';
import ListaDePersonal from './man_equipo_trabajadores';
import { Receipt, Eye} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ReactExport from 'react-data-export';

const TareasTrabajador = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [filtro, setFiltro] = useState('');
    const [lineasusuarios, setLineasUsuarios] = useState(null);
    const [show, setShow] = useState(false);
    const [linea_id, setLinea_id] = useState(null);
    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    const [datos, setDatos] = useState({
        nombre_persona:'',
    })

    const actualizaFiltro = str => {
        setFiltro(str);
    }

    const listarTrabajadores = (linea_id)=>{
        setLinea_id(linea_id);
        setShow(true);
    }

    const handlerClose = () => {
        setShow(false);
    }

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_de_un_trabajador/`+ filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            res.data.map( r => {
                //solo para poder utilizar los campos en el excel
                    r['nom_parte']=r.linea.parte.num_parte;
                    r['nom_tarea']=r.linea.tarea.nombre;
                    r['obtarea']=r.linea.tarea.observaciones;
                    r['obtareatrab']=r.linea.tarea.observaciones_trab;
                    r['parte_tip']=r.linea.parte.tipo_nombre;
                    r['priori']=r.linea.tarea.prioridad;
                    r['peri']=r.linea.parte.tipo_nombre==="Preventivo"?r.linea.tarea.tipo_periodo.nombre:null;
                    r['pericant']=r.linea.parte.tipo_nombre==="Preventivo"?r.linea.tarea.tipo_periodo.cantidad_dias:null;
                    r['fecha_ini']=r.fecha_inicio?invertirFecha(String(r.fecha_inicio)):'';
                    r['fecha_plani']=r.linea.fecha_plan?invertirFecha(String(r.linea.fecha_plan)):'';
                    r['fecha_f']=r.fecha_fin?invertirFecha(String(r.fecha_fin)):'';
                    r['equipoT']=r.linea.parte.seccion?r.linea.parte.seccion.siglas_zona +' - '+r.linea.parte.seccion.nombre + (r.linea.parte.equipo?' - ' + r.linea.parte.equipo.nombre:''):null;
            })
            setLineasUsuarios(res.data.sort(function(a, b){
                if(a.get_full_name > b.get_full_name){
                    return 1;
                }
                if(a.get_full_name < b.get_full_name){
                    return -1;
                }
                return 0;
            }))
        })
        .catch( err => {
            console.log(err);
        });
    }, [filtro]);

    return(
        <Container className="mt-5">
            <h5 className="mt-5">Filtro</h5>
            <Form>
                <Row>
                    <Col>
                        <FiltroTareasTrabajador actualizaFiltro={actualizaFiltro}/>
                    </Col>
                </ Row>
                <Row> 
                    <Col><h5>{lineasusuarios?lineasusuarios.prioridad:''}</h5></Col>
                    <ExcelFile filename={"ExcelExportExample"} element={<button>Exportar a Excel</button>}>
                        <ExcelSheet data={lineasusuarios} name="lineasusuarios">
                            <ExcelColumn label="Prioridad" value="priori"/>
                            <ExcelColumn label="Parte" value="nom_parte"/>
                            <ExcelColumn label="Tarea" value="nom_tarea"/>
                            <ExcelColumn label="Observaciones Tarea" value="obtarea"/>
                            <ExcelColumn label="Observaciones Trabajador" value="obtareatrab"/>
                            <ExcelColumn label="Equipo" value="equipoT"/>
                            <ExcelColumn label="Fecha Planificación" value="fecha_plani"/>
                            <ExcelColumn label="Fecha Inicio" value="fecha_ini"/> 
                            <ExcelColumn label="Fecha Fin" value="fecha_f"/>  
                            <ExcelColumn label="Tipo" value="parte_tip"/>
                            <ExcelColumn label="Periodo" value="peri"/>
                            <ExcelColumn label="Cantidad periodo" value="pericant"/>
                        </ExcelSheet>
                    </ExcelFile> 
                </Row>
                <Row>
                <Col>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Pr</th>
                                <th>Num Parte</th>
                                <th>Nombre Tarea</th>
                                <th>Observaciones</th>
                                <th>Observaciones trab</th>
                                <th>Equipo</th>
                                <th>Fecha Prev. Inicio</th>
                                <th>Fecha Inicio</th>
                                <th>Fecha Fin</th>
                                <th>Tipo</th>
                                <th>periodo</th>
                                <th>cantidad de periodo</th>
                                <th style={{width:115}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineasusuarios && lineasusuarios.map( lineasUs => {
                                return (
                                    <tr key={lineasUs.id}>
                                        <td>{lineasUs.linea.tarea.prioridad}</td>
                                        <td>{lineasUs.linea.parte.num_parte}</td>
                                        <td>{lineasUs.linea.tarea.nombre}</td>
                                        <td>{lineasUs.linea.tarea.observaciones}</td>
                                        <td>{lineasUs.linea.tarea.observaciones_trab}</td>
                                        <td>{lineasUs.linea.parte.seccion?lineasUs.linea.parte.seccion.siglas_zona +' - '+lineasUs.linea.parte.seccion.nombre + (lineasUs.linea.parte.equipo?' - ' + lineasUs.linea.parte.equipo.nombre:''):null}</td>
                                        <td>{invertirFecha(lineasUs.linea.fecha_plan)}</td>
                                        <td>{lineasUs.fecha_inicio?invertirFecha(String(lineasUs.fecha_inicio)):''}</td>
                                        <td>{lineasUs.fecha_fin?invertirFecha(String(lineasUs.fecha_fin)):''}</td>
                                        <td>{lineasUs.linea.parte.tipo_nombre}</td>
                                        <td>{lineasUs.linea.parte.tipo_nombre==="Preventivo"?lineasUs.linea.tarea.tipo_periodo.nombre:null}</td>
                                        <td>{lineasUs.linea.parte.tipo_nombre==="Preventivo"?lineasUs.linea.tarea.tipo_periodo.cantidad_dias:null}</td>
                                        <td>
                                        <Receipt className="mr-3 pencil" onClick={event =>{listarTrabajadores(lineasUs.linea.id)}}/>
                                        <Link to={`/mantenimiento/parte_op/${lineasUs.linea.parte.id}`}><Eye className="mr-3 pencil"/></Link>
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row> 
            </Form>
            <ListaDePersonal    show={show}
                                linea_id ={linea_id}
                                handlerClose={handlerClose}
            />
        </Container>
    );
}

export default TareasTrabajador;