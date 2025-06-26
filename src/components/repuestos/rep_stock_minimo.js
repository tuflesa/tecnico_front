import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const StockMinimoForm = ({show, handleCloseStock, repuesto_escritico, repuesto_id, stock, stock_minimo, updateRepuesto, stocks_utilizados, setShowStock}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [datos, setDatos] = useState({
        empresa: user['tec-user'].perfil.empresa.id,
        repuesto: repuesto_id,
        almacen: '',
        stock_minimo_cantidad: null,
        stock_aconsejado: null,
        stock_actual: null,
        localizacion: null,
        stock_minimo : null,
    });
    const [empresas, setEmpresas] = useState([]);
    const [almacenes, setAlmacenes] = useState([]);
    const [guardarDisabled, setGuardarDisabled] = useState(false);

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
        axios.get(BACKEND_SERVER + `/api/repuestos/almacen/?empresa=${datos.empresa}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            let almacenes_utilizados = [];
            if (stocks_utilizados) {
                stocks_utilizados.forEach( s => {
                    almacenes_utilizados.push(s.almacen.id);
                })
            }
            const almacenes_disponible = res.data.filter( a =>!almacenes_utilizados.includes(a.id));
            setGuardarDisabled(almacenes_disponible.length === 0);
            setAlmacenes(almacenes_disponible);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, datos.empresa, stocks_utilizados]);

    useEffect(()=>{
        setDatos({
            ...datos,
            stock_minimo_cantidad : stock ? stock.stock_minimo : null,
            stock_aconsejado : stock ? stock.stock_minimo : null, // revisar
            stock_minimo_inicial : stock ? stock.stock_minimo : null,
            stock_actual : stock ? stock.suma : null,
            stock_actual_inicial : stock ? stock.suma : null,
            stock_minimo : stock_minimo ? stock_minimo : null,
        })
    },[stock, stock_minimo, almacenes]);

    useEffect(()=>{
        setDatos({
            ...datos,
            almacen : stock ? stock.almacen__id : almacenes.length > 0 ? almacenes[0].id : '',
        })
    },[almacenes]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        });
    }

    const handleDisabled = () => {
        return user['tec-user'].perfil.nivel_acceso.nombre === 'local'
    }

    const handleCancelar = () => {
        setDatos({
            ...datos,
            stock_minimo_cantidad : null,
            stock_aconsejado : null,
            stock_actual : null,
            localizacion : null,
        });
        handleCloseStock();
       
    }

    const handleGuardar = () => {
        if (datos.stock_minimo_cantidad !== datos.stock_minimo_inicial){
            // Stock mínimo
            if (datos.stock_minimo) { // Actualizar stock mínimo
                // datos.stock_minimo.cantidad = parseInt(datos.stock_minimo_cantidad);
                axios.patch(BACKEND_SERVER + `/api/repuestos/stocks_minimos/${datos.stock_minimo.id}/`, {
                    cantidad: datos.stock_minimo_cantidad,
                    cantidad_aconsejable: datos.stock_aconsejado,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                      }     
                })
                .then( res => { 
                        updateRepuesto();
                        setShowStock(false);
                    }
                )
                .catch(err => { console.log(err);})
            }
            else { // Crear stock mínimo
                axios.post(BACKEND_SERVER + `/api/repuestos/stocks_minimos/`, {
                    repuesto: repuesto_id,
                    almacen: datos.almacen,
                    cantidad: datos.stock_minimo_cantidad ? datos.stock_minimo_cantidad : 0,
                    cantidad_aconsejable: datos.stock_aconsejado? datos.stock_aconsejado : 0,
                    stock_act: 0,
                    localizacion: datos.localizacion, 
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                      }     
                })
                .then( res => { 
                        if (!datos.stock_actual) {
                            console.log('no hay valor inicial de stock ...')
                        }
                        updateRepuesto();
                        setShowStock(false);
                    }
                )
                .catch(err => { console.log(err);})
            }
        }

        // Ajustar Stock
        if (datos.stock_actual !== datos.stock_actual_inicial || !datos.stock_actual){ // Si hay cambios o se deja sin valor el campo stock
            // 1 Crear un inventario
            // 2 Añadir una línea de inventario
            // 3 Generar un movimiento correspondiente al inventario

            const hoy = new Date();
            var dd = String(hoy.getDate()).padStart(2, '0');
            var mm = String(hoy.getMonth() + 1).padStart(2, '0'); //Enero es 0!
            var yyyy = hoy.getFullYear();
            
            axios.post(BACKEND_SERVER + `/api/repuestos/inventario/`, {
                nombre : datos.stock_actual_inicial ? 'Ajuste de stock' : 'Ajuste Inicial',
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
                        repuesto : repuesto_id,
                        almacen : datos.almacen,
                        cantidad : datos.stock_actual ? datos.stock_actual : 0 
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                          }     
                    })
                    .then( res => {
                        axios.post(BACKEND_SERVER + `/api/repuestos/movimiento/`, {
                            fecha : yyyy + '-' + mm + '-' + dd,
                            cantidad : datos.stock_actual_inicial ? (parseInt(datos.stock_actual) - parseInt(datos.stock_actual_inicial)) : datos.stock_actual ? datos.stock_actual : 0,
                            almacen : datos.almacen,
                            usuario : user['tec-user'].id,
                            linea_inventario : res.data.id
                        }, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                              }     
                        })
                        .then( res => {
                            updateRepuesto();
                        })
                        .catch( err => {console.log(err);})
                    })
                    .catch( err => {console.log(err);})
                }
            )
            .catch(err => { console.log(err);})
        }
        
        handleCancelar();
    }

    return (
        <Modal show={show} onHide={handleCloseStock} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header>
                    <Modal.Title>Stock Mínimo + Ajuste</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form >
                        <Row>
                            <Col>
                                <Form.Group controlId="empresa">
                                    <Form.Label>Empresa</Form.Label>
                                    <Form.Control as="select"  
                                                name='empresa' 
                                                value={datos.empresa}
                                                onChange={handleInputChange}
                                                disabled={stock ? true : handleDisabled()}
                                                placeholder="Empresa">
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
                                <Form.Group controlId="almacen">
                                    <Form.Label>Almacén</Form.Label>
                                    <Form.Control as="select"  
                                                name='almacen' 
                                                value={datos.almacen}
                                                onChange={handleInputChange}
                                                disabled={stock ? true : false}
                                                placeholder="Almacen">
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
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="localizacion">
                                    <Form.Label>Ubicación</Form.Label>
                                    <Form.Control type="text" 
                                                name='localizacion' 
                                                value={datos.localizacion}
                                                onChange={handleInputChange} 
                                                placeholder="Localización en Almacén"
                                                // disabled
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="stock_actual">
                                    <Form.Label>Stock Actual</Form.Label>
                                    <Form.Control type="text" 
                                                name='stock_actual' 
                                                value={datos.stock_actual}
                                                onChange={handleInputChange} 
                                                placeholder="Stock Actual"
                                                // disabled
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="stock_minimo_cantidad">
                                    <Form.Label>Stock Mínimo</Form.Label>
                                    <Form.Control type="text" 
                                                name='stock_minimo_cantidad' 
                                                value={datos.stock_minimo_cantidad}
                                                onChange={handleInputChange} 
                                                placeholder="Stock Mínimo"
                                                disabled={repuesto_escritico===false?true:false}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="stock_aconsejado">
                                    <Form.Label>Stock Recomendado</Form.Label>
                                    <Form.Control type="text" 
                                                name='stock_aconsejado' 
                                                value={datos.stock_aconsejado}
                                                onChange={handleInputChange} 
                                                placeholder="Stock Recomendado"
                                                disabled={repuesto_escritico===false?false:true}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="info" 
                        onClick={handleGuardar}
                        disabled = {guardarDisabled}>
                        Guardar
                    </Button>
                    <Button variant="waring" onClick={handleCancelar}>
                        Cancelar
                    </Button>
                </Modal.Footer>
        </Modal>
    )
}

export default StockMinimoForm;