import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import StandChart from "./qs_stand_chart";
import FlowerChart from "./qs_flor_chart";
import HeightChart from "./qs_height_chart";
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';
import QSNavBar from "./qs_nav";
import {montaje, fleje} from './Grupo_164FF_W';

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
    const [alturas, setAlturas] = useState(null);
    const [gap, setGap] = useState(null);
    const [desarrollos, setDesarrollos] = useState(null);
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

    const leerPC = (event) => {
        event.preventDefault();
        axios.get(BACKEND_SERVER + '/api/qs/pc/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
                console.log(res.data);
                console.log(ejesSim);
        })
    }

    const calcula_desarrollos = () => {
        const crecimiento = 0.863428+2.255361*fleje.espesor;
        const des = [];

        // cuchillas
        // const Desarrollo = R1*alfa1 + 2*R2*((Math.PI-alfa1)/2 - alfa3) + 2*R4*(2*alfa3) + 2*R2_s*(alfa2_s-alfa3_s) + 2*R1_s*(alfa1_s/2-alfa_c);
        const cuchillas = montaje.filter(m => m.tipo == 'FP');
        cuchillas&&ejes&&ejesSim&&cuchillas.map(c => {
            const roll_i = c.rodillos[0];
            const roll_s = c.rodillos[1];
            let AxisPos0_i, AxisPos0_s
            if (simulador) {
                AxisPos0_i = ejesSim.filter(e => e.op == c.operacion)[0].pos['INF'];
                AxisPos0_s = ejesSim.filter(e => e.op == c.operacion)[0].pos['SUP'];
            }
            else {
                AxisPos0_i = ejes.filter(e => e.op == c.operacion)[0].pos['INF'];
                AxisPos0_s = ejes.filter(e => e.op == c.operacion)[0].pos['SUP'];
            }
            // Parametros
            const R1 = roll_i.parametros.R1;
            const R2 = roll_i.parametros.R2;
            const alfa1 = roll_i.parametros.alfa1 * Math.PI / 180;
            const alfa3 = roll_i.parametros.alfa3 * Math.PI / 180;
            const R1_s = roll_s.parametros.R1;
            const R2_s = roll_s.parametros.R2;
            const alfa1_s = roll_s.parametros.alfa1 * Math.PI / 180;
            const alfa2_s = roll_s.parametros.alfa2 * Math.PI / 180;
            const alfa3_s = roll_s.parametros.alfa3 * Math.PI / 180;
            const C = roll_s.parametros.Cuchilla;
            const Dc_i = roll_i.parametros.Dc;
            const Dc_s = roll_s.parametros.Dc;
            const Df_i = roll_i.parametros.Df;

            // Calculos
            const pos_i = -AxisPos0_i + Df_i / 2;
            const ycr = ((AxisPos0_s - Dc_s/2) + (-AxisPos0_i + Dc_i/2)) / 2;
            const yc = pos_i + R1;
            const xc2 = (R2-R1) * Math.sin(alfa1/2);
            const yc2 = yc + (R2-R1) * Math.cos(alfa1/2);
            const x3 = xc2 - R2 * Math.cos(alfa3);
            const y3 = yc2 - R2 * Math.sin(alfa3);
            const xcr = x3 + (1/Math.tan(alfa3)) * (ycr - y3);
            const R4 = Math.sqrt(Math.pow(x3-xcr,2)+Math.pow(y3 - ycr,2));
            let alfa_c = 0;
             if (R1_s != 0) {
                alfa_c = Math.asin(C/(2*R1_s));
             }

            const Desarrollo = R1*alfa1 + 2*R2*((Math.PI-alfa1)/2 - alfa3) + 2*R4*(2*alfa3) + 2*R2_s*(alfa2_s-alfa3_s) + 2*R1_s*(alfa1_s/2-alfa_c);
            des.push(Desarrollo);
        });
        setDesarrollos({
            ...desarrollos,
            'Desarrollo': fleje.ancho,
            'Lineal': fleje.ancho + crecimiento,
            'FP1': des[0],
            'FP2': des[1],
            'FP3': des[2]
        });
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
        const H =[{nombre: 'MIN',
                   color:'red', 
                   puntos:[{x: 0, y:0, OP: 0, nombre: 'ET'}, {x:1590, y:10, OP:1, nombre: 'BD1'}, {x:2760, y:20, OP:2, nombre: 'BD2'}, {x:6320, y:30, OP:4, nombre: 'FP1'},{x:7570, y:40, OP:5, nombre: 'FP2'},{x:8820, y:50, OP:6, nombre: 'FP3'}, {x:10070, y:40, OP:7, nombre: 'W'}]
                  }, 
                  {nombre: 'MAX',
                   color: 'blue',
                   puntos:[{x: 0, y:0, OP: 0, nombre: 'ET'}, {x:1590, y:-10, OP:1, nombre: 'BD1'}, {x:2760, y:-20, OP:2, nombre: 'BD2'}, {x:6320, y:-30, OP:4, nombre: 'FP1'},{x:7570, y:-40, OP:5, nombre: 'FP2'},{x:8820, y:-50, OP:6, nombre: 'FP3'}]
                }];

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
                // Calculo de alturas
                switch (m.tipo) {
                    case 'BD':
                        H.map( h => {
                            let y,q;
                            if (h.nombre == 'MIN'){
                                if (simulador) y = -pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos_sim;
                                else y = -pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;

                                h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                            }
                            else {
                                const roll = m.rodillos[0]; // Solo usamos el rodillo interior
                                const Df = roll.parametros.Df;
                                const R = roll.parametros.R;
                                let alfa = roll.parametros.alfa * Math.PI / 180;
                                let L; // longitud de fleje fuera del radio (tramo recto)
                                if (R * alfa > fleje.ancho) {
                                    alfa = fleje.ancho / R;
                                    L = 0;
                                    
                                }
                                else {
                                    L = fleje.ancho - R * alfa;
                                }
                                
                                if (simulador) q = pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos_sim;
                                else q = pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;

                                y = R * (1 - Math.cos(alfa/2)) + (L/2) * Math.sin(alfa/2) - q;
                                h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                            }
                        });
                        break;
                    case 'BD_W':
                        H.map( h => {
                            let y;
                            if (h.nombre == 'MIN'){
                                if (simulador) y = -pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos_sim;
                                else y = -pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;

                                h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                            }
                            else {
                                const roll = m.rodillos[0];
                                const R1 = roll.parametros.R1;
                                let alfa1 = roll.parametros.alfa1 * Math.PI / 180;
                                const R2 = roll.parametros.R2;
                                let alfa2 = roll.parametros.alfa2 * Math.PI / 180;
                                const Df = roll.parametros.Df;
                                const Dc = roll.parametros.Dc;
                                // Calculos
                                let q; // Posición del rodillo inferior
                                if (simulador) q = -pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos_sim;
                                else q = -pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                                const xc1 = - roll.parametros.xc1;
                                const yc1 = q + R1;
                                const xc2 = 0;
                                const yc2 = (Dc-Df)/2 - R2 + q;
                                const x0 = xc1 + R1 * Math.sin(alfa2);
                                const y0 = yc1 - R1 * Math.cos(alfa2);
                                const x1 = xc2 - R2 * Math.sin(alfa2);
                                const y1 = yc2 + R2 * Math.cos(alfa2);

                                // longitud de fleje fuera del radio (tramo recto)
                                const d1 = 2* Math.sqrt(Math.pow((x0-x1),2)+Math.pow((y0-y1),2)); // Tramo recto entre radios
                                const d2 = R2 * 2 * alfa2; // Longitud tramo central
                                const d3 = 2 * R1 * alfa2; 
                                const d4 = 2 * R1 * alfa1;
                                const d5 = d1 + d2 + d3 + d4;

                                let L; 
                                if (d5 > fleje.ancho) {
                                    alfa1 = alfa1 - (d5 - fleje.ancho)/(2*R1);
                                    L = 0;
                                    
                                }
                                else {
                                    L = fleje.ancho - d5;
                                }
                                y = yc1 - R1*Math.cos(alfa1);
                                
                                h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                            }
                        });
                        break;
                    case 'BD_2R':
                        H.map( h => {
                            let y;
                            if (h.nombre == 'MIN'){
                                if (simulador) y = -pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos_sim;
                                else y = -pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;

                                h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                            }
                            else {
                                const roll = m.rodillos[0]; // Solo usamos el rodillo interior
                                const R1 = roll.parametros.R1;
                                let alfa1 = roll.parametros.alfa1 * Math.PI / 180;
                                const R2 = roll.parametros.R2;
                                let alfa2 = roll.parametros.alfa2 * Math.PI / 180;
                                const R3 = roll.parametros.R3;
                                const Df = roll.parametros.Df;
                                // Calculos
                                const xc1 = 0;
                                let q;
                                if (simulador) q = -pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos_sim;
                                else q = -pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                                const yc1 = q + R1;
                                const xc2 = (R1-R2) * Math.sin(alfa1/2);
                                const yc2 = yc1 - (R1-R2) * Math.cos(alfa1/2);
                                const xc3 = xc2 - (R3-R2) * Math.sin(alfa2);
                                const yc3 = yc2 + (R3-R2) * Math.cos(alfa2);

                                // longitud de fleje fuera del radio (tramo recto)
                                const d1 = R1 * alfa1; // Longitud tramo central
                                const d2 = 2 * R2 * alfa2;
                                const d3 = d1 + d2;

                                let alfa3 = 0;
                                if (d3 > fleje.ancho) {
                                    alfa2 = (d3 - fleje.ancho)/(2*R2);
                                }
                                else {
                                    alfa3 = (fleje.ancho - d3)/(2*R3);
                                }
                                
                                y = yc3 - R3 * Math.cos(alfa2+alfa3);
                                h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                            }
                        });
                        break;    
                    case 'W':
                        let y;
                        if (simulador) y = -pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos_sim;
                        else y = -pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;

                        H.filter( h => h.nombre == 'MIN')[0].puntos.filter(q => q.OP == m.operacion)[0].y = y;
                        break;
                    case 'FP':
                        H.map( h => {
                            let y;
                            if (h.nombre == 'MIN'){
                                if (simulador) y = -pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos_sim;
                                else y = -pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'INF')[0].pos;
                            }
                            else {
                                if (simulador) y = pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'SUP')[0].pos_sim;
                                else y = pos.filter( p => p.op == m.operacion)[0].posiciones.filter(p => p.eje == 'SUP')[0].pos;
                            }
                            h.puntos.filter(p => p.OP == m.operacion)[0].y = y;
                        });
                        break;
                }
            });
            SetPosiciones(pos);
            setGap(gap_list);
            setAlturas(H);
            calcula_desarrollos();
        }
    },[montaje, fleje, ejes, ejesSim, simulador]);

    useEffect(()=>{
        console.log(desarrollos);
    },[desarrollos]);

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
                                     fleje={fleje}
                                     desarrollos={desarrollos}
                                     setDesarrollos={setDesarrollos}/>
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
                        <Col className="col-12">
                            <HeightChart alturas={alturas}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="col-6">
                            {simulador ?  <React.Fragment>
                                            <Button variant="info" type="submit" className={'mx-2'} onClick={simular}>Simular</Button>
                                            <Button variant="info" type="submit" className={'mx-2'} onClick={leerPC}>Leer PC</Button>
                                          </React.Fragment>    
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