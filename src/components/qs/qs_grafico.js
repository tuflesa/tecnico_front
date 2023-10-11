import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import StandChart from "./qs_stand_chart";
import FlowerChart from "./qs_flor_chart";
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';
import QSNavBar from "./qs_nav";
import {montaje, fleje} from './Grupo_164FF';

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
    const [posiciones, SetPosiciones] = useState(null);
    const [gap, setGap] = useState(null);
    const [simulador, setSimulador] = useState(false);
    const [ejesSim, setEjesSim] = useState(null);
    const [datos, setDatos] = useState(null);

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
                setEjesSim(JSON.parse(JSON.stringify(res.data)));
        })
    },[token]);

    useEffect(()=>{
        const pos = [];
        let eje_sup;
        let eje_inf;
        let Ds;
        let Di;
        let gap;
        let piston;
        const gap_list = [];
        if (ejes && ejesSim && montaje){
            // Calculo de posiciones
            montaje.map(m => {
                const line = [];
                m.rodillos.map((r,i) =>{
                    line.push({
                        eje: r.eje,
                        pos: -r.parametros.Df/2 + ejes[m.operacion-1].pos[r.eje],
                        pos_sim: -r.parametros.Df/2 + ejesSim[m.operacion-1].pos[r.eje]
                    });
                });
                pos.push({
                    op: m.operacion,
                    posiciones: line
                });
                // Calculo del gap y amortiguación entre rodillos
                switch (m.tipo.slice(0,2)) {
                    case 'BD':
                        piston = 60;
                        eje_inf = simulador ? ejesSim[m.operacion-1].pos['INF'] : ejes[m.operacion-1].pos['INF'];
                        eje_sup = simulador ? ejesSim[m.operacion-1].pos['SUP'] : ejes[m.operacion-1].pos['SUP'];
                        Di = m.rodillos.filter(r => r.eje == 'INF')[0].parametros['Df'];
                        Ds = m.rodillos.filter(r => r.eje == 'SUP')[0].parametros['Df'];
                        gap = eje_sup + eje_inf - (Ds + Di)/2;
                        if (gap < fleje.espesor) {
                            piston = 60 - fleje.espesor + gap;
                            gap = fleje.espesor;
                        }
                        break;
                    case 'FP':
                        piston = null;
                        eje_inf = simulador ? ejesSim[m.operacion-1].pos['INF'] : ejes[m.operacion-1].pos['INF'];
                        eje_sup = simulador ? ejesSim[m.operacion-1].pos['SUP'] : ejes[m.operacion-1].pos['SUP'];
                        Di = m.rodillos.filter(r => r.eje == 'INF')[0].parametros['Dext'];
                        Ds = m.rodillos.filter(r => r.eje == 'SUP')[0].parametros['Dext'];
                        gap = eje_sup + eje_inf - (Ds + Di)/2;
                        break;
                    default:
                        gap = null;
                        piston = null;
                        break;
                }
                gap_list.push({
                    op: m.operacion,
                    gap: gap,
                    piston: piston
                });
            });
            SetPosiciones(pos);
            setGap(gap_list);
        }
    },[montaje, ejes, ejesSim, simulador]);

    useEffect(()=>{
        if (simulador) {
            const dat = {};
            posiciones.filter(p => p.op == OP)[0].posiciones.map(p => {
                dat[p.eje] =  parseFloat(p.pos_sim).toFixed(2);
            });
            setDatos(dat);
        }
    }, [simulador, OP]);

    const handleDataChange = (event) => {
        event.preventDefault();
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        });
    }

    const simular = (event) => {
        event.preventDefault();
        const temp = [...ejesSim];
        montaje.filter(m => m.operacion == OP)[0].rodillos.map( r => {
            const Df = r.parametros['Df'];
            temp[OP-1].pos[r.eje] = parseFloat(datos[r.eje]) + Df/2; 
        });
        setEjesSim(temp);
    }

return (
        <React.Fragment>
            <QSNavBar/>
            <Container>
                <Row>
                    <Form>
                        <Row>
                            <Col>
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
                            </Col>
                            <Col>            
                                <Form.Check // prettier-ignore
                                        type="switch"
                                        id="custom-switch"
                                        label="Simulador"
                                        onClick={(event) => {
                                            // event.preventDefault();
                                            setSimulador(event.target.checked);
                                        }}
                                />
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row>
                    <Col className="col-6">
                        <StandChart montaje={montaje.filter(m => m.operacion == OP)}
                                    ejes={simulador ? ejesSim&&ejesSim.filter(e => e.op == OP)[0].pos : ejes&&ejes.filter(e => e.op == OP)[0].pos}
                                    posiciones={posiciones&&posiciones.filter(p => p.op==OP)[0].posiciones}
                                    simulador={simulador}
                                    gap = {gap&&gap.filter(g => g.op == OP)}
                                    fleje={fleje}/>  
                                    
                                     
                    </Col>
                    <Col className="col-6">
                        <FlowerChart montaje={montaje}
                                     ejes={simulador ? ejesSim : ejes}
                                     fleje={fleje}/>
                    </Col>
                </Row> 
                <Form>
                    <Row>
                        <Col className="col-6">
                            <Row>
                                {simulador&&posiciones&&posiciones.filter(p => p.op==OP)[0].posiciones.map((p,i) => {
                                    return (
                                        <Col  key={i} className="col-3">
                                            <Form.Group controlId={p.eje}>
                                                <Form.Label>{p.eje}</Form.Label>
                                                <Form.Control type="number" 
                                                            name={p.eje} 
                                                            value={datos&&datos[p.eje]}
                                                            onChange={handleDataChange} 
                                                            placeholder= {p.eje}
                                                            autoFocus
                                                    />
                                            </Form.Group>
                                        </Col>
                                    )
                                })}
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="col-6">
                            {simulador ?  <Button variant="info" type="submit" className={'mx-2'} onClick={simular}>Simular</Button>
                                            : 
                                          <Button variant="info" type="submit" className={'mx-2'} onClick={leerEjes}>Leer</Button>}
                        </Col>
                    </Row>
                </Form>
            </Container>
        </React.Fragment>
    )
}

export default QS_Grafico;