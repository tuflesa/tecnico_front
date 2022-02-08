//Modal que abre los movimientos del repuesto
import React, { useEffect, useState } from 'react';
import { Button, Row, Modal, Col, Table } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import {invertirFecha} from '../utilidades/funciones_fecha';
import ReactExport from 'react-data-export';
import moment from 'moment';

const ListaTrazabilidad = ({repuesto, showTrazabilidad, handlerListCancelar, almacen}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [listado, setListado] = useState(null);
    //const [listado_ordenado, setListadoOrdenado] = useState(null)
    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    useEffect(() => {        
        repuesto && almacen && axios.get(BACKEND_SERVER + `/api/repuestos/movimiento_trazabilidad/?linea_inventario__repuesto=${repuesto.id}&almacen__id=${almacen}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            res.data.map( r => {
                r.albaran=r.linea_inventario.inventario.nombre;
                r['alm'] = r.almacen.nombre;
                r['stock']='';
                r['usuario']=r.usuario.get_full_name;
            })
            axios.get(BACKEND_SERVER + `/api/repuestos/movimiento_trazabilidad/?linea_pedido__repuesto=${repuesto.id}&almacen__id=${almacen}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( re => {
                {re.data && re.data.map( r => {
                    r.albaran=r.linea_pedido.pedido.numero;
                    r['alm'] = r.almacen.nombre;
                    r['stock']='';
                    r['usuario']=r.usuario.get_full_name;
                })}
                axios.get(BACKEND_SERVER + `/api/repuestos/movimiento_trazabilidad/?linea_salida__repuesto=${repuesto.id}&almacen__id=${almacen}`,{
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then( r => {
                    {r.data && r.data.map( res => {
                        res.albaran=res.linea_salida.salida.nombre;
                        res['alm'] = res.almacen.nombre;
                        res['stock']='';
                        res['usuario']=res.usuario.get_full_name;
                    })}
                    const listado_completo = r.data.concat(re.data, res.data).sort(function(a, b){
                        if(a.id < b.id){
                            return 1;
                        }
                        if(a.id > b.id){
                            return -1;
                        }
                        return 0;
                    })
                    for(let x=(listado_completo.length-1);x>=0;x--){ 
                        let y=x+1;  
                        if(x===listado_completo.length-1) y=listado_completo.length-1;             
                        if(listado_completo[x].albaran==='Ajuste de stock')
                            listado_completo[x].stock=listado_completo[x].cantidad;
                            else if (listado_completo[x].albaran==='Ajuste Inicial')
                                listado_completo[x].stock=listado_completo[x].cantidad;
                                else 
                                listado_completo[x].stock= listado_completo[y].stock + listado_completo[x].cantidad;
                    }
                    setListado(listado_completo);
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
                     
    }, [repuesto, almacen]);
    
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
                            <ExcelColumn label="Fecha" value="fecha"/>
                            <ExcelColumn label="Usuario" value="usuario"/>
                            <ExcelColumn label="Movimiento" value="albaran"/>
                            <ExcelColumn label="Almacén" value="alm"/>                            
                            <ExcelColumn label="Cantidad" value="cantidad"/> 
                            <ExcelColumn label="Stock" value="stock"/>                           
                        </ExcelSheet>
                    </ExcelFile> 
                </Row>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>                                
                                <tr>
                                    <th>Fecha</th>
                                    <th>Usuario</th>
                                    <th>Movimiento</th>
                                    <th>Almacén</th>                                    
                                    <th>Cant. Movimiento</th>
                                    <th>Stock</th>
                                </tr>
                            </thead>                               
                            <tbody>
                                    {listado && listado.map( movimiento => {
                                        return (
                                            <tr key={movimiento.id}>                                            
                                                <td>{invertirFecha(String(movimiento.fecha))}</td>
                                                <td>{movimiento.usuario}</td>                                          
                                                <td>{movimiento.linea_inventario?movimiento.albaran : movimiento.linea_salida?movimiento.albaran : movimiento.linea_pedido?movimiento.albaran : ''}</td>
                                                <td>{movimiento.alm}</td>
                                                <td>{movimiento.cantidad}</td>
                                                <td>{movimiento.stock}</td>
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
