import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button, Form } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { Tools, FileCheck, Receipt, Eye} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ListaDePersonal from './man_equipo_trabajadores';
import ManEquipoFiltro from './man_equipo_filtro';
import ObservacionesModal from './man_equipo_observaciones';

const ManPorEquipos = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [lineas, setLineas] = useState(null);  
    const [hoy] = useState(new Date());
    const [show, setShow] = useState(false);
    const [linea_trab, setLinea_Trab] = useState(null);
    const [linea_completa, setLinea_completa] = useState(null);
    const [lineasTrabajadores, setlineasTrabajadores] = useState(null);
    const [count, setCount] = useState(null);
    const [pagTotal, setPagTotal] = useState(null);
    const [filtro, setFiltro] = useState(null);
    const [show_Observacion, setShowObservacion] = useState(false);
    const [abrirFiltro, setabrirFiltro] = useState(false);
    const [actualizar_seg, setActualizarSeg] = useState(false);
    const [parte, setParte] = useState(null);

    const actualizaFiltro = str => {
        setFiltro(str);
    }

    const [datos, setDatos] = useState({
        fecha_inicio: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
        fecha_fin: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
        linea: '',
        trabajador: user['tec-user'].perfil.usuario,
        pagina:1,
        observaciones:'',
    });

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
            }
        }
    }, []);

    useEffect(() => {
        if (filtro && user['tec-user'].perfil.destrezas.length > 0) {
            axios.get(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_activas_destrezas/` + filtro, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                },
                params: {
                    destrezas: user['tec-user'].perfil.destrezas.join(',')
                }
            })
            .then(res => {
                setLineas(res.data.results);
                setCount(res.data.count);
                let pagT = res.data.count / 20;
                if (res.data.count % 20 !== 0) {
                    pagT += 1;
                }
                setPagTotal(Math.trunc(pagT));
            })
            .catch(err => {
                console.log(err);
            });
            setActualizarSeg(false);
        }
    }, [token, filtro, actualizar_seg, user]);    
 
    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/mantenimiento/trabajadores_linea_filtro/?trabajador=${user['tec-user'].perfil.usuario}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setlineasTrabajadores(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, user]);

    const comparar = (x) => {
        for(var y=0;y<lineasTrabajadores?.length;y++){
            if(lineasTrabajadores[y].linea===x.id){
                return( true);
            }
        }
        return(false);
    }

    const updateTarea = () => {
        axios.get(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_activas_destrezas/`+ filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                },
                params: {
                    destrezas: user['tec-user'].perfil.destrezas.join(',')
                }
        })
        .then( res => {
            setLineas([...res.data.results]); 
            setCount(res.data.count);
        })
        .catch( err => {
            console.log(err);
        });
    }
    
    const InicioTarea = (linea) => { 
        axios.get(BACKEND_SERVER + `/api/mantenimiento/trabajadores_linea/?linea=${linea.id}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {
            if(linea.fecha_inicio===null){
                axios.patch(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/${linea.id}/`, {
                    fecha_inicio:datos.fecha_inicio,
                    estado: 2,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                      }     
                })
                .then( r => { 
                    axios.post(BACKEND_SERVER + `/api/mantenimiento/trabajadores_linea/`, {
                        linea:linea.id,
                        fecha_inicio:datos.fecha_inicio,
                        fecha_fin:null,
                        trabajador:datos.trabajador,
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                          }     
                    })
                    .then( ress => {
                        updateTarea();
                        axios.get(BACKEND_SERVER + `/api/mantenimiento/trabajadores_linea_filtro/?trabajador=${user['tec-user'].perfil.usuario}`,{
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                                }
                        })
                        .then( res => {
                            setlineasTrabajadores(res.data);
                        })
                        .catch( err => {
                            console.log(err);
                        });
                    })
                    .catch(err => { console.log(err);})
                })
                .catch(err => { console.log(err);})
            }
            else{
                const trabajador_activo = res.data.filter(s => s.trabajador === user['tec-user'].perfil.usuario);
                if(trabajador_activo.length===0){
                    axios.post(BACKEND_SERVER + `/api/mantenimiento/trabajadores_linea/`, {
                        linea:linea.id,
                        fecha_inicio:datos.fecha_inicio,
                        fecha_fin:null,
                        trabajador:datos.trabajador,
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                          }     
                    })
                    .then( ress => {
                        updateTarea(); 
                    })
                    .catch(err => { console.log(err);})
                }
                else if(trabajador_activo.length!==0){
                    alert('Usted ya tiene este trabajo iniciado');
                }
            }
        })
        .catch(err => { console.log(err);}) 
    }

    const pedir_observaciones = (linea, parte) => {
        if(linea.fecha_inicio===null){
            alert('Esta tarea todavía no se ha iniciado');
        }
        else{
            const trabajador_activo = linea.lineas?.filter(s => s.trabajador.id === user['tec-user'].perfil.usuario);
            if(trabajador_activo.length===0){
                alert('No tienes esta tarea iniciada, no la puedes comentar ni finalizar');
            }
            else if(trabajador_activo.length!==0){
                datos.observaciones=linea.observaciones_trab;
                setShowObservacion(true);
                setLinea_completa(linea);
                setParte(parte);
            }
        }
    }

    const handleCloseObservacion = () => {
        setShowObservacion(false);
        updateTarea();
    }

    const listarTrabajadores = (linea)=>{
        setLinea_Trab(linea);
        setShow(true);
    }
    
    const handlerClose = () => {
        setShow(false);
    }

    const cambioPagina = (pag) => {
        if(pag<=0){
            pag=1;
        }
        
        if(pag>count/20){
            if(count % 20 === 0){
                pag=Math.trunc(count/20);
            }
            else{
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
        actualizaFiltro(filtro3);
    }

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })  
    }
    
    const abroFiltro = () => {
        setabrirFiltro(!abrirFiltro);
    }

    return(
        <Container className="pt-1 mt-5">
            <br></br>
            <h5 className="mb-5 mt-5" style={{ color: 'red' }}>
                Listado de Trabajos <span style={{ color: 'black' }}>{user['tec-user'].get_full_name}</span>, por fecha y prioridad:
            </h5>
            <button type="button" onClick={event => {abroFiltro()}}>Ver Anotaciones</button>
            {abrirFiltro?   
            <Row className="mb-2">                
                <Col>             
                    <h5>Acciones:</h5>
                    <h5><Tools/> ---- Para iniciar un trabajo</h5>
                    <h5><FileCheck/> ---- Para finalizar un trabajo o poner un comentario</h5>
                    <h5><Receipt/> ---- Listado del personal que está interviniendo en este trabajo</h5>
                    <h5><Eye/> ---- Ver el parte al que pertenece la tarea</h5>
                    <h5 style={{ color: 'blue' }}>Trabajo cogido por nosotros</h5>
                    <h5 style={{ color: '#E0B800'}}>Trabajo cogido por un compañero</h5>
                </Col>
            </Row>
            :null} 
            <Row className="mb-2 mt-2">
                <Col>
                    <ManEquipoFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </Row>
            <table>
                <tbody>
                    <tr>
                        <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                        <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                        <th>Página {datos.pagina} de {pagTotal===0?1:pagTotal} - Número registros totales: {count}</th>
                    </tr>
                </tbody>
            </table> 
            <Row>
                <Col>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Pr</th>
                                <th style={{width:110}}>Fecha Prev. Inicio</th>
                                <th>Nombre Tarea</th>
                                <th>Observaciones</th>
                                <th>Equipo</th>
                                <th style={{width:110}}>Fecha Inicio</th>
                                <th style={{width:110}}>Fecha Fin</th>
                                <th style={{width:115}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineas && lineas.map( linea => {
                                return (
                                    <tr key={linea.id} style={{ backgroundColor: comparar(linea) ? '#cce5ff': linea.fecha_inicio!==null? 'yellow' : " " }} className="table-secundary">
                                        <td>{linea.tarea.prioridad}</td>
                                        <td>{invertirFecha(linea.fecha_plan)}</td>
                                        <td>{linea.tarea.nombre}</td>
                                        <td>{linea.tarea.observaciones}</td>
                                        <td>{linea.parte.seccion?linea.parte.seccion.siglas_zona +' - '+linea.parte.seccion.nombre + (linea.parte.equipo?' - ' + linea.parte.equipo.nombre:''):null}</td>
                                        <td>{linea.fecha_inicio?invertirFecha(String(linea.fecha_inicio)):''}</td>
                                        <td>{linea.fecha_fin?invertirFecha(String(linea.fecha_fin)):''}</td>
                                        <td>
                                        <Tools className="mr-3 pencil"  onClick={event =>{InicioTarea(linea)}}/>
                                        <FileCheck className="mr-3 pencil"  onClick={event =>{pedir_observaciones(linea, linea.parte)}} />
                                        <Receipt className="mr-3 pencil" onClick={event =>{listarTrabajadores(linea)}}/>
                                        <Link to={`/mantenimiento/parte_op/${linea.parte.id}`}><Eye className="mr-3 pencil"/></Link>
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
                        <th>Página {datos.pagina} de {pagTotal===0?1:pagTotal}</th>
                    </tr>
                </tbody>
            </table>
            
            {/* Usar el modal independiente */}
            <ObservacionesModal 
                show={show_Observacion}
                onHide={handleCloseObservacion}
                linea={linea_completa}
                parte={parte}
                onUpdateTarea={updateTarea}
                showConsumibles={true}
                showFinalizar={true}
            />
            
            <ListaDePersonal    
                show={show}
                lineas_trab={linea_trab}
                handlerClose={handlerClose}
            />
        </Container>
    )
}

export default ManPorEquipos;