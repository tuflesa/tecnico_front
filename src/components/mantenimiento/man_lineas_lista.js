import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table} from 'react-bootstrap';
import { Trash, PencilFill, Receipt, Eye, PlusSquare, DashSquare, HandThumbsUpFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ManLineasFiltro from './man_lineas_filtro';
import { color, filter } from 'd3';
import {invertirFecha} from '../utilidades/funciones_fecha';
import ListaDePersonal from './man_equipo_trabajadores';
import ReactExport from 'react-data-export';


const ManLineasListado = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [lineas, setLineas] = useState(null);
    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    var fecha_hoy=Date.parse(new Date);
    var mesEnMilisegundos = 1000 * 60 * 60 * 24 * 30;
    var enunmes=fecha_hoy+mesEnMilisegundos;
    var dentrodeunmes = new Date(enunmes);
    var fechaenunmesString = dentrodeunmes.getFullYear() + '-' + ('0' + (dentrodeunmes.getMonth()+1)).slice(-2) + '-' + ('0' + dentrodeunmes.getDate()).slice(-2);
    var haceunmes = fecha_hoy-mesEnMilisegundos;
    var unmesatras = new Date(haceunmes);
    var fechapasadaString = unmesatras.getFullYear() + '-' + ('0' + (unmesatras.getMonth()+1)).slice(-2) + '-' + ('0' + unmesatras.getDate()).slice(-2);

    const [filtro, setFiltro] = useState(`?parte__empresa__id=${user['tec-user'].perfil.empresa.id}&estado=${''}&fecha_plan__lte=${fechaenunmesString}`);
    const [activos, setActivos] = useState(true);
    const [linea_id, setLinea_id] = useState(null);
    const [show, setShow] = useState(false);
    const [actualizar, setActualizar] = useState('');
    const [count, setCount] = useState(null);
    const [pagTotal, setPagTotal] = useState(null);
    const [abrirFiltro, setabrirFiltro] = useState(false);
    const [actualizar_seg, setActualizarSeg] = useState(false);

    const actualizaFiltro = (str, act) => {   
        setActivos(act)
        setFiltro(str);
    }

    const [datos, setDatos] = useState({
        pagina: 1,
    });

    useEffect(()=>{
        console.log(actualizar_seg);
        if(activos){
            axios.get(BACKEND_SERVER + '/api/mantenimiento/listado_lineas_activas/'+ filtro,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }
            })
            .then( res => {
                res.data.results.map( r => {
                    //solo para poder utilizar los campos en el excel
                    r['priori']=r.tarea.prioridad;
                    r['nom_parte']=r.parte.nombre;
                    r['obparte']=r.parte.observaciones;
                    r['nom_tarea']=r.tarea.nombre;
                    r['obtarea']=r.tarea.observaciones;
                    r['obtareaT']=r.tarea.observaciones_trab;
                    r['parte_tip']=r.parte.tipo_nombre;
                    r['especial']=r.tarea.especialidad_nombre;
                    r['equipoT']=r.parte.seccion?r.parte.seccion.siglas_zona +' - '+r.parte.seccion.nombre + (r.parte.equipo?' - ' + r.parte.equipo.nombre:''):null;
                    r['fecha_plani']=r.fecha_inicio?invertirFecha(String(r.fecha_plan)):'';
                    r['fecha_ini']=r.fecha_inicio?invertirFecha(String(r.fecha_inicio)):'';
                })
                setLineas(res.data.results);
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
        else{
            //si no hay opción 5 (Activos) filtramos de forma normal
            axios.get(BACKEND_SERVER + '/api/mantenimiento/listado_lineas_partes/'+ filtro,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }
            })
            .then( res => {
                /* res.data.results.map( r => {
                    //solo para poder utilizar los campos en el excel
                    r['priori']=r.tarea.prioridad;
                    r['nom_parte']=r.parte.nombre;
                    r['obparte']=r.parte.observaciones;
                    r['obtarea']=r.tarea.observaciones;
                    r['obtareaT']=r.tarea.observaciones_trab;
                    r['parte_tip']=r.parte.tipo_nombre;
                    r['especial']=r.tarea.especialidad_nombre;
                    r['equipoT']=r.parte.equipo.nombre;
                    r['fecha_plani']=r.fecha_inicio?invertirFecha(String(r.fecha_plan)):'';
                    r['fecha_ini']=r.fecha_inicio?invertirFecha(String(r.fecha_inicio)):'';
                }) */
                setLineas(res.data.results);
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
    }, [token, filtro, activos, actualizar, actualizar_seg]); 

    const BorrarLinea =(linea) =>{ 
        axios.get(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_partes/?tarea=${linea.tarea.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            //si solo hay una linea y la fecha fin esta vacía, podemos eliminar linea y tarea.
            if(res.data.length===1 && res.data[0].fecha_fin===null){
                var confirmacion = window.confirm('¿Deseas eliminar la línea?');
                if(confirmacion){
                    axios.delete(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_partes/${res.data[0].id}/`,{            
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        } 
                    })
                    .then(re =>{
                        axios.delete(BACKEND_SERVER + `/api/mantenimiento/tareas/${res.data[0].tarea.id}/`,{            
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            } 
                        })
                        .then(r =>{
                            alert('tarea eliminada');
                            setActualizar(linea);  
                        })
                        .catch (err=>{console.log((err));});
                    })
                    .catch (err=>{console.log((err));});
                }
            }
            else{
                //Si la ultima linea tiene fecha fin, no se puede eliminar
                if(res.data[res.data.length-1].fecha_fin!==null){
                    alert('No se puede elimnar, trabajo ya ejecutado y terminado');
                }
                //en un preventivo, queremos detener el ciclo del trabajo.
                else{
                    var detenerTrabajo = window.confirm('No se puede eliminar, tiene trabajos finalizados. ¿Deseas detener el proceso?');
                    if(detenerTrabajo){
                        //eliminamos la linea que es la que ejecuta de nuevo la tarea'
                        axios.delete(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_partes/${res.data[res.data.length-1].id}/`,{            
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            } 
                        })
                        .then(ress =>{
                            alert('Trabajo detenido, no volverá a generar linea');
                            setActualizar(linea);  
                        })
                        .catch (err=>{console.log((err));});
                    }
                }
            }       
        })
        .catch( err => {
            console.log(err);
        });                 
    }

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

    const cambioPagina = (pag) => {
        if(pag<=0){
            pag=1;
        }
        if(pag>count/20){
            if(count % 20 === 0){
                pag=Math.trunc(count/20);
            }
            if(count % 20 !== 0){
                pag=Math.trunc(count/20)+1;
            }
        }
        if(pag>0){
            setDatos({
                ...datos,
                pagina: pag,
            })
        }
        var filtro2=`&page=${datos.pagina}`;
        const filtro3 = filtro + filtro2;
        actualizaFiltro(filtro3, activos);
    }

    const abroFiltro = () => {
        setabrirFiltro(!abrirFiltro);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            console.log('actualizar_seg');
            setActualizarSeg(!actualizar_seg);
        }, 30000);
        //console.log('viendo que vale actualizar_seg: ' + actualizar_seg);
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
                            <ExcelColumn label="Equipo" value="equipoT"/>  
                            <ExcelColumn label="Fecha Planificación" value="fecha_plani"/>
                            <ExcelColumn label="Fecha Inicio" value="fecha_ini"/>        
                        </ExcelSheet>
                    </ExcelFile> 
                </Row>
            :null}
            <table>
                <tbody>
                    <tr>
                        <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                        <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                        <th>Página {datos.pagina} de {pagTotal} - Número registros totales: {count}</th>
                    </tr>
                </tbody>
            </table> 
            <Row>                
                <Col>
                    <h5 className="mb-3 mt-3">Listado de Trabajos</h5>
                    <h5>--- Verde = Trabajo terminado   --- Rojo = Trabajo NO iniciado con fecha pasada</h5>  
                    <h5>--- Azul = Trabajo iniciado   --- Naranja = Trabajo iniciado con fecha pasada</h5>             
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
                                            <Link to={`/mantenimiento/linea_tarea/${linea.id}`}>
                                                <PencilFill className="mr-3 pencil"/>                                                
                                            </Link>  
                                            <Trash className="mr-3 pencil"  onClick={event =>{BorrarLinea(linea)}} />                                       
                                            <Receipt className="mr-3 pencil" onClick={event =>{listarTrabajadores(linea.id)}}/>
                                            <Link to={`/mantenimiento/parte/${linea.parte.id}`}><Eye className="mr-3 pencil"/></Link>
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
                        <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                        <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                        <th>Página {datos.pagina} de {pagTotal} - Número registros totales: {count}</th>
                    </tr>
                </tbody>
            </table>
            
            <ListaDePersonal    show={show}
                                linea_id ={linea_id}
                                handlerClose={handlerClose}
        />
        </Container>
    )
}

export default ManLineasListado;