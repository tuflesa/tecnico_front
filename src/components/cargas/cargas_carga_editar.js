import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';

const CargaEditar = ({ match }) => {
    const [token] = useCookies(['tec-token']);

    const [empresas, setEmpresas] = useState([]);
    const [agencias, setAgencias] = useState([]);

    const [datos, setDatos] = useState({
        empresa: '',
        matricula: '',
        remolque: '',
        agencia: '',
        telefono: '',
        fecha_entrada: '',
        hora_entrada: '',
        tara: '',
        destino: '',
        bruto: '',
        fecha_salida: ''
        });

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/cargas/carga/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            console.log(res.data);
            setDatos({
                id: res.data.id,
                empresa: res.data.empresa,
                matricula: res.data.matricula,
                remolque: res.data.remolque,
                agencia: res.data.agencia,
                telefono: res.data.telefono,
                fecha_entrada: res.data.fecha_entrada,
                hora_entrada: res.data.hora_entrada,
                tara: Number.isInteger(parseInt(res.data.tara)) ? res.data.tara : '',
                destino: res.data.destino,
                bruto: Number.isInteger(parseInt(res.data.bruto)) ? res.data.bruto : '',
                fecha_salida: res.data.fecha_salida
                });
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

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

        axios.get(BACKEND_SERVER + '/api/cargas/agencia/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            //console.log(res.data);
            setAgencias(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    const actualizarDatos = (event) => {
        event.preventDefault()
        console.log('Actualizar datos...' + datos.fecha_salida + ' ' + datos.bruto + ' ' + datos.remolque)

        // if (datos.fecha_salida === null) { // && Number.isInteger(parseInt(datos.bruto))) {
        //     datos.fecha_salida = new Date();
        //     datos.fecha_salida.setHours( datos.fecha_salida.getHours() + 2 );
        //     // console.log(datos.fecha_salida);
        // } 
        
        axios.put(BACKEND_SERVER + `/api/cargas/carga/${datos.id}/`, {
            empresa: datos.empresa,
            matricula: datos.matricula,
            remolque: datos.remolque,
            telefono: datos.telefono,
            agencia: datos.agencia === 0 ? null : datos.agencia,
            fecha_entrada: datos.fecha_entrada,
            hora_entrada: datos.hora_entrada,
            tara: datos.tara,
            destino: datos.destino,
            bruto: datos.bruto ? datos.bruto : null,
            fecha_salida: datos.fecha_salida ? datos.fecha_salida : null
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }     
        })
        .then( res => { 
            console.log(res);
            window.location.href = "/cargas";
        })
        .catch(err => { console.log(err);})
    }

    const handleInputChange = (event) => {
        // console.log(event.target.name)
        // console.log(event.target.value)
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

        return ( 
        <Container>
            <Row className="justify-content-center"> 
                <h5 className="pb-3 pt-1 mt-2">Editar Carga</h5>
            </Row>
            <Row className="justify-content-center">
                <Form >
                    <Row>
                        <Col>
                            <Form.Group controlId="empresa">
                                <Form.Label>Empresa</Form.Label>
                                <Form.Control as="select" 
                                            value={datos.empresa}
                                            name='empresa'
                                            onChange={handleInputChange}
                                            disabled={true}>
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
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="matricula">
                                <Form.Label>Matricula</Form.Label>
                                <Form.Control type="text" 
                                            name='matricula' 
                                            value={datos.matricula}
                                            onChange={handleInputChange} 
                                            placeholder="Matrícula" />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="remolque">
                                <Form.Label>Remolque</Form.Label>
                                <Form.Control type="text" 
                                            name='remolque' 
                                            value={datos.remolque}
                                            onChange={handleInputChange} 
                                            placeholder="Remolque" 
                                            required/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="fecha">
                                <Form.Label>Fecha entrada</Form.Label>
                                <Form.Control type="date" 
                                                name='fecha_entrada'
                                                value={datos.fecha_entrada}
                                                onChange={handleInputChange}
                                                readOnly />
                            </Form.Group>        
                        </Col>
                        <Col>
                            <Form.Group controlId="hora">
                                <Form.Label>Hora</Form.Label>
                                <Form.Control type="text" 
                                            name='hora_entrada' 
                                            value={datos.hora_entrada}
                                            onChange={handleInputChange} 
                                            placeholder="Hora de entrada"
                                            readOnly />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="agencia">
                                <Form.Label>Agencia</Form.Label>
                                <Form.Control as="select" 
                                            value={datos.agencia}
                                            name='agencia'
                                            onChange={handleInputChange}>
                                    <option key={0} value={null}>-------</option>
                                    {agencias && agencias.map( agencia => {
                                        return (
                                        <option key={agencia.id} value={agencia.id}>
                                            {agencia.nombre}
                                        </option>
                                        )
                                    })}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="telefono">
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control type="text" 
                                            name='telefono' 
                                            value={datos.telefono}
                                            onChange={handleInputChange} 
                                            placeholder="Telefono" />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="destino">
                                <Form.Label>Destino</Form.Label>
                                <Form.Control type="text" 
                                            name='destino' 
                                            value={datos.destino}
                                            onChange={handleInputChange} 
                                            placeholder="Destino" />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="tara">
                                <Form.Label>Tara</Form.Label>
                                <Form.Control type="text" 
                                            name='tara' 
                                            value={datos.tara}
                                            onChange={handleInputChange} 
                                            placeholder="Tara"
                                            required />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="bruto">
                                <Form.Label>Bruto</Form.Label>
                                <Form.Control type="text" 
                                            name='bruto' 
                                            value={datos.bruto}
                                            onChange={handleInputChange} 
                                            placeholder="Bruto" />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="neto">
                                <Form.Label>Neto</Form.Label>
                                <Form.Control type="text" 
                                            name='neto' 
                                            value={parseInt(datos.bruto) > parseInt(datos.tara) ? datos.bruto - datos.tara : null}
                                            placeholder="Neto" 
                                            disabled={true}/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Button variant="info" type="submit" className="mr-3" onClick={actualizarDatos}>Actualizar</Button> 
                        <Link to='/cargas'>
                            <Button variant="warning" className="mr-3">
                                Cancelar
                            </Button>
                        </Link>
                    </Row>
                </Form>
            </Row>
        </Container>
    );
}
 
export default CargaEditar;