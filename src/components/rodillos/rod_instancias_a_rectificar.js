import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Container, Table } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Trash } from 'react-bootstrap-icons';
import axios from 'axios';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { line } from 'd3';

const RodInstanciasRectificar = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [lineas_rectificacion, setLineasRectificacion] = useState([]);
    const [operaciones, setOperaciones] = useState([]);
    const [empresas, setEmpresas] = useState([user['tec-user'].perfil.empresa.id]);
    const [secciones, setSecciones] = useState([]);
    const [zonas, setZonas] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [filtro, setFiltro] = useState(`?finalizado=${false}&instancia__rodillo__operacion__seccion__maquina__empresa__id=${[user['tec-user'].perfil.empresa.id]}`);

    const [datos, setDatos] = useState({
        id:'',
        nombre: '',
        empresa: user['tec-user'].perfil.empresa.id,
        maquina: '',
        seccion: '',
        operacion: '',
        finalizado: false,
        rectificado_por: '',
    });

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/rodillos/listado_linea_rectificacion`+filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setLineasRectificacion(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro]);

    const Actualizo_LineasRectificacion = (linea, fecha) => {
        axios.patch(BACKEND_SERVER + `/api/rodillos/listado_linea_rectificacion/${linea.id}/`, { //Actualizamos fecha
            fecha: fecha,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => {  
            window.location.reload(); //actualizo página
        })
        .catch(err => { 
            console.error(err);
        })

    };

    const handleInputChange_fecha_rectificado = (linea) => (event) => {
        const { value } = event.target;
        // Actualiza el estado de lineasInstancias
        Actualizo_LineasRectificacion(linea,value);
        setLineasRectificacion((prev) =>
            prev.map((instancia) =>
                instancia.id === linea.id ? { ...instancia, fecha: value } : instancia
            )
        );
    };

    useEffect(()=>{
        const filtro = `?finalizado=${datos.finalizado}&instancia__rodillo__operacion__seccion__maquina__empresa__id=${datos.empresa}&instancia__rodillo__operacion__seccion__maquina__id=${datos.maquina}&instancia__rodillo__operacion__seccion__id=${datos.seccion}&instancia__rodillo__operacion__id=${datos.operacion}&instancia__nombre__icontains=${datos.nombre}&full_name=${datos.rectificado_por?datos.rectificado_por:''}`
        actualizaFiltro(filtro);
    },[datos]);

    const actualizaFiltro = str => {
        setFiltro(str);
    }

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
                seccion: '',
                operacion: ''
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
                    seccion: '',
                    operacion: ''
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.empresa]);

    useEffect(() => {
        if (datos.maquina === '') {
            setSecciones([]);
            setDatos({
                ...datos,
                seccion: '',
                operacion: '',
            });
        }
        else {
            axios.get(BACKEND_SERVER + `/api/rodillos/seccion/?maquina__id=${datos.maquina}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setSecciones(res.data);
                setDatos({
                    ...datos,
                    seccion: '',
                    operacion: '',
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.maquina]);

    useEffect(() => {
        if (datos.seccion === '') {
            setOperaciones([]);
        }
        else {
            axios.get(BACKEND_SERVER + `/api/rodillos/operacion/?seccion__id=${datos.seccion}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setOperaciones(res.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.seccion]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleInputChange_finalizado = (event) => {
        const { name, value } = event.target;
    
        setDatos((prevDatos) => ({
            ...prevDatos,
            [name]: name === 'finalizado' ? (value === '' ? undefined : value === 'true') : value  // Convert value to boolean or undefined for finalizado
        }));
    };
    
    const handleInputChange_archivo = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file.name);
        } else {
            setSelectedFile('');
        }
    };

    return(
        <Container className='mt-5 pt-1'>
            <Row className="mb-3">                  
                <Col>
                    <Form.Group controlId="formNombre">
                        <Form.Label>Nombre Contiene</Form.Label>
                        <Form.Control type="text" 
                                    name='nombre' 
                                    value={datos.nombre}
                                    onChange={handleInputChange}                                        
                                    placeholder="Nombre contiene"
                                    autoFocus/>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="rectificado_por">
                        <Form.Label>Rectificado_por Contiene</Form.Label>
                        <Form.Control type="text" 
                                    name='rectificado_por' 
                                    value={datos.rectificado_por}
                                    onChange={handleInputChange}                                        
                                    placeholder="Rectificado_por contiene"
                                    autoFocus/>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="finalizado">
                        <Form.Label>Rectificado</Form.Label>
                        <Form.Control as="select" 
                                        value={datos.finalizado}
                                        name='finalizado'
                                        onChange={handleInputChange_finalizado}>
                            <option key={0} value={''}>Todos</option>
                            <option key={1} value={true}>Si</option>
                            <option key={2} value={false}>No</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>
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
                <Col>
                    <Form.Group controlId="seccion">
                        <Form.Label>Sección</Form.Label>
                        <Form.Control as="select" 
                                        value={datos.seccion}
                                        name='seccion'
                                        onChange={handleInputChange}>
                            <option key={0} value={''}>Todas</option>
                            {secciones && secciones.map( seccion => {
                                return (
                                <option key={seccion.id} value={seccion.id}>
                                    {seccion.nombre}
                                </option>
                                )
                            })}
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="operacion">
                        <Form.Label>Operación</Form.Label>
                        <Form.Control as="select" 
                                        value={datos.operacion}
                                        name='operacion'
                                        onChange={handleInputChange}>
                            <option key={0} value={''}>Todos</option>
                            {operaciones && operaciones.map( operacion => {
                                return (
                                <option key={operacion.id} value={operacion.id}>
                                    {operacion.nombre}
                                </option>
                                )
                            })}
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Instancias a rectificar</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Nombre</th>
                                <th>Diámetro Fondo</th> 
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Nuevo Diámetro Fondo</th>}                                
                                <th>Diámetro Exterior</th>
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Nuevo Diámetro Exterior</th>}
                                <th>Ancho</th>
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Nuevo Ancho</th>}
                                <th>Num Ejes</th>
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Rectificado por</th>}
                                <th>Fecha estimada</th>
                                {datos.finalizado !== false && <th style={{ backgroundColor: '#DBFAC9' }}>Fecha Rectificado</th>}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineas_rectificacion.map(linea => {
                                return (
                                    <tr key={linea.id}>
                                        <td>{linea.instancia.id}</td>
                                        <td>{linea.instancia.nombre}</td>
                                        <td>{linea.diametro}</td>
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.nuevo_diametro}</td>}
                                        <td>{linea.diametro_ext}</td> 
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.nuevo_diametro_ext}</td>}
                                        <td>{linea.ancho}</td>
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.nuevo_ancho}</td>} 
                                        <td>{linea.instancia.rodillo.num_ejes}</td> 
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.rectificado_por?linea.rectificado_por.get_full_name:''}</td>} 
                                        <td>
                                            <Form.Group controlId="fecha_estimada">
                                                <Form.Control type="date" 
                                                            name='fecha_estimada' 
                                                            value={linea.fecha}
                                                            onChange={handleInputChange_fecha_rectificado(linea)} 
                                                            placeholder="Fecha estimada" 
                                                            disabled={linea.finalizado===true?true:false}/>
                                            </Form.Group>
                                        </td>
                                        {datos.finalizado !== false && <td style={{ backgroundColor: '#DBFAC9' }}>{linea.fecha_rectificado?invertirFecha(String(linea.fecha_rectificado)):''}</td>} 
                                        <td>{linea.archivo}</td> 
                                        <td>
                                            <Col>
                                                <form encType='multipart/form-data'>
                                                    <Form.Group controlId="archivo">
                                                        <input 
                                                            type="file" 
                                                            name='archivo' 
                                                            onChange={handleInputChange_archivo} 
                                                            style={{ display: 'none' }} 
                                                            id="file-upload" 
                                                        />
                                                        <Form.Control 
                                                            as="button" 
                                                            onClick={() => document.getElementById('file-upload').click()}
                                                        >
                                                            {selectedFile || 'Selec archivo'}
                                                        </Form.Control>
                                                    </Form.Group>
                                                </form>
                                            </Col>
                                        </td>                             
                                    </tr>
                            )})}
                        </tbody>
                    </Table>
                </Col>                
            </Row>
        </Container>
    )
}

export default RodInstanciasRectificar;