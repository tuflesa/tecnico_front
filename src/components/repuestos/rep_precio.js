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
    var foco =0;

    const [datos, setDatos] = useState({
        id:'',
        proveedor: '', 
        descatalogado: false,  
        precio_n:{},
        descuento_n:{},
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
                    descuento: res.data[x].descuento,
                    descuento_n:0,
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

    useEffect(() => {
        if(precios){
            for(var x=0; x<precios.length;x++){
                if(precios[x].id===datos.id){
                    console.log('estoy dentro del if de perferfoco');
                    console.log(datos.precio_n);
                    precios[x].precio_n=datos.precio_n;
                    //precios[x].descuento_n=datos.descuento_n;
                }
                console.log(precios);
            }
    }
    }, [datos.precio_n]);

    useEffect(() => {
        if(precios){
            for(var x=0; x<precios.length;x++){
                console.log('estoy en perderfocoDto en el for');
                console.log(precios[x].id);
                console.log(datos.id);
                if(precios[x].id===datos.id){
                    console.log('estoy en perderfocoDto en el if');
                    precios[x].descuento_n=datos.descuento_n;
                }
            }
        }
    }, [datos.descuento_n]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }  

    const handleInputChange2 = (event) => {
        console.log('estoy en el handleinputchange2');
        setDatos({
            ...datos,
            [event.target.name] : event.target.value,
            [event.target.id] : parseInt(event.target.className),
        })
        foco=1;
        console.log(datos);
    } 

    const handleInputChange3 = (event) => {
        console.log('estoy en el handleinputchange3');
        setDatos({
            ...datos,
            [event.target.name] : event.target.value,
            [event.target.id] : parseInt(event.target.className),
        })
        console.log(datos);
    } 

    /* const PerderFoco = () => {
        console.log('estoy en perderfoco');
        console.log(Object.prototype.toString.call(datos.precio_n));
        for(var x=0; x<precios.length;x++){
            if(precios[x].id===datos.id){
                console.log('estoy dentro del if de perferfoco');
                console.log(datos.precio_n);
                precios[x].precio_n=datos.precio_n;
                //precios[x].descuento_n=datos.descuento_n;
            }
            console.log(precios);
        }
        datos.precio_n=0;        
    } */

    /* const PerderFocoDto = () => {
        console.log('estoy en perderfocoDto');
        console.log(datos);
        for(var x=0; x<precios.length;x++){
            console.log('estoy en perderfocoDto en el for');
            console.log(precios[x].id);
            console.log(datos.id);
            if(precios[x].id===datos.id){
                console.log('estoy en perderfocoDto en el if');
                precios[x].descuento_n=datos.descuento_n;
                datos.descuento_n=0;
            }
        }
        
    }  */

    const handlerGuardar =()=>{
        console.log('esto vale precios en guardar');
        console.log(precios);
        for(var x=0; x<precios.length; x++){
            var precios_nuevos = precios[x].precio_n;
            var descuento_nuevo = precios[x].descuento_n;
            var ids=precios[x].ids; //es el id de la línea no del repuesto
            if(precios_nuevos!==0){
                console.log('dentro del if de precios');
                axios.patch(BACKEND_SERVER + `/api/repuestos/repuesto_precio/${ids}/`,{
                    precio: precios_nuevos,
                }, { 
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }    
                })
                .then( res => {
                    //window.location.href = "/repuestos/precio";
                })
                .catch(err => { console.log(err);})
            }
            if(descuento_nuevo!==0){
                console.log('dentro del if de descuentos');
                console.log(precios[x].descuento_n);
                axios.patch(BACKEND_SERVER + `/api/repuestos/repuesto_precio/${ids}/`,{
                    descuento: descuento_nuevo,
                }, { 
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }    
                })
                .then( res => {
                    //window.location.href = "/repuestos/precio";
                })
                .catch(err => { console.log(err);})
            }
        }
        window.location.href = "/repuestos/precio";
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
                                    <th>Descuento</th>
                                    <th>Precio Actual</th>
                                    <th>Nuevo Descuento</th>
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
                                            <td>{p.descuento?p.descuento + '%':0 + '%'}</td>
                                            <td>{p.precio?p.precio + '€': 0 + '€'}</td>
                                            <td>
                                            <input                  
                                                className={p.id} 
                                                type = "text" 
                                                name='descuento_n'
                                                id = "id"
                                                value= {datos.descuento_n[p]}
                                                onChange={handleInputChange3}
                                                //onBlur={PerderFocoDto}
                                                placeholder={p.descuento_n}
                                            />
                                            </td>
                                            <td>
                                            <input                  
                                                className={p.id} 
                                                type = "text" 
                                                id = "id"
                                                name='precio_n'
                                                value= {datos.precio_n[p]}
                                                onChange={handleInputChange2}
                                                //onBlur={PerderFoco}
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