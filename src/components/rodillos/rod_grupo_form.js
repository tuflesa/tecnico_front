import { Container } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';
import { Button, Form, Col, Row } from 'react-bootstrap';
import RodBancada from './rod_bancada_form';
import RodGrupoEditar from './rod_grupo_editar';
//import { line, link } from 'd3';
//import { Link } from 'react-router-dom';
//import { useHistory } from 'react-router-dom';


const RodGrupo = ({grupo, setGrupo, mostrarBancada}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [empresas, setEmpresas] = useState(null);
    const [zonas, setZonas] = useState([]);
    //const [bancadas, setBancadas] = useState(null);
    const [filtro, setFiltro] = useState(`?tubo_madre__gte=${0}&tubo_madre__lte=${0}`);
    const [mostrarRodBancada] = useState(mostrarBancada);

    const [datos, setDatos] = useState({
        id: grupo.id? grupo.id:null,
        empresa: grupo.id?grupo.maquina.empresa_id:user['tec-user'].perfil.empresa.id,
        zona: grupo.id?grupo.maquina.id:'',
        tubo_madre: grupo.id?grupo.tubo_madre:'',
        nombre: grupo.id?grupo.nombre:'',
        bancadas_elegidas:grupo.id?grupo.bancadas:[],
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
        axios.get(BACKEND_SERVER + `/api/rodillos/grupo_nuevo/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
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
                zona: '',
                seccion: '',
                equipo: ''
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
                /* setDatos({
                    ...datos,
                    zona: '',
                }); */
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.empresa]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }
    
    const GuardarGrupo = (event) => {
        event.preventDefault();
        axios.post(BACKEND_SERVER + `/api/rodillos/grupo_only/`, {
            nombre: datos.nombre,
            maquina: datos.zona,
            tubo_madre: datos.tubo_madre,
            bancadas:datos.bancadas_elegidas,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then(res => { 
            window.location.href=`/rodillos/grupo_editar/${res.data.id}`;       
        })
        .catch(err => { 
            console.log(err);
            alert('Falta datos, por favor rellena todos los campos obligatorios.');
        });
    };  

    const ActualizarGrupo = (event) => {
        event.preventDefault();
        axios.patch(BACKEND_SERVER + `/api/rodillos/grupo_only/${grupo.id}/`, {
            nombre: datos.nombre,
            maquina: datos.zona,
            tubo_madre: datos.tubo_madre,
            bancadas: datos.bancadas_elegidas,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then(res => { 
            //setGrupo(res.data);
            window.location.href=`/rodillos/grupo_editar/${res.data.id}`;
        })
        .catch(err => { 
            console.log(err);
            alert('Falta datos, por favor rellena todos los campos obligatorios.');
        });
        
    };

    return (
        <Container className='mt-5'>
            {grupo.id?<h5 className='mt-5'>Editar Grupo</h5>:<h5 className='mt-5'>Nuevo Grupo</h5>}
            <Form >
                <Row>
                    <Col>
                        <Form.Group controlId="nombre">
                            <Form.Label>Nombre del grupo *</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange} 
                                        placeholder="Nombre grupo"
                                        autoFocus
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="tubo_madre">
                            <Form.Label>Ø del tubo madre *</Form.Label>
                            <Form.Control type="number" 
                                        name='tubo_madre' 
                                        value={datos.tubo_madre}
                                        onChange={handleInputChange} 
                                        placeholder="Ø tubo madre"
                            />
                        </Form.Group>
                    </Col>
                </Row>
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
                        <Form.Group controlId="zona">
                            <Form.Label>Zona *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.zona}
                                            name='zona'
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
            </Form>
            <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
            {grupo.length===0?<Button variant="outline-primary" onClick={GuardarGrupo}>Guardar</Button>:<Button variant="outline-primary" onClick={ActualizarGrupo}>Actualizar</Button>}
            {mostrarRodBancada && <RodBancada visible={mostrarRodBancada} grupo={grupo} setGrupo={setGrupo} />} {/* mostramos en editar las bancadas de la máquina */}
        </Container>
    )
}
 
export default RodGrupo;