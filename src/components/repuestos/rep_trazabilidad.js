//Modal que abre los movimientos del repuesto
import React, { useEffect, useState } from 'react';
import { Button, Row, Modal, Col, Table } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const ListaTrazabilidad = ({repuesto, showTrazabilidad, handlerListCancelar}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [listado, setListado] = useState(null);
    const [datos, setDatos] = useState({usuario: user['tec-user']}); 

    useEffect(() => {
        console.log(datos.usuario.perfil.empresa.id);
        repuesto && axios.get(BACKEND_SERVER + `/api/repuestos/movimiento_trazabilidad/?linea_inventario__repuesto=${repuesto.id}&almacen__empresa=${datos.usuario.perfil.empresa.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            console.log('esto son los inventarios');
            console.log(res.data);
            axios.get(BACKEND_SERVER + `/api/repuestos/movimiento_trazabilidad/?linea_pedido__repuesto=${repuesto.id}&almacen__empresa=${datos.usuario.perfil.empresa.id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( re => {
                console.log('esto son los pedidos');
                console.log(re.data);
                axios.get(BACKEND_SERVER + `/api/repuestos/movimiento_trazabilidad/?linea_salida__repuesto=${repuesto.id}&almacen__empresa=${datos.usuario.perfil.empresa.id}`,{
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then( r => {
                    console.log('esto son las salidas');
                    console.log(r.data);
                    setListado(r.data.concat(re.data, res.data));
                })
                .catch( err => {
                    console.log(err);
                });
            })
            .catch( err => {
                console.log(err);
            });
        })
        .catch( err => {
            console.log(err);
        });
    }, [repuesto]);

    useEffect(() =>{
        //Ordena por fecha el listado de los movimentos
        if (listado){
            listado.sort(function(a, b){
                if(a.fecha > b.fecha){
                    return 1;
                }
                if(a.listado < b.listado){
                    return -1;
                }
                return 0;
            })
        }
    }, [listado]);

    const handlerListCerrar = () => {      
        handlerListCancelar();
    }
    return(
        <Modal show={showTrazabilidad} backdrop="static" keyboard={ false } animation={false} size="xl">
            <Modal.Header closeButton>                
                <Modal.Title>Listado Trazabilidad del Repuesto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row> 
                    <Col><h5>{repuesto?repuesto.nombre:''}</h5></Col>
                </Row>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>                                
                                <tr>
                                    <th>Movimiento</th>
                                    <th>Fecha</th>
                                    <th>Cantidad</th>
                                </tr>
                            </thead>                               
                            <tbody> 
                                {listado && listado.map( movimiento => {
                                    return (
                                        <tr key={movimiento.id}>                                            
                                            <td>{movimiento.linea_inventario?'Inventario' : movimiento.linea_salida?'Salida' : 'Pedido'}</td>
                                            <td>{invertirFecha(String(movimiento.fecha))}</td>
                                            <td>{movimiento.cantidad}</td>
                                        </tr>
                                    )
                                })
                                }                               
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>                                               
                <Button variant="info" onClick={handlerListCerrar}>
                    Cancelar
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
export default ListaTrazabilidad;
