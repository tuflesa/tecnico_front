import React , { useState, useEffect } from "react";
import { Container, Row, Form, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const RodBancadaCTFiltro = ({actualizaFiltro}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [datos, setDatos] = useState({
        id:'',
        empresa: user['tec-user'].perfil.empresa.id,
        maquina: '',
        dimensiones:'',
    });

    const [empresas, setEmpresas] = useState(null);
    const [zonas, setZonas] = useState(null);

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

    useEffect(()=>{
        const filtro = `?maquina__empresa__id=${datos.empresa}&id=${datos.id}&maquina=${datos.maquina}&pertenece_grupo=${false}&dimensiones=${datos.dimensiones}`
        actualizaFiltro(filtro);
    },[datos]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }
    
    return ( 
        <Container>
            <h5 className="mb-3 mt-3">Filtro</h5>
            <Form>
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
                        <Form.Group controlId="dimensiones">
                            <Form.Label>Dimensiones *</Form.Label>
                            <Form.Control type="text" 
                                        name='dimensiones' 
                                        value={datos.dimensiones}
                                        onChange={handleInputChange} 
                                        placeholder="Dimensiones"
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Container>
     );
}
 
export default RodBancadaCTFiltro;