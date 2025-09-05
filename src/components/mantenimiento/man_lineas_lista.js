import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table} from 'react-bootstrap';
import { Trash, PencilFill, Receipt, Eye, PlusSquare, DashSquare, HandThumbsUpFill, FileCheck } from 'react-bootstrap-icons';
import ManLineasFiltro from './man_lineas_filtro';
import {invertirFecha} from '../utilidades/funciones_fecha';
import ListaDePersonal from './man_equipo_trabajadores';
import ObservacionesModal from './man_equipo_observaciones'; // IMPORTAR EL MODAL
import ReactExport from 'react-data-export';


const ManLineasListado = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [lineas, setLineas] = useState(null);
    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    var fecha_hoy=Date.parse(new Date());
    var mesEnMilisegundos = 1000 * 60 * 60 * 24 * 30;
    var enunmes=fecha_hoy+mesEnMilisegundos;
    var dentrodeunmes = new Date(enunmes);
    var fechaenunmesString = dentrodeunmes.getFullYear() + '-' + ('0' + (dentrodeunmes.getMonth()+1)).slice(-2) + '-' + ('0' + dentrodeunmes.getDate()).slice(-2);
    var haceunmes = fecha_hoy-mesEnMilisegundos;
    var unmesatras = new Date(haceunmes);
    var fechapasadaString = unmesatras.getFullYear() + '-' + ('0' + (unmesatras.getMonth()+1)).slice(-2) + '-' + ('0' + unmesatras.getDate()).slice(-2);

    const [filtroBase, setFiltroBase] = useState(`?parte__empresa__id=${user['tec-user'].perfil.empresa.id}&fecha_plan__lte=${fechaenunmesString}&estado__in=1,2&exclude_estado=3,4`);
 
    const [linea_id, setLinea_id] = useState(null);
    const [show, setShow] = useState(false);
    const [actualizar, setActualizar] = useState('');
    const [count, setCount] = useState(null);
    const [pagTotal, setPagTotal] = useState(null);
    const [abrirFiltro, setabrirFiltro] = useState(false);
    const [actualizar_seg, setActualizarSeg] = useState(false);

    // ESTADOS PARA EL MODAL DE OBSERVACIONES
    const [show_Observacion, setShowObservacion] = useState(false);
    const [linea_completa, setLinea_completa] = useState(null);
    const [parte, setParte] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [datos, setDatos] = useState({});

    const actualizaFiltro = (str) => {   
        if (str !== filtroBase) {
            setFiltroBase(str);
            setPaginaActual(1);
        }
    }

    useEffect(() => { //para mantener el modal abierto cuando regresamos de hacer una salida de almacén
        const datosStr  = sessionStorage.getItem('datos_salida')
        if (datosStr) {
            const datos = JSON.parse(datosStr)
            if (datos.volverConObservacion) {
                setShowObservacion(true)
                const nuevosDatos = { ...datos, volverConObservacion: false };
                sessionStorage.setItem('datos_salida', JSON.stringify(nuevosDatos));
                
                setParte(datos.parte);
                setLinea_completa(datos.linea_completa);

                if (datos.observaciones_temp) {
                    setDatos(prev => ({
                        ...prev,
                        observaciones: datos.observaciones_temp
                    }));
                }
                if(datos.filtro){
                    setFiltroBase(datos.filtro);
                }
            }
        }
    }, []);

    // FUNCIÓN PARA ACTUALIZAR LA TABLA (similar a updateTarea en ManPorEquipos)
    const updateTarea = () => {
        const filtroConPaginacion = `${filtroBase}&page=${paginaActual}`;
        axios.get(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_activas/`+ filtroConPaginacion,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            console.log('datos de fechas: ',res.data.results);
            res.data.results.forEach( r => {
                //solo para poder utilizar los campos en el excel
                r['priori']=r.tarea.prioridad;
                r['nom_parte']=r.parte.nombre;
                r['obparte']=r.parte.observaciones;
                r['nom_tarea']=r.tarea.nombre;
                r['obtarea']=r.tarea.observaciones;
                r['obtareaT']=r.tarea.observaciones_trab;
                r['parte_tip']=r.parte.tipo_nombre;
                r['especial']=r.tarea.especialidad_nombre;
                r['periodo']=r.tarea.tipo_periodo?r.tarea.tipo_periodo.nombre:'';
                r['equipoT']=r.parte.seccion?r.parte.seccion.nombre + (r.parte.equipo?' - ' + r.parte.equipo.nombre:''):null;
                r['maquina']=r.parte.seccion?r.parte.seccion.siglas_zona:null;
                r['fecha_plani']=r.fecha_plan?invertirFecha(String(r.fecha_plan)):'';
                r['fecha_ini']=r.fecha_inicio?invertirFecha(String(r.fecha_inicio)):'';
                r['fecha_f']=r.fecha_fin?invertirFecha(String(r.fecha_fin)):'';
                r['fecha_creaparte']=r.parte.fecha_creacion?invertirFecha(String(r.parte.fecha_creacion)):'';
            })
            setLineas([...res.data.results]);
            setCount(res.data.count);
            let pagT = res.data.count/20;
            if (res.data.count % 20 !== 0){
                pagT += 1;
            }
            setPagTotal(Math.trunc(pagT));
        })
        .catch( err => {
            console.log(err);
        });
    }

    // FUNCIÓN PARA ABRIR EL MODAL DE OBSERVACIONES
    const pedir_observaciones = (linea, parte) => {
        // En ManLineasListado no hay la misma lógica de validación que en ManPorEquipos
        // porque aquí se muestran todas las líneas independientemente del trabajador
        setShowObservacion(true);
        setLinea_completa(linea);
        setParte(parte);
    }

    // FUNCIÓN PARA CERRAR EL MODAL DE OBSERVACIONES
    const handleCloseObservacion = () => {
        setShowObservacion(false);
        updateTarea(); 
    }

    useEffect(() => {
        if (token['tec-token']) {
            updateTarea(); 
        }
    }, [token, filtroBase, paginaActual, actualizar, actualizar_seg]);

    useEffect(()=>{
        if (token['tec-token']) {
            updateTarea(); 
        } 
    }, [token, filtroBase, paginaActual, actualizar, actualizar_seg ]); 

    const listarTrabajadores = (linea_id)=>{
        setLinea_id(linea_id);
        setShow(true);
    }

    const handlerClose = () => {
        setShow(false);
    }

    const updateCantidad = (cantidad, linea) => {
        const newLineas = [...lineas];
        newLineas.forEach( l => {
            if (l.tarea.id === linea.tarea.id){
                l.tarea.prioridad += cantidad;
                if (l.tarea.prioridad < 1) l.tarea.prioridad = 1;
            } 
        });
        setLineas(newLineas);
    }

    const ActualizarPrioridad = (linea) => {
        axios.patch(BACKEND_SERVER + `/api/mantenimiento/tareas/${linea.tarea.id}/`, {
            prioridad : linea.tarea.prioridad,
        },{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setActualizar(linea);
        })
        .catch(err => { console.log(err);})
    }

    const cambioPagina = (nuevaPagina) => {
        if(nuevaPagina<=0){
            nuevaPagina =1;
        }
        const maxPagina = Math.ceil(count / 20) || 1;
        if(nuevaPagina >maxPagina){
            nuevaPagina = maxPagina;
        }
        setPaginaActual(nuevaPagina);
    }

    const abroFiltro = () => {
        setabrirFiltro(!abrirFiltro);
    }

    useEffect(() => {
        // eslint-disable-next-line no-unused-vars
        const interval = setInterval(() => {
            setActualizarSeg(true);
        }, 60000);
      }, []);

    return (
        <Container className='mt-3'>
            <button type="button" className='mt-5' onClick={event => {abroFiltro()}}>Ver Filtros</button>
            {abrirFiltro?    
                <Row>
                    <Col>
                        <ManLineasFiltro actualizaFiltro={actualizaFiltro}/>
                    </Col>
                </ Row>
            :null}
            {abrirFiltro? 
                <Row> 
                    <Col><h5>{lineas?lineas.prioridad:''}</h5></Col>
                    <ExcelFile filename={"ExcelExportExample"} element={<button>Exportar a Excel</button>}>
                        <ExcelSheet data={lineas} name="lineas">
                            <ExcelColumn label="Prioridad" value="priori"/>
                            <ExcelColumn label="Parte" value="nom_parte"/>
                            <ExcelColumn label="Observaciones Parte" value="obparte"/>
                            <ExcelColumn label="Tarea" value="nom_tarea"/>
                            <ExcelColumn label="Observaciones Tarea" value="obtarea"/>
                            <ExcelColumn label="Observaciones Tarea Mantenimiento" value="obtareaT"/>
                            <ExcelColumn label="Tipo" value="parte_tip"/>
                            <ExcelColumn label="Especialidad" value="especial"/>
                            <ExcelColumn label="Periodo" value="periodo"/>
                            <ExcelColumn label="Maquina" value="maquina"/>
                            <ExcelColumn label="Equipo" value="equipoT"/>  
                            <ExcelColumn label="Fecha Planificación" value="fecha_plani"/>
                            <ExcelColumn label="Fecha Inicio" value="fecha_ini"/>  
                            <ExcelColumn label="Fecha Fin" value="fecha_f"/>
                            <ExcelColumn label="Fecha Creación parte" value="fecha_creaparte"/>      
                        </ExcelSheet>
                    </ExcelFile> 
                </Row>
            :null}
            <table>
                <tbody>
                    <tr>
                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina(paginaActual - 1)} disabled={paginaActual <= 1}>Pág Anterior</button></th> 
                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina(paginaActual + 1)} disabled={paginaActual >= (pagTotal || 1)}>Pág Siguiente</button></th> 
                        <th>Página {paginaActual} de {pagTotal || 1} - Número registros totales: {count || 0}</th>
                    </tr>
                </tbody>
            </table> 
            <Row>                
                <Col>
                    <h5 className="mb-3 mt-3">Listado de Trabajos</h5>
                    <h5  style={{ color: 'green' }}>Trabajo terminado</h5>  
                    <h5  style={{ color: 'blue' }}>Trabajo iniciado</h5>  
                    <h5  style={{ color: 'orange' }}>Trabajo iniciado con fecha pasada (un mes vista desde la fecha de planificación)</h5>
                    <h5  style={{ color: 'red' }}>Trabajo NO iniciado con fecha pasada (un mes vista desde la fecha de planificación)</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Pr.</th>
                                <th>+/-</th>
                                <th>Parte</th>
                                <th>Tarea</th>
                                <th>Tipo</th>
                                <th>Especialidad</th>
                                <th>Equipo</th>
                                <th>Observaciones Mantenimiento</th>
                                <th style={{width:110}}>Fecha Plan</th>
                                <th style={{width:110}}>Fecha Inicio</th>
                                <th style={{width:110}}>Fecha Fin</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineas && lineas.map( linea => {
                                return (
                                    <tr key={linea.id} className = {linea.fecha_fin?"table-success" : linea.fecha_inicio && fechapasadaString<linea.fecha_plan?"table-primary":!linea.fecha_inicio && fechapasadaString>linea.fecha_plan?"table-danger" : "" }style={{ backgroundColor: linea.fecha_inicio && fechapasadaString>linea.fecha_plan? 'orange' : " " }}>
                                        <td>{linea.tarea.prioridad}</td>
                                        <td>
                                            <PlusSquare className="mr-3 pencil"  onClick={event => {updateCantidad(1, linea)}} />
                                            <DashSquare className="mr-3 pencil"  onClick={event => {updateCantidad(-1, linea)}} />
                                            <HandThumbsUpFill className="mr-3 pencil" onClick= {async => {ActualizarPrioridad(linea)}}/>
                                        </td>
                                        <td>{linea.parte.nombre}</td>
                                        <td>{linea.tarea.nombre}</td>
                                        <td>{linea.parte.tipo_nombre}</td>
                                        <td>{linea.tarea.especialidad_nombre}</td>
                                        <td>{linea.parte.seccion?linea.parte.seccion.siglas_zona +' - '+linea.parte.seccion.nombre + (linea.parte.equipo?' - ' + linea.parte.equipo.nombre:''):null}</td>
                                        <td>{linea.observaciones_trab}</td>
                                        <td>{linea.fecha_plan? invertirFecha(String(linea.fecha_plan)):''}</td>
                                        <td>{linea.fecha_inicio?invertirFecha(String(linea.fecha_inicio)):''}</td>
                                        <td>{linea.fecha_fin?invertirFecha(String(linea.fecha_fin)):''}</td>
                                        <td>                                            
                                            <a href={`/mantenimiento/linea_tarea/${linea.id}`} target="_blank" rel="noopener noreferrer">
                                                <PencilFill className="mr-3 pencil"/>
                                            </a> 
                                            {/* <Trash className="mr-3 pencil"  onClick={event =>{BorrarLinea(linea)}} />   */}
                                            <FileCheck className="mr-3 pencil"  onClick={event =>{pedir_observaciones(linea, linea.parte)}} />                                     
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
            <table>
                <tbody>
                    <tr>
                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina(paginaActual - 1)} disabled={paginaActual <= 1}>Pág Anterior</button></th> 
                        <th><button type="button" className="btn btn-default" onClick={() => cambioPagina(paginaActual + 1)} disabled={paginaActual >= (pagTotal || 1)}>Pág Siguiente</button></th> 
                        <th>Página {paginaActual} de {pagTotal || 1} - Número registros totales: {count || 0}</th>
                    </tr>
                </tbody>
            </table>
            
            {/* MODAL DE OBSERVACIONES */}
            <ObservacionesModal 
                show={show_Observacion}
                onHide={handleCloseObservacion}
                linea={linea_completa}
                parte={parte}
                onUpdateTarea={updateTarea}
                showConsumibles={true}
                showFinalizar={false}
                filtro={`${filtroBase}&page=${paginaActual}`}
            />
            
            <ListaDePersonal    show={show}
                                lineas_trab ={linea_id}
                                handlerClose={handlerClose}
            />
        </Container>
    )
}

export default ManLineasListado;