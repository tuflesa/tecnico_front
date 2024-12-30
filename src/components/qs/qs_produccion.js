import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Container, Row, Col, Form} from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import QSNavBar from "./qs_nav";

const QS_Produccion = () => {
    const [token] = useCookies(['tec-token']);
    const [grupos, setGrupos] = useState(null);
    const [grupo, setGrupo] = useState(0);
    const [montajes, setMontajes] = useState(null);
    const [monatje, setMontaje] = useState([]);
    const [montajeActivo, setMontajeActivo] = useState(0);

    const LeeMontaje = (dato) => {
        console.log(dato);
        const temp = []; // Aqui guardo el montaje temporal
        // Seccion formadora
        const formadora = dato.grupo.bancadas.filter(b => b.seccion.nombre=='Formadora')[0];
        console.log(formadora);
        formadora.celdas.map(c => {
            const tipo = c.operacion.nombre.substr(0,2)=='BD'?'BD':c.operacion.nombre;
            const rod = c.conjunto.elementos.map(e => {
                return ({
                tipo_plano: 'BD_W_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 660,
                    Dext: 550,
                    Df: 300,
                    Dc: 338.5,
                    R1: 126,
                    alfa1: 63,
                    xc1: 155.3,
                    R2: 489,
                    alfa2: 12,
                    R3:15
                }})
            });
            temp.push({
                operacion: c.operacion.orden,
                color: 'blue',
                tipo: tipo,
                nombre: c.operacion.nombre,
                rodillos: rod
            });
        });
        console.log(temp);
    }
    
    const handleGrupoChange = (event) => {
        event.preventDefault();
        setGrupo(event.target.value);
        setMontajeActivo(0);
        setMontaje([]);
    }

    const handleMontajeChange = (event) => {
        event.preventDefault();
        console.log('montaje activo');
        setMontajeActivo(event.target.value);
        const montaje_id = event.target.value;
        LeeMontaje(montajes.filter(m => m.id==montaje_id)[0]);
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
                    </Form>
                </Row>
            </Container>
        </React.Fragment>
    )
}

export default QS_Produccion;