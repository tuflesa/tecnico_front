//import React, { useState, useEffect } from 'react';
import './repuestos.css';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
//import { useCookies } from 'react-cookie';
//import axios from 'axios';
//import { BACKEND_SERVER } from '../../constantes';
//import { filter } from 'd3';
import logo from '../../assets/icono_1.svg';
//import cuchilla from '../../assets/cuchilla_1.svg';
//import logo_bor from '../../assets/bitmap.svg';


const Programadores = () => {
    //const [user] = useCookies(['tec-user']);
    //const [token] = useCookies(['tec-token']);

    /* const soyProgramador = user['tec-user'].perfil.destrezas.filter(s => s === 7);
    const [precios, setPrecios] = useState(null);
    const [lista_precios, setListaPrecios] = useState(null);
    const [repuestos, setRepuestos] = useState(null);
    const [linea_pedidos, setLineaPedidos] = useState(null);
    const generico_id = 32;
    const generico_id = 273;
    const right =[];
    const Nright = [];
    const SinProveedor = [];
    const ConProveedor = []; */
    
    //var numero = 2;
    //var SiEsta = '';

    //vamos a copiar las observaciones de los trabajadores de las tareas a las lineas de parte
    /* axios.get(BACKEND_SERVER + `/api/mantenimiento/lineas_parte_trabajo/`,{
        headers: {
            'Authorization': `token ${token['tec-token']}`
        }
    })
    .then( r => {
        console.log('que listado obtenemos');
        console.log(r.data);
        for(var x=1500;x<1512; x++){
            console.log('dentro del for');
            axios.patch(BACKEND_SERVER + `/api/mantenimiento/lineas_parte_mov/${r.data[x].id}/`,{
                observaciones_trab: r.data[x].tarea.observaciones_trab,
            },
            {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                console.log('dentro del patch');
            })
            .catch( err => {
                console.log(err);
            });
        }
    })
    .catch( err => {
        console.log(err);
    }); */

    //Repasa el listado en la tabla de precios de proveedor y crea aquello que se hayan quedado sin crear o se hayan borrado.
    /* const RepasarListado = ()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/repuesto_precio/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( r => {
            console.log('esto es la lista de repuestos_precios');
            console.log(r.data);
            setListaPrecios(r.data);
        })
        console.log('se terminóoooooo');
    }

    useEffect(()=>{
        console.log(lista_precios);
        for(var x=2300; x<2342; x++){
            lista_precios && axios.patch(BACKEND_SERVER + `/api/repuestos/precio/${lista_precios[x].id}/`, {
                descripcion_proveedor: lista_precios[x].repuesto.nombre,
                modelo_proveedor: lista_precios[x].repuesto.modelo,
                fabricante: lista_precios[x].repuesto.fabricante,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }     
            })
            .then( s => { 
                console.log('en el then del patch');
            })
            .catch(err => { console.log(err);})
        }
    }, [lista_precios]); */

    //copiar la descripción de proveedor actual y modelo actual de repuestos en la tabla de precio, descripcion_proveedor.
    const copia_descripcion = ()=>{
        /* for(var y=0; y<SinProveedor.length; y++){
            const newProveedores = [parseInt(generico_id)];
            axios.patch(BACKEND_SERVER + `/api/repuestos/lista/${SinProveedor[y].id}/`, {
                proveedores:newProveedores,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }     
            })
            .then( r => { 
                console.log('patch de la linea de pedido');
            })
            .catch(err => { console.log(err);})
        } */
        /* for(var y=0; y<ConProveedor.length; y++){
            console.log('estamos dentro _____ 30!!!');
            for(var x=0; x<ConProveedor[y].proveedores.length; x++){
                axios.post(BACKEND_SERVER + `/api/repuestos/precio/`, {
                    proveedor: ConProveedor[y].proveedores[x],
                    repuesto: ConProveedor[y].id,
                    precio: '',
                    descuento: '',
                    descripcion_proveedor: ConProveedor[y].nombre,
                    modelo_proveedor: ConProveedor[y].modelo,
                    fabricante: ConProveedor[y].fabricante,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                        }     
                })
                .then( res => { 
                    }
                )
                .catch(err => { console.log(err);});
            }
        }
        console.log('termino el post en precio'); */
    }

    const RepasarListado = () => {
       /*  axios.get(BACKEND_SERVER + `/api/repuestos/precio/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setPrecios(res.data);
            axios.get(BACKEND_SERVER + `/api/repuestos/lista_repuestos/`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }     
            })
            .then( r => { 
                setRepuestos(r.data);                
            })
            .catch(err => { console.log(err);})
        })
        .catch(err => { console.log(err);}) */
        
        
    }

    const los_diferentes = () => {
        /* var cont = 0;
        repuestos.filter((d) => {
            precios.filter((s) => {
                if (d.id === s.repuesto) {
                    cont=1;
                    Nright.push(d);
                    
                }
            })
            if(cont===0){
                if(d.proveedores.length===1){
                    SinProveedor.push(d);
                }
                else{
                    ConProveedor.push(d);
                }
                right.push(d);
            }
            else{
                cont=0;
            }
        }) */
    }


    //copiar la descripción de proveedor y el modelo en la linea del pedido.
    const copiar_datos = ()=>{
        /* for(var y=1300; y<1368; y++){
            axios.patch(BACKEND_SERVER + `/api/repuestos/linea_pedido/${linea_pedidos[y].id}/`, {
                descripcion_proveedor: linea_pedidos[y].repuesto.nombre,
                modelo_proveedor: linea_pedidos[y].repuesto.modelo,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }     
            })
            .then( r => { 
                console.log('patch de la linea de pedido');
            })
            .catch(err => { console.log(err);})
        } */
    }
    const copia_descripcion_linea_pedido = ()=>{
        /* axios.get(BACKEND_SERVER + `/api/repuestos/linea_pedido_detalle/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setLineaPedidos(res.data);
            console.log('listado de lineas de pedido');
            console.log(res.data);
        })
        .catch( err => {
            console.log(err);
        }); */
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
                            <th><Button variant="info" onClick={event =>{los_diferentes()}}>3- Recoger los diferentes</Button></th>
                            <th><Button variant="info" onClick={event =>{copia_descripcion_linea_pedido()}}>4- Copiar datos linea pedidos</Button></th>
                            <th><Button variant="info" onClick={event =>{copiar_datos()}}>5- Copiar datos en linea</Button></th>
                        </tbody>
                    </Table>
                </Col>
            </Row>  
            {/* <Row>
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
            </Row> */}          
        </Container>        
    )
}

export default Programadores;