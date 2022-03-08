import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { PlusCircle } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';

const ParteForm = ({parte, setParte}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [tipoparte, setTipoParte] = useState(null);
    const [empresas, setEmpresas] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [zonas, setZonas] = useState(null);
    const [equipos, setEquipos] = useState(null);
    const [hoy] = useState(new Date);
    const [datos, setDatos] = useState({
        id: parte.id ? parte.id : null,
        nombre: parte.nombre,
        tipo: parte.tipo,
        creada_por: parte.creado_nombre? parte.creado_nombre : '',
        finalizado: parte? parte.finalizado : false,
        observaciones: parte.observaciones? parte.observaciones : '',
        fecha_creacion: parte ? parte.fecha_creacion : (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
        fecha_finalizacion: parte? parte.fecha_finalizacion : '',
        empresa: parte.equipo? parte.equipo.empresa_id : user['tec-user'].perfil.empresa.id,
        zona: parte.equipo? parte.equipo.zona_id : '',
        seccion: parte.equipo? parte.equipo.seccion : '',
        equipo: parte.equipo? parte.equipo.id : '',
    });

    useEffect(()=>{
        parte && setDatos({
            id: parte.id ? parte.id : null,
            nombre: parte.nombre,
            tipo: parte.tipo,
            creada_por: parte? parte.creada_por.get_full_name : '',
            finalizado: parte? parte.finalizado : false,
            observaciones: parte.observaciones? parte.observaciones : '',
            fecha_creacion: parte? parte.fecha_creacion :'',
            fecha_finalizacion: parte? parte.fecha_finalizacion : '',
            empresa: parte.equipo? parte.equipo.empresa_id : user['tec-user'].perfil.empresa.id,
            zona: parte.equipo? parte.equipo.zona_id : '',
            seccion: parte.equipo? parte.equipo.seccion : '',
            equipo: parte.equipo? parte.equipo.id : '',
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
            }))
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

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleDisabled = () => {
        return parte.nombre !== ''
    }

    const crearParte = (event) => {
        console.log(datos);
        event.preventDefault();
        axios.post(BACKEND_SERVER + `/api/mantenimiento/parte_trabajo/`, {
            nombre: datos.nombre,
            tipo: datos.tipo,
            creada_por: user['tec-user'].id,
            finalizado: false,
            observaciones: datos.observaciones,
            fecha_creacion: datos.fecha_creacion,
            fecha_finalizacion: datos.fecha_finalizacion,
            equipo: datos.equipo,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setParte(res.data);
        })
        .catch(err => { console.log(err);})
    }

    return(
        <Container>
            <Row className="justify-content-center"> 
                {parte.id ?
                    <h5 className="pb-3 pt-1 mt-2">Detalle del parte de trabajo</h5>:
                    <h5 className="pb-3 pt-1 mt-2">Nueva Parte de trabajo</h5>}
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
                                <Form.Group controlId="creada_por">
                                    <Form.Label>Creado por</Form.Label>
                                    <Form.Control   type="text" 
                                                    name='creada_por' 
                                                    disabled
                                                    value={parte.creada_por ? parte.creada_por.get_full_name : user['tec-user'].get_full_name}/>
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
                                                {parte.nombre===''?  <option key={0} value={''}>Seleccionar</option>:''}                                                   
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
                        </Row>                          
                        <Row>                            
                            <Col>
                                <Form.Group controlId="empresa">
                                    <Form.Label>Empresa</Form.Label>
                                    <Form.Control as="select"  
                                                name='empresa' 
                                                value={datos.empresa}
                                                onChange={handleInputChange}
                                                placeholder="Empresa"
                                                disabled={handleDisabled()}>
                                                {parte.nombre===''?  <option key={0} value={''}>Seleccionar</option>:''}    
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
                                    <Form.Control   as="select" 
                                                    value={datos.zona}
                                                    name='zona'
                                                    onChange={handleInputChange}> 
                                                    {parte.nombre===''?  <option key={0} value={''}>Seleccionar</option>:''}                                      
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
                                                    {parte.nombre===''?  <option key={0} value={''}>Seleccionar</option>:''}                                      
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
                                                    {parte.nombre===''?  <option key={0} value={''}>Seleccionar</option>:''}                                       
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
                                    <Form.Label>Fecha Creación</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_creacion' 
                                                value={datos.fecha_creacion}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha creación" />
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
                            <Col>
                                <Form.Group className="mb-3" id="pendiente">
                                    <Form.Check type="checkbox" 
                                                label="Pendiente"
                                                checked = {datos.pendiente}
                                                onChange = {handleInputChange} />
                                </Form.Group>
                            </Col> 
                        </Row>                   
                        <Form.Row className="justify-content-center">
                            {parte.id ? 
                                <Button variant="info" type="submit" className={'mx-2'} onClick={null}>Actualizar</Button> :
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
            {datos.id ? 
                <React.Fragment>
                    <Form.Row>
                        <Col>
                            <Row>
                                <Col>
                                <h5 className="pb-3 pt-1 mt-2">Tareas del Parte:</h5>
                                </Col>
                                <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                        <PlusCircle className="plus mr-2" size={30} onClick={null}/>
                                </Col>
                            </Row>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Prioridad</th>
                                        <th>Nombre</th>
                                        <th>Especialidad</th> 
                                        <th>Fecha Inicio</th>
                                        <th>Fecha Fin</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead> 
                                                                            
                                {/* <tbody>
                                    {tareas && tareas.map( tarea => {
                                        return (
                                            <tr key={tarea.id}>
                                                <td>{tarea.nombre}</td>
                                                <td>{tarea.tipo_nombre}</td>
                                                <td>{tarea.especialidad_nombre}</td>
                                                <td>{tarea.prioridad}</td>
                                                <td>                                            
                                                    <Link to={`/mantenimiento/tarea/${tarea.id}`}>
                                                        <PencilFill className="mr-3 pencil"/>                                                
                                                    </Link> 
                                                    <Trash className="pencil"  onClick={event =>{handleTrashClick(tarea)}} />                                            
                                                </td>
                                            </tr>
                                        )})
                                    }
                                </tbody> */}
                            </Table>                                     
                        </Col>
                    </Form.Row>                                                
                </React.Fragment> 
                : null} 
        </Container>
    )
}
export default ParteForm;