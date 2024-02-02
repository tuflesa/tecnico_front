import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Form, Button } from 'react-bootstrap';
import { PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const RodBancadaCTListado = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [empresas, setEmpresas] = useState(null);
    const [zonas, setZonas] = useState(null);
    const [bancadas, setBancadas] = useState(null);
    const [filtro, setFiltro] = useState(`?dimensiones__icontains=${''}&seccion__maquina__id=${''}&seccion__maquina__empresa=${''}&seccion__pertenece_grupo=${false}`);//BUSCANDO LAS BANCADAS CT
    const [count, setCount] = useState(null);

    const [datos, setDatos] = useState({
        empresa: user['tec-user'].perfil.empresa.id,
        zona: '',
        dimensiones: '',
        maquina: '',
        pagina: 1,
        total_pag:0,
    });

    useEffect(()=>{
        setFiltro(`?dimensiones__icontains=${datos.dimensiones}&seccion__maquina__id=${datos.maquina}&seccion__maquina__empresa=${datos.empresa}&seccion__pertenece_grupo=${false}`);
    },[datos]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/bancada_ct/`+ filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setBancadas(res.data.results);
            setCount(res.data.count);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro]);

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

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    useEffect(()=>{
        if(count % 20 === 0){
            setDatos({
                ...datos,
                total_pag:Math.trunc(count/20),
            })
        }
        else if(count % 20 !== 0){
            setDatos({
                ...datos,
                total_pag:Math.trunc(count/20)+1,
            })
        }
    }, [count]);

    const cambioPagina = (pag) => {
        if(pag<=0){
            pag=1;
        }
        if(pag>count/20){
            if(count % 20 === 0){
                pag=Math.trunc(count/20);
            }
            if(count % 20 !== 0){
                pag=Math.trunc(count/20)+1;
            }
        }
        if(pag>0){
            setDatos({
                ...datos,
                pagina: pag,
            })
        }
    } 

    return (
        <Container className='mt-5'>
            {/* <Row>
                <Col><h5 className="mb-3 mt-3">Filtros Bancadas CT</h5></Col>
            </Row> */}
            <Row>
                <Col>
                    <Form.Group controlId="nombre">
                        <Form.Label>Dimensiones</Form.Label>
                        <Form.Control type="text" 
                                    name='dimensiones' 
                                    value={datos.dimensiones}
                                    onChange={handleInputChange} 
                                    placeholder="Dimensiones" 
                                    autoFocus/>
                    </Form.Group>
                </Col>
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
                    <h5 className="mb-3 mt-3">Listado de Bancadas de Cabeza de Turco</h5>
                    <Row>
                        <table>
                            <tbody>
                                <tr>
                                    <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                                    <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                                    <th>Número páginas: {datos.pagina} / {datos.total_pag}</th>
                                    <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
                                </tr>
                            </tbody>
                        </table>
                    </Row>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th style={{ width: 10 }}>boton</th>
                                <th>Dimensiones</th>
                                <th>Empresa</th>
                                <th>Máquina</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bancadas && bancadas.map(bancada => {
                                return (
                                    <React.Fragment key={bancada.id}>
                                        {<tr>
                                            <td>
                                                <button type="button" className="btn btn-default" value={bancada.id} name='prueba' onClick={event => { 'cogerDatos(bancada)' }}>--</button>
                                            </td>
                                            <td>{bancada.dimensiones}</td>
                                            <td>{bancada.seccion.maquina.empresa.nombre}</td>
                                            <td>{bancada.seccion.maquina.siglas}</td>
                                            <td><Link title='Detalle/Modificar'to={`/rodillos/bacada_ct_editar/${bancada.id}`}><PencilFill className="mr-3 pencil"/></Link></td>
                                        </tr>}
                                        {/* {filaSeleccionada === linea.id && show === true && (
                                            <tr>
                                                <td colSpan="4">
                                                        <Table striped bordered hover>
                                                            <thead>
                                                                <tr>
                                                                    <th>Rodillo</th>
                                                                    <th>Operación</th>
                                                                    <th>Descripción perfil</th>
                                                                    <th>Dimensión</th>
                                                                    <th>Eje</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {conjuntos}
                                                            </tbody>
                                                        </Table>
                                                </td>
                                            </tr>
                                        )} */}
                                    </React.Fragment>
                                )
                            })}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    )
}

export default RodBancadaCTListado;