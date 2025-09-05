import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';

const LineaTareaForm = ({linea_tarea, setLineaTarea}) => {
    const [token] = useCookies(['tec-token']);
    const [estados, setEstados] = useState(null);
    const [tipo_periodos, setTipoPeriodo] = useState(null);
    const [user] = useCookies(['tec-user']);
    const [hoy] = useState(new Date());
    const nosoyTecnico = user['tec-user'].perfil.puesto.nombre==='Operador'||user['tec-user'].perfil.puesto.nombre==='Mantenimiento'?true:false;

    const [datos, setDatos] = useState({
        id: linea_tarea.id,
        nombre: linea_tarea.tarea.nombre,
        especialidad: linea_tarea.tarea.especialidad_nombre,
        prioridad: linea_tarea.tarea.prioridad,
        observaciones: linea_tarea.tarea.observaciones,
        observaciones_trab: linea_tarea.observaciones_trab,
        fecha_plan: linea_tarea.fecha_plan,
        fecha_inicio: linea_tarea.fecha_inicio,
        fecha_fin: linea_tarea.fecha_fin,
        estado: linea_tarea.estado,
        periodo: linea_tarea.tarea.periodo?linea_tarea.tarea.periodo:0,
        tipo_periodo: linea_tarea.tarea.tipo_periodo?linea_tarea.tarea.tipo_periodo.id:'',
    });

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/mantenimiento/tipo_periodo/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setTipoPeriodo(res.data);
        })
        .catch( err => {
            console.log(err); 
        })       
    }, [token]);

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

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })  
    }
    
    const actualizaTarea = (datosActualizados) => {
        axios.patch(BACKEND_SERVER + `/api/mantenimiento/tarea_nueva/${linea_tarea.tarea.id}/`, {
            nombre: datosActualizados.nombre,
            prioridad: datosActualizados.prioridad,
            observaciones: datosActualizados.observaciones,
            tipo_periodo: datosActualizados.tipo_periodo,
            periodo: datosActualizados.periodo,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }     
        })
        .then(res => {
            alert('Tarea actualizada');
        })
        .catch(err => { console.log(err); })
    }    

    const actualizarLinea = (datosActualizados) => {
        axios.patch(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/${linea_tarea.id}/`, {
            fecha_inicio: datosActualizados.fecha_inicio,
            fecha_fin: datosActualizados.fecha_fin,
            fecha_plan: datosActualizados.fecha_plan,
            estado: datosActualizados.estado,
            observaciones_trab: datosActualizados.observaciones_trab,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }     
        })
        .then(res => {
            console.log("Línea actualizada");
        })
        .catch(err => { console.log(err); })
    }    

    const crearLineaNueva = () => { //si es un preventivo y le ponemos fecha de cierre, crea una nueva linea de la tarea
        var fechaString= null;
        var diaEnMilisegundos = 1000 * 60 * 60 * 24;
        var fecha=Date.parse(hoy);
        var fechaPorSemanas=null;
        var suma=null;
        suma = fecha + (diaEnMilisegundos * linea_tarea.tarea.periodo * linea_tarea.tarea.tipo_periodo.cantidad_dias);
        fechaPorSemanas = new Date(suma);
        fechaString = fechaPorSemanas.getFullYear() + '-' + ('0' + (fechaPorSemanas.getMonth()+1)).slice(-2) + '-' + ('0' + fechaPorSemanas.getDate()).slice(-2);
        
        fechaString && axios.post(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/`,{
            parte: linea_tarea.parte.id,
            tarea: linea_tarea.tarea.id,
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
    }

    const cerrarDatos = () => {
        if(datos.nombre!==linea_tarea.tarea.nombre || datos.prioridad!==linea_tarea.tarea.prioridad || datos.observaciones!==linea_tarea.tarea.observaciones || datos.observaciones_trab!==linea_tarea.observaciones_trab || datos.fecha_plan!==linea_tarea.fecha_plan || datos.fecha_fin!==linea_tarea.fecha_fin || datos.periodo!==linea_tarea.tarea.periodo || datos.tipo_periodo!==linea_tarea.tarea.tipo_periodo.id){
            var hay_modificado = window.confirm('No has actualizado los cambios ¿Deseas guardar los datos?');
            if(hay_modificado){
                const datosActualizados = {...datos};
                procesarDatos(datosActualizados);
                window.close();
            }
            else{
                window.close();
            }
        }
        else{
            window.close();
        }
    }

    const actualizarDatos = (event) => {
        event.preventDefault();
        const datosActualizados = {...datos};
        procesarDatos(datosActualizados);
        setLineaTarea(prev => ({
            ...prev,
            tarea: {
                ...prev.tarea,
                nombre: datosActualizados.nombre,
                prioridad: datosActualizados.prioridad,
                observaciones: datosActualizados.observaciones,
                periodo: datosActualizados.periodo,
                tipo_periodo: { id: datosActualizados.tipo_periodo }
            },
            observaciones_trab: datosActualizados.observaciones_trab,
            fecha_plan: datosActualizados.fecha_plan,
            fecha_fin: datosActualizados.fecha_fin,
            fecha_inicio: datosActualizados.fecha_inicio ?? prev.fecha_inicio
        }));

    }

    const procesarDatos = (datosActualizados) => {
        // Crea una copia del objeto datos para no modificar el original directamente
        // const datosActualizados = {...datos};
        // Solo establecer fecha_plan a null si realmente está vacío y antes tenía un valor
        if(datosActualizados.fecha_plan === ''){
            datosActualizados.fecha_plan = null;
        }
        // Actualiza el estado según las fechas
        if(datosActualizados.fecha_fin !== null){
            datosActualizados.estado = 3;
            if(linea_tarea.parte.tipo_nombre === 'Preventivo'){
                // Si no hay fecha de inicio, establecerla a hoy
                if(datosActualizados.fecha_inicio === null){
                    datosActualizados.fecha_inicio = (hoy.getFullYear() + '-' + 
                        String(hoy.getMonth()+1).padStart(2,'0') + '-' + 
                        String(hoy.getDate()).padStart(2,'0'));
                }
                crearLineaNueva();
                actualizarLinea(datosActualizados);
                return;
            } else {
                actualizarLinea(datosActualizados);
                actualizaTarea(datosActualizados);
                return;
            }
        } else if(datosActualizados.fecha_inicio !== null){
            datosActualizados.estado = 2;
        } else if(datosActualizados.fecha_plan !== null){
            datosActualizados.estado = 1;
        } else if(datosActualizados.fecha_plan === null){
            datosActualizados.estado = 4;
        }
        actualizarLinea(datosActualizados);
        actualizaTarea(datosActualizados);
    }

    const handleDisabledObservaciones = () => { //inhabilitar observaciones si no eres técnico
        return (user['tec-user'].perfil.puesto.nombre!=='Director Técnico')
    }

    return (
        <Container className='pt-1 mt-5'>
            <h5 className='pt-1 mt-2'>Parte: {linea_tarea.parte.nombre}</h5>
            <Row className="justify-content-center">
                    <h5 className="pb-3 pt-1 mt-2">Detalle de la tarea</h5>
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <Form >
                        <Row>
                            <Col>
                                <Form.Group id="prioridad">
                                    <Form.Label>Prioridad</Form.Label>
                                    <Form.Control type="text" 
                                                name='prioridad' 
                                                value={datos.prioridad}
                                                onChange={handleInputChange} 
                                                placeholder="Prioridad"
                                                disabled={nosoyTecnico? true: false}
                                                autoFocus
                                    />
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="estado">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Control as="select"  
                                                name='estado' 
                                                value={datos.estado}
                                                onChange={handleInputChange}
                                                disabled
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
                            <Col>
                                <Form.Group id="especialidad">
                                    <Form.Label>Especialidad</Form.Label>
                                    <Form.Control type="text" 
                                                name='especialidad' 
                                                value={datos.especialidad}
                                                disabled
                                    />
                                </Form.Group>
                            </Col>                                          
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group id="nombre">
                                    <Form.Label>Nombre</Form.Label>
                                    <Form.Control as="textarea" rows={1}
                                                name='nombre' 
                                                value={datos.nombre}
                                                onChange={handleInputChange} 
                                                placeholder="Nombre"
                                                disabled={nosoyTecnico? true: false}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {linea_tarea.parte.tipo===1 || linea_tarea.parte.tipo===7? //si es un preventivo
                                    <Form.Group controlId="periodo">
                                        <Form.Label>Frecuencia</Form.Label>
                                        <Form.Control as="select" 
                                                        value={datos.periodo}
                                                        name='periodo'
                                                        onChange={handleInputChange}
                                                        disabled={nosoyTecnico? true: false}>
                                                        {datos.periodo===0?  <option key={0} value={''}>Seleccionar</option>:''}
                                                        <option key={1} value={1}>1</option>
                                                        <option key={2} value={2}>2</option>
                                                        <option key={3} value={3}>3</option>
                                                        <option key={4} value={4}>4</option>
                                                        <option key={5} value={5}>5</option>
                                                        <option key={6} value={6}>6</option>
                                                        <option key={7} value={7}>7</option>
                                                        <option key={8} value={8}>8</option>
                                                        <option key={9} value={9}>9</option>
                                                        <option key={10} value={10}>10</option>
                                                        <option key={11} value={10}>11</option>                                        
                                        </Form.Control>
                                    </Form.Group>
                                : null}
                            </Col>
                            <Col>
                                {linea_tarea.parte.tipo===1 || linea_tarea.parte.tipo===7? //si es un preventivo
                                    <Form.Group id="tipo_periodo">
                                        <Form.Label>Periodo/s</Form.Label>
                                        <Form.Control as="select"  
                                                    name='tipo_periodo' 
                                                    value={datos.tipo_periodo}
                                                    onChange={handleInputChange}
                                                    placeholder="Tipo Periodo"
                                                    disabled={nosoyTecnico? true: false}>  
                                                    {datos.tipo_periodo===''?  <option key={0} value={''}>Seleccionar</option>:''}   
                                                    {/* {linea_tarea.tipo_periodo===null?  <option key={0} value={''}>Seleccionar</option>:''}                                                */}
                                                    {tipo_periodos && tipo_periodos.map( periodo => {
                                                        return (
                                                        <option key={periodo.id} value={periodo.id}>
                                                            {periodo.nombre}
                                                        </option>
                                                        )
                                                    })}
                                        </Form.Control>
                                    </Form.Group>
                                : null}
                            </Col>
                        </Row> 
                        <Row>
                            <Col>
                                <Form.Group controlId="fecha_plan">
                                    <Form.Label>Fecha Plan{linea_tarea.parte.fecha_prevista_inicio===null?' (Parte pendiente)':''}</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_plan' 
                                                value={datos.fecha_plan}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha Plan"
                                                disabled={nosoyTecnico || linea_tarea.parte.fecha_prevista_inicio===null} />
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="fecha_inicio">
                                    <Form.Label>Fecha Inicio</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_inicio' 
                                                value={datos.fecha_inicio}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha Inicio"
                                                disabled />
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="fecha_fin">
                                    <Form.Label>Fecha Fin</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_fin' 
                                                value={datos.fecha_fin}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha Fin"
                                                disabled/>
                                </Form.Group>
                            </Col> 
                        </Row>                                    
                        <Row>                            
                            <Col>
                                <Form.Group id="observaciones">
                                    <Form.Label>Observaciones Técnico</Form.Label>
                                    <Form.Control as="textarea" rows={3}
                                                name='observaciones' 
                                                value={datos.observaciones}
                                                onChange={handleInputChange} 
                                                placeholder="Observaciones"
                                                disabled={handleDisabledObservaciones()}
                                    />
                                </Form.Group>
                            </Col>
                        </Row> 
                        <Row>                            
                            <Col>
                                <Form.Group id="observaciones_trab">
                                    <Form.Label>Conclusiones Personal Mantenimiento</Form.Label>
                                    <Form.Control as="textarea" rows={4}
                                                name='observaciones_trab' 
                                                value={datos.observaciones_trab}
                                                onChange={handleInputChange} 
                                                placeholder="Conclusiones"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>                    
                        <Form.Row className="justify-content-center">
                            <Button variant="info" type="button" className={'mx-2'} onClick={actualizarDatos}>Actualizar</Button>
                            {/* <Button variant="info" className={'mx-2'} onClick={() => window.close()}>Cerrar</Button> */}
                            <Button variant="info" className={'mx-2'} onClick={cerrarDatos}>Cerrar</Button>
                        </Form.Row>
                    </Form>
                </Col>
            </Row>
        </Container>    
    )
}
export default LineaTareaForm;