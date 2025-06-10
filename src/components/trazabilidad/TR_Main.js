import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Container, Button, Row, Col, Form, Modal, Table} from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import TR_NavBar from "./TR_NabBar";
import ResetAcu from "./TR_ResetAcu";

const TR_Main = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [empresas, setEmpresas] = useState(null);
    const [empresa, setEmpresa] = useState(user['tec-user'].perfil.empresa.id);
    const [acumuladores, setAcumuladores] = useState(null);
    const [acuId, setAcuId] = useState(null);
    const [acumulador, setAcumulador] = useState(null);
    
    const [flejesDB, setFlejesDB] = useState(null);

    useEffect(()=>{
         axios.get(BACKEND_SERVER + `/api/estructura/empresa`,{ 
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            console.log(res.data);
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
            // console.log(res.data);
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
            if (acumulador.of_activa) {
                leerFlejesTecnicoDB();
            }
            else {
                leerFlejesProduccionDB();
            }
        }
    },[acumulador,])

    const handleEmpresaChange = (event) => {
        setEmpresa(event.target.value);
        setAcumulador(null);
        setAcuId(null);
    }

    const handleAcuChange = (event) => {
        setAcuId(event.target.value);
        setFlejesDB(null);
    }

    const leerFlejesTecnicoDB = () => {
        axios.get(BACKEND_SERVER + `/api/trazabilidad/flejes`,{ 
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            console.log(res.data);
        })
        .catch( err => {
            console.log(err);
        });
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

    return (
            <React.Fragment>
                <TR_NavBar/>
                <Container fluid>
                    <Form>
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
                            <Col md={4}>
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
                        </Row>
                        <Row>
                            <Col>
                                {acumulador?(acumulador.n_bobina_activa?
                                <React.Fragment>
                                    Hay datos: Poner un formulario con los datos actuales de acumulador
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