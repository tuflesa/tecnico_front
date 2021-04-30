import React, { useEffect, useState } from 'react';
import { Container, Row, Form } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const EstSeccionFiltro = ({ actualizaFiltro }) => {
    const [empresas, setEmpresas] = useState([]);
    const [zonas, setZonas] = useState([]);
    const [token] = useCookies(['tec-token']);
    const [datos, setDatos] = useState({
        empresa: '',
        zona: '',
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

    const handleInputChange = (event) => {
        // console.log(event.target.name)
        // console.log(event.target.value)
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    useEffect(()=>{
        const filtro = `?zona__empresa=${datos.empresa}&zona=${datos.zona}&nombre__icontains=${datos.nombre}`
        actualizaFiltro(filtro);
        // console.log(filtro);
    },[datos, actualizaFiltro]);


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
                                        onChange={handleInputChange}>
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
 
export default EstSeccionFiltro;