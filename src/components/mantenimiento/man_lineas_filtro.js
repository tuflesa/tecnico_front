import React , { useState, useEffect } from "react";
import { Container, Row, Form, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const ManLineasFiltro = ({actualizaFiltro}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']); 
    const [empresas, setEmpresas] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [zonas, setZonas] = useState(null);
    const [equipos, setEquipos] = useState(null);
    const [estados, setEstados] = useState(null);

    const [datos, setDatos] = useState({
        id: '',
        nombre_tarea: '',
        nombre_parte: '',
        especialidad: '',
        prioridad_menor: '',
        prioridad_mayor: '',
        tipo: '',
        empresa: user['tec-user'].perfil.empresa.id,
        zona: '',
        seccion: '',
        equipo: '',
        finalizada:false,
        fecha_inicio_lte:'',
        fecha_inicio_gte:'',
        fecha_plan_lte:'',
        fecha_plan_gte:'',
        estados:'',
    });

    const [especialidades, setEspecialidades] = useState(null);
    const [tipotarea, setTipoTarea] = useState(null);

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
            axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`,{
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
            axios.get(BACKEND_SERVER + `/api/estructura/seccion/?zona=${datos.zona}`,{
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
            axios.get(BACKEND_SERVER + `/api/estructura/equipo/?seccion=${datos.seccion}`,{
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
        axios.get(BACKEND_SERVER + '/api/mantenimiento/estados/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEstados(res.data.sort(function(a, b){
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
    }, [token]);

    useEffect(()=>{
        const filtro1 = `?tarea__nombre__icontains=${datos.nombre_tarea}&parte__nombre__icontains=${datos.nombre_parte}&tarea__especialidad=${datos.especialidad}&tarea__prioridad__lte=${datos.prioridad_menor}&tarea__prioridad__gte=${datos.prioridad_mayor}&parte__tipo=${datos.tipo}&parte__empresa=${user['tec-user'].perfil.empresa.id}&finalizada=${datos.finalizada}&fecha_inicio__lte=${datos.fecha_inicio_lte}&fecha_inicio__gte=${datos.fecha_inicio_gte}&fecha_plan__lte=${datos.fecha_plan_lte}&fecha_plan__gte=${datos.fecha_plan_gte}&estado=${datos.estados==='5'?'':datos.estados}`;
        let filtro2 = `&parte__empresa__id=${datos.empresa}`;
        if (datos.empresa !== ''){
            filtro2 = filtro2 + `&parte__zona__id=${datos.zona}`;
            if (datos.zona !== ''){
                filtro2 = filtro2 + `&parte__seccion__id=${datos.seccion}`;
                if (datos.seccion !== ''){
                    filtro2 = filtro2 + `&parte__equipo__id=${datos.equipo}`
                }
            }
        }
        const filtro = filtro1 + filtro2 ;
        const activos = datos.estados;
        actualizaFiltro(filtro, activos);
    },[ datos.empresa, datos.zona, datos.seccion, datos.equipo, datos.id, datos.nombre_tarea, datos.tipo, datos.especialidad,datos.prioridad_mayor, datos.prioridad_menor, datos.finalizada, datos.nombre_parte, datos.fecha_inicio_gte, datos.fecha_inicio_lte, datos.fecha_plan_gte, datos.fecha_plan_lte, datos.estados, token]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleInputChangeE = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    return (
        <Container>
            <h5 className="mb-3 mt-3">Filtro</h5>
            <Form>
                <Row>
                    <Col>
                        <Form.Group controlId="formNombreParte">
                            <Form.Label>Nombre Parte contiene</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre_parte' 
                                        value={datos.nombre_parte}
                                        onChange={handleInputChange}                                        
                                        placeholder="Nombre Parte contiene"
                                        autoFocus/>
                        </Form.Group>
                    </Col> 
                    <Col>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Nombre Tarea contiene</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre_tarea' 
                                        value={datos.nombre_tarea}
                                        onChange={handleInputChange}                                        
                                        placeholder="Nombre Tarea contiene"/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="tipo">
                            <Form.Label>Tipo</Form.Label>
                            <Form.Control as="select"  
                                        name='tipo' 
                                        value={datos.tipo}
                                        onChange={handleInputChange}
                                        placeholder="Tipo">
                                            <option key={0} value={''}>Todos</option>
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
                        <Form.Group controlId="especialidades">
                            <Form.Label>Especialidades</Form.Label>
                            <Form.Control as="select"  
                                        name='especialidad' 
                                        value={datos.especialidad}
                                        onChange={handleInputChange}
                                        placeholder="Especialidad">
                                            <option key={0} value={''}>Todos</option>
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
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa</Form.Label>
                            <Form.Control as="select"  
                                        name='empresa' 
                                        value={datos.empresa}
                                        onChange={handleInputChange}
                                        placeholder="Empresa">
                                        <option key={0} value={''}>Todas</option>    
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
                                <option key={0} value={''}>Todas</option>
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
                                <option key={0} value={''}>Todas</option>
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
                                <option key={0} value={''}>Todos</option>
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
                        <Form.Group controlId="fecha_plan_gte">
                            <Form.Label>Fecha Plan posterior a:</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_plan_gte' 
                                        value={datos.fecha_plan_gte}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha plan posterior a..." />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha_plan_lte">
                            <Form.Label>Fecha Plan Anterior a</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_plan_lte' 
                                        value={datos.fecha_plan_lte}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha plan anterior a..." />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha_inicio_gte">
                            <Form.Label>Fecha Inicio Posterior a</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_inicio_gte' 
                                        value={datos.fecha_inicio_gte}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha inicio posterior a..." />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha_inicio_lte">
                            <Form.Label>Fecha Inicio Anterior a</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_inicio_lte' 
                                        value={datos.fecha_inicio_lte}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha inicio anterior a..." />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="menorque">
                            <Form.Label>Prioridad menor que:</Form.Label>
                            <Form.Control type="text" 
                                        name='prioridad_menor' 
                                        value={datos.prioridad_menor}
                                        onChange={handleInputChange}                                        
                                        placeholder="Prioridad menor que"
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="mayorque">
                            <Form.Label>Prioridad mayor que:</Form.Label>
                            <Form.Control type="text" 
                                        name='prioridad_mayor' 
                                        value={datos.prioridad_mayor}
                                        onChange={handleInputChange}                                        
                                        placeholder="Prioridad mayor que"
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="estados">
                            <Form.Label>Estado Trabajo</Form.Label>
                            <Form.Control as="select"  
                                        name='estados' 
                                        value={datos.estados}
                                        onChange={handleInputChangeE}
                                        placeholder="Estados">
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
            </Form>
        </Container>
    );
}
export default ManLineasFiltro;