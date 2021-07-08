import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { PlusCircle, PencilFill, Trash } from 'react-bootstrap-icons';
import './repuestos.css';

const RepuestoForm = ({repuesto, setRepuesto}) => {
    const [token] = useCookies(['tec-token']);

    const [datos, setDatos] = useState({
        id: repuesto.id ? repuesto.id : null,
        nombre: repuesto.nombre,
        fabricante: repuesto.fabricante ? repuesto.fabricante : '',
        modelo: repuesto.modelo ? repuesto.modelo : '',
        stock: repuesto.stock,
        stock_T: 0,
        stocks_minimos: repuesto.stocks_minimos,
        es_critico: repuesto.es_critico,
        equipos: repuesto.equipos,
        proveedores: repuesto.proveedores
    });

    useEffect(()=>{
        let stock_T = 0;
        datos.stock && datos.stock.forEach(element => {
            stock_T += element.suma;
            const sm = datos.stocks_minimos.filter(e => e.almacen === element.almacen__id);
            if (sm.length > 0) {
                element.stock_minimo = sm[0].cantidad;
            } 
            else {
                element.stock_minimo = 0;
            }
        });
        // console.log(stock_T);
        setDatos({
            ...datos,
            stock_T : stock_T
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[datos.stock]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleCritico = (event) => {
        setDatos({
            ...datos,
            es_critico : !datos.es_critico
        })
    }

    const actualizarDatos = (event) => {
        event.preventDefault();
        // console.log(datos);
        axios.put(BACKEND_SERVER + `/api/repuestos/detalle/${datos.id}/`, {
            nombre: datos.nombre,
            fabricante: datos.fabricante,
            modelo: datos.modelo,
            es_critico: datos.es_critico
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            console.log(res.data);
            setRepuesto(res.data);
            window.location.href = "/repuestos";
        })
        .catch(err => { console.log(err);})

    }

    const crearDatos = (event) => {
        event.preventDefault();
        axios.post(BACKEND_SERVER + `/api/repuestos/detalle/`, {
            nombre: datos.nombre,
            fabricante: datos.fabricante,
            modelo: datos.modelo,
            es_critico: datos.es_critico
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            console.log(res.data);
            setRepuesto(res.data);
            // window.location.href = "/repuestos";
        })
        .catch(err => { console.log(err);})
    }

    return (
        <Container>
            <Row className="justify-content-center"> 
            {repuesto.id ?
                <h5 className="pb-3 pt-1 mt-2">Repuesto Detalle</h5>:
                <h5 className="pb-3 pt-1 mt-2">Nuevo Repuesto</h5>}
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <h5 className="pb-3 pt-1 mt-2">Datos básicos:</h5>
                    <Form >
                        <Row>
                            <Col>
                                <Form.Group controlId="nombre">
                                    <Form.Label>Nombre</Form.Label>
                                    <Form.Control type="text" 
                                                name='nombre' 
                                                value={datos.nombre}
                                                onChange={handleInputChange} 
                                                placeholder="Nombre"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="stock_T">
                                    <Form.Label>Stock</Form.Label>
                                    <Form.Control type="text" 
                                                name='stock_T' 
                                                value={datos.stock_T}
                                                // onChange={handleInputChange} 
                                                placeholder="Stock Total"
                                                disabled
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="fabricante">
                                    <Form.Label>Fabricante</Form.Label>
                                    <Form.Control type="text" 
                                                name='fabricante' 
                                                value={datos.fabricante}
                                                onChange={handleInputChange} 
                                                placeholder="Fabricante"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="model">
                                    <Form.Label>Modelo</Form.Label>
                                    <Form.Control type="text" 
                                                name='modelo' 
                                                value={datos.modelo}
                                                onChange={handleInputChange} 
                                                placeholder="Modelo"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3" controlId="es_critico">
                                    <Form.Check type="checkbox" 
                                                label="Es crítico"
                                                checked = {datos.es_critico}
                                                onChange = {handleCritico} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Row className="justify-content-center">
                            {repuesto.id ? 
                                <Button variant="info" type="submit" className={'mx-2'} onClick={actualizarDatos}>Actualizar</Button> :
                                <Button variant="info" type="submit" className={'mx-2'} onClick={crearDatos}>Guardar</Button>
                            }
                            <Link to='/repuestos'>
                                <Button variant="warning" >
                                    Cancelar
                                </Button>
                            </Link>
                        </Form.Row>
                        {repuesto.id ?
                            <React.Fragment>
                                <Form.Row>
                                    <Col>
                                        <Row>
                                            <Col>
                                            <h5 className="pb-3 pt-1 mt-2">Stock por almacén:</h5>
                                            </Col>
                                            <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                                    <PlusCircle className="plus mr-2" size={30} />
                                            </Col>

                                        </Row>
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Empresa</th>
                                                    <th>Almacén</th>
                                                    <th>Stock</th>
                                                    <th>Stock Mínimo</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {datos.stock && datos.stock.map( stock => {
                                                    return (
                                                        <tr key={stock.almacen__nombre}>
                                                            <td>{stock.almacen__empresa__siglas}</td>
                                                            <td>{stock.almacen__nombre}</td>
                                                            <td>{stock.suma}</td>
                                                            <td>{stock.stock_minimo}</td>
                                                            <td>
                                                                <Link to={`#`}>
                                                                    <PencilFill className="mr-3 pencil"/>
                                                                </Link>
                                                                <Trash className="trash"  onClick={null} />
                                                            </td>
                                                        </tr>
                                                    )})
                                                }
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Form.Row>
                                <Form.Row>
                                    <Col>
                                        <Row>
                                            <Col>
                                                <h5 className="pb-3 pt-1 mt-2">Es repuesto de:</h5>
                                            </Col>
                                            <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                                <PlusCircle className="plus mr-2" size={30} />
                                            </Col>
                                        </Row>
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Zona</th>
                                                    <th>Seccion</th>
                                                    <th>Equipo</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {datos.equipos && datos.equipos.map( equipo => {
                                                    return (
                                                        <tr key={equipo.id}>
                                                            <td>{equipo.siglas_zona}</td>
                                                            <td>{equipo.seccion_nombre}</td>
                                                            <td>{equipo.nombre}</td>
                                                            <td>
                                                                <Link to={`#`}>
                                                                    <PencilFill className="mr-3 pencil"/>
                                                                </Link>
                                                                <Trash className="trash"  onClick={null} />
                                                            </td>
                                                        </tr>
                                                    )})
                                                }
                                            </tbody>
                                        </Table>
                                    </Col>
                                    <Col>
                                        <Row>
                                            <Col>
                                            <h5 className="pb-3 pt-1 mt-2">Proveedores:</h5>
                                            </Col>
                                            <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                                <PlusCircle className="plus mr-2" size={30} />
                                            </Col>
                                        </Row>
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Nombre</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {datos.proveedores && datos.proveedores.map( p => {
                                                    return (
                                                        <tr key={p.id}>
                                                            <td>{p.nombre}</td>
                                                            <td>
                                                                <Link to={`#`}>
                                                                    <PencilFill className="mr-3 pencil"/>
                                                                </Link>
                                                                <Trash className="trash"  onClick={null} />
                                                            </td>
                                                        </tr>
                                                    )})
                                                }
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Form.Row>
                            </React.Fragment>
                        : null}
                    </Form>
                </Col>
            </Row>        
        </Container> 
    )
}

export default RepuestoForm;