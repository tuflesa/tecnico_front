import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import StandChart from "./qs_stand_chart";
import FlowerChart from "./qs_flor_chart";
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';
import {montaje, fleje} from './Grupo_90';

// const ejes = [{op:1, pos: [174, 343.57]},
//               {op:2, pos: [177.91, 340.49]},
//               {op:4, pos: [207.01, 201.08]},
//               {op:5, pos: [206.43, 197.73]},
//               {op:6, pos: [201.79, 187.88]},
//               {op:7, pos: [255.65, 255.65, 263.15]}
//             ]; 

const QS_Grafico = () => {
    const [token] = useCookies(['tec-token']);

    const [OP, setOP] = useState(1);
    const [ejes, setEjes] = useState(null);
    const [simulador, setSimulador] = useState(false);

    const handleInputChange = (event) => {
        event.preventDefault();
        setOP(event.target.value);
    }


    const leerEjes = (event) => {
        event.preventDefault();
        axios.get(BACKEND_SERVER + '/api/qs/ejes/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
                setEjes(res.data);
        })
    }


    useEffect(()=>{
        axios.get(BACKEND_SERVER + '/api/qs/ejes/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
                setEjes(res.data);
                console.log(res.data);
        })
    },[token]);

return (
        <React.Fragment>
            <Container>
                <Row>
                    <Form>
                        <Form.Group controlId="operacion">
                            <Form.Control as="select" 
                                            value={OP}
                                            name='operacion'
                                            onChange={handleInputChange}>
                                {montaje && montaje.map( m => {
                                    return (
                                    <option key={m.operacion} value={m.operacion}>
                                        {m.nombre}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                        <Form.Check // prettier-ignore
                                type="switch"
                                id="custom-switch"
                                label="Simulador"
                                onClick={(event) => {
                                    // event.preventDefault();
                                    setSimulador(event.target.checked);
                                }}
                            />
                        {simulador ? <Button variant="info" type="submit" className={'mx-2'} onClick={null}>Simular</Button> : <Button variant="info" type="submit" className={'mx-2'} onClick={leerEjes}>Leer</Button>}
                    </Form>
                </Row>
                <Row>
                    <Col className="col-6">
                        <StandChart montaje={montaje.filter(m => m.operacion == OP)}
                                    ejes={ejes&&ejes.filter(e => e.op == OP)[0].pos}
                                    fleje={fleje}/>   
                    </Col>
                    <Col className="col-6">
                        <FlowerChart montaje={montaje}
                                     ejes={ejes}
                                     fleje={fleje}/>
                    </Col>
                </Row> 
            </Container>
        </React.Fragment>
    )
}

export default QS_Grafico;