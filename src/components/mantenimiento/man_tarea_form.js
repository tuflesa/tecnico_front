import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';

const TareaForm = ({tarea, setTarea}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [tipotarea, setTipoTarea] = useState(null);
    const [especialidades, setEspecialidades] = useState(null);
    const [tipo_periodo, setTipoPeriodo] = useState(null);
    /* const [empresas, setEmpresas] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [zonas, setZonas] = useState(null);
    const [equipos, setEquipos] = useState(null); */

    const [datos, setDatos] = useState({
        id: tarea.id ? tarea.id : null,
        nombre: tarea.nombre,
        tipo: tarea.tipo,
        especialidad: tarea.especialidad,
        tipo_periodo: tarea.tipo_periodo,
        periodo: tarea.periodo? tarea.periodo : null,
        prioridad: tarea.prioridad? tarea.prioridad : null,
        observaciones: tarea.observaciones? tarea.observaciones : '',
        pendiente: tarea.pendiente,
        /* empresa: tarea.equipo? tarea.equipo.empresa_id : user['tec-user'].perfil.empresa.id,
        zona: tarea.equipo? tarea.equipo.zona_id : '',
        seccion: tarea.equipo? tarea.equipo.seccion : '',
        equipo: tarea.equipo? tarea.equipo.id : '', */
    });

    useEffect(()=>{
        setDatos({
            id: tarea.id ? tarea.id : null,
            nombre: tarea.nombre,
            tipo: tarea.tipo,
            especialidad: tarea.especialidad,
            tipo_periodo: tarea.tipo_periodo,
            periodo: tarea.periodo? tarea.periodo : null,
            prioridad: tarea.prioridad? tarea.prioridad : null,
            observaciones: tarea.observaciones? tarea.observaciones : '',
            pendiente: tarea.pendiente,
            /* empresa: tarea.equipo? tarea.equipo.empresa_id : user['tec-user'].perfil.empresa.id,
            zona: tarea.equipo? tarea.equipo.zona_id : '',
            seccion: tarea.equipo? tarea.equipo.seccion : '',
            equipo: tarea.equipo? tarea.equipo.id : '', */
        });
    },[tarea]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/mantenimiento/tipo_tarea/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setTipoTarea(res.data.sort(function(a, b){
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

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/mantenimiento/tipo_periodo/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setTipoPeriodo(res.data.sort(function(a, b){
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
    
    // useEffect(() => {
    //     axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
    //         headers: {
    //             'Authorization': `token ${token['tec-token']}`
    //         }
    //     })
    //     .then( res => {
    //         setEmpresas(res.data);
    //     })
    //     .catch( err => {
    //         console.log(err);
    //     });        
    // }, [token]);

    // useEffect(() => {        
    //     if (datos.empresa === '') {
    //         setZonas([]);
    //         setDatos({
    //             ...datos,
    //             zona: '',
    //             seccion: '',
    //             equipo: ''
    //         });
    //     }
    //     else {
    //         datos.empresa && axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`,{
    //             headers: {
    //                 'Authorization': `token ${token['tec-token']}`
    //             }
    //         })
    //         .then( res => {
    //             setZonas(res.data);
    //             /* setDatos({
    //                 ...datos,
    //                 zona: '',
    //                 seccion: '',
    //                 equipo: ''
    //             }); */
    //         })
    //         .catch( err => {
    //             console.log(err);
    //         });            
    //     }
    // }, [token, datos.empresa]);

    // useEffect(() => {
    //     if (datos.zona === '') {
    //         setSecciones([]);
    //         setDatos({
    //             ...datos,
    //             seccion: '',
    //             equipo: ''
    //         });
    //     }
    //     else {
    //         datos.zona && axios.get(BACKEND_SERVER + `/api/estructura/seccion/?zona=${datos.zona}`,{
    //             headers: {
    //                 'Authorization': `token ${token['tec-token']}`
    //             }
    //         })
    //         .then( res => {
    //             setSecciones(res.data);
    //             /* setDatos({
    //                 ...datos,
    //                 seccion: '',
    //                 equipo: ''
    //             }); */
    //         })
    //         .catch( err => {
    //             console.log(err);
    //         });            
    //     }
    // }, [token, datos.zona]);

    // useEffect(() => {        
    //     if (datos.seccion === ''){
    //         setEquipos([]);
    //         setDatos({
    //             ...datos,
    //             equipo: ''
    //         });
    //     }
    //     else{
    //         datos.seccion && axios.get(BACKEND_SERVER + `/api/estructura/equipo/?seccion=${datos.seccion}`,{
    //             headers: {
    //                 'Authorization': `token ${token['tec-token']}`
    //             }
    //         })
    //         .then( res => {
    //             setEquipos(res.data.sort(function(a, b){
    //                 if(a.nombre > b.nombre){
    //                     return 1;
    //                 }
    //                 if(a.nombre < b.nombre){
    //                     return -1;
    //                 }
    //                 return 0;
    //             }))
    //             /* setDatos({
    //                 ...datos,
    //                 equipo: ''
    //             }); */
    //         })
    //         .catch( err => {
    //             console.log(err);
    //         });            
    //     }
    // }, [token, datos.seccion]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const crearDatos = (event) => {
        event.preventDefault();
        axios.post(BACKEND_SERVER + `/api/mantenimiento/tarea_nueva/`, {
            nombre: datos.nombre,
            //equipo: datos.equipo,
            tipo: datos.tipo,
            especialidad: datos.especialidad,
            tipo_periodo: datos.tipo_periodo,
            periodo: datos.periodo,
            prioridad: datos.prioridad,
            observaciones: datos.observaciones,
            pendiente: datos.pendiente,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setTarea(res.data);
            window.location.href = "/mantenimiento/tareas";
        })
        .catch(err => { console.log(err);})
    }

    const actualizarDatos = (event) => {
        event.preventDefault();
        axios.put(BACKEND_SERVER + `/api/mantenimiento/tarea_nueva/${datos.id}/`, {
            nombre: datos.nombre,
            //equipo: datos.equipo,
            tipo: datos.tipo,
            especialidad: datos.especialidad,
            tipo_periodo: datos.tipo_periodo,
            periodo: datos.periodo,
            prioridad: datos.prioridad,
            observaciones: datos.observaciones,
            pendiente: datos.pendiente,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setTarea(res.data);
        })
        .catch(err => { console.log(err);})

    }

    const handleDisabled = () => {
        return tarea.nombre !== ''
    }

    const handleDisabled2 = () => {
        return datos.tipo!=='1'
    }  

    return (
        <Container>
            <Row className="justify-content-center"> 
                {tarea.id ?
                    <h5 className="pb-3 pt-1 mt-2">Detalle de la Tarea</h5>:
                    <h5 className="pb-3 pt-1 mt-2">Nueva Tarea</h5>}
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <h5 className="pb-3 pt-1 mt-2">Datos básicos:</h5>
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
                            <Col>
                                <Form.Group id="especialidades">
                                    <Form.Label>Especialidades</Form.Label>
                                    <Form.Control as="select"  
                                                name='especialidad' 
                                                value={datos.especialidad}
                                                onChange={handleInputChange}
                                                placeholder="Especialidad">
                                                {tarea.nombre===''?  <option key={0} value={''}>Seleccionar</option>:''}
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
                            <Col>
                                <Form.Group controlId="tipo">
                                    <Form.Label>Tipo Mantenimiento</Form.Label>
                                    <Form.Control as="select"  
                                                name='tipo' 
                                                value={datos.tipo}
                                                onChange={handleInputChange}
                                                placeholder="Tipo Mantenimiento"> 
                                                {tarea.nombre===''?  <option key={0} value={''}>Seleccionar</option>:''}                                                   
                                                {tipotarea && tipotarea.map( tipo => {
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
                            <Col>
                                <Form.Group className="mb-3" id="pendiente">
                                    <Form.Check type="checkbox" 
                                                label="Pendiente"
                                                checked = {datos.pendiente}
                                                onChange = {handleInputChange} />
                                </Form.Group>
                            </Col>                        
                        </Row>                          
                        {/* <Row>
                            <Col>
                                <Form.Group controlId="empresa">
                                    <Form.Label>Empresa</Form.Label>
                                    <Form.Control as="select"  
                                                name='empresa' 
                                                value={datos.empresa}
                                                onChange={handleInputChange}
                                                placeholder="Empresa"
                                                disabled={handleDisabled()}>
                                                {tarea.nombre===''?  <option key={0} value={''}>Seleccionar</option>:''}    
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
                                    <Form.Label>Zona</Form.Label>
                                    <Form.Control as="select" 
                                                    value={datos.zona}
                                                    name='zona'
                                                    onChange={handleInputChange}>
                                        {tarea.nombre===''?  <option key={0} value={''}>Seleccionar</option>:''}
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
                                    <Form.Label>Seccion</Form.Label>
                                    <Form.Control as="select" 
                                                    value={datos.seccion}
                                                    name='seccion'
                                                    onChange={handleInputChange}>
                                        {tarea.nombre===''?  <option key={0} value={''}>Seleccionar</option>:''}
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
                                    <Form.Label>Equipo</Form.Label>
                                    <Form.Control as="select" 
                                                    value={datos.equipo}
                                                    name='equipo'
                                                    onChange={handleInputChange}>
                                        {tarea.nombre===''?  <option key={0} value={''}>Seleccionar</option>:''}
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
                        </Row>  */}
                        <Row>
                            <Col>
                                <Form.Group id="tipo_periodo">
                                    <Form.Label>Tipo Periodo</Form.Label>
                                    <Form.Control as="select"  
                                                name='tipo_periodo' 
                                                value={datos.tipo_periodo}
                                                onChange={handleInputChange}
                                                placeholder="Tipo Periodo"
                                                disabled={handleDisabled2()}>  
                                                {tarea.nombre===''?  <option key={0} value={''}>Seleccionar</option>:''}                                                  
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
                            <Col>
                                <Form.Group controlId="periodo">
                                    <Form.Label>Cantidad de Periodos</Form.Label>
                                    <Form.Control as="select" 
                                                    value={datos.periodo}
                                                    name='periodo'
                                                    onChange={handleInputChange}
                                                    disabled={handleDisabled2()}>
                                        {tarea.nombre===''?  <option key={0} value={''}>Seleccionar</option>:''}
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
                                        <option key={12} value={12}>12</option>                                        
                                    </Form.Control>
                                </Form.Group>
                            </Col>                            
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
                        <Form.Row className="justify-content-center">
                            {tarea.id ? 
                                <Button variant="info" type="submit" className={'mx-2'} onClick={actualizarDatos}>Actualizar</Button> :
                                <Button variant="info" type="submit" className={'mx-2'} onClick={crearDatos}>Guardar</Button>
                            }
                            <Link to='/mantenimiento/tareas'>
                                <Button variant="warning" >
                                    Cancelar / Cerrar
                                </Button>
                            </Link>
                        </Form.Row>
                    </Form>
                </Col>
            </Row>
        </Container>    
    )
}
export default TareaForm;