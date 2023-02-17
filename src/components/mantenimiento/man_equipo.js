import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button  } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { Tools, FileCheck, Receipt, Eye} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ListaDePersonal from './man_equipo_trabajadores';
import ManEquipoFiltro from './man_equipo_filtro';

const ManPorEquipos = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [lineas, setLineas] = useState(null);  
    const [hoy] = useState(new Date);
    const [show, setShow] = useState(false);
    const [linea_id, setLinea_id] = useState(null);
    const [lineasTrabajadores, setlineasTrabajadores] = useState(null);
    

    var dentrodeunmes=null;
    var fechaenunmesString=null;
    var fecha_hoy=Date.parse(hoy);
    var mesEnMilisegundos = 1000 * 60 * 60 * 24 * 7;  //cambiado a una semana, en vez del mes
    var enunmes=fecha_hoy+mesEnMilisegundos;
    dentrodeunmes = new Date(enunmes);
    fechaenunmesString = dentrodeunmes.getFullYear() + '-' + ('0' + (dentrodeunmes.getMonth()+1)).slice(-2) + '-' + ('0' + dentrodeunmes.getDate()).slice(-2);
    var Mizona = user['tec-user'].perfil.zona?user['tec-user'].perfil.zona.id:'';
    var Midestreza = user['tec-user'].perfil.destrezas.length===1?user['tec-user'].perfil.destrezas[0]:'';

    const [filtro, setFiltro] = useState(`?parte__empresa=${user['tec-user'].perfil.empresa.id}&fecha_plan__lte=${fechaenunmesString}&parte__zona__id=${Mizona}&tarea__especialidad=${Midestreza}`);
    const actualizaFiltro = str => {
        setFiltro(str);
    }

    const [datos, setDatos] = useState({
        fecha_inicio: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
        fecha_fin: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
        linea: '',
        trabajador: user['tec-user'].perfil.usuario,
    });
    
    useEffect(()=>{ 
        axios.get(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_activas/`+ filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            //filtramos los trabajos que sean de nuestras destrezas, para cuando son varias destrezas 
            var MisTrabajos;
            var destrezas = user['tec-user'].perfil.destrezas;
            MisTrabajos = res.data.filter(s => destrezas.includes(s.tarea.especialidad));
            setLineas(MisTrabajos);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro]); 
 
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
    }, [token]);

    const comparar = (x) => {
        for(var y=0;y<lineasTrabajadores.length;y++){
            if(lineasTrabajadores[y].linea===x.id){
                return( "table-primary");
            }
        }
    }

    const updateTarea = () => {
        axios.get(BACKEND_SERVER + '/api/mantenimiento/listado_lineas_activas/'+ filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            //filtramos los trabajos que sean de nuestras destrezas.
            var MisTrabajos;
            var destrezas = user['tec-user'].perfil.destrezas;
            MisTrabajos = res.data.filter(s => destrezas.includes(s.tarea.especialidad));
            //ordenamos los trabajos por prioridad
            setLineas(MisTrabajos.sort(function(a, b){
                if(a.tarea.prioridad < b.tarea.prioridad){
                    return 1;
                }
                if(a.tarea.prioridad > b.tarea.prioridad){
                    return -1;
                }
                return 0;
            }))  
            //setLineas(res.data);
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
                    })
                    .catch(err => { console.log(err);})
                    updateTarea();
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

    const FinalizarTarea = (linea) => { 
        axios.get(BACKEND_SERVER + `/api/mantenimiento/trabajadores_linea/?linea=${linea.id}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {
            if(linea.fecha_inicio===null){
                alert('Esta tarea todavía no se ha iniciado');
            }
            else{
                const trabajador_activo = res.data.filter(s => s.trabajador === user['tec-user'].perfil.usuario);
                if(trabajador_activo.length===0){
                    alert('No tienes esta tarea iniciada, no la puedes finalizar');
                }
                else if(trabajador_activo.length!==0){
                    var Finalizar_Tarea = window.confirm('Vas a finalizar la tarea ¿Desea continuar?');
                    if (Finalizar_Tarea){
                        for(var x=0;x<res.data.length;x++){
                            axios.patch(BACKEND_SERVER + `/api/mantenimiento/trabajadores_linea/${res.data[x].id}/`,{
                                fecha_fin: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
                            },
                            {
                                headers: {
                                    'Authorization': `token ${token['tec-token']}`
                                }
                            })
                            .then( r => {
                                updateTarea();
                            })
                            .catch( err => {
                                console.log(err);
                            });
                        }
                        axios.patch(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_activas/${linea.id}/`,{
                            fecha_fin: datos.fecha_fin,
                            estado: 3,
                        },
                        {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }
                        })
                        .then( re => {
                            if(re.data.parte.tipo===1){
                                var fechaString= null;
                                var diaEnMilisegundos = 1000 * 60 * 60 * 24;
                                var fecha=Date.parse(re.data.fecha_fin);
                                var fechaPorSemanas=null;
                                var suma=null;
                                suma = fecha + (diaEnMilisegundos * re.data.tarea.periodo * re.data.tarea.tipo_periodo.cantidad_dias);
                                fechaPorSemanas = new Date(suma);
                                fechaString = fechaPorSemanas.getFullYear() + '-' + ('0' + (fechaPorSemanas.getMonth()+1)).slice(-2) + '-' + ('0' + fechaPorSemanas.getDate()).slice(-2);
                               
                                fechaString && axios.post(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/`,{
                                    parte: re.data.parte.id,
                                    tarea: re.data.tarea.id,
                                    fecha_inicio:null,
                                    fecha_fin:null,
                                    fecha_plan: fechaString,
                                    estado: 1,
                                },
                                {
                                    headers: {
                                        'Authorization': `token ${token['tec-token']}`
                                    }
                                })
                                .then( r => {
                                    console.log('linea hecha');

                                })
                                .catch( err => {
                                    console.log(err);  
                                });
                                updateTarea();
                            }                            
                            else{
                                axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_parte_trabajo/?parte=${re.data.parte.id}`, {
                                    headers: {
                                        'Authorization': `token ${token['tec-token']}`
                                      }     
                                })
                                .then( res => {
                                    var contador = 0;
                                    for(var x=0;x<res.data.length;x++){
                                        if(res.data[x].estado===3){
                                            contador=contador+1;
                                            if(contador===res.data.length){
                                                axios.patch(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo/${res.data[0].parte}/`,{
                                                    estado: 3,
                                                },
                                                {
                                                    headers: {
                                                        'Authorization': `token ${token['tec-token']}`
                                                    }
                                                })
                                                .then( re => {
                                                    console.log('parte finalizado');
                                                })
                                                .catch( err => {
                                                    console.log(err);  
                                                });
                                            }
                                        }
                                        else{
                                            console.log('hay lineas sin finalizar');
                                        }
                                    }

                                })
                                .catch( err => {
                                    console.log(err);  
                                });
                            }
                        })
                        .catch( err => {
                            console.log(err);
                        });
                    }
                }
            }
            updateTarea();
        })
        .catch(err => { console.log(err);}) 
    }

    const listarTrabajadores = (linea_id)=>{
        setLinea_id(linea_id);
        setShow(true);
    }
    
    const handlerClose = () => {
        setShow(false);
    }

    return(
        <Container class extends className="pt-1 mt-5">
            <Row class extends>                
                <Col>
                    <h5 className="mb-3 mt-3" style={ { color: 'red' } }>Listado de Trabajos {user['tec-user'].get_full_name}, por prioridades:</h5>              
                    <h5>Acciones:</h5>
                    <h5><Tools/> ---- Para iniciar un trabajo "Iniciados en color verde"</h5>
                    <h5><FileCheck/> ---- Para finalizar un trabajo</h5>
                    <h5><Receipt/> ---- Listado del personal que está interviniendo en este trabajo</h5>
                    <h5><Eye/> ---- Ver el parte al que pertenece la tarea</h5>
                </Col>
                <Col>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <h5 style={{ color: 'green' }}>Verde ---- Trabajo cogido por un compañero</h5>
                    <h5 style={{ color: 'blue' }}>Azul ---- Trabajo cogido por nosotros</h5>
                </Col>
            </Row>
            <Row>
                <Col>
                    <ManEquipoFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
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
                                    <tr key={linea.id} className = {comparar(linea)? "table-primary" : linea.fecha_inicio!==null? "table-success" : " "}>
                                        <td>{linea.tarea.prioridad}</td>
                                        <td>{invertirFecha(linea.fecha_plan)}</td>
                                        <td>{linea.tarea.nombre}</td>
                                        <td>{linea.tarea.observaciones}</td>
                                        <td>{linea.parte.seccion?linea.parte.seccion.siglas_zona +' - '+linea.parte.seccion.nombre + (linea.parte.equipo?' - ' + linea.parte.equipo.nombre:''):null}</td>
                                        <td>{linea.fecha_inicio?invertirFecha(String(linea.fecha_inicio)):''}</td>
                                        <td>{linea.fecha_fin?invertirFecha(String(linea.fecha_fin)):''}</td>
                                        <td>
                                        <Tools className="mr-3 pencil"  onClick={event =>{InicioTarea(linea)}}/>
                                        <FileCheck className="mr-3 pencil"  onClick={event =>{FinalizarTarea(linea)}} />
                                        <Receipt className="mr-3 pencil" onClick={event =>{listarTrabajadores(linea.id)}}/>
                                        <Link to={`/mantenimiento/parte_op/${linea.parte.id}`}><Eye className="mr-3 pencil"/></Link>
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row> 
        <ListaDePersonal    show={show}
                            linea_id ={linea_id}
                            handlerClose={handlerClose}
        />
        </Container>
    )
}

export default ManPorEquipos;

