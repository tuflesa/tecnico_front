import React, { useEffect, useState } from 'react';
import { Container, Row, Form } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const EstEquiposFiltro = ({ actualizaFiltro }) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [empresas, setEmpresas] = useState([]);
    const [zonas, setZonas] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [datos, setDatos] = useState({
        empresa: user['tec-user'].perfil.empresa.id,
        zona: '',
        seccion: '',
        nombre: ''
    });

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            //console.log(res.data);
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(()=>{
        // console.log(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`);
        if (datos.empresa === '') {
            setZonas([]);
        }
        else {
            axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                //console.log(res.data);
                setZonas(res.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.empresa]);

    useEffect(()=>{
        // console.log(BACKEND_SERVER + `/api/estructura/seccion/?zona=${datos.zona}`);
        if (datos.zona === '') {
            setSecciones([]);
        }
        else {
            axios.get(BACKEND_SERVER + `/api/estructura/seccion/?zona=${datos.zona}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                //console.log(res.data);
                setSecciones(res.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.zona]);

    const handleInputChange = (event) => {
        // console.log(event.target.name)
        // console.log(event.target.value)
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    useEffect(()=>{
        const filtro = `?seccion__zona__empresa=${datos.empresa}&seccion__zona=${datos.zona}&seccion=${datos.seccion}&nombre__icontains=${datos.nombre}`
        actualizaFiltro(filtro);
        // console.log(filtro);
    },[datos, actualizaFiltro]);

    const handleDisabled = () => {
        return user['tec-user'].perfil.nivel_acceso.nombre === 'local'
    }

    return ( 
        <Container>
            <h5 className="mb-3 mt-3">Filtro</h5>
            <Row>
                <Form>
                    <Form.Group controlId="empresa">
                        <Form.Label>Empresa</Form.Label>
                        <Form.Control as="select" 
                                        value={datos.empresa}
                                        name='empresa'
                                        onChange={handleInputChange}
                                        disabled={handleDisabled()}>
                            <option key={0} value={''}>-------</option>
                            {empresas && empresas.map( empresa => {
                                return (
                                <option key={empresa.id} value={empresa.id}>
                                    {empresa.nombre}
                                </option>
                                )
                            })}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="zona">
                        <Form.Label>Zona</Form.Label>
                        <Form.Control as="select" 
                                        value={datos.zona}
                                        name='zona'
                                        onChange={handleInputChange}>
                            <option key={0} value={''}>-------</option>
                            {zonas && zonas.map( zona => {
                                return (
                                <option key={zona.id} value={zona.id}>
                                    {zona.siglas}
                                </option>
                                )
                            })}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="zona">
                        <Form.Label>Seccion</Form.Label>
                        <Form.Control as="select" 
                                        value={datos.seccion}
                                        name='seccion'
                                        onChange={handleInputChange}>
                            <option key={0} value={''}>-------</option>
                            {secciones && secciones.map( seccion => {
                                return (
                                <option key={seccion.id} value={seccion.id}>
                                    {seccion.nombre}
                                </option>
                                )
                            })}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="formNombre">
                        <Form.Label>Nombre contiene</Form.Label>
                        <Form.Control type="text" 
                                    name='nombre' 
                                    value={datos.nombre}
                                    onChange={handleInputChange} 
                                    placeholder="Nombre" />
                    </Form.Group>
                </Form>
            </Row>
        </Container>
     );
}
 
export default EstEquiposFiltro;