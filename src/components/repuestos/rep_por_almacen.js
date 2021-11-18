import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Button, Row, Form, Modal, Col, Table } from 'react-bootstrap';
import { PencilFill } from 'react-bootstrap-icons';
const RepPorAlmacen = ({empresa, repuesto, cerrarListAlmacen, show})=>{
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [datos, setDatos] = useState({
        stocks_minimos: repuesto ? repuesto.stocks_minimos : null,
        cantidad: repuesto ? repuesto.stocks_minimos.cantidad : null,
        almacen: null,
        //stock_act: repuesto ? repuesto.stocks_minimos.stock_act : null,
        stock_actual: null,
        stock_minimo: null, 
        habilitar: null,   
    });  
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })        
    }

    const habilitar_linea = (r) =>{
        
        datos.habilitar = r.id;
    }
    console.log('que vale habilitar');
    console.log(datos.habilitar);
    const ActualizaStock = (r) =>{
        let r_id = r.id;
        let r_almacen = r.almacen.id;
        axios.patch(BACKEND_SERVER + `/api/repuestos/stocks_minimos/${r_id}/`, {
            cantidad: datos.stock_minimo ? datos.stock_minimo : repuesto.stocks_minimos.cantidad,  
            stock_act: datos.stock_actual ? datos.stock_actual : repuesto.stocks_minimos.stock_act,          
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            //console.log('modificado correctamente_________');
            if (datos.stock_actual){
                //console.log('hemos modificado Stock_Act.....') ;
                const hoy = new Date();
                var dd = String(hoy.getDate()).padStart(2, '0');
                var mm = String(hoy.getMonth() + 1).padStart(2, '0'); //Enero es 0!
                var yyyy = hoy.getFullYear();
                
                axios.post(BACKEND_SERVER + `/api/repuestos/inventario/`, {
                    nombre : 'Ajuste de stock',
                    fecha_creacion : yyyy + '-' + mm + '-' + dd,
                    responsable : user['tec-user'].id
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }     
                })
                .then( res => { 
                        const inventario = res.data
                        axios.post(BACKEND_SERVER + `/api/repuestos/lineainventario/`, {
                            inventario : inventario.id,
                            repuesto : repuesto.id,
                            almacen : r_almacen,
                            cantidad : datos.stock_actual, 
                        }, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }     
                        })
                        .then( res => {
                            // console.log(res.data);
                            const linea_inventario = res.data;
                            axios.post(BACKEND_SERVER + `/api/repuestos/movimiento/`, {
                                fecha : yyyy + '-' + mm + '-' + dd,
                                cantidad : datos.stock_actual,
                                almacen : r_almacen,
                                usuario : user['tec-user'].id,
                                linea_inventario : linea_inventario.id
                            }, {
                                headers: {
                                    'Authorization': `token ${token['tec-token']}`
                                }     
                            })
                            .then( res => {
                                //console.log('FINNN');
                                //updateRepuesto();
                            })
                            .catch( err => {console.log(err);})
                        })
                        .catch( err => {console.log(err);})
                    }
                )
            }
        })
        .catch(err => { console.log(err);})
    }

    const handlerListCancelar = () => {      
        cerrarListAlmacen();
        datos.stock_actual= '';
        datos.stock_minimo= '';
    } 
    return (
        <Modal show={show} backdrop="static" keyboard={ false } animation={false} size="lg">
            <Modal.Header closeButton>                
                <Modal.Title>Repuestos por almacén</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Row>
                            <Col>
                            <h5 className="pb-3 pt-1 mt-2">Stock por almacén:</h5>
                            </Col>                                            
                        </Row>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Almacén</th>
                                    <th>Ubicación</th>
                                    <th>Stock Actual</th>
                                    <th>Stock Mínimo</th>
                                    <th>Actualizar</th>
                                </tr>
                            </thead>
                            {repuesto ?
                                <tbody>
                                    {datos.stocks_minimos && datos.stocks_minimos.map( r => {
                                        var mostrar = false;
                                        if(datos.habilitar===r.id){
                                            mostrar = true;
                                        }
                                        else (mostrar = false);
                                            if(r.almacen.empresa === empresa){
                                                return (
                                                    
                                                    <tr key={r.id}>
                                                        <td>{r.almacen.nombre}</td> 
                                                        <td>{r.localizacion}</td>                                                                                                       
                                                        <td>
                                                        <input type = "text" 
                                                                        name='stock_actual' 
                                                                        value= {datos.stock_act}
                                                                        onChange={handleInputChange}
                                                                        placeholder={r.stock_act}
                                                                        disabled={mostrar}
                                                        />
                                                        </td>
                                                        <td>
                                                        <input type = "text" 
                                                                        name='stock_minimo' 
                                                                        value= {datos.stock_min}
                                                                        onChange={handleInputChange}
                                                                        placeholder={r.cantidad}
                                                                        disabled={mostrar}
                                                        />
                                                        </td>
                                                        <td>
                                                            <PencilFill className="mr-3 pencil" onClick= {async => {habilitar_linea(r)}}/>                                               
                                                            <PencilFill className="mr-3 pencil" onClick= {async => {ActualizaStock(r)}}/>
                                                        </td>
                                                    </tr>
                                                )}
                                            })
                                    }
                                </tbody>
                            : null
                            }
                        </Table>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>                                               
                <Button variant="info" onClick={handlerListCancelar}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
export default RepPorAlmacen;