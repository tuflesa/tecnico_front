import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { strToArrBuffer } from 'react-data-export/dist/ExcelPlugin/utils/DataUtil';

const LineaTareaForm = ({linea_tarea, setLineaTarea}) => {
    const [token] = useCookies(['tec-token']);
    const [estados, setEstados] = useState(null);
    const [tipo_periodos, setTipoPeriodo] = useState(null);
    const [user] = useCookies(['tec-user']);
    const [hoy] = useState(new Date);
    const nosoyTecnico = user['tec-user'].perfil.puesto.nombre==='Operador'||user['tec-user'].perfil.puesto.nombre==='Mantenimiento'?true:false;

    const [datos, setDatos] = useState({
        id: linea_tarea.id,
        nombre: linea_tarea.tarea.nombre,
        especialidad: linea_tarea.tarea.especialidad_nombre,
        prioridad: linea_tarea.tarea.prioridad,
        observaciones: linea_tarea.tarea.observaciones,
        observaciones_trab: linea_tarea.tarea.observaciones_trab,
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
    
    const actualizaTarea = () => { //actualiza datos en la tarea que cuelga del parte
        axios.patch(BACKEND_SERVER + `/api/mantenimiento/tarea_nueva/${linea_tarea.tarea.id}/`, {
            nombre: datos.nombre,
            prioridad: datos.prioridad,
            observaciones: datos.observaciones,
            observaciones_trab: datos.observaciones_trab,
            tipo_periodo: datos.tipo_periodo,
            periodo: datos.periodo,
            fecha_plan: datos.fecha_plan,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }     
        })
        .then( res => {  
            alert('Tarea actualizada');
        })
        .catch(err => { console.log(err);})
    }

    const actualizarLinea = () => { //actualiza la linea generada de la tarea
        axios.patch(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/${linea_tarea.id}/`, {
            fecha_inicio:datos.fecha_inicio,
            fecha_fin:datos.fecha_fin,
            fecha_plan:datos.fecha_plan,
            estado: datos.estado,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }     
        })
        .then( res => { 
            datos.nombre= '';
            datos.especialidad='';
            datos.prioridad='';
            datos.observaciones='';
            datos.observaciones_trab='';
            datos.fecha_plan=null;
            datos.fecha_inicio=null;
            datos.fecha_fin=null;
            datos.estado='';
        })
        .catch(err => { console.log(err);})
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

    const actualizarDatos = (event) => { //movimientos al pulsar el botón actualizar
        event.preventDefault();
        if(datos.fecha_plan===''){datos.fecha_plan=null;}
        if(datos.fecha_fin!==null){
            datos.estado=3;
            if(linea_tarea.parte.tipo_nombre==='Preventivo'){
                if(datos.fecha_inicio===null){
                    datos.fecha_inicio=(hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0'));
                }
                crearLineaNueva();
                actualizarLinea();
                return;
            }
            else{
                actualizarLinea();
                actualizaTarea();
                return;
            }
        }
        else if(datos.fecha_inicio!==null){datos.estado=2;}
        else if(datos.fecha_plan!==null){datos.estado=1;}
        else if(datos.fecha_plan===null){datos.estado=4;}
        actualizarLinea();
        actualizaTarea();
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
                                                disabled={nosoyTecnico? + true: + false}
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
                            <Col>
                                <Form.Group id="especialidad">
                                    <Form.Label>Especialidad</Form.Label>
                                    <Form.Control type="text" 
                                                name='especialidad' 
                                                value={datos.especialidad}
                                                disabled='true'
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
                                                disabled={nosoyTecnico? + true: + false}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {linea_tarea.parte.tipo===1? //si es un preventivo
                                    <Form.Group id="tipo_periodo">
                                        <Form.Label>Tipo Periodo</Form.Label>
                                        <Form.Control as="select"  
                                                    name='tipo_periodo' 
                                                    value={datos.tipo_periodo}
                                                    onChange={handleInputChange}
                                                    placeholder="Tipo Periodo"
                                                    disabled={nosoyTecnico? + true: + false}>  
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
                            <Col>
                                {linea_tarea.parte.tipo===1? //si es un preventivo
                                    <Form.Group controlId="periodo">
                                        <Form.Label>Cantidad de Periodos</Form.Label>
                                        <Form.Control as="select" 
                                                        value={datos.periodo}
                                                        name='periodo'
                                                        onChange={handleInputChange}
                                                        disabled={nosoyTecnico? + true: + false}>
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
                                                disabled={nosoyTecnico? + true: linea_tarea.parte.fecha_prevista_inicio===null?+ true:+ false} />
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
                                                disabled='true' />
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="fecha_fin">
                                    <Form.Label>Fecha Fin</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_fin' 
                                                value={datos.fecha_fin}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha Fin"/>
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
                                    <Form.Label>Conclusiones Personal Mantenmiento</Form.Label>
                                    <Form.Control as="textarea" rows={3}
                                                name='observaciones_trab' 
                                                value={datos.observaciones_trab}
                                                onChange={handleInputChange} 
                                                placeholder="Conclusiones"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>                    
                        <Form.Row className="justify-content-center">
                                <Button variant="info" type="submit" className={'mx-2'} onClick={actualizarDatos}>Actualizar</Button>
                                <Button variant="info" className={'mx-2'} onClick={() => window.close()}>Cerrar</Button>
                                {/* <Button variant="info" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar</Button> */}
                        </Form.Row>
                    </Form>
                </Col>
            </Row>
        </Container>    
    )
}
export default LineaTareaForm;