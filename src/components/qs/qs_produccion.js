import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Container, Row, Col, Form} from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import QSNavBar from "./qs_nav";
import StandChart from "./qs_stand_chart";

const QS_Produccion = () => {
    const [token] = useCookies(['tec-token']);
    const [grupos, setGrupos] = useState(null);
    const [grupo, setGrupo] = useState(0);
    const [montajes, setMontajes] = useState(null);
    const [montaje, setMontaje] = useState(null);
    const [montajeActivo, setMontajeActivo] = useState(0);
    const [OP, setOP] = useState(1);
    const [ejes, setEjes] = useState(null);
    const [posiciones, SetPosiciones] = useState(null);

    const leerEjes = (event) => {
        // event.preventDefault();
        axios.get(BACKEND_SERVER + '/api/qs/ejes/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
                setEjes(res.data);
                // console.log('ejes:');
                // console.log(res.data);
        })
    }

    const LeeMontaje = (dato) => {
        const temp = []; // Aqui guardo el montaje temporal
        const bancadas = dato.grupo.bancadas;
        bancadas.push(dato.bancadas);
        console.log(bancadas);
        // Seccion formadora
        // const formadora = dato.grupo.bancadas.filter(b => b.seccion.nombre=='Formadora')[0];
        // console.log(formadora);
        bancadas.map(b => {
            b.celdas.map(c => {
                const tipo = c.operacion.nombre.substr(0,2)=='BD'?'BD':c.operacion.nombre;
                const rod = c.conjunto.elementos.map(e => {
                    const instancia = e.rodillo.instancias.filter(i => i.activa_qs==true)[0] // Instancia activa
                    // Parametros de la instancia
                    const param = {
                        Ancho: instancia.ancho,
                        Df: instancia.diametro,
                        Dext: instancia.diametro_ext,
                        Dc: instancia.diametro_centro
                    }
                    // Añadimos parametros del rodillo
                    e.rodillo.parametros.map(p => param[p.nombre]=p.valor);
                    return ({
                    tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                    eje: e.eje.tipo.siglas,
                    parametros: param
                })
                });
                temp.push({
                    operacion: c.operacion.orden,
                    color: 'blue',
                    tipo: tipo,
                    nombre: c.operacion.nombre,
                    rodillos: rod
                });
            });
        });
        setMontaje(temp.sort((a,b) => a.operacion - b.operacion))
    }
    
    const handleGrupoChange = (event) => {
        event.preventDefault();
        setGrupo(event.target.value);
        setMontajeActivo(0);
        setMontaje(null);
    }

    const handleMontajeChange = (event) => {
        event.preventDefault();
        console.log('montaje activo');
        setMontajeActivo(event.target.value);
        const montaje_id = event.target.value;
        LeeMontaje(montajes.filter(m => m.id==montaje_id)[0]);
    }

    const handleInputChange = (event) => {
        event.preventDefault();
        setOP(event.target.value);
    }

    // Lectura de grupos
    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/rodillos/grupo_only/?maquina=${4}`,{ // 4 es el id de la mtt2
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setGrupos(res.data);
        })
        .catch( err => {
            console.log(err);
        });
        leerEjes();
    }, [token]);

    // Lectura de montajes del grupo
    useEffect(()=>{
        grupo && axios.get(BACKEND_SERVER + `/api/rodillos/montaje_qs/?maquina__id=${4}&&grupo__id=${grupo}`,{ // 4 es el id de la mtt2
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            console.log(res.data);
            setMontajes(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, grupo]);

    // useEffect(()=>{
    //     const pos = [];
    //     let eje_sup;
    //     let eje_inf;
    //     let Ds;
    //     let Di;
    //     let gap;
    //     let piston;
    //     const gap_list = [];

    //     if (ejes && montaje){
    //         // Calculo de posiciones
    //         montaje.map(m => {
    //             const line = [];
    //             m.rodillos.map((r,i) =>{
    //                 switch (r.eje){
    //                     // case 'LAT_MO':
    //                     // case 'LAT_OP':
    //                     //     line.push({
    //                     //         eje: r.eje,
    //                     //         pos: 492 -r.parametros.Df/2 - ejes[m.operacion-1].pos[r.eje],
    //                     //         pos_sim: 492 -r.parametros.Df/2 - ejesSim[m.operacion-1].pos[r.eje]
    //                     //     });
    //                     //     break;
    //                     case 'SUP_V_MO':
    //                     case 'SUP_V_OP':
    //                         line.push({
    //                             eje: r.eje,
    //                             pos: -r.parametros.Df/2 + (465 - ejes[m.operacion-1].pos[r.eje])/Math.cos(15*Math.PI/180),
    //                         });
    //                         console.log(r.eje);
    //                         console.log('Df: ', r.parametros.Df/2);
    //                         console.log('Eje: ', ejes[m.operacion-1].pos[r.eje]);
    //                         console.log('sup: ', -r.parametros.Df/2 + (465 - ejes[m.operacion-1].pos[r.eje])/Math.cos(15*Math.PI/180));
    //                         break;
    //                     case 'SUP_H_MO':
    //                     case 'SUP_H_OP':
    //                         line.push({
    //                             eje: r.eje,
    //                             pos: 138.183 - ejes[m.operacion-1].pos[r.eje] - Math.sin(15*Math.PI/180)*r.parametros.Df/2,
    //                         });
    //                         break;
    //                     case 'INF_W':
    //                         line.push({
    //                             eje: r.eje,
    //                             pos: -r.parametros.Df/2 + ejes[m.operacion-1].pos[r.eje] + ejes[m.operacion-1].pos['CAB'] - 298.5,
    //                         });
    //                         break;
    //                     case 'ANCHO_S1':
    //                     case 'ANCHO':
    //                         line.push({
    //                             eje: r.eje,
    //                             pos: 170 + ejes[m.operacion-1].pos[r.eje] -r.parametros.Df,
    //                         });
    //                         break;
    //                     case 'ALTO':
    //                         line.push({
    //                             eje: r.eje,
    //                             pos: -270 + ejes[m.operacion-1].pos[r.eje],
    //                         });
    //                     break;
    //                     case 'ALTO_S1':
    //                         line.push({
    //                             eje: r.eje,
    //                             pos: -40 + ejes[m.operacion-1].pos[r.eje],
    //                         });
    //                     break;  
    //                     default: 
    //                         line.push({
    //                             eje: r.eje,
    //                             pos: -r.parametros.Df/2 + ejes[m.operacion-1].pos[r.eje],
    //                         });
    //                 }
    //             });
    //             pos.push({
    //                 op: m.operacion,
    //                 posiciones: line
    //             });
    //         });
    //         SetPosiciones(pos);
    //     }
    // },[montaje, ejes]);

    return (
        <React.Fragment>
            <QSNavBar/>
            <Container>
                <Row>
                    <Form>
                        <Row>
                            <Col>
                                <Form.Group controlId="grupo">
                                    <Form.Label>Grupo</Form.Label>
                                    <Form.Control   size="lg"
                                                    as="select" 
                                                    value={grupo}
                                                    name='grupo'
                                                    onChange={handleGrupoChange}>
                                                        <option key={0} value={0}>Ninguno</option>
                                                        {grupos && grupos.map( g => {
                                                            return (
                                                            <option key={g.id} value={g.id}>
                                                                {g.nombre}
                                                            </option>
                                                            )
                                                        })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="montaje">
                                    <Form.Label>Montaje</Form.Label>
                                    <Form.Control   size="lg"
                                                    as="select" 
                                                    value={montajeActivo}
                                                    name='montaje'
                                                    onChange={handleMontajeChange}>
                                        <option key={0} value={0}>Ninguno</option>                
                                        {montajes && montajes.map( m => {
                                            return (
                                            <option key={m.id} value={m.id}>
                                                {m.bancadas.dimensiones}
                                            </option>
                                            )
                                        })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
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
                        </Row>
                        {/* <Row>
                            <Col className="col-6">
                                {montaje&&posiciones&&ejes&&<StandChart montaje={montaje&&montaje.filter(m => m.operacion == OP)}
                                            ejes={ejes&&ejes.filter(e => e.op == OP)[0].pos}
                                            posiciones={null}//posiciones&&posiciones.filter(p => p.op==OP)[0].posiciones}
                                            simulador={false}
                                            gap = {null}
                                            fleje={null}/>  }
                            </Col>
                        </Row> */}
                    </Form>
                </Row>
            </Container>
        </React.Fragment>
    )
}

export default QS_Produccion;