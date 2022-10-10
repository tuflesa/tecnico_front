import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';
import { Trash, PlusCircle, Receipt, PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import LineaTareaNueva from './man_parte_lineatarea';
import LineasPartesMov from './man_parte_lineas_mov';
import { style } from 'd3';

const ParteForm = ({parte, setParte, op}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [tipoparte, setTipoParte] = useState(null);
    const [empresas, setEmpresas] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [zonas, setZonas] = useState(null);
    const [equipos, setEquipos] = useState(null);
    const [hoy] = useState(new Date);
    const [show_linea, setShowLinea] = useState(false);
    const [show_error, setShowError] = useState(false);
    const [show_listlineastareas, setShowListLineasTareas] = useState(false);
    const [lineaLineasTareas, setListLineasTareas] = useState(null);
    const [cambio_fecha, setCambioFecha] = useState(false);
    const [estados, setEstados] = useState(null);
    const [actualizar, setActualizar] = useState('');
    const [lineas, setLineas] = useState(null);
    const soyTecnico = user['tec-user'].perfil.destrezas.filter(s => s === 6);

    const [datos, setDatos] = useState({
        id: parte.id ? parte.id : null,
        nombre: parte?parte.nombre:null,
        tipo: parte?parte.tipo:null,
        creado_por: parte.creado_por,
        finalizado: parte? parte.finalizado : false,
        observaciones: parte.observaciones? parte.observaciones : '',
        fecha_creacion: parte.id ? parte.fecha_creacion :(hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
        fecha_prevista_inicio: parte? parte.fecha_prevista_inicio : '',
        fecha_finalizacion: parte? parte.fecha_finalizacion : '',
        empresa: parte?parte.empresa:null,
        zona: parte? parte.zona : '',
        seccion: parte.id? parte.seccion.id : '',
        equipo: parte.equipo? parte.equipo.id: '',
        tarea: parte?parte.tarea:null,
        estado: parte?parte.estado:null,
        num_parte: parte? parte.num_parte:null,
        tipo_periodo: parte.tipo===1? parte.tipo_periodo : '',
        periodo: parte.tipo===1? parte.periodo : 0,
        finalizar: parte.estado===3?true:false,
    });

    useEffect(()=>{
        setDatos({
            id: parte.id ? parte.id : null,
            nombre: parte?parte.nombre:null,
            tipo: parte?parte.tipo:null,
            creado_por: parte.creado_por,
            finalizado: parte? parte.finalizado : false,
            observaciones: parte.observaciones? parte.observaciones : '',
            fecha_creacion: parte.id ? parte.fecha_creacion :(hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
            fecha_prevista_inicio: parte? parte.fecha_prevista_inicio : '',
            fecha_finalizacion: parte? parte.fecha_finalizacion : '',
            empresa: parte?parte.empresa:null,
            zona: parte? parte.zona : '',
            seccion: parte.id? parte.seccion.id : '',
            equipo: parte.equipo? parte.equipo.id: '',
            tarea: parte?parte.tarea:null,
            estado: parte?parte.estado:null,
            num_parte: parte? parte.num_parte:null,
            tipo_periodo: parte.tipo===1? parte.tipo_periodo : '',
            periodo: parte.tipo===1? parte.periodo : 0,
            finalizar: parte.estado===3?true:false,
        });
    },[parte]);
  
    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/mantenimiento/tipo_tarea/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            if(soyTecnico.length===0){
                const no_tecnico = res.data.filter( s => s.nombre !== 'Preventivo');
                setTipoParte(no_tecnico.sort(function(a, b){
                    if(a.nombre > b.nombre){
                        return 1;
                    }
                    if(a.nombre < b.nombre){
                        return -1;
                    }
                    return 0;
                }))
                setDatos({
                    ...datos,
                    tipo: 2,
                    fecha_prevista_inicio: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
                });
            }
            else{
                setTipoParte(res.data.sort(function(a, b){
                    if(a.nombre > b.nombre){
                        return 1;
                    }
                    if(a.nombre < b.nombre){
                        return -1;
                    }
                    return 0;
                }))
            }
        })
        .catch( err => {
            console.log(err); 
        })       
    }, [token]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            //Si es Bornay, enseñamos Bornay y Comalsid
            if(user['tec-user'].perfil.empresa.id===1&&user['tec-user'].perfil.puesto.nombre==='Mantenimiento'){
                var empresas_2 = res.data.filter( s => s.id !== 2);
                setEmpresas(empresas_2);
            }
            else{
                setEmpresas(res.data);
            }
        })
        .catch( err => {
            console.log(err);
        });        
    }, [token]);
    
    useEffect(() => {
        if (datos.empresa === '') {
            setZonas([]);
            setDatos({
                ...datos,
                zona: '',
                seccion: '',
                equipo: ''
            });
        }
        else {
            datos.empresa && axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setZonas(res.data);
                // setDatos({
                //     ...datos,
                //     zona: '',
                //     seccion: '',
                //     equipo: ''
                // });
            })
            .catch( err => {
                console.log(err);
            });            
        }
    }, [token, datos.empresa]);
    
    useEffect(() => {
        if (datos.zona === '') {
            setSecciones([]);
            setDatos({
                ...datos,
                seccion: '',
                equipo: ''
            });
        }
        else {
            datos.zona && axios.get(BACKEND_SERVER + `/api/estructura/seccion/?zona=${datos.zona}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setSecciones(res.data);
                // setDatos({
                //     ...datos,
                //     seccion: '',
                //     equipo: ''
                // });
            })
            .catch( err => {
                console.log(err);
            });            
        }
    }, [token, datos.zona]);
    
    useEffect(() => {        
        if (datos.seccion === ''){
            setEquipos([]);
            setDatos({
                ...datos,
                equipo: ''
            });
        }
        else{
            datos.seccion && axios.get(BACKEND_SERVER + `/api/estructura/equipo/?seccion=${datos.seccion}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setEquipos(res.data.sort(function(a, b){
                    if(a.nombre > b.nombre){
                        return 1;
                    }
                    if(a.nombre < b.nombre){
                        return -1;
                    }
                    return 0;
                }))
                // setDatos({
                //     ...datos,
                //     equipo: ''
                // });
            })
            .catch( err => {
                console.log(err);
            });            
        }
    }, [token, datos.seccion]);
    
    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/mantenimiento/estados/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEstados(res.data.sort(function(a, b){
                if(a.id > b.id){
                    return 1;
                }
                if(a.id < b.id){
                    return -1;
                }
                return 0;
            }))
        })
        .catch( err => {
            console.log(err); 
        })       
    }, [token]);

    useEffect(()=>{        
        parte.id && axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_parte_trabajo/?parte=${parte.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            const unique = (value, index, self) => {
                return self.indexOf(value.tarea) === index.tarea
              }
            if(parte.tipo_nombre==="Preventivo"){
                const prueba = res.data.filter((r=> r.fecha_fin===null));
                if(prueba.length===0){
                    let hash = {};
                    var array = [''];
                    array = res.data.filter(o => hash[o.tarea.id] ? false : hash[o.tarea.id] = true);
                    setLineas(array);
                }
                else{
                    setLineas(prueba.sort(function(a, b){
                        if(a.tarea.prioridad < b.tarea.prioridad){
                            return 1;
                        }
                        if(a.tarea.prioridad > b.tarea.prioridad){
                            return -1;
                        }
                        return 0;
                    }))
                    if(prueba && prueba.length===0){
                        const uniqueTarea = res.data.filter(unique)
                        setLineas(uniqueTarea);
                    }
                }
            }
            else{
                setLineas(res.data.sort(function(a, b){
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
    }, [token]); 
    
    const updateParte = () => {
        parte.id && axios.get(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo_detalle/${parte.id}/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {
            setParte(res.data);
            axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_parte_trabajo/?parte=${parte.id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }
            })
            .then( res => {
                if(parte.tipo_nombre==="Preventivo"){
                    const prueba = res.data.filter((r=> r.fecha_fin===null));
                    setLineas(prueba.sort(function(a, b){
                        if(a.tarea.prioridad < b.tarea.prioridad){
                            return 1;
                        }
                        if(a.tarea.prioridad > b.tarea.prioridad){
                            return -1;
                        }
                        return 0;
                    }))
                }
                else{
                    setLineas(res.data.sort(function(a, b){
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
        })
        .catch(err => { 
            console.log(err);})
    }
    
    const handleDisabled2 = () => {
        return false; //user['tec-user'].perfil.puesto.nombre==='Mantenimiento'
    }

    
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })  
    }

    const handleFinalizar = (event) => {
        var Finalizar_Tarea = window.confirm('Vas a finalizar el parte completo ¿Desea continuar?');
        if(Finalizar_Tarea){
            setDatos({
                ...datos,
                finalizar: true,
            }) 
            //finalizamos la cabecera del parte si es técnico, pondrá fecha_finalización, si es de mantanimiento no se pondrá la fecha.
            var estado2=datos.estado;
            var fecha_f=datos.fecha_finalizacion;
            if(user['tec-user'].perfil.puesto.nombre==='Mantenimiento'){
                estado2=3;
                fecha_f=null;
            }
            else{
                estado2=3;
                fecha_f= datos.fecha_finalizacion;
            }
            axios.patch(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo/${parte.id}/`,{
                fecha_finalizacion : fecha_f,
                estado: estado2,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }     
            })
            .then( r => {
                updateParte();
            })
            .catch(err => { 
                console.log(err);})

            //finalizamos todas las tareas de este parte
            axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_parte_trabajo/?parte=${parte.id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }     
            })
            .then( res => {
                for(var x=0; x<res.data.length; x++){
                    if(res.data[x].estado===3){
                    }
                    else{
                        axios.patch(BACKEND_SERVER + `/api/mantenimiento/lineas_parte_trabajo/${res.data[x].id}/`,{
                            fecha_inicio: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
                            fecha_fin: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
                            estado: 3,
                        }, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }     
                        })
                        .then( r => {
                            updateParte();
                        })
                        .catch(err => { 
                            console.log(err);})
                    }
                }
            })
            .catch(err => { 
                console.log(err);
            })
        }
        if(!Finalizar_Tarea){
            setDatos({
                ...datos,
                finalizar: false,
            }) 
        }
    }

    const handleInputChangeEmpresa = (event) => {
        setDatos({
            ...datos,
            zona: '',
            seccion: '',
            equipo: ''
                });
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })  
    }

    const handleInputChangeZona = (event) => {
        setDatos({
            ...datos,
            seccion: '',
            equipo: ''
                });
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })  
    }

    const handleInputChangeSeccion = (event) => {
        setDatos({
            ...datos,
            equipo: ''
                });
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })  
    }

    const handleInputChangeF = (event) => {
        setCambioFecha(true);
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })  
    }

    const crearParte = (event) => {
        event.preventDefault();
        axios.post(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo/`, {
            nombre: datos.nombre,
            tipo: datos.tipo,
            creado_por: user['tec-user'].perfil.usuario,
            finalizado: false,
            observaciones: datos.observaciones,
            fecha_creacion: datos.fecha_creacion,
            fecha_prevista_inicio: datos.fecha_prevista_inicio,
            fecha_finalizacion: datos.fecha_finalizacion,
            empresa: datos.empresa,
            equipo: datos.equipo?datos.equipo : '',
            zona: datos.zona,
            seccion: datos.seccion,
            estado: datos.fecha_prevista_inicio?1:4,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setParte(res.data);
        })
        .catch(err => { 
            setShowError(true);
            console.log(err);
        })
    } 

    //actualiza el estado y la fecha de la linea si cambia la fecha_prevista_inicio del parte
    const actualizarLinea = () => { 
        var fecha=null;
        var estado='';
        if(parte.fecha_prevista_inicio===null&& datos.fecha_prevista_inicio!==null){
            fecha=datos.fecha_prevista_inicio;
            estado=1;
        }
        else if(parte.fecha_prevista_inicio!==null && datos.fecha_prevista_inicio===null){
            fecha=null;
            estado=4;
        }
        else{
            estado=0;
        }
        if(estado!==0){
            //ponemos la fecha de planificación y el estado en el parte
            axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_parte_mov/?parte=${parte.id}`,{
          /*       fecha_plan: fecha,
                estado: estado,
            }, { */
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                //ponemos la nueva fecha planificacion y el estado en todas las lineas del parte
                for(var x=0;x<res.data.length;x++){
                    axios.patch(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/${res.data[x].id}/`, {
                        fecha_plan: fecha,
                        estado: estado,
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }     
                    })
                    .then( r => {
                        axios.patch(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo/${parte.id}/`, {
                            fecha_plan: fecha,
                            estado: estado,
                        }, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }     
                        })
                        .then( rs => {
                            updateParte();
                        })
                        .catch(err => { console.log(err);})
                        updateParte();
                    })
                    .catch(err => { console.log(err);})
                }         
            })
            .catch( err => {
                console.log(err);
            });
        }
    }

    const actualizarDatos = (event) => {
        //Si borramos la fecha, ponemos un null para que no falle el put
        if(datos.fecha_prevista_inicio===''){datos.fecha_prevista_inicio=null}
        if(datos.fecha_finalizacion===''){datos.fecha_finalizacion=null}
        event.preventDefault();
        axios.put(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo/${parte.id}/`, {
            nombre: datos.nombre,
            tipo: datos.tipo,
            finalizado: datos.finalizado,
            observaciones: datos.observaciones,
            fecha_creacion: datos.fecha_creacion,
            fecha_prevista_inicio: datos.fecha_prevista_inicio,
            fecha_finalizacion: datos.fecha_finalizacion,
            zona: datos.zona,
            seccion: datos.seccion,
            equipo: datos.equipo,
            estado: datos.estado?datos.estado:datos.fecha_finalizacion?3:datos.fecha_prevista_inicio?1:4,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            //if(cambio_fecha){
            if(parte.fecha_prevista_inicio!==datos.fecha_prevista_inicio){
                actualizarLinea();
            }
            //si he puesto fecha de finalización, finalizamos todo el parte completo
            if(parte.fecha_finalizacion!==datos.fecha_finalizacion){
                handleFinalizar();
            }
            setParte(res.data); 
            updateParte();   
        })
        .catch(err => { 
            setShowError(true);
            console.log(err);})

    }

    const abrirAddLinea =() =>{
        setShowLinea(true);
    }

    const cerrarAddLinea =() =>{ 
        setShowLinea(false);
    }

    const cerrarAddLineaPartes =() =>{
        setShowListLineasTareas(false);
    }

    const listarLineasTareas = (tarea)=>{
        setListLineasTareas(tarea);
        setShowListLineasTareas(true);
    }

    const handleCloseError = () => setShowError(false);

    const BorrarLinea =(linea) =>{ 
        axios.get(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_partes/?tarea=${linea.id}`,{
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

    const handleDisabled = () => {
        return (user['tec-user'].perfil.puesto.nombre==='Mantenimiento')
    }

    const handleDisabledMantenimiento = () => {
        return (user['tec-user'].perfil.puesto.nombre==='Mantenimiento')
    }

    return(
        <Container className='mt-5'>
            <Row className="justify-content-center"> 
                {parte.id ?
                    <h5 className="pb-3 pt-1 mt-2">Detalle del parte de trabajo</h5>:
                    <h5 className="pb-3 pt-1 mt-2">Nuevo Parte de trabajo</h5>}
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <h5 className="pb-3 pt-1 mt-2">Datos básicos:</h5>
                    <Form >
                        <Row>
                            <Col>
                                <Form.Group controlId="num_parte">
                                    <Form.Label>Numero Parte</Form.Label>
                                    <Form.Control type="text" 
                                                name='num_parte' 
                                                disabled
                                                value={datos.num_parte}/>
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group id="nombre">
                                    <Form.Label>Nombre(*)</Form.Label>
                                    <Form.Control type="text" 
                                                name='nombre' 
                                                value={datos.nombre}
                                                onChange={handleInputChange} 
                                                placeholder="Nombre"
                                                autoFocus
                                    />
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="creado_nombre">
                                    <Form.Label>Creado por (*)</Form.Label>
                                    <Form.Control   type="text" 
                                                    name='creado_nombre' 
                                                    disabled
                                                    value={datos.creado_por.get_full_name}/>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="estado">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Control as="select"  
                                                name='estado' 
                                                value={datos.estado}
                                                onChange={handleInputChange}
                                                disabled='true'
                                                placeholder="Estado">
                                                    <option key={0} value={''}>Todos</option>
                                                    {estados && estados.map( estado => {
                                                    return (
                                                    <option key={estado.id} value={estado.id}>
                                                        {estado.nombre}
                                                    </option>
                                                    )
                                                })}                                                
                                    </Form.Control>
                                </Form.Group>
                            </Col>           
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="tipo">
                                    <Form.Label>Tipo Mantenimiento (*)</Form.Label>
                                    <Form.Control as="select"  
                                                name='tipo' 
                                                value={datos.tipo}
                                                onChange={handleInputChange}
                                                placeholder="Tipo Mantenimiento"
                                                /* disabled={handleDisabled()} */> 
                                                {datos.id===null? <option key={0} value={''}>Seleccionar</option>: ''}                                                   
                                                {tipoparte && tipoparte.map( tipo => {
                                                    return (
                                                    <option key={tipo.id} value={tipo.id}>
                                                        {tipo.nombre}
                                                    </option>
                                                    )
                                                })}
                                    </Form.Control>
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="fecha_creacion">
                                    <Form.Label>Fecha Creación (*)</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_creacion' 
                                                value={datos.fecha_creacion}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha creación" />
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="fecha_prevista_inicio">
                                    <Form.Label>Fecha Prevista Inicio</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_prevista_inicio' 
                                                value={datos.fecha_prevista_inicio}
                                                onChange={handleInputChangeF} 
                                                placeholder="Fecha prevista inicio" />
                                </Form.Group>
                            </Col>                         
                            <Col>
                                <Form.Group controlId="fecha_finalizacion">
                                    <Form.Label>Fecha Finalización</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_finalizacion' 
                                                value={datos.fecha_finalizacion}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha Finalización" 
                                                disabled = {handleDisabledMantenimiento()}
                                                /* disabled={true} *//>
                                </Form.Group>
                            </Col>             
                        </Row>                          
                        <Row>                            
                            <Col>
                                <Form.Group controlId="empresa">
                                    <Form.Label>Empresa (*)</Form.Label>
                                    <Form.Control as="select"  
                                                name='empresa' 
                                                value={datos.empresa}
                                                onChange={handleInputChangeEmpresa}
                                                placeholder="Empresa"
                                                disabled={parte.id ? true : handleDisabled2()}>                                               
                                                {empresas && empresas.map( empresa => {
                                                    return (
                                                    <option key={empresa.id} value={empresa.id}>
                                                        {empresa.nombre}
                                                    </option>
                                                    )
                                                })}
                                </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="zona">
                                    <Form.Label>Zona (*)</Form.Label>
                                    <Form.Control   as="select" 
                                                    value={datos.zona}
                                                    name='zona'
                                                    onChange={handleInputChangeZona}> 
                                                    <option key={0} value={''}>Seleccionar</option>                                      
                                                    {zonas && zonas.map( zona => {
                                                        return (
                                                        <option key={zona.id} value={zona.id}>
                                                            {zona.siglas}
                                                        </option>
                                                        )
                                                    })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="seccion">
                                    <Form.Label>Seccion (*)</Form.Label>
                                    <Form.Control   as="select" 
                                                    value={datos.seccion}
                                                    name='seccion'
                                                    onChange={handleInputChangeSeccion}>  
                                                    <option key={0} value={''}>Seleccionar</option>                                      
                                                    {secciones && secciones.map( seccion => {
                                                        return (
                                                        <option key={seccion.id} value={seccion.id}>
                                                            {seccion.nombre}
                                                        </option>
                                                        )
                                                    })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="equipo">
                                    <Form.Label>Equipo </Form.Label>
                                    <Form.Control   as="select" 
                                                    value={datos.equipo}
                                                    name='equipo'
                                                    onChange={handleInputChange}>  
                                                    {/* {datos.equipo===''?  <option key={0} value={''}>Seleccionar</option>:''}                                    */}
                                                    <option key={0} value={''}>Seleccionar</option>   
                                                    {equipos && equipos.map( equipo => {
                                                        return (
                                                        <option key={equipo.id} value={equipo.id}>
                                                            {equipo.nombre}
                                                        </option>
                                                        )
                                                    })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>                                               
                            <Col>
                                <Form.Group id="observaciones">
                                    <Form.Label>Observaciones</Form.Label>
                                    <Form.Control type="text" 
                                                name='observaciones' 
                                                value={datos.observaciones}
                                                onChange={handleInputChange} 
                                                placeholder="Observaciones"
                                    />
                                </Form.Group>
                            </Col>                            
                        </Row> 
                        <Row>
                        {parte.tipo===2?
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Check type="checkbox" 
                                                label="Finalizar"
                                                checked = {datos.finalizar}
                                                onChange = {handleFinalizar} 
                                                disabled = {parte.estado===3?true:false}/>
                                </Form.Group>
                            </Col>
                        :null}
                        </Row>  
                        {/* {soyTecnico.length!==0?*/}
                        {op?
                        <Form.Row className="justify-content-center">
                            {parte.id? 
                                <Button variant="info" type="submit" className={'mx-2'} onClick={actualizarDatos}>Actualizar</Button> :
                                <Button variant="info" type="submit" className={'mx-2'} onClick={crearParte}>Guardar</Button>
                            }
                            <Button variant="info" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
                        </Form.Row>
                        :<Button variant="info" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>}
                    </Form>
                </Col>
            </Row>
            {parte.id ? 
                <React.Fragment>
                    <Form.Row>
                        <Col>
                            <Row>
                                <Col>
                                <h5 className="pb-3 pt-1 mt-2">Tareas del Parte:</h5>
                                </Col>
                                {/* {soyTecnico.length!==0?   */}
                                {op?
                                    <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                            <PlusCircle className="plus mr-2" size={30} onClick={abrirAddLinea}/>
                                    </Col>
                                :null}
                            </Row>
                            <Table bordered hover>
                                <thead>
                                    <tr>
                                        <th>Prioridad</th>
                                        <th>Nombre</th>
                                        <th>Especialidad</th>
                                        <th>Observaciones</th>
                                        {datos.tipo===1? <th>Tipo Periodo</th>:null}
                                        {datos.tipo===1?<th>Cantidad Periodos</th>:null}
                                        {(user['tec-user'].perfil.puesto.nombre !=='Operario')? 
                                        <th>Acciones</th>
                                        :null}
                                    </tr>
                                </thead>                                                                             
                                <tbody>
                                    {lineas && lineas.map( linea => {
                                        return (
                                            <tr key={linea.tarea.id} class={ linea.fecha_fin?"table-success":linea.fecha_inicio?"table-info":"" }/* class = {linea.fecha_inicio?"table-danger":" " } */>
                                                <td>{linea.tarea.prioridad}</td>
                                                <td>{linea.tarea.nombre}</td>
                                                <td>{linea.tarea.especialidad_nombre}</td>
                                                <td>{linea.tarea.observaciones}</td>
                                                {datos.tipo===1 && linea.tarea.tipo_periodo? 
                                                    <td>{linea.tarea.tipo_periodo.nombre}</td>:''}
                                                {datos.tipo===1?<td>{linea.tarea.periodo}</td>:''}
                                                {(user['tec-user'].perfil.puesto.nombre !=='Operario')? 
                                                    <td>                                            
                                                        <Receipt className="mr-3 pencil" onClick={event =>{listarLineasTareas(linea.tarea)}}/>
                                                        <Link to={`/mantenimiento/linea_tarea/${linea.id}`}><PencilFill className="mr-3 pencil"/></Link> 
                                                        <Trash className="mr-3 pencil"  onClick={event =>{BorrarLinea(linea.tarea)}} />
                                                    </td>
                                                :null}
                                            </tr>
                                        )})
                                    }
                                </tbody>
                            </Table>                                     
                        </Col>
                    </Form.Row>                                                
                </React.Fragment> 
            : null} 
            <LineaTareaNueva     show={show_linea}
                                handleCloseLinea ={cerrarAddLinea}
                                tareaAsignadas={parte.tarea}
                                parte={parte}
                                updateParte = {updateParte}
            />
            <LineasPartesMov    show={show_listlineastareas}
                                handleCloseList ={cerrarAddLineaPartes}
                                tarea={lineaLineasTareas}
                                parte={parte}
            />
            <Modal show={show_error} onHide={handleCloseError} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>Error al guardar formulario. Revise que todos los campos con asterisco esten cumplimentados</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseError}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}
export default ParteForm;