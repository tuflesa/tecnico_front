import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Form, Table, Button } from 'react-bootstrap';

const RepPrecio = ()=>{
    const [token] = useCookies(['tec-token']);
    const [proveedores, setProveedores] = useState(null);
    const [precios, setPrecios] = useState(null);
    const prueba = [{}];

    const [datos, setDatos] = useState({
        id:'',
        proveedor: '', 
        descatalogado: false,  
        precio_n:[{}],
    });

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/repuestos/proveedor/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setProveedores(res.data.sort(function(a, b){
                if(a.nombre > b.nombre){
                    return 1;
                }
                if(a.nombre < b.nombre){
                    return -1;
                }
                return 0;
            }))
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(()=>{
        datos.proveedor && axios.get(BACKEND_SERVER + `/api/repuestos/repuesto_precio/?proveedor__id=${datos.proveedor}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {
            for(var x=0; x<res.data.length; x++){
                prueba[x]={
                    ids: res.data[x].id,
                    id: res.data[x].repuesto.id,
                    nombre: res.data[x].repuesto.nombre,
                    nombre_comun: res.data[x].repuesto.nombre_comun,
                    precio: res.data[x].precio,
                    precio_n:0,
                }
            }
            setPrecios(prueba.sort(function(a, b){
                if(a.nombre > b.nombre){
                    return 1;
                }
                if(a.nombre < b.nombre){
                    return -1;
                }
                return 0;
            }));
        })
        .catch(err => { console.log(err);})
    },[datos.proveedor]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }  

    const handleInputChange2 = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value,
            [event.target.id] : parseInt(event.target.className),
        })
    } 

    const PerderFoco = () => {
        for(var x=0; x<precios.length;x++){
            if(precios[x].id===datos.id){
                precios[x].precio_n=datos.precio_n;
            }
        }
    }  

    const handlerGuardar =()=>{
        for(var x=0; x<precios.length; x++){
            var precios_nuevos = precios[x].precio_n;
            var id=precios[x].ids;
            if(precios_nuevos!==0){
                axios.patch(BACKEND_SERVER + `/api/repuestos/repuesto_precio/${id}/`,{
                    precio: precios_nuevos
                }, { 
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }    
                })
                .then( res => {
                    window.location.href = "/repuestos/precio";
                })
                .catch(err => { console.log(err);})
            }
        }
    }

    const retroceder =()=>{
        window.location.href = "/repuestos/precio";
    }

    return(
        <Container className='mt-5'>
            <Row>
                <Col>
                    <h5></h5>
                    <h5>Precios por Repuesto</h5>
                </Col>
            </Row>     
            <Form>
                <Row>                    
                    <Col>
                        <Form.Group controlId="proveedor">
                            <Form.Label>Proveedor</Form.Label>
                            <Form.Control as="select"  
                                        name='proveedor' 
                                        value={datos.proveedor}
                                        onChange={handleInputChange}
                                        placeholder="Proveedor">
                                        <option key={0} value={''}>Elgir Proveedor</option>
                                        {proveedores && proveedores.map( prov => {
                                            return (
                                            <option key={prov.id} value={prov.id}>
                                                {prov.nombre}
                                            </option>
                                            )
                                        })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="descatalogado">
                            <Form.Label>Descatalogado</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.descatalogado}
                                            name='descatalogado'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                <option key={1} value={true}>Si</option>
                                <option key={2} value={false}>No</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                {datos.proveedor?
                    <React.Fragment>
                        <Form.Row>
                            <Col>
                                <Row>
                                    <Col>
                                    <h5 className="pb-3 pt-1 mt-2">Articulos del Proveedor:</h5>
                                    </Col>
                                </Row>
                            </Col>
                        </Form.Row>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Codigo</th>
                                    <th>Descripción Proveedor</th>
                                    <th>Descripción Etiqueta</th>
                                    <th>Precio Actual</th>
                                    <th>Nuevo Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {precios && precios.map( p => {
                                    return (                                                
                                        <tr key={p.id}>
                                            <td>{p.id}</td>
                                            <td>{p.nombre}</td>
                                            <td>{p.nombre_comun}</td>
                                            <td>{p.precio + '€'}</td>
                                            <td>
                                            <input                  
                                                className={p.id} 
                                                type = "text" 
                                                id = "id"
                                                name='precio_n'
                                                value= {datos.precio_n[p]}
                                                onChange={handleInputChange2}
                                                onBlur={PerderFoco}
                                                placeholder={p.precio_n}
                                            />
                                            </td>
                                        </tr>
                                    )})
                                }
                            </tbody>
                            <td>
                                <Button variant="info" onClick={handlerGuardar}>Guardar</Button>
                            </td>
                            <td>
                                <Button variant="info" onClick={retroceder}>Cancelar</Button>
                            </td>
                        </Table>
                    </React.Fragment> : null}
                </Form>
        </Container>
    )
}
export default RepPrecio;