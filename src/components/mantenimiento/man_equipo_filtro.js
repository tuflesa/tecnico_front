import React , { useState, useEffect } from "react";
import { Container, Row, Form, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const ManEquipoFiltro = ({actualizaFiltro}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']); 

    const [empresas, setEmpresas] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [zonas, setZonas] = useState(null);
    const [equipos, setEquipos] = useState(null);
    const [tipotarea, setTipoTarea] = useState(null);
    const [primera_vez, setPrimeraVez] = useState(true);
    const [abrirFiltro, setabrirFiltro] = useState(false);
    
    var fecha_hoy=Date.parse(new Date());
    var mesEnMilisegundos = 1000 * 60 * 60 * 24 * 7;  //cambiado a una semana, en vez del mes
    var enunmes=fecha_hoy+mesEnMilisegundos;
    var dentrodeunmes = new Date(enunmes);
    var fechaenunmesString = dentrodeunmes.getFullYear() + '-' + ('0' + (dentrodeunmes.getMonth()+1)).slice(-2) + '-' + ('0' + dentrodeunmes.getDate()).slice(-2); 

    const [datos, setDatos] = useState({
        especialidad: user['tec-user'].perfil.destrezas.length===1?user['tec-user'].perfil.destrezas[0]:'',
        tipo: '',
        empresa: user['tec-user'].perfil.empresa.id,
        zona: user['tec-user'].perfil.zona?user['tec-user'].perfil.zona.id:'',
        seccion: user['tec-user'].perfil.seccion?user['tec-user'].perfil.seccion.id:'',
        equipo: '',
        fecha_plan_lte: fechaenunmesString,
    });

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
            //Si es Bornay, enseñamos Bornay y Comalsid
            if(user['tec-user'].perfil.empresa.id===1 && user['tec-user'].perfil.puesto.nombre!=='Operador'){
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
    }, [token, user]);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setZonas(res.data);
            !primera_vez && setDatos({
                ...datos,
                zona: '',
                seccion: '',
                equipo: ''
            });
        })
        .catch( err => {
            console.log(err);
        });
    }, [datos.empresa]);

    useEffect(() => {
        if (datos.zona === '') {
            setSecciones([]);
            !primera_vez && setDatos({
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
                !primera_vez && setDatos({
                    ...datos,
                    seccion: '',
                    equipo: ''
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [datos.zona]);

    useEffect(() => {
        if (datos.seccion === ''){
            setEquipos([]);
            !primera_vez && setDatos({
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
                setPrimeraVez(false);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [datos.seccion]);

    useEffect(()=>{
        const filtro = `?parte__tipo=${datos.tipo}&parte__empresa=${datos.empresa}&parte__zona=${datos.zona}&parte__seccion__id=${datos.seccion}&parte__equipo__id=${datos.equipo}&fecha_plan__lte=${datos.fecha_plan_lte}&tarea__especialidad=${datos.especialidad}`;
        actualizaFiltro(filtro);
    },[datos]);
    /* eslint-enable react-hooks/exhaustive-deps */

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleInputChange_empresa = (event) => {
        setDatos({
            ...datos,
            empresa: event.target.value,
            zona: '',
            seccion: '',
            equipo: ''
        });
    }

    const handleInputChange_zona = (event) => {
        setDatos({
            ...datos,
            zona: event.target.value,
            seccion: '',
            equipo: ''
        });
    }

    const handleInputChange_seccion = (event) => {
        setDatos({
            ...datos,
            seccion: event.target.value,
            equipo: ''
        });
    }

    const Desactivar = () => {
        if(user['tec-user'].perfil.puesto.nombre!=='Operador'){    
            return false;
        }
        else{
            return true;
        }
    }

    const Desactivar_zona = () => {
        if(user['tec-user'].perfil.zona && user['tec-user'].perfil.puesto.nombre==='Operador'){    
            return true;
        }
        else{
            return false;
        }
    }

    const Desactivar_seccion = () => {
        if(user['tec-user'].perfil.seccion && user['tec-user'].perfil.puesto.nombre==='Operador'){    
            return true;
        }
        else{
            return false;
        }
    }

    const abroFiltro = () => {
        setabrirFiltro(!abrirFiltro);
    }

    return (
        <Container >
            <button type="button" onClick={event => {abroFiltro()}}>Ver Filtros</button>
            <Form>
            {abrirFiltro?
                <Row>
                    <Col>
                        <Form.Group controlId="tipo">
                            <Form.Label>Tipo de tarea</Form.Label>
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
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa</Form.Label>
                            <Form.Control as="select"  
                                        name='empresa' 
                                        value={datos.empresa}
                                        onChange={handleInputChange_empresa}
                                        placeholder="Empresa"
                                        disabled={Desactivar()}>
                                        {<option key={0} value={''}>Todas</option>}   
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
                                            onChange={handleInputChange_zona}
                                            disabled={Desactivar_zona()}>
                                {<option key={0} value={''}>Todas</option>}
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
                                            onChange={handleInputChange_seccion}
                                            disabled={Desactivar_seccion()}>
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
                </Row> 
            :null}
            </Form>
        </Container>
    );
}
export default ManEquipoFiltro;