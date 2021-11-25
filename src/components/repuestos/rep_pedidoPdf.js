import React, { useState, useEffect } from 'react';
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { Container, Row, Col, Table, Modal } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { useCookies } from 'react-cookie';

const VistaPdf = ({pedido, VerPdf}) =>{
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [hoy] = useState(new Date);
    const [datos, setDatos] = useState({
        id: pedido ? pedido.id : null,
        proveedor: pedido ? pedido.proveedor.id : null,
        empresa: pedido ? pedido.empresa : user['tec-user'].perfil.empresa.id,
        numero: pedido ? pedido.numero : '',
        creado_por: pedido ? pedido.creado_por.get_full_name : '',
        fecha_creacion: pedido ? pedido.fecha_creacion : (hoy.getFullYear() + '-'+(hoy.getMonth()+1)+'-'+hoy.getDate()),
        fecha_cierre: pedido ? pedido.fecha_entrega : '',
        finalizado: pedido ? pedido.finalizado : false,
        lineas_pedido: pedido ? pedido.lineas_pedido : null,
        lineas_adicionales: pedido ? pedido.lineas_adicionales : null
    }); 
    console.log('lo que entra en el pdf');
    console.log(pedido);
    return(        
        <Document>
            <Page size="A4">  
                <View>
                    <Text>hola mundo!!! aunque este muy trillado.</Text>
                </View>                     
              <Row>
                    {pedido ? 
                        <Col>
                            <Text className="mb-3 mt-3">Pedido Proveedor</Text>
                            <Table striped bordered hover>
                                {/* <thead>
                                    <tr>
                                        <th style= {StyleSheet}>Num-Pedido</th>
                                        <th>Empresa</th>
                                        <th>Proveedor</th>
                                        <th>Fecha Pedido</th>
                                        <th>Fecha Entrega</th>
                                    </tr>
                                </thead> */}
                                {/* <tbody>
                                    {pedido && pedido.map( pedido => {
                                        return (
                                            <tr key={pedido.id}>
                                                <td>{pedido.numero}</td>
                                                <td>{pedido.empresa.nombre}</td>
                                                <td>{pedido.proveedor.nombre}</td>
                                                <td>{invertirFecha(String(pedido.fecha_creacion))}</td>
                                                <td>{pedido.fecha_entrega && invertirFecha(String(pedido.fecha_entrega))}</td>                                        
                                                <td>{pedido.finalizado ? 'Si' : 'No'}</td>
                                            </tr>
                                        )})
                                    }
                                </tbody> */}
                            </Table>
                     </Col>
                    : null}
                </Row>             
            </Page>
        </Document>
    )    
}
export default VistaPdf;