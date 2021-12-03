import React, { Component, useState, useEffect } from 'react';
import { Document, Page, Image, View, Text, StyleSheet} from "@react-pdf/renderer";
import { Container, Row, Col, Table, Modal } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { useCookies } from 'react-cookie';
import { Border, ListTask } from 'react-bootstrap-icons';
import { line } from 'd3-shape';

const VistaPdf = ({pedido, VerPdf, linea, empresa, lineas_adicionales, proveedor, contacto, direccion_envio}) =>{
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [hoy] = useState(new Date);

    useEffect(()=>{
        console.log('datos...... direccion --- contacto --- pedido');
        console.log(direccion_envio);
        console.log(contacto);
        console.log(pedido);
        console.log(linea);
    },[token]);

    function parseData(){
        if(linea){
            return linea.map((data, i)=>{
                return(
                    <View key={i}>
                        <View style={styles.page2}>
                            <View style={styles.section}>
                                <View style={styles.section7}><Text>{data.cantidad}</Text></View>
                                <View style={styles.section6}><Text>{data.repuesto.nombre}</Text></View>
                                <View style={styles.section9}><Text>{data.precio + '€'}</Text></View>
                                <View style={styles.section9}><Text>{data.descuento + '%'}</Text></View>
                                <View style={styles.section9}><Text>{data.total + '€'}</Text></View>
                            </View>
                        </View>
                    </View>
                )
            })
        }
    }

    function parse2Data(){
        if(lineas_adicionales){
            return lineas_adicionales.map((data, i)=>{
                return(
                    <View key={i}>
                        <View style={styles.page2}>
                            <View style={styles.section}>
                                <View style={styles.section7}><Text>{data.cantidad}</Text></View>
                                <View style={styles.section6}><Text>{data.descripcion}</Text></View>
                                <View style={styles.section9}><Text>{data.precio + '€'}</Text></View>
                                <View style={styles.section9}><Text>{data.descuento + '%'}</Text></View>
                                <View style={styles.section9}><Text>{data.total + '€'}</Text></View>
                            </View>
                        </View>
                    </View>
                )
            })
        }
    }
    const styles = StyleSheet.create({
        page:{
           // backgroundColor: "green",
            marginTop: 30,
            marginLeft: 30,
            marginRight: 30
        },
        page2:{
           // backgroundColor: "green",
            marginLeft: 30,
            marginRight: 30
        },
        section: {
            flexDirection: 'row',
            flexGrow: 1,
           // backgroundColor: "red"
        },
        section3: {
            margin: 5,
            padding: 5,
            flex: 1,
            flexDirection: "column",
            //backgroundColor: "yellow",
            fontSize: 13
        },
        section4: {
            margin: 5,
            padding: 5,
            flex: 3,
            flexDirection: "column",
           // backgroundColor: "blue",
            fontSize: 13
        },
        section5: {
            margin: 5,
            padding: 5,
            flex: 1,
            flexDirection: "column",
            //backgroundColor: "yellow",
            fontSize: 11
        },
        section6: {
            margin: 5,
            padding: 5,
            flex: 6,
            flexDirection: "column",
            //backgroundColor: "blue",
            fontSize: 13,
            //borderBottomColor: 'black'
        },
        section7: {
            margin: 5,
            padding: 5,
            flex: 1,
            flexDirection: "column",
            //backgroundColor: "blue",
            fontSize: 13,
            //borderBottomColor: 'black'
        },
        section8: {
            margin: 5,
            padding: 5,
            flex: 2,
            flexDirection: "column",
            //backgroundColor: "blue",
            textAlign: 'center',
            fontSize: 13,
            //borderBottomColor: 'black'
        },
        section9: {
            margin: 5,
            padding: 5,
            flex: 2,
            flexDirection: "column",
            textAlign: 'right',
            //backgroundColor: "blue",
            fontSize: 13,
            //borderBottomColor: 'black'
        },
        section10: {
            margin: 1,
            //padding: 5,
            flex: 2,
            flexDirection: "column",
            //backgroundColor: "yellow",
            fontSize: 11
        },
        sectionTabla: {
            flexDirection: 'row',
            flexGrow: 1,
            borderBottom: true
           // backgroundColor: "red"
        }
    });
    return(     
        <Document>
            <Page size="A4">
                <View style={styles.page}>
                    <View style={styles.section}>
                        <View style={styles.section3}>
                            <Text>logo # 1</Text>
                            <Text>logo # 1</Text>
                            <Text>logo # 1</Text>
                            <Text>logo # 1</Text>
                        </View>
                        <View style={styles.section3}>
                            <Text>Iconos # 2</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.page2}>               
                    <View style={styles.section}>
                        <View style={styles.section3}>
                            <Text>Fecha:</Text>
                            <Text>Atención:</Text>
                            <Text>Empresa:</Text>
                            <Text>Asunto:</Text>
                            <Text>De:</Text>
                        </View>
                        <View style={styles.section4}>
                            <Text>{pedido.fecha_creacion}</Text>
                            <Text>{contacto.nombre}</Text>
                            <Text>{proveedor.nombre}</Text>
                            <Text>Pedido</Text>
                            <Text>{pedido.creado_por.get_full_name}</Text>
                        </View>
                        <View style={styles.section4}>
                            <Text>Dirección de Envío:</Text>
                            <Text>{empresa.nombre}</Text>
                            <Text>{direccion_envio.direccion}</Text>
                            <Text>{direccion_envio.poblacion}</Text>
                            <Text>{direccion_envio.codpostal}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.page2}>
                    <View style={styles.section}>
                        <View style={styles.section3}>
                            <Text>Nº Pedido: {pedido.numero}</Text>                            
                        </View>
                    </View>
                </View>
                <View style={styles.page2}>
                    <View style={styles.section}>
                        <View style={styles.section5}>
                            <Text>Muy Sres. nuestros:</Text>
                            <Text>Les confirmamos nuestro pedido para el suministro del material que detallamos a continuacion:</Text>
                        </View>
                    </View>
                </View>
                { linea.length>0 ?
                    <View style={styles.page}>
                        <View style={styles.sectionTabla}>
                            <View style={styles.section7}><Text>Cant.</Text></View>
                            <View style={styles.section6}><Text>Descripción</Text></View>
                            <View style={styles.section8}><Text>Precio</Text></View>
                            <View style={styles.section8}><Text>Dto.</Text></View>
                            <View style={styles.section8}><Text>Total</Text></View>
                        </View>                                          
                    </View>                    
                :null}
                {parseData()}
                { lineas_adicionales.length>0 ?
                    <View style={styles.page}>
                        <View style={styles.sectionTabla}>
                            <View style={styles.section7}><Text>Cant.</Text></View>
                            <View style={styles.section6}><Text>Descripción</Text></View>
                            <View style={styles.section8}><Text>Precio</Text></View>
                            <View style={styles.section8}><Text>Dto.</Text></View>
                            <View style={styles.section8}><Text>Total</Text></View>
                        </View>                                          
                    </View>                    
                :null}
                {parse2Data()}
                <View style={styles.page2}>
                    <View style={styles.section}>
                        <View style={styles.section5}><Text>Sin más por el momento, reciban un afectuoso saludo.</Text></View>                                              
                    </View>
                    <View style={styles.section}> 
                        <View style={styles.section7}></View>                        
                        <View style={styles.section10}><Text>{pedido.creado_por.get_full_name}</Text></View>                       
                    </View>
                    <View style={styles.section}> 
                        <View style={styles.section7}></View>                                            
                        <View style={styles.section10}><Text>Dpto. Técnico</Text></View>
                    </View>
                </View>
            </Page>
        </Document>   
        // <Document>
        //     <Page size="A4" style = {{margin: 50, fontSize: 12, marginRight: 50/* , backgroundColor: 'tomato' */}} > 
        //         <View style={{flexDirection: "column", margin: 20, justifyContent: "center"}}>
        //             <View style={{flex: 2, flexDirection: "row", justifyContent: 'space-between', padding: 10}}>
        //                 <View style = {{flex:0.5}}><Text>{pedido.fecha_creacion}</Text></View>
        //                 <View style = {{flex:0.5}}><Text>Dirección Entrega:</Text></View>
        //             </View>
        //             <View style={{flex: 2, flexDirection: "row", justifyContent: 'space-between', padding: 10}}>
        //                 <View style = {{flex:0.5}}><Text>{proveedor.nombre}</Text></View>
        //                 <View style = {{flex:0.5}}><Text>{empresa.nombre}</Text></View>
        //             </View>
        //             <View style={{flex: 2, flexDirection: "row", justifyContent: 'space-between', padding: 10}}>
        //                 <View style = {{flex:0.5}}><Text>{proveedor.direccion}</Text></View>
        //                 <View style = {{flex:0.5}}><Text>{empresa.direccion}</Text></View>
        //             </View>
        //             <View style={{flex: 2, flexDirection: "row", padding: 10}}>
        //                 <View style = {{flex:0.5}}><Text>Población:</Text></View>
        //                 <View style = {{flex:0.5}}><Text>{empresa.poblacion}</Text></View>
        //             </View>
        //             <View style={{flex: 2, flexDirection: "row", padding: 10}}>
        //                 <View style = {{flex:0.5}}><Text>Código Postal:</Text></View>
        //                 <View style = {{flex:0.5}}><Text>{empresa.codpostal}</Text></View>
        //             </View>
        //             <View style={{flex: 2, flexDirection: "row", padding: 10}}>
        //                 <View style = {{flex:0.5}}><Text>{proveedor.telefono}</Text></View>
        //                 <View style = {{flex:0.5}}><Text>{empresa.telefono}</Text></View>
        //             </View>
        //         </View>                      
        //         <View style={{flexDirection: "column", margin: 20, justifyContent: "center"}}>
        //             <View style={{flexDirection: "row", flex:0.5, padding: 10}}>
        //                 <View style = {{flex:0.25}}><Text>Num-Pedido:</Text></View>
        //                 <View style = {{flex:0.4}}><Text>{pedido.numero}</Text></View>
        //             </View>
        //             <View style={{flexDirection: "row", flex:0.5, padding: 10}}>
        //                 <View style = {{flex:0.3}}><Text>Fecha de Pedido:</Text></View>
        //                 <View style = {{flex:0.6}}><Text>{pedido.fecha_creacion}</Text></View>
        //             </View>
        //         </View> 
        //         { linea.length>0 ?
        //         <View>
        //             <View style={{flexDirection: "row", marginRight: 90, borderBottom: true, borderBottomWidth: 2, borderBottomColor:"red"}}>
        //                 <View style={{flexDirection: "column", flex: 5}}>
        //                     <Text>Repuesto:</Text>                            
        //                 </View>
        //                 <View style={{flexDirection: "column", flex: 1}}>
        //                     <Text>Cant.:</Text>                            
        //                 </View>
        //                 <View style={{flexDirection: "column", flex: 3}}>
        //                     <Text>Precio:</Text>                           
        //                 </View>
        //                 <View style={{flexDirection: "column", flex: 3}}>
        //                     <Text>Total:</Text>                           
        //                 </View>
        //             </View>
        //             {parseData()}
        //         </View> 
        //         :null} 
        //         { lineas_adicionales.length>0 ?
        //         <View>
        //             <View style={{flexDirection: "row", marginRight: 80, marginTop:70, borderBottom: true, borderBottomWidth: 2, borderBottomColor:"red"}}>
        //                 <View style={{flexDirection: "column", flex: 3}}>
        //                     <Text>Descripción:</Text>                            
        //                 </View>
        //                 <View style={{flexDirection: "column", flex: 2}}>
        //                     <Text>Cant.:</Text>                            
        //                 </View>
        //                 <View style={{flexDirection: "column", flex: 2}}>
        //                     <Text>Precio:</Text>                           
        //                 </View>
        //                 <View style={{flexDirection: "column", flex: 2}}>
        //                     <Text>Total:</Text>                           
        //                 </View>
        //             </View>
        //             {parse2Data()}
        //         </View>
        //         :null}          
        //     </Page>
        // </Document>
    )    
}
export default VistaPdf;