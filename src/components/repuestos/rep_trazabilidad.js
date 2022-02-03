//Modal que abre los movimientos del repuesto
import React, { useEffect, useState } from 'react';
import { Button, Row, Modal, Col, Table } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import {invertirFecha} from '../utilidades/funciones_fecha';
import ReactExport from 'react-data-export';
import moment from 'moment';

const ListaTrazabilidad = ({repuesto, showTrazabilidad, handlerListCancelar, empresa}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [listado, setListado] = useState(null);
    const [listado_ordenado, setListadoOrdenado] = useState(null)
    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    useEffect(()=>{
    },[empresa, token])

    useEffect(() => {        
        repuesto && empresa && axios.get(BACKEND_SERVER + `/api/repuestos/movimiento_trazabilidad/?linea_inventario__repuesto=${repuesto.id}&almacen__empresa=${empresa}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            {res.data && res.data.map( r => {
                r.albaran=r.linea_inventario.inventario.nombre;
            })}
            axios.get(BACKEND_SERVER + `/api/repuestos/movimiento_trazabilidad/?linea_pedido__repuesto=${repuesto.id}&almacen__empresa=${empresa}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( re => {
                {re.data && re.data.map( r => {
                    r.albaran=r.linea_pedido.pedido.numero;
                })}
                axios.get(BACKEND_SERVER + `/api/repuestos/movimiento_trazabilidad/?linea_salida__repuesto=${repuesto.id}&almacen__empresa=${empresa}`,{
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then( r => {
                    {r.data && r.data.map( res => {
                        res.albaran=res.linea_salida.salida.nombre;
                    })}
                    setListado(r.data.concat(re.data, res.data).sort(function(a, b){
                        if(a.id < b.id){
                            return 1;
                        }
                        if(a.id > b.id){
                            return -1;
                        }
                        return 0;
                    }))                    
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
    }, [repuesto, empresa]);

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
                    <ExcelFile filename={"ExcelExportExample"} element={<button>Exportar a Excel</button>}>
                        <ExcelSheet data={listado} name="Listados">
                            <ExcelColumn label="Id" value="id"/>
                            <ExcelColumn label="Movimiento" value="albaran"/>
                            <ExcelColumn label="Fecha" value="fecha"/>
                            <ExcelColumn label="Cantidad" value="cantidad"/>
                        </ExcelSheet>
                    </ExcelFile> 
                </Row>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>                                
                                <tr>
                                    <th>Movimiento</th>
                                    <th>Almacén</th>
                                    <th>Fecha</th>
                                    <th>Cantidad</th>
                                </tr>
                            </thead>                               
                            <tbody>
                                    {listado && listado.map( movimiento => {
                                        return (
                                            <tr key={movimiento.id}>                                            
                                                <td>{movimiento.linea_inventario?movimiento.albaran : movimiento.linea_salida?movimiento.albaran : movimiento.linea_pedido?movimiento.albaran : ''}</td>
                                                <td>{movimiento.almacen.nombre}</td>
                                                <td>{invertirFecha(String(movimiento.fecha))}</td>
                                                <td>{movimiento.cantidad}</td>
                                            </tr>
                                        )
                                    })}                              
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
