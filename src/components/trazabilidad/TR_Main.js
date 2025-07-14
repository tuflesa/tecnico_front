import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Container, Button, Row, Col, Form, Modal, Table} from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import useInterval from '../utilidades/use_interval';
import { BACKEND_SERVER } from '../../constantes';
import TR_NavBar from "./TR_NabBar";
import ResetAcu from "./TR_ResetAcu";
import FlejesAcu from "./TR_FlejesAcu";

const TR_Main = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [empresas, setEmpresas] = useState(null);
    const [empresa, setEmpresa] = useState(user['tec-user'].perfil.empresa.id);
    const [acumuladores, setAcumuladores] = useState(null);
    const [acuId, setAcuId] = useState(null);
    const [acumulador, setAcumulador] = useState(null);
    const [filtro, setFiltro] = useState({
        of: null,
        finalizado: 'False'
    });
    const [PLC_status, setPLC_status] = useState(null);
    const [flejesDB, setFlejesDB] = useState(null); // Flejes de la base de datos de producción
    const [flejesAcumulador, setFlejesAcumulador] = useState(null);

    useEffect(()=>{
         axios.get(BACKEND_SERVER + `/api/estructura/empresa`,{ 
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            // console.log(res.data);
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    },[token]);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/trazabilidad/acumuladores/?zona__empresa__id=${empresa}`,{ 
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            // console.log(acumulador);
            setAcumuladores(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    },[token, empresa]);

    useEffect(()=>{
        console.log('datos acumulador', acuId)
        if(acuId){
            const acu = acumuladores.filter(a => a.id==acuId)[0];
            console.log('acu', acu);
            if (acu) {
                setAcumulador(acu);
            }
            else {
                 setAcumulador(null);
            }
        }
    },[acuId]);

    useEffect(()=>{
        if (acumulador) {
            console.log('acumulador',acumulador);
            if (acumulador.of_activa) {
                leerFlejesTecnicoDB();
                // leerEstadoPLC();
                setFiltro({
                    ...filtro,
                    of: acumulador.of_activa
                })
            }
            else {
                leerFlejesProduccionDB();
            }
        }
    },[acumulador])

    useEffect(()=>{
        // console.log('filtro. ', filtro);
        leerFlejesTecnicoDB()
    },[filtro]);

    // useEffect(()=>{
    //     if (flejesAcumulador && acumulador && flejesAcumulador.length>0) {
    //         if (acumulador.of_activa != flejesAcumulador[0].of) {
    //             console.log('Cambio de of ...');
    //             axios.get(BACKEND_SERVER + `/api/trazabilidad/acumuladores/${acuId}`,{ 
    //                 headers: {
    //                     'Authorization': `token ${token['tec-token']}`
    //                 }
    //             })
    //             .then( res => { 
    //                 setAcumulador(res.data);
    //             })
    //             .catch( err => {
    //                 console.log(err);
    //             });
    //         }
    //     }
    // }, [flejesAcumulador]);

    useEffect(()=>{
        if (PLC_status) {
            if(PLC_status.fleje_actual.of != acumulador.of_activa) {
                console.log('cambio de of');
                console.log('PLC of activa: ', PLC_status.fleje_actual.of);
                console.log('Acumulador of activa: ', acumulador.of_activa);
                axios.get(BACKEND_SERVER + `/api/trazabilidad/acumuladores/${acumulador.id}`,{ 
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then( res => {
                    // console.log(acumulador);
                    setAcumulador(res.data);
                })
                .catch( err => {
                    console.log(err);
                });
            }
            else console.log('misma of');
        }
    },[PLC_status]);

    const handleEmpresaChange = (event) => {
        setEmpresa(event.target.value);
        setAcumulador(null);
        setAcuId(null);
    }

    const handleAcuChange = (event) => {
        setAcuId(event.target.value);
        setFlejesDB(null);
    }

    const handleOFChange = (event) => {
        setFiltro({
            ...filtro,
            of : event.target.value
        });
    }

    const handleFinChange = (event) => {
        setFiltro({
            ...filtro,
            finalizado : event.target.value
        });
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        leerFlejesTecnicoDB();
    }

    const leerFlejesTecnicoDB = () => {
        // console.log('lee tecnico DB');
        // console.log('acu', acumulador);
        // console.log('filtro: ', filtro);
        acumulador&&axios.get(BACKEND_SERVER + `/api/trazabilidad/flejesLista/?acumulador=${acumulador.id}&finalizada=${filtro.finalizado}&of=${filtro.of}`,{ 
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            const flejes_OF_actual = res.data.filter(f => f.of == acumulador.of_activa).sort((a, b) => a.pos - b.pos);
            const flejes_OF_next = res.data.filter(f => f.of != acumulador.of_activa).sort((a, b) => a.pos - b.pos);
            // console.log('Flejes: ', flejes_OF_actual.concat(flejes_OF_next));
            setFlejesAcumulador(flejes_OF_actual.concat(flejes_OF_next));
        })
        .catch( err => {
            console.log(err);
        });
        leerEstadoPLC();
    }

    const leerFlejesProduccionDB = () => {
        axios.get(BACKEND_SERVER + `/api/trazabilidad/leerFlejesProduccionDB`,{ 
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            // console.log(res.data);
            const flejes = res.data.filter(f => f.maquina_siglas == acumulador.maquina_siglas).sort((a, b) => a.pos - b.pos);;
            // console.log(flejes);
            setFlejesDB(flejes);
        })
        .catch( err => {
            console.log(err);
        });
    }

    const leerEstadoPLC = () => {
        acumulador&&axios.get(BACKEND_SERVER + `/api/trazabilidad/leerEstadoPLC/?acu_id=${acumulador.id}`,{ 
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            // console.log(res.data);
            setPLC_status(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }

    useInterval(leerFlejesTecnicoDB, 10000);

    return (
            <React.Fragment>
                <TR_NavBar/>
                <Container fluid>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={3}>
                                <Form.Group controlId="empresa">
                                    <Form.Label>Empresa</Form.Label>
                                    <Form.Control   size="lg"
                                                    as="select" 
                                                    value={empresa}
                                                    name='empresa'
                                                    onChange={handleEmpresaChange}>
                                                        {empresas && empresas.map( e => {
                                                            return (
                                                            <option key={e.id} value={e.id}>
                                                                {e.nombre}
                                                            </option>
                                                            )
                                                        })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId="maquina">
                                    <Form.Label>Maquina</Form.Label>
                                    <Form.Control   size="lg"
                                                    as="select" 
                                                    value={acuId}
                                                    name='acumulador'
                                                    onChange={handleAcuChange}>
                                                        <option key={0} value={0}> Ninguna </option>
                                                        {acumuladores && acumuladores.map( acc => {
                                                            return (
                                                            <option key={acc.id} value={acc.id}>
                                                                {acc.nombre}
                                                            </option>
                                                            )
                                                        })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId="of">
                                    <Form.Label>OF *</Form.Label>
                                    <Form.Control type="text"  
                                                size="lg"
                                                name='of' 
                                                value={filtro.of}
                                                onChange={handleOFChange}> 
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="Finalizado">
                                    <Form.Label>Finalizado</Form.Label>
                                    <Form.Control   size="lg"
                                                    as="select" 
                                                    value={filtro.finalizado}
                                                    name='finalizado'
                                                    onChange={handleFinChange}>
                                                        <option key={0} value={'False'}> No </option>
                                                        <option key={1} value={'True'}> Si </option>
                                                        <option key={2} value={''}> Todos </option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {acumulador?(acumulador.n_bobina_activa?
                                <React.Fragment>
                                    <h4>OF ACTUAL: {PLC_status&&PLC_status.fleje_actual.of}</h4>
                                    <FlejesAcu 
                                        Flejes = {flejesAcumulador}
                                    />
                                </React.Fragment>:
                                <React.Fragment>
                                    <ResetAcu 
                                        Acumulador = {acumulador}
                                        setAcumulador={setAcumulador}
                                        Flejes = {flejesDB}
                                    />
                                </React.Fragment>):''}
                            </Col>
                        </Row>
                    </Form>
                </Container>
            </React.Fragment>
    )
}

export default TR_Main