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
    const [lista_precios, setListaPrecios] = useState(null);
    const [repuestos, setRepuestos] = useState(null);
    
    var numero = 2;
    var SiEsta = '';

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
 
    //Repasa el listado en la tabla de precios de proveedor y crea aquello que se hayan quedado sin crear o se hayan borrado.
    const RepasarListado = ()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/lista_repuestos/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setListaRepuestos(res.data);
            axios.get(BACKEND_SERVER + `/api/repuestos/repuesto_precio/`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( r => {
                //console.log(r.data);
                setListaPrecios(r.data);
                for(var x=0; x<res.data.length; x++){
                    for(var y=0; y<r.data.length; y++){
                        if(res.data[x].id===r.data[y].repuesto.id){
                            SiEsta=1;
                        }
                    }
                    if(SiEsta!==1){
                        if(res.data[x].proveedores.length===0){
                            alert('este repuesto no tiene proveedor, revisar: ' + res.data[x].nombre);
                            break;
                        }
                        else if(res.data[x].proveedores.length!==0){
                            for(var z=0; z<res.data[x].proveedores.length;z++){
                                axios.post(BACKEND_SERVER + `/api/repuestos/precio/`, {
                                    repuesto: res.data[x].id,
                                    proveedor: res.data[x].proveedores[z],
                                    descripcion_proveedor: res.data[x].nombre,
                                    modelo_proveedor: res.data[x].modelo,
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
                            SiEsta='';
                        }
                    }
                    else{
                        SiEsta='';
                    }
                }
            })
            .catch( err => {console.log(err); });
        })
        .catch( err => {
            console.log(err);
        });
        console.log('se terminóoooooo');
    }

    //copiar la descripción de proveedor actual y modelo actual de repuestos en la tabla de precio, descripcion_proveedor.
    const copia_descripcion = ()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/repuesto_precio/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setListaRepuestos(res.data);
            for(var y=0; y<res.data.length; y++){
                axios.patch(BACKEND_SERVER + `/api/repuestos/precio/${res.data[y].id}/`, {
                    descripcion_proveedor: res.data[y].repuesto.nombre,
                    modelo_proveedor: res.data[y].repuesto.modelo,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                      }     
                })
                .then( r => { 
                    console.log('copiado descripción y modelo');
                })
                .catch(err => { console.log(err);})
            }
        })
        .catch( err => {
            console.log(err);
        });
    }

    //copiar la descripción de proveedor y el modelo en la linea del pedido.
    const copia_descripcion_linea_pedido = ()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/linea_pedido_detalle/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            for(var y=0; y<res.data.length; y++){
                axios.patch(BACKEND_SERVER + `/api/repuestos/linea_pedido/${res.data[y].id}/`, {
                    descripcion_proveedor: res.data[y].repuesto.nombre,
                    modelo_proveedor: res.data[y].repuesto.modelo,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                      }     
                })
                .then( r => { 
                })
                .catch(err => { console.log(err);})
            }
        })
        .catch( err => {
            console.log(err);
        });
    }

    /* useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/repuesto_precio/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setRepuestos(res.data);
        })
        .catch(err => { console.log(err);})
    },[token]); */

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
                            <th><Button variant="info" onClick={event =>{RepasarListado()}}>1- Repasar lista de precios</Button></th>
                            <th><Button variant="info" onClick={event =>{copia_descripcion()}}>2- Copiar DESCRIPCION Y MODELO en precio</Button></th>
                            <th><Button variant="info" onClick={event =>{copia_descripcion_linea_pedido()}}>3- Copiar datos a la linea de pedido</Button></th>
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