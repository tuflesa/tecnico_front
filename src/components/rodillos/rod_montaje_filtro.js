import React , { useState, useEffect } from "react";
import { Container, Row, Form, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const RodMontajeFiltro = ({actualizaFiltro}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [empresas, setEmpresas] = useState(null);
    const [zonas, setZonas] = useState(null);
    const [grupos, setGrupos] = useState(null);
    const [bancadas, setBancadas] = useState(null);

    const [datos, setDatos] = useState({
        id:'',
        empresa: user['tec-user'].perfil.empresa.id,
        maquina: '',
        grupo: '',
    });

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

    useEffect(() => {
        if (datos.empresa === '') {
            setZonas([]);
            setDatos({
                ...datos,
                maquina: '',
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
                    maquina: '',
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.empresa]);

    useEffect(() => {
        if (datos.maquina === '') {
            setGrupos([]);
            setDatos({
                ...datos,
                grupo: '',
            });
        }
        else {
            axios.get(BACKEND_SERVER + `/api/rodillos/grupo_montaje/?maquina=${datos.maquina}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setGrupos(res.data);
                setDatos({
                    ...datos,
                    grupo: '',
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.maquina]);

    useEffect(() => {
        if (datos.maquina === '') {
            setBancadas([]);
            setDatos({
                ...datos,
                bancada: '',
            });
        }
        else {
            axios.get(BACKEND_SERVER + `/api/rodillos/bancada_montaje_ct/?seccion__maquina=${datos.maquina}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setBancadas(res.data);
                setDatos({
                    ...datos,
                    bancada: '',
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.maquina]);

    useEffect(()=>{
        const filtro = `?maquina__empresa__id=${datos.empresa}&tubo_madre=${datos.grupo}&maquina=${datos.maquina}&bancada=${datos.dimensiones}`
        actualizaFiltro(filtro);
    },[datos]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }
    
    return ( 
        <Container>
            <h5 className="mb-3 mt-3">Filtro</h5>
            <Form>
                <Row>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa</Form.Label>
                            <Form.Control as="select"  
                                        name='empresa' 
                                        value={datos.empresa}
                                        onChange={handleInputChange}
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
                    <Col>
                        <Form.Group controlId="maquina">
                            <Form.Label>Máquina</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.maquina}
                                            name='maquina'
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
                        <Form.Group controlId="grupo">
                            <Form.Label>Grupo Ø</Form.Label>
                            <Form.Control 
                                as="select" 
                                value={datos.grupo}
                                name='grupo'
                                onChange={handleInputChange} >
                                <option key={0} value={''}>Todas</option>
                                {grupos && grupos.map(grupo => (
                                    <option key={grupo.id} value={grupo.tubo_madre}>
                                        {grupo.tubo_madre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="dimensiones">
                            <Form.Label>Dimenesiones</Form.Label>
                            <Form.Control 
                                as="select" 
                                value={datos.dimensiones}
                                name='dimensiones'
                                onChange={handleInputChange} >
                                <option key={0} value={''}>Todas</option>
                                {bancadas && bancadas.map(bancada => (
                                    <option key={bancada.id} value={bancada.id}>
                                        {bancada.dimensiones}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    
                </Row>
            </Form>
        </Container>
     );
}
 
export default RodMontajeFiltro;