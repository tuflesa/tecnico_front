import React , { useState, useEffect } from "react";
import { Container, Row, Form, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const RepInventarioFiltro = ({actualizaFiltro}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [almacenes, setAlmacenes] = useState(null);

    const [datos, setDatos] = useState({
        id:'',
        empresa: user['tec-user'].perfil.empresa.id, 
        nombre: '',
        fabricante: '',        
        almacen: '',
        nombre_comun: '',
    });

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(()=>{  
        const filtro = `?repuesto__nombre__icontains=${datos.nombre}&repuesto__nombre_comun__icontains=${datos.nombre_comun}&repuesto__fabricante__icontains=${datos.fabricante}&almacen__id=${datos.almacen}&almacen__empresa__id=${datos.empresa}&repuesto__descatalogado=${false}`;      
        actualizaFiltro(filtro);
    },[datos.nombre, datos.fabricante, datos.almacen, datos.nombre_comun, datos.id]);
    /* eslint-disable react-hooks/exhaustive-deps */

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/almacen/?empresa=${datos.empresa}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setAlmacenes(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, datos.empresa]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    return ( 
        <Container className="mt-5">
            <h5 className="mb-3 mt-3">Filtro</h5>
            <Form>
                <Row>                    
                    <Col>
                        <Form.Group controlId="almacen">
                            <Form.Label>Almacén</Form.Label>
                            <Form.Control as="select" 
                                        name='almacen' 
                                        value={datos.almacen}
                                        onChange={handleInputChange} 
                                        autoFocus >
                                <option key={0} value={''}>-------</option>
                                {almacenes && almacenes.map( almacen => {
                                    return (
                                    <option key={almacen.id} value={almacen.id}>
                                        {almacen.nombre}
                                    </option>
                                    )
                                })}   
                            </Form.Control>         
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="nombre">
                            <Form.Label>Nombre contiene</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange}                                        
                                        placeholder="Nombre contiene"/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="formNombreComun">
                            <Form.Label>Descripción Etiqueta</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre_comun' 
                                        value={datos.nombre_comun}
                                        onChange={handleInputChange}                                        
                                        placeholder="Descripción Etiqueta"/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fabricante">
                            <Form.Label>Fabricante contiene</Form.Label>
                            <Form.Control type="text" 
                                        name='fabricante' 
                                        value={datos.fabricante}
                                        onChange={handleInputChange} 
                                        placeholder="Fabricante contiene" />
                        </Form.Group>
                    </Col>                                  
                </Row>                               
            </Form>
        </Container>
     );
}
 
export default RepInventarioFiltro;