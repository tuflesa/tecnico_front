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
        proveedor:'', 
        descripcion:'',
        modelo:'',
        nombre:'',
        descatalogado: false,  
        precio_n:{},
        descuento_n:{},
        descripcion_proveedor_n:{},
        modelo_proveedor_n:{},
    });

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/repuestos/proveedor/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setProveedores(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(()=>{
        datos.proveedor && axios.get(BACKEND_SERVER + `/api/repuestos/repuesto_precio/?proveedor__id=${datos.proveedor}&descripcion_proveedor__icontains=${datos.descripcion}&modelo_proveedor__icontains=${datos.modelo}&repuesto__nombre__icontains=${datos.nombre}`,{
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
                    descripcion_proveedor:res.data[x].descripcion_proveedor,
                    descripcion_proveedor_n:'',
                    modelo_proveedor:res.data[x].modelo_proveedor,
                    modelo_proveedor_n:'',
                }
            }
            setPrecios(prueba);
        })
        .catch(err => { console.log(err);})
    },[datos.proveedor, datos.descripcion, datos.nombre, datos.modelo]);

    useEffect(() => {
        if(precios){
            for(var x=0; x<precios.length;x++){
                if(precios[x].id===datos.id){
                    precios[x].precio_n=datos.precio_n;
                    //precios[x].descuento_n=datos.descuento_n;
                }
            }
    }
    }, [datos.precio_n]);

    useEffect(() => {
        if(precios){
            for(var x=0; x<precios.length;x++){
                if(precios[x].id===datos.id){
                    precios[x].descuento_n=datos.descuento_n;
                }
            }
        }
    }, [datos.descuento_n]);

    useEffect(() => {
        if(precios){
            for(var x=0; x<precios.length;x++){
                if(precios[x].id===datos.id){
                    precios[x].descripcion_proveedor_n=datos.descripcion_proveedor_n;
                    precios[x].modelo_proveedor_n=datos.modelo_proveedor_n;
                }
            }
        }
    }, [datos.descripcion_proveedor_n, datos.modelo_proveedor_n]);

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

    const handleInputChange3 = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value,
            [event.target.id] : parseInt(event.target.className),
        })
    } 

    const handleInputChange4 = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value,
            [event.target.id] : parseInt(event.target.className),
        })
    }

    const handlerGuardar =()=>{
        for(var x=0; x<precios.length; x++){
            var precios_nuevos = precios[x].precio_n;
            var descuento_nuevo = precios[x].descuento_n;
            var descripcion_nueva = precios[x].descripcion_proveedor_n;
            var modelo_nuevo = precios[x].modelo_proveedor_n;
            var ids=precios[x].ids; //es el id de la línea no del repuesto
            if(precios_nuevos!==0){
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
            if(descripcion_nueva!==''){
                axios.patch(BACKEND_SERVER + `/api/repuestos/repuesto_precio/${ids}/`,{
                    descripcion_proveedor: descripcion_nueva,
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
            if(modelo_nuevo!==''){
                axios.patch(BACKEND_SERVER + `/api/repuestos/repuesto_precio/${ids}/`,{
                    modelo_proveedor: modelo_nuevo,
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
                    {datos.proveedor?
                        <Col>
                            <Form.Group controlId="descripcion">
                                <Form.Label>Descripción Proveedor</Form.Label>
                                <Form.Control type="text" 
                                            name='descripcion' 
                                            value={datos.descripcion}
                                            onChange={handleInputChange} 
                                            placeholder="Descripción proveedor"/>
                            </Form.Group>
                        </Col>
                    :null}
                    {datos.proveedor?
                        <Col>
                            <Form.Group controlId="nombre">
                                <Form.Label>Descripción Repuesto</Form.Label>
                                <Form.Control type="text" 
                                            name='nombre' 
                                            value={datos.nombre}
                                            onChange={handleInputChange} 
                                            placeholder="Descripción repuesto"/>
                            </Form.Group>
                        </Col>
                    :null}
                    {datos.proveedor?
                        <Col>
                            <Form.Group controlId="modelo">
                                <Form.Label>Modelo Repuesto</Form.Label>
                                <Form.Control type="text" 
                                            name='modelo' 
                                            value={datos.modelo}
                                            onChange={handleInputChange} 
                                            placeholder="Modelo repuesto"/>
                            </Form.Group>
                        </Col>
                    :null}
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
                                    <th>Código</th>
                                    <th>Descripción proveedor</th>
                                    <th>Modelo proveedor</th>
                                    <th>Descripción repuesto</th>
                                    <th>Descuento</th>
                                    <th>Precio Actual</th>
                                    <th>Nuevo Descuento</th>
                                    <th>Nuevo Precio</th>
                                    <th>Nueva Descripción</th>
                                    <th>Nuevo Modelo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {precios && precios.map( p => {
                                    return (                                                
                                        <tr key={p.id}>
                                            <td>{p.id}</td>
                                            <td>{p.descripcion_proveedor}</td>
                                            <td>{p.modelo_proveedor}</td>
                                            <td>{p.nombre}</td>
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
                                            <td>
                                            <input                  
                                                className={p.id} 
                                                type = "text" 
                                                id = "id"
                                                name='descripcion_proveedor_n'
                                                value= {datos.descripcion_proveedor_n[p]}
                                                onChange={handleInputChange4}
                                                //onBlur={PerderFoco}
                                                placeholder={p.descripcion_proveedor_n}
                                            />
                                            </td>
                                            <td>
                                            <input                  
                                                className={p.id} 
                                                type = "text" 
                                                id = "id"
                                                name='modelo_proveedor_n'
                                                value= {datos.modelo_proveedor_n[p]}
                                                onChange={handleInputChange4}
                                                //onBlur={PerderFoco}
                                                placeholder={p.modelo_proveedor_n}
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