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
    const [tubo_madre, setTuboMadre] = useState(null);
    const [grupoId, setGrupoId] = useState(null);
    const [dimensionesID, setDimensionesId] = useState(null);
    const [dimensiones, setDimensiones] = useState(null);
    const [grupo_nombre, setGrupoNombre] = useState(null);

    const [datos, setDatos] = useState({
        id:'',
        empresa: user['tec-user'].perfil.empresa.id,
        maquina: '',
        grupo: '',
        tubo_madre:'',
        dimensiones:'',
        nombre:'',
        titular:false,
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
            axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}&es_maquina_tubo=${true}`,{
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
                dimensiones:'',
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
                    dimensiones:'',
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
            datos.maquina && axios.get(BACKEND_SERVER + `/api/rodillos/bancada_montaje_ct/?seccion__maquina=${datos.maquina}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setBancadas(res.data);
                setDimensionesId('');
                setTuboMadre('');
                setDimensiones('');
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
        const filtro = `?maquina__empresa__id=${datos.empresa}&tubo_madre=${tubo_madre}&grupo=${grupoId}&maquina=${datos.maquina}&bancada=${dimensionesID}&nombre=${'M-'+ grupo_nombre + '-' + dimensiones}&titular_grupo=${datos.titular}`
        actualizaFiltro(filtro);
    },[datos]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleInputChangeGrupo = (event) => {
        const [id, madre, nombre] = event.target.value.split(',');
        setGrupoId(id);
        setTuboMadre(madre);
        setGrupoNombre(nombre);
        setDatos({
            ...datos,
            grupo : event.target.value
        });
    };

    const handleInputChangeDimensiones = (event) => {
        const [id, dimensiones] = event.target.value.split(',');
        setDimensionesId(id);
        setDimensiones(dimensiones);
        setDatos({
            ...datos,
            dimensiones : event.target.value
        });
    };
    
    return ( 
        <Container>
            <h5 className="mb-3 mt-3">Datos del Montaje</h5>
            <Form>
                <Row>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa *</Form.Label>
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
                            <Form.Label>Máquina *</Form.Label>
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
                            <Form.Label>Grupo Ø *</Form.Label>
                            <Form.Control 
                                as="select" 
                                value={datos.grupo}
                                name='grupo'
                                onChange={handleInputChangeGrupo} >
                                <option key={0} value={''}>Todas</option>
                                {grupos && grupos.map(grupo => (
                                    <option key={grupo.id} value={`${grupo.id},${grupo.tubo_madre},${grupo.nombre}`}>
                                        {grupo.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="dimensiones">
                            <Form.Label>Cabeza de turco / calibradora *</Form.Label>
                            <Form.Control 
                                as="select" 
                                value={datos.dimensiones}
                                name='dimensiones'
                                onChange={handleInputChangeDimensiones} >
                                <option key={0} value={''}>Todas</option>
                                {bancadas && bancadas.map(bancada => (
                                    <option key={bancada.id} value={`${bancada.id},${bancada.dimensiones}`}>
                                        {bancada.dimensiones}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="titular">
                            <Form.Check type="checkbox" 
                                        name='titular'
                                        label="¿Titular de grupo?"
                                        checked = {datos.titular}
                                        onChange = {handleInputChange} />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Container>
     );
}
 
export default RodMontajeFiltro;