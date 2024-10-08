import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const LineaTareaNueva = ({show, handleCloseLinea, tareaAsignadas, parte, updateParte}) => {
    
    const [token] = useCookies(['tec-token']);
    const [especialidades, setEspecialidades] = useState(null);
    const [listaAsignadas, setListaAsignadas] = useState([]);
    const [tipo_periodo, setTipoPeriodo] = useState(null);
    
    const [datos, setDatos] = useState({  
        id: null,
        nombre: '',
        especialidad: '',
        prioridad: '',
        observaciones: '',
        fecha_plan: null,
        estado: parte.fecha_prevista_inicio?1:4,
        tipo_periodo: parte.tipo_periodo,
        periodo: parte.periodo,
        //estado: '',
    }); 

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/mantenimiento/especialidades/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEspecialidades(res.data.sort(function(a, b){
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
        })       
    }, [token]);

    useEffect(()=>{
        let TareasAsignadasID = [];
        tareaAsignadas && tareaAsignadas.forEach(p => {
            TareasAsignadasID.push(p.id);
        });
        setListaAsignadas(TareasAsignadasID);
    },[tareaAsignadas]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/mantenimiento/tipo_periodo/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setTipoPeriodo(res.data.sort(function(a, b){
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

    const handlerCancelar = () => {      
        handleCloseLinea();
    }    

    const handlerGuardar = () => {
        axios.post(BACKEND_SERVER + `/api/mantenimiento/tarea_nueva/`,{
            nombre: datos.nombre,
            especialidad: datos.especialidad,
            prioridad: datos.prioridad,
            observaciones: datos.observaciones,
            tipo_periodo: datos.tipo_periodo,
            periodo: datos.periodo,
        },
        {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            datos.nombre='';
            datos.especialidad='';
            datos.prioridad='';
            datos.observaciones='';
            datos.tipo_periodo='';
            datos.periodo=0;
            const newTareaParte = [...listaAsignadas, parseInt(res.data.id)];
            axios.post(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/`,{
                parte: parte.id,
                tarea: res.data.id,
                fecha_inicio:null,
                fecha_fin:null,
                fecha_plan: datos.fecha_plan?datos.fecha_plan: parte.fecha_prevista_inicio,
                finalizada: false,
                estado: parte.fecha_prevista_inicio?1:4,
            },
            {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( r => {
                var estado=null;
                if(parte.estado===3){
                    estado=1;
                }
                else{
                    estado=parte.estado;
                }
                axios.patch(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo/${parte.id}/`,{
                    tarea: newTareaParte,
                    fecha_finalizacion: null,
                    estado: estado,
                },
                {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then( re => {
                    updateParte();
                    handlerCancelar(); 
                    datos.nombre='';
                    datos.especialidad='';
                    datos.prioridad='';
                    datos.observaciones='';
                    datos.fecha_plan=null;
                })
                .catch( err => {
                    console.log(err);            
                    handlerCancelar();
                });
            })
            .catch( err => {
                console.log(err);            
                handlerCancelar();
            });
            
        })
        .catch( err => {
            console.log(err);            
            handlerCancelar();
        });              
    }
    
    return (        
        <Modal show={show} backdrop="static" keyboard={ false } animation={false}>            
            <Modal.Header closeButton>  
                <h5>Nueva Tarea </h5>
            </Modal.Header>
            <Modal.Body>
                <Form >
                    <Row>
                        <Col>
                            <Form.Group id="nombre">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control type="text" 
                                            name='nombre' 
                                            value={datos.nombre}
                                            onChange={handleInputChange} 
                                            placeholder="Nombre"
                                            autoFocus
                                />
                            </Form.Group>
                        </Col>
                    </Row> 
                    <Row>
                        <Col>
                            <Form.Group id="especialidades">
                                <Form.Label>Especialidades</Form.Label>
                                    <Form.Control   as="select"  
                                                    name='especialidad' 
                                                    value={datos.especialidad}
                                                    onChange={handleInputChange}
                                                    placeholder="Especialidad">
                                                    <option key={0} value={''}>Seleccionar</option>
                                                    {especialidades && especialidades.map( especialidad => {
                                                        return (
                                                        <option key={especialidad.id} value={especialidad.id}>
                                                            {especialidad.nombre}
                                                        </option>
                                                        )
                                                    })}
                                    </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row> 
                    <Row>
                        <Col>
                            <Form.Group id="prioridad">
                                <Form.Label>Prioridad</Form.Label>
                                <Form.Control type="text" 
                                            name='prioridad' 
                                            value={datos.prioridad}
                                            onChange={handleInputChange} 
                                            placeholder="Prioridad"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        {parte.tipo===1 || parte.tipo===7?  
                            <Col>
                                <Form.Group controlId="periodo">
                                    <Form.Label>Frecuencia</Form.Label>
                                    <Form.Control as="select" 
                                                    value={datos.periodo}
                                                    name='periodo'
                                                    onChange={handleInputChange}
                                                    //disabled={handleDisabled()}
                                                    >
                                                    {/* {datos.periodo===0?  <option key={0} value={''}>Seleccionar</option>:''} */}
                                                    <option key={0} value={''}>Seleccionar</option>
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
                            </Col>
                        : null}
                    </Row> 
                    <Row>
                        {parte.tipo===1 || parte.tipo===7?
                            <Col>
                                <Form.Group id="tipo_periodo">
                                    <Form.Label>Periodo/s</Form.Label>
                                    <Form.Control as="select"  
                                                name='tipo_periodo' 
                                                value={datos.tipo_periodo}
                                                onChange={handleInputChange}
                                                placeholder="Tipo Periodo"
                                                //disabled={handleDisabled()}
                                                >  
                                                {/* {datos.tipo_periodo===null?  <option key={0} value={''}>Seleccionar</option>:''}   
                                                {parte.tipo_periodo===null?  <option key={0} value={''}>Seleccionar</option>:''}     */}    
                                                <option key={0} value={''}>Seleccionar</option>                                       
                                                {tipo_periodo && tipo_periodo.map( periodo => {
                                                    return (
                                                    <option key={periodo.id} value={periodo.id}>
                                                        {periodo.nombre}
                                                    </option>
                                                    )
                                                })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        : null}
                    </Row>
                    <Row>                            
                        <Col>
                            <Form.Group id="observaciones">
                                <Form.Label>Observaciones</Form.Label>
                                <Form.Control as="textarea" rows={3} 
                                            name='observaciones' 
                                            value={datos.observaciones}
                                            onChange={handleInputChange} 
                                            placeholder="Observaciones"
                                />
                            </Form.Group>
                        </Col>
                    </Row>  
                    <Row>
                        <Col>
                            <Form.Group controlId="fecha_plan">
                                <Form.Label>Fecha Plan{parte.fecha_prevista_inicio===null?' (Parte Pendiente)':''}</Form.Label>
                                <Form.Control type="date" 
                                            name='fecha_plan' 
                                            value={datos.fecha_plan}
                                            onChange={handleInputChange} 
                                            placeholder="Fecha Plan" 
                                            disabled={parte.fecha_prevista_inicio===null?true:false}/>
                            </Form.Group>
                        </Col> 
                    </Row>                    
                </Form>
            </Modal.Body>
            <Modal.Footer>                    
                <Button variant="info" onClick={handlerGuardar}> Guardar </Button>                         
                <Button variant="waring" onClick={handlerCancelar}>
                    Cancelar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default LineaTareaNueva;