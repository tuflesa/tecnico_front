import React, { useState, useEffect, Fragment } from "react";
import axios from 'axios';
import { Container, Row, Col, Form} from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import QSNavBar from "./qs_nav";
import StandChart2 from "./qs_stand_chart _2";

const QS_Produccion = () => {
    const [token] = useCookies(['tec-token']);
    const [grupos, setGrupos] = useState(null);
    const [grupo, setGrupo] = useState(0);
    const [montajes, setMontajes] = useState(null);
    const [montaje, setMontaje] = useState(null);
    const [montajeActivo, setMontajeActivo] = useState(0);
    const [articulos, setArticulos] = useState(null);
    const [articulo, setArticulo] = useState(0);
    const [diametrosPLC, setDiametrosPLC] = useState(null);
    const [posiciones, setPosiciones] = useState(null);
    const [fleje, setFleje] = useState(null);
    const [OP, setOP] = useState(1);

    const leeDiametrosPLC = (event) => {
        // event.preventDefault();
        axios.get(BACKEND_SERVER + '/api/qs/diametros_actuales_PLC/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
                setDiametrosPLC(res.data);
                //console.log(res.data);
        })
    }
    const leePosicionesPLC = (event) => {
        // event.preventDefault();
        axios.get(BACKEND_SERVER + '/api/qs/posiciones_actuales_PLC/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
                console.log('Posiciones PLC ...');
                console.log(res.data);
                setPosiciones(res.data);
        })
    }

    const compara_diametros_PLC_montaje = () => {
        console.log('Montaje ...');
        console.log(montaje);
        console.log('leyendo diametros de PLC ...');
        console.log(diametrosPLC);
        montaje.forEach(o => {
            o.rodillos.forEach(r =>{
                const Df_PC = r.parametros.Df;
                const PLC = diametrosPLC[o.nombre];
                const Df_PLC = PLC[r.eje];
                // if (Math.abs(Df_PC-Df_PLC) > 0.1) {
                //     console.log('Operacion ', o.nombre);
                //     console.log('Eje: ', r.eje);
                //     console.log('Df_PC ', Df_PC);
                //     console.log('Df_PLC ', Df_PLC);
                // }
            });
        });
    }

    const LeeMontaje = (dato) => {
        // Si no hay dato no hacemos nada
        if (!dato) {
            setMontajeActivo(0);
            setMontaje(null);
            setArticulos(null);
            return
        }
        // Si hay dato continuamos
        const temp = []; // Aqui guardo el montaje temporal
        const bancadas = [];
        dato.grupo.bancadas.forEach(b => bancadas.push(b)); // Bancadas del grupo
        bancadas.push(dato.bancadas); // Añadimos la calibradora que viene como bancada sin grupo
        // Guardamos los articulos de montaje
        setArticulos(dato.articulos);
        bancadas.map(b => {
            b.celdas.map(c => {
                const tipo = c.operacion.nombre.substring(0,2);
                const rod = []
                c.conjunto.elementos.map(e => {
                    const num_instancias = e.rodillo.instancias.length;
                    e.rodillo.instancias.filter(i => i.activa_qs==true).map((instancia,i) => { // Instancias activas
                        // Parametros de la instancia
                        const param = {
                            Ancho: instancia.ancho,
                            Df: instancia.diametro,
                            Dext: instancia.diametro_ext,
                            Dc: instancia.diametro_centro
                        }
                        // Añadimos parametros del rodillo
                        e.rodillo.parametros.map(p => param[p.nombre]=p.valor);
                        //Posición del rodillo LAT_OP, SUP, INF etc ...
                        let eje = e.eje.tipo.siglas
                        if (e.eje.numero_ejes > 1) { // más de un eje
                            if (num_instancias === 1) { //rodillos iguales
                                switch (eje) {
                                    case 'LAT':
                                        rod.push({
                                            tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                            eje: 'LAT_OP',
                                            parametros: param
                                        });
                                        rod.push({
                                            tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                            eje: 'LAT_MO',
                                            parametros: param
                                        });
                                        break;
                                    case 'SUP/INF':
                                        rod.push({
                                            tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                            eje: 'SUP',
                                            parametros: param
                                        });
                                        rod.push({
                                            tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                            eje: 'INF',
                                            parametros: param
                                        });
                                        break;
                                    case 'SUP':
                                        rod.push({
                                            tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                            eje: 'SUP_OP',
                                            parametros: param
                                        });
                                        rod.push({
                                            tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                            eje: 'SUP_MO',
                                            parametros: param
                                        });
                                        break;
                                    case 'L_IS':
                                            rod.push({
                                                tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                                eje: 'ANCHO',
                                                parametros: param
                                            });
                                            rod.push({
                                                tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                                eje: 'ALTO',
                                                parametros: {Df: 0}
                                            });
                                            break;
                                }
                            }
                            else { //Rodillos diferentes
                                console.log('Rodillos diferentes');
                                eje = instancia.posicion;
                                rod.push({
                                    tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                    eje: eje,
                                    parametros: param
                                });
                            }
                        }
                        else {
                            rod.push({
                                tipo_plano: e.rodillo.tipo_plano?e.rodillo.tipo_plano.nombre:'NONE',
                                eje: eje,
                                parametros: param
                            });
                        }
                    });
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
        setMontaje(temp.sort((a,b) => a.operacion - b.operacion).filter(o => o.nombre !=='ET'));
    }
    
    const handleGrupoChange = (event) => {
        event.preventDefault();
        setGrupo(event.target.value);
        setMontajeActivo(0);
        setMontaje(null);
        setArticulos(null);
        setArticulo(0);
    }

    const handleMontajeChange = (event) => {
        event.preventDefault();
        setMontajeActivo(event.target.value);
        const montaje_id = event.target.value;
        LeeMontaje(montajes.filter(m => m.id==montaje_id)[0]);
        setArticulo(0);
    }

    const handleArticuloChange = (event) => {
        event.preventDefault();
        // console.log('cambio de articulo');
        setArticulo(event.target.value);
    }

    const handleOPChange = (event) => {
        event.preventDefault();
        setOP(event.target.value);
    }

    // Al inicio: Lectura de grupos
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
    }, [token]);

    // Lectura de montajes del grupo
    useEffect(()=>{
        grupo && axios.get(BACKEND_SERVER + `/api/rodillos/montaje_qs/?maquina__id=${4}&&grupo__id=${grupo}`,{ // 4 es el id de la mtt2
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            //console.log(res.data);
            setMontajes(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, grupo]);

    // Si cambia el montaje leemos los diametros activos en el PLC para ver si coinciden con el montaje actual
    useEffect(()=>{
        leeDiametrosPLC();
        leePosicionesPLC();
    },[montaje]);

    // Cuando tenemos nuevos diametros del PLC y montaje comparamos si los diametros coinciden
    useEffect(()=>{
        diametrosPLC&&montaje&&compara_diametros_PLC_montaje();
    },[diametrosPLC, montaje]);

    // Actualizar Fleje al cambiar de articulo
    useEffect(() => {
        if (articulo==0) {
            setFleje(null);
        }
        else {
            console.log('montaje ...');
            console.log(montaje);
            const art = articulos.filter(a => a.id == articulo)[0];
            setFleje({
                espesor: parseFloat(art.espesor),
                ancho: art.desarrollo,
                calidad: 'S350',
                color: 'aqua'
            });
        }
    },[articulo]);

    return (
        <React.Fragment>
            <QSNavBar/>
            <Container fluid>
                <Form>
                    <Row>
                        <Col lg={6}>
                            <Row>
                                <Col lg={6}>
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
                                        <Form.Label>Calibradora</Form.Label>
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
                        </Col>
                        <Col lg={6}>
                            <Row>
                                <Col>
                                    <Form.Group controlId="Articulo">
                                        <Form.Label>Artículo</Form.Label>
                                        <Form.Control   size="lg"
                                                        as="select" 
                                                        value={articulo}
                                                        name='articulo'
                                                        onChange={handleArticuloChange}>
                                            <option key={0} value={0}>Ninguno</option>                
                                            {articulos && articulos.map( a => {
                                                return (
                                                <option key={a.id} value={a.id}>
                                                    {a.nombre}
                                                </option>
                                                )
                                            })}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    {
                    montaje&&articulo&&fleje&&posiciones&&<React.Fragment>
                    <Row>
                        <Col lg={6}>
                            <Form.Group controlId="operacion">
                                <Form.Control as="select" 
                                                value={OP}
                                                name='operacion'
                                                onChange={handleOPChange}>
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
                    <Row>
                        <Col lg={6}>
                            <StandChart2 
                                montaje={montaje.filter(m => m.operacion == OP)}
                                posiciones={posiciones}
                                simulador={false}
                                gap = {[]}
                                fleje={fleje}/> 
                        </Col>
                    </Row> 
                    </React.Fragment>
                    }
                </Form>
            </Container>
        </React.Fragment>
    )
}

export default QS_Produccion;