import React, { useState, useEffect } from 'react';
import './repuestos.css';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { filter } from 'd3';
import logo from '../../assets/icono_1.svg';
import cuchilla from '../../assets/cuchilla_1.svg';
import logo_bor from '../../assets/bitmap.svg';


const Programadores = () => {
    const [user] = useCookies(['tec-user']);
    const [token] = useCookies(['tec-token']);

    const soyProgramador = user['tec-user'].perfil.destrezas.filter(s => s === 7);
    const [lista_repuestos, setListaRepuestos] = useState(null);
    const [repuestos, setRepuestos] = useState(null);
    var numero = 2;

    //crea el listado en la tabla de precios de proveedor de los repuestos ya enlazados a proveedores.
    /* const CrearListado = ()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/lista/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setListaRepuestos(res.data);
            for(var x=0; x<res.data.length; x++){
                for(var y=0; y<res.data[x].proveedores.length; y++){
                    axios.post(BACKEND_SERVER + `/api/repuestos/precio/`, {
                        repuesto: res.data[x].id,
                        proveedor: res.data[x].proveedores[y],
                        precio: 0,
                        descuento: 0, 
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                          }     
                    })
                    .then( res => { 
                        console.log('ya estaaaaaa');
                    })
                    .catch(err => { console.log(err);})
                }
            }
        })
        .catch( err => {
            console.log(err);
        });
    }*/
 

    //copiar la descripción de proveedor actual de repuestos en la tabla de precio, descripcion_proveedor.
    const copia_descripcion = ()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/repuesto_precio/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setListaRepuestos(res.data);
            console.log(res.data);
            for(var y=0; y<res.data.length; y++){
                axios.patch(BACKEND_SERVER + `/api/repuestos/precio/${res.data[y].id}/`, {
                    descripcion_proveedor: res.data[y].repuesto.nombre,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                      }     
                })
                .then( r => { 
                    console.log('ya estaaaaaa');
                    console.log(res.data);
                })
                .catch(err => { console.log(err);})
            }
        })
        .catch( err => {
            console.log(err);
        });
    }

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/repuesto_precio/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setRepuestos(res.data);
        })
        .catch(err => { console.log(err);})
    },[token]);

    return (
        <Container className='mt-5'>
            <Row>
                <Col>
                    
                    <h5 className="mb-3 mt-3">Acciones de Programadores</h5>  
                    <h5><img src = {logo}></img></h5>                 
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Crear lista precio - proveedor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* <th><Button variant="info" onClick={event =>{CrearListado()}}>Crear lista</Button></th> */}
                            <th><Button variant="info" onClick={event =>{copia_descripcion()}}>Copiar datos</Button></th>
                        </tbody>
                    </Table>
                </Col>
            </Row>  
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Almacenes</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th colspan ={numero}>Id Repuesto precio</th>
                                <th>Nombre</th>
                                <th>Imagen</th>
                                <th>Proveedor</th>
                            </tr>
                            <tr>
                                <th><img src = {logo}></img></th>
                                <th><img src = {logo}></img></th>
                                <th><img src = {logo}></img></th>
                                <th><img src = {logo}></img></th>
                                <th><img src = {logo}></img></th>
                            </tr>
                        </thead>
                        <tbody>
                            {repuestos && repuestos.map( repuesto => {
                                return (
                                    <tr key={repuesto.id}>
                                        <td>{repuesto.nombre}</td>
                                        <td>{repuesto.proveedor===29?<img src = {logo}></img>:repuesto.proveedor===30?<img src = {cuchilla}></img>:''}</td>
                                        <td>{repuesto.proveedor}</td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>          
        </Container>        
    )
}

export default Programadores;