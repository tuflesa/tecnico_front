import { Container } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';
import { Button, Form, Col, Row } from 'react-bootstrap';

const RodRodilloForm = ({rodillo, setRodillo}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    
    const [empresas, setEmpresas] = useState(null);
    const [zonas, setZonas] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [operaciones, setOperaciones] = useState([]);
    const [tipo_rodillo, setTipoRodillo] = useState([]);
    const [materiales, setMateriales] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [tipo_plano, setTipoPlano] = useState([]);

    const [datos, setDatos] = useState({
        empresa: user['tec-user'].perfil.empresa.id,
        zona: '',
        seccion: '',
        operacion: '',
        grupo: '',
        tipo_rodillo: '',
        material: '',
        nombre: '',
        tipo_plano: '',
    });

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
        axios.get(BACKEND_SERVER + '/api/rodillos/tipo_plano/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setTipoPlano(res.data);
            console.log(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    /* useEffect(() => {
        rodillo && axios.get(BACKEND_SERVER + `/api/rodillos/rodillo_nuevo/?operacion__seccion__maquina${2}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            console.log('que aparece en operacion__seccion__maquina === 2');
            console.log(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [rodillo]); */

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/rodillos/materiales/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setMateriales(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/rodillos/tipo_rodillo/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setTipoRodillo(res.data);
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
            axios.get(BACKEND_SERVER + `/api/rodillos/seccion/?maquina=${datos.zona}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setSecciones(res.data);
                setDatos({
                    ...datos,
                    seccion: '',
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.zona]);

    useEffect(() => {
        if (datos.seccion === ''){
            setOperaciones([]);
            setDatos({
                ...datos,
                operacion: ''
            });
        }
        else{
            axios.get(BACKEND_SERVER + `/api/rodillos/operacion/?seccion=${datos.seccion}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setOperaciones(res.data);
                setDatos({
                    ...datos,
                    operacion: ''
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.seccion]);

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
            axios.get(BACKEND_SERVER + `/api/rodillos/grupo/?maquina=${datos.zona}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setGrupos(res.data);
                if(res.data.length === 0){
                    alert('No tenemos ningún grupo dado de alta para esta máquina');
                }
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.zona]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const GuardarRodillo = (event) => {
        event.preventDefault();
        axios.post(BACKEND_SERVER + `/api/rodillos/rodillo_nuevo/`, {
            nombre: datos.nombre,
            operacion: datos.operacion,
            grupo: datos.grupo,
            tipo: datos.tipo_rodillo,
            material: datos.material,
            tipo_plano: datos.tipo_plano,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => { 
            setRodillo(res.data);
        })
        .catch(err => { 
            console.log(err);
            alert('Falta datos, por favor rellena todo los datos que tengan *');
        })
    };

    const ActualizarRodillo = (event) => {
        event.preventDefault();
        axios.put(BACKEND_SERVER + `/api/rodillos/rodillo_nuevo/${rodillo.id}/`, {
            nombre: datos.nombre,
            operacion: datos.operacion,
            grupo: datos.grupo,
            tipo: datos.tipo_rodillo,
            material: datos.material,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => { 
            setRodillo(res.data);
        })
        .catch(err => { 
            console.log(err);
            alert('Falta datos, por favor rellena todo los datos que tengan *');
        })
    };

    const handleDisabled = () => {
        return user['tec-user'].perfil.nivel_acceso.nombre === 'local'
    }

    return (
        <Container className='mt-5'>
            <h5 className='mt-5'>Creando un rodillo nuevo</h5>
            <Form >
                <Row>
                <Form.Group controlId="nombre">
                    <Form.Label>Nombre del rodillo *</Form.Label>
                    <Form.Control type="text" 
                                name='nombre' 
                                value={datos.nombre}
                                onChange={handleInputChange} 
                                placeholder="Rodillo"
                                autoFocus
                    />
                </Form.Group>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa *</Form.Label>
                            <Form.Control as="select"  
                                        name='empresa' 
                                        value={datos.empresa}
                                        onChange={handleInputChange}
                                        disabled={handleDisabled()}
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
                            <Form.Label>Zona *</Form.Label>
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
                            <Form.Label>Seccion *</Form.Label>
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
                        <Form.Group controlId="operacion">
                            <Form.Label>Operación *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.operacion}
                                            name='operacion'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                {operaciones && operaciones.map( operacion => {
                                    return (
                                    <option key={operacion.id} value={operacion.id}>
                                        {operacion.nombre}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="tipo_rodillo">
                            <Form.Label>Tipo de Rodillo *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.tipo_rodillo}
                                            name='tipo_rodillo'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                {tipo_rodillo && tipo_rodillo.map( tipo => {
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
                        <Form.Group controlId="material">
                            <Form.Label>Tipo de Material *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.material}
                                            name='material'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                {materiales && materiales.map( material => {
                                    return (
                                    <option key={material.id} value={material.id}>
                                        {material.nombre}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="grupo">
                            <Form.Label>Grupo al que pertenece</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.grupo}
                                            name='grupo'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                {grupos && grupos.map( grupo => {
                                    return (
                                    <option key={grupo.id} value={grupo.id}>
                                        {grupo.nombre}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="tipo_plano">
                            <Form.Label>Tipo de plano</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.tipo_plano}
                                            name='tipo_plano'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                {tipo_plano && tipo_plano.map( tipo => {
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
            </Form>
            <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
            {rodillo.length===0?<Button variant="outline-primary" onClick={GuardarRodillo}>Guardar</Button>:<Button variant="outline-primary" onClick={ActualizarRodillo}>Actualizar</Button>}
        </Container>
    );
}
export default RodRodilloForm;