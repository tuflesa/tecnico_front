import React , { useState, useEffect } from "react";
import { Container, Row, Form, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const ManPartesFiltro = ({actualizaFiltro}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [tipotarea, setTipoTarea] = useState(null);
    const [usuarios, setUsuarios] = useState(null);
    const [empresas, setEmpresas] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [zonas, setZonas] = useState(null);
    const [equipos, setEquipos] = useState(null);
    const [estados, setEstados] = useState(null);
    const soyTecnico = user['tec-user'].perfil.destrezas.filter(s => s === 6);

    const [datos, setDatos] = useState({
        id: '',
        nombre: '',
        tipotarea: '',
        creado_por: soyTecnico.length===0?user['tec-user'].perfil.usuario:'',
        observaciones: '',
        finalizado: false,
        empresa: user['tec-user'].perfil.empresa.id,
        zona: '',
        seccion: '',
        equipo: '',
        fecha_prevista_inicio_lte:'',
        fecha_prevista_inicio_gte:'',
        estados: '',
        num_parte: '',
    });    

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/mantenimiento/tipo_tarea/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            if(soyTecnico.length===0){
                const no_tecnico = res.data.filter( s => s.nombre !== 'Preventivo');
                setTipoTarea(no_tecnico.sort(function(a, b){
                    if(a.nombre > b.nombre){
                        return 1;
                    }
                    if(a.nombre < b.nombre){
                        return -1;
                    }
                    return 0;
                }))
            }
            else{
                setTipoTarea(res.data.sort(function(a, b){
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
        axios.get(BACKEND_SERVER + `/api/administracion/usuarios/?perfil__empresa__id=${user['tec-user'].perfil.empresa.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setUsuarios(res.data.sort(function(a, b){
                if(a.get_full_name > b.get_full_name){
                    return 1;
                }
                if(a.get_full_name < b.get_full_name){
                    return -1;
                }
                return 0;
            }))
        })
        .catch( err => {
            console.log(err);
        });
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
            var filtrado = res.data.filter(s=> s.id!==2);
            setEstados(filtrado.sort(function(a, b){
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
        const filtro1 = `?nombre__icontains=${datos.nombre}&tipo=${datos.tipotarea}&observaciones__icontains=${datos.observaciones}&creado_por=${datos.creado_por}&finalizado=${datos.finalizado}&fecha_prevista_inicio__lte=${datos.fecha_prevista_inicio_lte}&fecha_prevista_inicio__gte=${datos.fecha_prevista_inicio_gte}&estado=${datos.estados==='5'?'':datos.estados}&num_parte__icontains=${datos.num_parte}`;
        let filtro2 = `&empresa__id=${datos.empresa}`;
        if (datos.empresa !== ''){
            filtro2 = filtro2 + `&zona__id=${datos.zona}`;
            if (datos.zona !== ''){
                filtro2 = filtro2 + `&seccion__id=${datos.seccion}`;
                if (datos.seccion !== ''){
                    filtro2 = filtro2 + `&equipo__id=${datos.equipo}`
                }
            }
        }
        const filtro = filtro1 + filtro2;
        const activos = datos.estados<3;
        actualizaFiltro(filtro, activos);
    },[datos, token]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    return (
        <Container className="mt-5">
            <h5 className="mt-5">Filtro</h5>
            <Form>
                <Row>                    
                    <Col>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Nombre contiene</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange}                                        
                                        placeholder="Nombre contiene"
                                        autoFocus/>
                        </Form.Group>
                    </Col>  
                    <Col>
                        <Form.Group controlId="tipotarea">
                            <Form.Label>Tipo Mantenimiento</Form.Label>
                            <Form.Control as="select"  
                                        name='tipotarea' 
                                        value={datos.tipotarea}
                                        onChange={handleInputChange}
                                        placeholder="Tipo Mantenimiento">
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
                        <Form.Group controlId="creado_por">
                            <Form.Label>Creado Por</Form.Label>
                            <Form.Control as="select"  
                                        name='creado_por' 
                                        value={datos.creado_por}
                                        onChange={handleInputChange}
                                        placeholder="Creado por"
                                        disabled={soyTecnico.length===0?true:false}>
                                        <option key={0} value={''}>Todas</option>    
                                        {usuarios && usuarios.map( usuario => {
                                            return (
                                            <option key={usuario.id} value={usuario.id}>
                                                {usuario.get_full_name}
                                            </option>
                                            )
                                        })}
                        </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha_prevista_inicio_gte">
                            <Form.Label>Fecha Prevista Posterior a</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_prevista_inicio_gte' 
                                        value={datos.fecha_prevista_inicio_gte}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha creación posterior a..." />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha_prevista_inicio_lte">
                            <Form.Label>Fecha Prevista Anterior a</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_prevista_inicio_lte' 
                                        value={datos.fecha_prevista_inicio_lte}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha creación anterior a..." />
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
                                        disabled={soyTecnico.length===0?true:false}>
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
                        <Form.Group controlId="num_parte">
                            <Form.Label>Numero de Parte</Form.Label>
                            <Form.Control type="text" 
                                        name='num_parte' 
                                        value={datos.num_parte}
                                        onChange={handleInputChange}                                        
                                        placeholder="Numero contiene"/>
                        </Form.Group>
                    </Col>  
                    <Col>
                        <Form.Group controlId="observaciones">
                            <Form.Label>Observaciones contiene</Form.Label>
                            <Form.Control type="text" 
                                        name='observaciones' 
                                        value={datos.observaciones}
                                        onChange={handleInputChange}                                        
                                        placeholder="Observaciones contiene"/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="estados">
                            <Form.Label>Estado del Parte</Form.Label>
                            <Form.Control as="select"  
                                        name='estados' 
                                        value={datos.estados}
                                        onChange={handleInputChange}
                                        placeholder="Estados">
                                            <option key={0} value={''}>Activos</option>
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
export default ManPartesFiltro;