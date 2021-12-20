import React , { useState, useEffect } from "react";
import RepAlmacenForm from './rep_almacen_form';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button, Form } from 'react-bootstrap';
import RepuestoForm from "./rep_form";

const RepSalidas = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [filtro, setFiltro] = useState (null);
    const [repuesto, setRepuesto] = useState (null);
    const [almacenes, setAlmacenes]=useState(null)
    const [stock_minimo, setStock_minimo]=useState(null);

    const [numeroBar, setnumeroBar] = useState({
        id:'',
        almacen:'',
    });

    const [datos, setDatos] = useState({
        id:'',
        nombre:'',
        stock: '',
        cantidad:'',
        critico: '',
        usuario: user['tec-user'],
        almacen:'',
    });

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/almacen/?empresa=${datos.usuario.perfil.empresa.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setAlmacenes(res.data);
        })
        .catch(err => { console.log(err);})
    },[token]);

    const realizarSalida = ()=> {
   
        if(datos.cantidad===0){
            alert('La cantidad asignada es 0, revisar cantidad');
        }
        else{
            console.log('botón salida');
        }
    }
    
    const handleInputChange2 = (event) => {             
        setnumeroBar ({
            ...numeroBar,
            [event.target.name] : event.target.value                 
        }) 
        if(numeroBar.id.length===11){
            datos.id = parseInt(numeroBar.id);
            datos.almacen = numeroBar.almacen;
        }
    }

    useEffect(()=>{
        datos.id && datos.almacen && axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimos/?repuesto=${datos.id}&almacen=${datos.almacen}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setStock_minimo(res);
            console.log('esto es stock_minimo');
            console.log(res.data);
            if(res.data.length === 0){
                console.log ('no hay stock');
                alert('Este Repuesto NO existe en este almacen, revise almacen seleccionado');
                numeroBar.id='';
                numeroBar.almacen='';
                datos.id='';
                datos.almacen='';
            }
            else{
                axios.get(BACKEND_SERVER + `/api/repuestos/detalle/${res.data[0].repuesto}/`,{
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                        }
                })
                .then( ras => {
                    setRepuesto(ras); 
                    console.log('esto sería el articulo a pintar');         
                    console.log(ras.data);
                    setDatos ({
                        nombre: ras.data.nombre,
                        stock: res.data[0].stock_act,
                        critico: ras.data.es_critico ? 'Si' : 'No',
                        
                    }) 

                })
                .catch( err => {
                    console.log(err);
                });
            }
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, datos.id, datos.almacen]);

    return (
        <Container>
            <Row>                
                <Col>
                    <Form.Group controlId="almacen">
                        <Form.Label>Almacén</Form.Label>
                        <Form.Control as="select"  
                                    name='almacen' 
                                    value={numeroBar.almacen}
                                    placeholder="Almacén"
                                    onChange={handleInputChange2}> 
                                    <option key={0} value={''}>
                                            ----
                                    </option>
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
                    <Form.Group controlId="formId">
                        <Form.Label>Codigo Barras</Form.Label>
                        <Form.Control type="text" 
                                    name='id' 
                                    value={numeroBar.id}
                                    onChange={handleInputChange2}
                                    placeholder="Codigo de barras" />
                    </Form.Group>
                </Col>                
            </Row> 
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Repuestos</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Stock Actual</th>                                
                                <th>Crítico</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{datos.nombre}</td>
                                <td>{datos.stock}</td>
                                <td>{datos.critico}</td> 
                                <td>                                    
                                    <Form.Control   type="text" 
                                                    name='cantidad' 
                                                    value={datos.cantidad}
                                                    onChange={null}
                                                    placeholder="Cantidad" />                                    
                                </td>                                 
                            </tr>
                        </tbody>
                    </Table>
                </Col>                
            </Row>
            <Form.Row className="justify-content-center">
                {repuesto ? 
                    <Button variant="info" type="submit" className={'mx-2'} onClick={realizarSalida}>Hacer Salida</Button> :
                    null
                }
                <Link to='/home'>
                    <Button variant="warning" >
                        Cancelar
                    </Button>
                </Link>                            
            </Form.Row>
        </Container>
    )
}

export default RepSalidas;