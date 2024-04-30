import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const EquipoForm = ({show, repuesto_id, handleCloseEquipo, equiposAsignados, updateRepuesto}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [datos, setDatos] = useState({
        empresa: user['tec-user'].perfil.empresa.id,
        zona: '',
        seccion: '',
        equipo: ''
    });
    const [guardarDisabled, setGuardarDisabled] = useState(true);
    const [empresas, setEmpresas] = useState(null);
    const [zonas, setZonas] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [listaAsignados, setListaAsignados] = useState([]);

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

    /* eslint-disable react-hooks/exhaustive-deps */
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
                const equiposDisponibles = res.data.filter(e => {return !listaAsignados.includes(e.id)});
                setEquipos(equiposDisponibles);
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
    /* eslint-disable react-hooks/exhaustive-deps */

    useEffect(() =>{
        setGuardarDisabled(datos.equipo === '');
    }, [token, datos.equipo]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleDisabled = () => {
        return user['tec-user'].perfil.nivel_acceso.nombre === 'local'
    }

    useEffect(() =>{
        let equiposAsignadosID = [];
        equiposAsignados && equiposAsignados.forEach(e => {
            equiposAsignadosID.push(e.id);
        });
        setListaAsignados(equiposAsignadosID);
    }, [equiposAsignados]);

    const handlerCancelar = () => {
        setDatos({
            empresa: user['tec-user'].perfil.empresa.id,
            zona: '',
            seccion: '',
            equipo: ''
        });
        handleCloseEquipo();
    }
    
    const handlerGuardar = () => {
        const newEquipos = [...listaAsignados, parseInt(datos.equipo)];
        axios.patch(BACKEND_SERVER + `/api/repuestos/lista/${repuesto_id}/`, {
            equipos: newEquipos
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
                updateRepuesto();
                handlerCancelar();
            }
        )
        .catch(err => { console.log(err);});
    }

    return (
        <Modal show={show} onHide={handleCloseEquipo} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header>
                    <Modal.Title>Añadir equipo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form >
                            <Row>
                                <Col>
                                    <Form.Group controlId="empresa">
                                        <Form.Label>Empresa</Form.Label>
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
                            </Row>
                            <Row>
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
                            </Row>
                            <Row>
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
                            </Row>
                            <Row>
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
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="info" 
                        onClick={handlerGuardar}
                        disabled={guardarDisabled}>
                        Guardar
                    </Button>
                    <Button variant="waring" onClick={handlerCancelar}>
                        Cancelar
                    </Button>
                </Modal.Footer>
        </Modal>
    );
}

export default EquipoForm;