import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import StandChart from "./qs_stand_chart";
import FlowerChart from "./qs_flor_chart";
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';

const montaje = [
    {
        operacion: 1,
        color: 'blue',
        tipo: 'BD',
        nombre: 'BD-I',
        rodillos: [
            {
                tipo_plano: 'BD_INF',
                parametros: {
                    Ancho: 760,
                    Dext: 620,
                    Df: 300,
                    R: 480,
                    alfa: 90
                }
            },
            {
                tipo_plano: 'BD_SUP',
                parametros: {
                    Ancho: 650,
                    Dext: 740,
                    R: 461
                }
            }
        ]
    },
    {
        operacion: 2,
        color: 'magenta',
        tipo: 'BD',
        nombre: 'BD-II',
        rodillos: [
            {
                tipo_plano: 'BD_INF',
                parametros: {
                    Ancho: 660,
                    Dext: 740,
                    Df: 300,
                    R: 300,
                    alfa: 120
                }
            },
            {
                tipo_plano: 'BD_SUP',
                parametros: {
                    Ancho: 520,
                    Dext: 740,
                    R: 281
                }
            }
        ]   
    },
    {
        operacion: 4,
        color: 'red',
        tipo: 'FP',
        nombre: 'FP-I',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                parametros: {
                    Ancho: 290,
                    Dext: 525.608,
                    Df: 300,
                    Dc: 529.608,
                    R1: 91.66,
                    alfa1: 120,
                    R2: 135.948,
                    alfa2: 30,
                    R3: 407.845,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                parametros: {
                    Ancho: 290,
                    Dext: 517.24,
                    Df: 300,
                    Dc: 521.24,
                    R1: 0,
                    alfa1: 0,
                    R2: 135.948,
                    alfa2: 53.74,
                    R3: 407.845,
                    alfa3: 10.612,
                    Cuchilla: 84.1,
                    D_cuchilla: 332
                },

            }
        ]   
    },
    {
        operacion: 5,
        color: 'green',
        tipo: 'FP',
        nombre: 'FP-II',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                parametros: {
                    Ancho: 290,
                    Dext: 510.482,
                    Df: 300,
                    Dc: 514.482,
                    R1: 96.082,
                    alfa1: 120,
                    R2: 116.4,
                    alfa2: 30,
                    R3: 349.201,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                parametros: {
                    Ancho: 290,
                    Dext: 502.12,
                    Df: 300,
                    Dc: 506.12,
                    R1: 96.08,
                    alfa1: 60,
                    R2: 116.4,
                    alfa2: 30,
                    R3: 349.2,
                    alfa3: 11.584,
                    Cuchilla: 56.06,
                    D_cuchilla: 326
                },
                
            }
        ]   
    },
    {
        operacion: 6,
        color: 'orange',
        tipo: 'FP',
        nombre: 'FP-III',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                parametros: {
                    Ancho: 290,
                    Dext: 491.904,
                    Df: 300,
                    Dc: 495.904,
                    R1: 100.925,
                    alfa1: 120,
                    R2: 92.979,
                    alfa2: 30,
                    R3: 278.936,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                parametros: {
                    Ancho: 290,
                    Dext: 489.95,
                    Df: 300,
                    Dc: 493.95,
                    R1: 100.925,
                    alfa1: 60,
                    R2: 92.979,
                    alfa2: 30,
                    R3: 278.936,
                    alfa3: 13.262,
                    Cuchilla: 13.76,
                    D_cuchilla: 326
                }
            }
        ]   
    },
    {
        operacion: 7,
        color: 'lime',
        tipo: 'W',
        nombre: 'Welding',
        rodillos: [
            {
                tipo_plano: 'W_Lat',
                parametros: {
                    Ancho: 210,
                    Df: 335,
                    R1: 96.05,
                    alfa1: 120,
                    R2: 3,
                    alfa2: 7,
                    C: 3
                }
            },
            {
                tipo_plano: 'W_Lat',
                parametros: {
                    Ancho: 210,
                    Df: 335,
                    R1: 96.05,
                    alfa1: 120,
                    R2: 3,
                    alfa2: 7,
                    C: 3
                }
            },
            {
                tipo_plano: 'W_Inf',
                parametros: {
                    Ancho: 140,
                    Df: 350,
                    R1: 96.05,
                    alfa1: 60,
                    R2: 3,
                    alfa2: 7,
                    C: 3
                }
            }
        ]
    }
]

// const ejes = [{op:1, pos: [174, 343.57]},
//               {op:2, pos: [177.91, 340.49]},
//               {op:4, pos: [207.01, 201.08]},
//               {op:5, pos: [206.43, 197.73]},
//               {op:6, pos: [201.79, 187.88]},
//               {op:7, pos: [255.65, 255.65, 263.15]}
//             ]; 
const fleje = {
    espesor: 3,
    ancho: 595,
    calidad: 'S350',
    color: 'aqua'
}

const QS_Grafico = () => {
    const [token] = useCookies(['tec-token']);

    const [OP, setOP] = useState(1);
    const [ejes, setEjes] = useState(null);
    const [posiciones, setPosiciones] = useState({});

    const handleInputChange = (event) => {
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
                        <Button variant="info" type="submit" className={'mx-2'} onClick={leerEjes}>Leer</Button>
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