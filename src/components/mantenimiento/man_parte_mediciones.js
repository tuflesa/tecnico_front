import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';
import { PlusCircle, Receipt } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import LineaMedicionNueva from './man_parte_lineamediciones';
import LineasPartesMov from './man_parte_lineas_mov';

const ParteMediciones = ({parte, setParte}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [tipoparte, setTipoParte] = useState(null);
    const [lineasparte, setLineasParte] = useState(null);
    const [empresas, setEmpresas] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [zonas, setZonas] = useState(null);
    const [equipos, setEquipos] = useState(null);
    const [hoy] = useState(new Date);
    const [tipo_periodo, setTipoPeriodo] = useState(null);
    const [show_linea, setShowLinea] = useState(false);
    const [show_error, setShowError] = useState(false);
    const [show_listlineastareas, setShowListLineasTareas] = useState(false);
    const [lineaLineasTareas, setListLineasTareas] = useState(null);
    const [cambio_fecha, setCambioFecha] = useState(false);
    const [estados, setEstados] = useState(null);
    const [lineas, setLineas] = useState(null);

    const [datos, setDatos] = useState({
        id: parte.id ? parte.id : null,
            nombre: parte?parte.nombre:null,
            tipo: 4,
            creado_por: parte.creado_por,
            finalizado: parte? parte.finalizado : false,
            observaciones: parte.observaciones? parte.observaciones : '',
            fecha_creacion: parte.id ? parte.fecha_creacion :(hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
            fecha_prevista_inicio: parte? parte.fecha_prevista_inicio : '',
            fecha_finalizacion: parte? parte.fecha_finalizacion : '',
            empresa: parte?parte.empresa:null,
            zona: parte? parte.zona : '',
            seccion: parte? parte.seccion : '',
            equipo: parte? parte.equipo : '',
            tipo_periodo: parte.id? parte.tipo_periodo : '',
            periodo: parte.id? parte.periodo : 0,
            tarea: parte?parte.tarea:null,
            estado: parte?parte.estado:null,
            num_parte: parte? parte.num_parte:null,
    });

    useEffect(()=>{
        setDatos({
            id: parte.id ? parte.id : null,
            nombre: parte?parte.nombre:null,
            tipo: 4,
            creado_por: parte.creado_por,
            finalizado: parte? parte.finalizado : false,
            observaciones: parte.observaciones? parte.observaciones : '',
            fecha_creacion: parte.id ? parte.fecha_creacion :(hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
            fecha_prevista_inicio: parte? parte.fecha_prevista_inicio : '',
            fecha_finalizacion: parte? parte.fecha_finalizacion : '',
            empresa: parte?parte.empresa:null,
            zona: parte? parte.zona : '',
            seccion: parte? parte.seccion : '',
            equipo: parte? parte.equipo : '',
            tipo_periodo: parte.id? parte.tipo_periodo : '',
            periodo: parte.id? parte.periodo : 0,
            tarea: parte?parte.tarea:null,
            estado: parte?parte.estado:null,
            num_parte: parte? parte.num_parte:null,
        });
    },[parte]);
  
    useEffect(() => {
        parte.id && axios.get(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo_detalle/${parte.id}/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => { 
            setLineasParte(res.data.tarea.sort(function(a, b){
                if(a.prioridad < b.prioridad){
                    return 1;
                }
                if(a.prioridad > b.prioridad){
                    return -1;
                }
                return 0;
            }))            
        })
        .catch( err => {
            console.log(err); 
        })       
    }, [token, parte]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setEmpresas(res.data);
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
                setDatos({
                    ...datos,
                    zona: '',
                    seccion: '',
                    equipo: ''
                });
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
                setDatos({
                    ...datos,
                    seccion: '',
                    equipo: ''
                });
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
                setDatos({
                    ...datos,
                    equipo: ''
                });
            })
            .catch( err => {
                console.log(err);
            });            
        }
    }, [token, datos.seccion]);

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
    
    const updateParte = () => {
        parte.id && axios.get(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo_detalle/${parte.id}/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {
            setParte(res.data);
        })
        .catch(err => { console.log(err);})
    }

    const handleDisabled2 = () => {
        return user['tec-user'].perfil.nivel_acceso.nombre === 'local'
    }

    
    const handleInputChange = (event) => {
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
            equipo: datos.equipo,
            zona: datos.zona,
            seccion: datos.seccion,
            tipo_periodo: datos.tipo==='1'? datos.tipo_periodo : '',
            periodo: datos.tipo==='1'? datos.periodo : 0,
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
            axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_parte_mov/?parte=${parte.id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                for(var x=0;x<res.data.length;x++){
                    axios.patch(BACKEND_SERVER + `/api/mantenimiento/linea_nueva/${res.data[x].id}/`, {
                        fecha_plan: fecha,
                        estado: estado,
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }     
                    })
                    .then( res => {
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
            tipo_periodo: datos.tipo=== 1? datos.tipo_periodo : '',
            periodo: datos.tipo=== 1? datos.periodo : 0,
            estado: datos.fecha_prevista_inicio?1:4,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            if(cambio_fecha){
                actualizarLinea();
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

    return(
        <Container>
            <Row className="justify-content-center"> 
                {parte.id ?
                    <h5 className="pb-3 pt-1 mt-2">Detalle del parte de mediciones</h5>:
                    <h5 className="pb-3 pt-1 mt-2">Nuevo Parte de mediciones</h5>}
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
                                    <Form.Control type='text' 
                                                name='tipo' 
                                                value="Mediciones"
                                                onChange={handleInputChange}
                                                placeholder="Tipo Mantenimiento"
                                                disabled={true} >
                                    </Form.Control>
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group id="tipo_periodo">
                                    <Form.Label>Tipo Periodo</Form.Label>
                                    <Form.Control as="select"  
                                                name='tipo_periodo' 
                                                value={datos.tipo_periodo}
                                                onChange={handleInputChange}
                                                placeholder="Tipo Periodo">  
                                                {datos.tipo_periodo===''?  <option key={0} value={''}>Seleccionar</option>:''}   
                                                {parte.tipo_periodo===null?  <option key={0} value={''}>Seleccionar</option>:''}                                               
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
                                                    onChange={handleInputChange}>
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
                            </Col>                 
                        </Row>                          
                        <Row>                            
                            <Col>
                                <Form.Group controlId="empresa">
                                    <Form.Label>Empresa (*)</Form.Label>
                                    <Form.Control as="select"  
                                                name='empresa' 
                                                value={datos.empresa}
                                                onChange={handleInputChange}
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
                                                    onChange={handleInputChange}> 
                                                    {datos.zona===''?  <option key={0} value={''}>Seleccionar</option>:''}                                      
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
                                    <Form.Control   as="select" 
                                                    value={datos.seccion}
                                                    name='seccion'
                                                    onChange={handleInputChange}>  
                                                    {datos.seccion===''?  <option key={0} value={''}>Seleccionar</option>:''}                                      
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
                                                    {datos.equipo===''?  <option key={0} value={''}>Seleccionar</option>:''}                                       
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
                                                placeholder="Fecha Finalización" />
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
                        <Form.Row className="justify-content-center">
                            {parte.id ? 
                                <Button variant="info" type="submit" className={'mx-2'} onClick={actualizarDatos}>Actualizar</Button> :
                                <Button variant="info" type="submit" className={'mx-2'} onClick={crearParte}>Guardar</Button>
                            }
                            <Link to='/mantenimiento/partes'>
                                <Button variant="warning" >
                                    Cancelar / Cerrar
                                </Button>
                            </Link>
                        </Form.Row>
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
                                <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                        <PlusCircle className="plus mr-2" size={30} onClick={abrirAddLinea}/>
                                </Col>
                            </Row>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Prioridad</th>
                                        <th>Nombre</th>
                                        <th>Especialidad</th>
                                        <th>Trabajo a realizar</th>
                                        {/* <th>Observaciones</th> */}
                                        <th>Acciones</th>
                                    </tr>
                                </thead>                                                                             
                                <tbody>
                                    {lineasparte && lineasparte.map( linea => {
                                        return (
                                            <tr key={linea.id}>
                                                <td>{linea.prioridad}</td>
                                                <td>{linea.nombre}</td>
                                                <td>{linea.especialidad_nombre}</td>
                                                <td>{linea.trabajo}</td>
                                                {/* <td>{linea.observaciones}</td> */}
                                                <td>                                            
                                                    <Receipt className="mr-3 pencil" onClick={event =>{listarLineasTareas(linea)}}/>
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
            <LineaMedicionNueva     show={show_linea}
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
export default ParteMediciones;