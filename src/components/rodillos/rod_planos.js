import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { PlusCircle } from 'react-bootstrap-icons';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';

const RodPlanos = () => {
    const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState([]);
    const [rodillos, setRodillos] = useState([]);
    const [revision, setRevision] = useState([]);
    const [token] = useCookies(['tec-token']);
    
    const [datos, setDatos] = useState({
        nombre: '',
    });

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/lista_rodillos/`, {
            headers: {
            'Authorization': `token ${token['tec-token']}`
            }
        })
        .then(res => {
          setRodillos(res.data);
        })
        .catch(err => {
          console.log(err);
        });
    }, [token]);
  
    const handleCheckboxChange = (event) => {
        const { value } = event.target;
        if (opcionesSeleccionadas.includes(value)) {
            setOpcionesSeleccionadas(opcionesSeleccionadas.filter(opcion => opcion !== value));
        } else {
            setOpcionesSeleccionadas([...opcionesSeleccionadas, value]);
        }
    };

    const GuardarPlano = () => {
        axios.post(BACKEND_SERVER + `/api/rodillos/crear_plano/`, {
            nombre: datos.nombre,
            rodillos: opcionesSeleccionadas,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => { 
            console.log('plano creado');
        })
        .catch(err => { console.log(err);})
    };
  
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value           
        });
    }

    return (
        <Container className='mt-5'>
            <h5 className="mb-3 mt-3">Dar de alta un plano</h5> 
            <Form>
                <Form.Group controlId="nombre">
                    <Form.Label>Nombre del plano</Form.Label>
                    <Form.Control type="text" 
                                name='nombre' 
                                value={datos.nombre}
                                onChange={handleInputChange} 
                                placeholder="Plano"
                                autoFocus
                    />
                </Form.Group>
                <h5 className="mb-3 mt-3">Elige los Rodillos del plano</h5>
                {rodillos.map(rodillo => (
                    <Form.Check
                        key={rodillo.id}
                        type="checkbox"
                        id={`checkbox-${rodillo.id}`}
                        label={rodillo.nombre}
                        value={String(rodillo.id)} // Convertir a cadena de texto
                        checked={opcionesSeleccionadas.includes(String(rodillo.id))} // Convertir a cadena de texto
                        onChange={handleCheckboxChange}
                    />
            ))}
            </Form>
            <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
            <Button variant="outline-primary" onClick={GuardarPlano}>Guardar</Button>
            <Form.Row>
                <Col>
                    <Row>
                        <Col>
                            <h5 className="pb-3 pt-1 mt-2">Revisiones del plano:</h5>
                        </Col>
                        <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                <PlusCircle className="plus mr-2" size={30} onClick={''}/>
                        </Col>
                    </Row>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Motivo</th>
                                <th>Archivo</th>
                            </tr>
                        </thead>
                        {/* <tbody>
                            {datos.equipos && datos.equipos.map( equipo => {
                                return (
                                    <tr key={equipo.id}>
                                        <td>{equipo.siglas_zona}</td>
                                        <td>{equipo.seccion_nombre}</td>
                                        <td>{equipo.nombre}</td>
                                        {!nosoyTecnico?
                                            <td>
                                                <Trash className="trash"  onClick={event => {handlerBorrarEquipo(equipo.id)}} />
                                            </td>
                                        :null}
                                    </tr>
                                )})
                            }
                        </tbody> */}
                    </Table>
                </Col>
            </Form.Row>
        </Container>
    );
  }
  
  export default RodPlanos;
  
  
  