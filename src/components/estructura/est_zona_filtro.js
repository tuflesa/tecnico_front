import React, { useEffect, useState } from 'react';
import { Container, Row, Form } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const EstZonaFiltro = ({ actualizaFiltro }) => {
    const [empresas, setEmpresas] = useState([]);
    const [token] = useCookies(['tec-token']);
    const [datos, setDatos] = useState({
        nombre: '',
        siglas: '',
        empresa: ''
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

    const handleInputChange = (event) => {
        // console.log(event.target.name)
        // console.log(event.target.value)
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    useEffect(()=>{
        const filtro = `?empresa=${datos.empresa}&nombre__icontains=${datos.nombre}&siglas__icontains=${datos.siglas}`
        actualizaFiltro(filtro);
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

                    <Form.Group controlId="formNombre">
                        <Form.Label>Nombre contiene</Form.Label>
                        <Form.Control type="text" 
                                    name='nombre' 
                                    value={datos.nombre}
                                    onChange={handleInputChange} 
                                    placeholder="Nombre" />
                    </Form.Group>

                    <Form.Group controlId="formSiglas">
                        <Form.Label>Siglas contiene</Form.Label>
                        <Form.Control type="text" 
                                    name='siglas' 
                                    value={datos.siglas}
                                    onChange={handleInputChange} 
                                    placeholder="Siglas" />
                    </Form.Group>
                </Form>
            </Row>
        </Container>
     );
}
 
export default EstZonaFiltro;