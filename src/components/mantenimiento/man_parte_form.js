import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Modal, Alert } from 'react-bootstrap';
import { Trash, PlusCircle, Receipt, PencilFill } from 'react-bootstrap-icons';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import LineaTareaNueva from './man_parte_lineatarea';
import LineasPartesMov from './man_parte_lineas_mov';
import { line } from 'd3';

const ParteForm = ({parte, setParte, op}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [tipoparte, setTipoParte] = useState(null);
    const [empresas, setEmpresas] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [zonas, setZonas] = useState(null);
    const [equipos, setEquipos] = useState(null);
    const [hoy] = useState(new Date());
    const [show_linea, setShowLinea] = useState(false);
    const [show_error, setShowError] = useState(false);
    const [show_listlineastareas, setShowListLineasTareas] = useState(false);
    const [lineaLineasTareas, setListLineasTareas] = useState(null);
    const [, setCambioFecha] = useState(false);
    const [estados, setEstados] = useState(null);
    const [, setActualizar] = useState('');
    const [lineas, setLineas] = useState(null);
    const soyTecnico = user['tec-user'].perfil.destrezas.filter(s => s === 6);
    const nosoyTecnico = user['tec-user'].perfil.puesto.nombre==='Operador'||user['tec-user'].perfil.puesto.nombre==='Mantenimiento'?true:false;
    const [consumibles, setConsumibles] = useState([]);
    const [eliminar_consumible, setEliminarConsumible] = useState(false);
    const [errores, setErrores] = useState({}); // Estado para guardar errores
    const [linea_GastoEditar, setLineaGastoEditar] = useState(null);
    const [show_modal_consumible, setShowModalConsumible] = useState(false);
    const [consumibleEditar, setConsumibleEditar] = useState(null);
    const [datosConsumible, setDatosConsumible] = useState({
        precio: 0,
        descuento: 0
    });

    const calcularTotalConsumibles = () => {
        if (!consumibles || consumibles.length === 0) return 0;
        
        return consumibles.reduce((total, consumible) => {
            const precio = consumible.linea_salida.precio_ultima_compra || 0;
            const descuento = consumible.linea_salida.descuento_ultima_compra || 0;
            const cantidad = consumible.linea_salida.cantidad || 0;
            
            const subtotal = cantidad * precio;
            const descuentoAplicado = subtotal * (descuento / 100);
            const totalLinea = subtotal - descuentoAplicado;
            
            return total + totalLinea;
        }, 0);
    };

    const calcularTotalGastos = () => {
        if (!linea_GastoEditar || linea_GastoEditar.length === 0) return 0;
        
        return linea_GastoEditar.reduce((total, lineaGasto) => {
            return total + (parseFloat(lineaGasto.total) || 0);
        }, 0);
    };

    const totalConsumibles = calcularTotalConsumibles();
    const totalGastos = calcularTotalGastos();
    const totalGeneral = totalConsumibles + totalGastos;

    const [datos, setDatos] = useState({
        id: parte.id ? parte.id : null,
        nombre: parte?parte.nombre:null,
        tipo: parte?parte.tipo:null,
        creado_por: parte.creado_por,
        finalizado: parte? parte.finalizado : false,
        observaciones: parte.observaciones? parte.observaciones : '',
        fecha_creacion: parte.id ? parte.fecha_creacion :(hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
        fecha_prevista_inicio: parte.id? parte.fecha_prevista_inicio :(hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
        fecha_finalizacion: parte? parte.fecha_finalizacion : '',
        empresa: parte?parte.empresa:null,
        zona: parte? parte.zona : '',
        seccion: parte.id? parte.seccion.id : '',
        equipo: parte.equipo? parte.equipo.id: '',
        tarea: parte?parte.tarea:null,
        estado: parte?parte.estado:null,
        num_parte: parte? parte.num_parte:null,
        tipo_periodo: parte.tipo===1 || parte.tipo===7? parte.tipo_periodo : '',
        periodo: parte.tipo===1 || parte.tipo===7? parte.periodo : 0,
        finalizar: parte.estado===3?true:false,
    });

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(()=>{
        setDatos({
            id: parte.id ? parte.id : null,
            nombre: parte?parte.nombre:null,
            tipo: parte?parte.tipo:null,
            creado_por: parte.creado_por,
            finalizado: parte? parte.finalizado : false,
            observaciones: parte.observaciones? parte.observaciones : '',
            fecha_creacion: parte.id ? parte.fecha_creacion :(hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
            fecha_prevista_inicio: parte.id? parte.fecha_prevista_inicio : (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
            fecha_finalizacion: parte? parte.fecha_finalizacion : '',
            empresa: parte?parte.empresa:null,
            zona: parte? parte.zona : '',
            seccion: parte.id? parte.seccion.id : '',
            equipo: parte.equipo? parte.equipo.id: '',
            tarea: parte?parte.tarea:null,
            estado: parte?parte.estado:null,
            num_parte: parte? parte.num_parte:null,
            tipo_periodo: parte.tipo===1 || parte.tipo===7? parte.tipo_periodo : '',
            periodo: parte.tipo===1 || parte.tipo===7? parte.periodo : 0,
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
            setTipoParte(res.data.sort(function(a, b){
                if(a.nombre > b.nombre){
                    return 1;
                }
                if(a.nombre < b.nombre){
                    return -1;
                }
                return 0;
            }));
        })
        .catch( err => {
            console.log(err); 
        })       
    }, [token]);

    useEffect(() => {
        parte && axios.get(BACKEND_SERVER + `/api/repuestos/movimiento_trazabilidad/?linea_salida__salida__num_parte=${parte.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setConsumibles(res.data);
            setEliminarConsumible(false);
        })
        .catch( err => {
            console.log(err); 
        })       
    }, [token, eliminar_consumible]);

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
            res.data.sort(function(a, b){ //ordenamos el listado para que en el unique, coja los ultimos registros
                if(a.id < b.id){
                    return 1;
                }
                if(a.id > b.id){
                    return -1;
                }
                return 0;
            })
            const unique = (value, index, self) => {
                return self.indexOf(value.tarea) === index.tarea
            }
            if(parte.tipo_nombre==="Preventivo" || parte.tipo_nombre==="Ins. per. reglamentaria"){
                let hash = {};
                var array = [''];
                const prueba = res.data.filter((r=> r.fecha_fin===null));
                array = res.data.filter(o => hash[o.tarea.id] ? false : hash[o.tarea.id] = true);
                if(array.length>prueba.length){
                    //cuando eliminamos el proceso preventivo de una tarea, deja de aparecer en las tareas pero si aparece en el parte
                    setLineas(array);
                }
                else{
                    //todas las tareas estas activas, por lo que solo muestra las lineas en juego.
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
    /* eslint-disable react-hooks/exhaustive-deps */

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
                if(parte.tipo_nombre==="Preventivo" || parte.tipo_nombre==="Ins. per. reglamentaria"){
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
        if(datos.tipo==='1'&& soyTecnico.length===0){
            alert('No tienes permisos para crear preventivos, contacte con el administrador');
            return;
        }
        if(datos.fecha_prevista_inicio===''){datos.fecha_prevista_inicio=null}
        if(datos.fecha_finalizacion===''){datos.fecha_finalizacion=null}
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
            setErrores({}); // Reiniciar errores si la petición es exitosa
        })
        .catch(err => { 
            if (err.response && err.response.data) {
                setErrores(err.response.data); // Guardar los errores del backend
            } else {
                console.log(err);
            }
            alert('Faltan datos, por favor, introduce todos los datos obligatorios.')
            console.log(err);
        })
    } 

    //actualiza el estado y la fecha de la linea si cambia la fecha_prevista_inicio del parte
    const actualizarLinea = () => { 
        var fecha=null;
        var estado='';
        if(parte.fecha_prevista_inicio===null && datos.fecha_prevista_inicio!==null){
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
                        
                    })
                    .catch(err => { console.log(err);})
                } 
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
            .catch( err => {
                console.log(err);
            });
        }
    }

    const actualizarDatos = (event) => {
        if(datos.tipo==='1'&& soyTecnico.length===0){
            alert('No tienes permisos para crear preventivos, contacte con el administrador');
            return;
        }
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
            if(res.data.results.length===1 && res.data.results[0].fecha_fin===null){
                var confirmacion = window.confirm('¿Deseas eliminar la línea?');
                if(confirmacion){
                    axios.delete(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_partes/${res.data.results[0].id}/`,{            
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        } 
                    })
                    .then(re =>{
                        axios.delete(BACKEND_SERVER + `/api/mantenimiento/tareas/${res.data.results[0].tarea.id}/`,{            
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            } 
                        })
                        .then(r =>{
                            alert('tarea eliminada');
                            setActualizar(linea);  
                            actualizarEstado();
                        })
                        .catch (err=>{console.log((err));});
                    })
                    .catch (err=>{console.log((err));});
                }
            }
            else{
                //Si la ultima linea tiene fecha fin, no se puede eliminar
                if(res.data.results[res.data.results.length-1].fecha_fin!==null){
                    alert('No se puede elimnar, trabajo ya ejecutado y terminado');
                }
                //en un preventivo, queremos detener el ciclo del trabajo.
                else{
                    var detenerTrabajo = window.confirm('No se puede eliminar, tiene trabajos finalizados. ¿Deseas detener el proceso?');
                    if(detenerTrabajo){
                        //eliminamos la linea que es la que ejecuta de nuevo la tarea'
                        axios.delete(BACKEND_SERVER + `/api/mantenimiento/listado_lineas_partes/${res.data.results[res.data.results.length-1].id}/`,{            
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

    const actualizarEstado = (event) => {
        axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_parte_trabajo/?parte=${parte.id}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }     
        })
        .then( res => { 
            const todosFinalizados = res.data.every(tarea => tarea.estado === 3);
            if(todosFinalizados){
                axios.patch(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo/${parte.id}/`, {
                    estado: 3,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }     
                })
                .then( res => { 
                    setParte(res.data); 
                    updateParte();   
                })
                .catch(err => { 
                    setShowError(true);
                    console.log(err);
                })
            }
        })
        .catch(err => { 
            console.log(err);
        })
        
    }

    const handleDisabledMantenimiento = () => {
        return (user['tec-user'].perfil.puesto.nombre==='Mantenimiento')
    }

    const handlerConsumibles = () => {
        // Guardar datos en sessionStorage para RepSalidas
        const dataToStore = {
            parte,
        };
        sessionStorage.setItem('datos_salida', JSON.stringify(dataToStore));
        window.location.href = `/repuestos/salidas/`;
    };

    const BorrarGasto = (lineaGasto) => {
        axios.delete(BACKEND_SERVER + `/api/mantenimiento/lineas_gastos/${lineaGasto.id}/`,{            
            headers: {
                'Authorization': `token ${token['tec-token']}`
            } 
        })
        .then(r =>{
            window.location.reload();
        })
        .catch (err=>{console.log((err));});
    };

    const BorrarConsumible = (consumible) => {
        var eliminar = window.confirm('Vas a eliminar un consumible ¿Deseas continuar?');
        if(eliminar){    
            axios.delete(BACKEND_SERVER + `/api/repuestos/lineas_salidas/${consumible.linea_salida.id}/`,{            
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                } 
            })
            .then(r =>{
                axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimos/?repuesto=${consumible.linea_salida.repuesto.id}&almacen=${consumible.almacen.id}`, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then(res => {      
                    let id_stock = res.data[0].id;
                    let stock_actual = Number(res.data[0].stock_act) + Number(consumible.linea_salida.cantidad);
                    axios.patch(BACKEND_SERVER + `/api/repuestos/stocks_minimos/${id_stock}/`, {
                        stock_act: stock_actual
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }
                    })
                    .then(rs => {
                        setEliminarConsumible(true);
                        window.location.reload();
                    })
                    .catch(err => { 
                        console.log(err);
                    }); 
                })   
            })
            .catch (err=>{console.log((err));});
        }
    };

    const ModificarConsumible = (consumible) => {
        setConsumibleEditar(consumible);
        setDatosConsumible({
            precio: consumible.linea_salida.precio_ultima_compra || 0,
            descuento: consumible.linea_salida.descuento_ultima_compra || 0
        });
        setShowModalConsumible(true);
    }

    const cerrarModalConsumible = () => {
        setShowModalConsumible(false);
        setConsumibleEditar(null);
        setDatosConsumible({ precio: 0, descuento: 0 });
    };

    const handleInputChangeConsumible = (event) => {
        setDatosConsumible({
            ...datosConsumible,
            [event.target.name]: event.target.value
        });
    };

    const guardarCambiosConsumible = () => {
        if (!consumibleEditar) return;

        axios.patch(BACKEND_SERVER + `/api/repuestos/lineas_salidas/${consumibleEditar.linea_salida.id}/`, {
            precio_ultima_compra: parseFloat(datosConsumible.precio),
            descuento_ultima_compra: parseFloat(datosConsumible.descuento)
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then(res => {
            alert('Consumible actualizado correctamente');
            cerrarModalConsumible();
            // Volver a cargar los consumibles
            axios.get(BACKEND_SERVER + `/api/repuestos/movimiento_trazabilidad/?linea_salida__salida__num_parte=${parte.id}`, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then(res => {
                setConsumibles(res.data);
            })
            .catch(err => {
                console.log(err);
            });
        })
        .catch(err => {
            console.log(err);
            alert('Error al actualizar el consumible');
        });
    };

    useEffect(()=>{
        parte && axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_gastos/?parte=${parte.id}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => { 
            setLineaGastoEditar(res.data);
        })
        .catch(err => { console.log(err);})
    },[token]);

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
                                <Form.Group id="nombre">
                                    <Form.Label>Nombre(*)</Form.Label>
                                    <Form.Control as="textarea" rows={1}
                                                name='nombre' 
                                                value={datos.nombre}
                                                onChange={handleInputChange} 
                                                placeholder="Nombre"
                                                disabled={nosoyTecnico? true: false}
                                                autoFocus
                                                className={`form-control ${errores.nombre ? 'border-red' : ''}`}
                                    />
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
                                                disabled={nosoyTecnico? true: false}
                                                className={`form-control ${errores.tipo ? 'border-red' : ''}`}> 
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
                                                placeholder="Fecha creación" 
                                                disabled={nosoyTecnico? true: false}
                                                className={`form-control ${errores.fecha_creacion ? 'border-red' : ''}`}/>
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="fecha_prevista_inicio">
                                    <Form.Label>Fecha Prevista Inicio</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_prevista_inicio' 
                                                value={datos.fecha_prevista_inicio}
                                                onChange={handleInputChangeF} 
                                                placeholder="Fecha prevista inicio" 
                                                disabled={nosoyTecnico? true: false}/>
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
                                                    onChange={handleInputChangeZona}
                                                    disabled={nosoyTecnico? true: false}
                                                    className={`form-control ${errores.zona ? 'border-red' : ''}`}> 
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
                                                    onChange={handleInputChangeSeccion}
                                                    disabled={nosoyTecnico? true: false}
                                                    className={`form-control ${errores.seccion ? 'border-red' : ''}`}>  
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
                                                    onChange={handleInputChange}
                                                    disabled={nosoyTecnico? true: false}>  
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
                                                disabled={nosoyTecnico? true: false}
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
                            <Button variant="info" className={'mx-2'} onClick={() => window.close()}>Cerrar</Button>
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
                                <h5 className="pb-3 pt-1 mt-2">Tareas del Parte: </h5>
                                <h5 style={{ color: 'green' }}>Tarea Finalizada</h5>
                                <h5 style={{ color: 'blue' }}>Tarea Iniciada</h5>
                                </Col>
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
                                        <th>Observaciones Técnico</th>
                                        {datos.tipo===1 || datos.tipo===7?<th>Frecuencia</th>:null}
                                        {datos.tipo===1 || datos.tipo===7? <th>Periodo/s</th>:null}
                                        {(user['tec-user'].perfil.puesto.nombre !=='Operario')? 
                                        <th style={{width:125}}>Acciones</th>
                                        :null}
                                    </tr>
                                </thead>                                                                             
                                <tbody>
                                    {lineas && lineas.map( linea => {
                                        return (
                                            <tr key={linea.tarea.id} className={ linea.fecha_fin?"table-success":linea.fecha_inicio?"table-primary":"" }/* class = {linea.fecha_inicio?"table-danger":" " } */>
                                                <td>{linea.tarea.prioridad}</td>
                                                <td>{linea.tarea.nombre}</td>
                                                <td>{linea.tarea.especialidad_nombre}</td>
                                                <td>{linea.tarea.observaciones}</td>
                                                {datos.tipo===1 || datos.tipo===7? 
                                                    <td>{linea.tarea.periodo?linea.tarea.periodo:'0'}</td>:''}
                                                {datos.tipo===1 || datos.tipo===7? 
                                                    <td>{linea.tarea.tipo_periodo?linea.tarea.tipo_periodo.nombre:'0'}</td> : ''}
                                                <td>                                            
                                                    <Receipt className="mr-3 pencil" onClick={event =>{listarLineasTareas(linea.tarea)}}/>
                                                    <a href={`/mantenimiento/linea_tarea/${linea.id}`} target="_blank" rel="noopener noreferrer"><PencilFill className="mr-3 pencil"/></a>
                                                    {nosoyTecnico?'':<Trash className="mr-3 pencil"  onClick={event =>{BorrarLinea(linea.tarea)}} />}
                                                </td>
                                            </tr>
                                        )})
                                    }
                                </tbody>
                            </Table>                                     
                        </Col>
                    </Form.Row>                                                
                </React.Fragment> 
            : null} 
            <Modal.Footer>                    
                <Button variant="info" onClick={handlerConsumibles}> Add Gastos y/o Comentarios </Button> 
            </Modal.Footer>
            {parte.id && consumibles?.length>0? 
                <React.Fragment>
                    <Form.Row>
                        <h5 className="pb-3 pt-1 mt-2">Consumibles:</h5>
                    </Form.Row>
                    <Form.Row>
                        <Col>
                            <Table bordered hover>
                                <thead>
                                    <tr>
                                        <th>Responsable</th>
                                        <th>Descripción</th>
                                        <th>Almacén</th>
                                        <th>Cantidad</th>
                                        <th>Precio</th>
                                        <th>Dto.</th>
                                        <th>Total</th>
                                        {soyTecnico && <th style={{ width: "120px" }}>Acciones</th>}
                                    </tr>
                                </thead>                                                                             
                                <tbody>
                                    {consumibles && consumibles.map( consumible => {
                                        return (
                                            <tr key={consumible.id}>
                                                <td>{consumible.usuario.get_full_name}</td>
                                                <td>{consumible.linea_salida.repuesto.nombre}</td>
                                                <td>{consumible.almacen.nombre}</td>
                                                <td>{consumible.linea_salida.cantidad}</td>
                                                <td>{consumible.linea_salida.precio_ultima_compra? consumible.linea_salida.precio_ultima_compra + '€': 0.00+ '€'}</td>
                                                <td>{consumible.linea_salida.descuento_ultima_compra? consumible.linea_salida.descuento_ultima_compra + '%': 0.00+ '%'}</td>
                                                <td>{(consumible.linea_salida.cantidad * consumible.linea_salida.precio_ultima_compra)-(consumible.linea_salida.cantidad * consumible.linea_salida.precio_ultima_compra*consumible.linea_salida.descuento_ultima_compra/100).toFixed(2) + '€'}</td>
                                                <td>{soyTecnico?<PencilFill className="mr-3 pencil"  onClick={event =>{ModificarConsumible(consumible)}} />:''}
                                                    {soyTecnico?<Trash className="mr-3 pencil"  onClick={event =>{BorrarConsumible(consumible)}} />:''}
                                                </td>
                                            </tr>
                                        )})
                                    }
                                    <tr style={{ fontWeight: 'bold', backgroundColor: '#e9ecef' }}>
                                        <td colSpan={soyTecnico ? 6 : 6} style={{ textAlign: 'right' }}>
                                            Subtotal Consumibles:
                                        </td>
                                        <td>{totalConsumibles.toFixed(2)} €</td>
                                        {soyTecnico?<td></td>:''}
                                    </tr>
                                </tbody>
                            </Table>                                     
                        </Col>
                    </Form.Row>                                                
                </React.Fragment> 
            : null}
            {parte.id && linea_GastoEditar?.length>0? 
                <React.Fragment>
                    <Form.Row>
                        <h5 className="pb-3 pt-1 mt-2">Gastos:</h5>
                    </Form.Row>
                    <Form.Row>
                        <Col>
                            <Table bordered hover>
                                <thead>
                                    <tr>
                                        <th >Responsable</th>
                                        <th >Descripción</th>
                                        <th >Cantidad</th>
                                        <th >Precio</th>
                                        <th >Dto.</th>
                                        <th >Total</th>
                                        {soyTecnico && <th style={{ width: "120px" }}>Acciones</th>}
                                    </tr>
                                </thead> 
                                                                            
                                <tbody>                                            
                                    {linea_GastoEditar && linea_GastoEditar.map( lineaGastos => {
                                        return (
                                            <tr key={lineaGastos.id}>
                                                <td>{lineaGastos.creado_por?.get_full_name}</td>
                                                <td>{lineaGastos.descripcion}</td>
                                                <td>{lineaGastos.cantidad}</td>
                                                <td>{Number(lineaGastos.precio).toFixed(2) + '€'}</td>
                                                <td>{lineaGastos.descuento + '%'}</td>
                                                <td>{Number(lineaGastos.total).toFixed(2) + '€'}</td>
                                                {soyTecnico?<td>{<Trash className="mr-3 pencil"  onClick={event =>{BorrarGasto(lineaGastos)}} />}</td>:''}
                                            </tr>
                                        )})
                                    }
                                    <tr style={{ fontWeight: 'bold', backgroundColor: '#e9ecef' }}>
                                        <td colSpan={soyTecnico ? 5 : 5} style={{ textAlign: 'right' }}>
                                            Subtotal Gastos:
                                        </td>
                                        <td>{totalGastos.toFixed(2)} €</td>
                                        {soyTecnico && <td></td>}
                                    </tr>
                                </tbody>
                            </Table>                                     
                        </Col>
                    </Form.Row>                                                
                </React.Fragment> 
            : null}
            {parte.id && (consumibles.length > 0 || (linea_GastoEditar && linea_GastoEditar.length > 0))? 
                <Row className="justify-content-end mt-4 mb-5">
                    <Col xs={12} md={6} lg={4}>
                        <Table bordered style={{ backgroundColor: '#d4edda' }}>
                            <tbody>
                                <tr style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                                    <td style={{ textAlign: 'right', padding: '15px' }}>
                                        TOTAL GENERAL:
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '15px', fontSize: '1.2em' }}>
                                        {totalGeneral.toFixed(2)} €
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
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
            <Modal show={show_modal_consumible} onHide={cerrarModalConsumible}>
                <Modal.Header closeButton>
                    <Modal.Title>Modificar Precio Consumible</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {consumibleEditar && (
                        <Form>
                            <Form.Group>
                                <Form.Label><strong>Repuesto:</strong></Form.Label>
                                <Form.Control 
                                    type="text" 
                                    value={consumibleEditar.linea_salida.repuesto.nombre}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label><strong>Cantidad:</strong></Form.Label>
                                <Form.Control 
                                    type="text" 
                                    value={consumibleEditar.linea_salida.cantidad}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Precio (€) *</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    step="0.01"
                                    name="precio"
                                    value={datosConsumible.precio}
                                    onChange={handleInputChangeConsumible}
                                    placeholder="0.00"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Descuento (%) *</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    step="0.01"
                                    name="descuento"
                                    value={datosConsumible.descuento}
                                    onChange={handleInputChangeConsumible}
                                    placeholder="0.00"
                                />
                            </Form.Group>
                            <Alert variant="info" className="mt-3">
                                <strong>Total: </strong>
                                {(
                                    (datosConsumible.precio * consumibleEditar.linea_salida.cantidad) - 
                                    (datosConsumible.precio * consumibleEditar.linea_salida.cantidad * datosConsumible.descuento / 100)
                                ).toFixed(2)} €
                            </Alert>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cerrarModalConsumible}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={guardarCambiosConsumible}>
                        Guardar Cambios
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}
export default ParteForm;