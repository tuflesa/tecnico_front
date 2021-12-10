import React, { Component, useState, useEffect } from 'react';
import { Document, Page, Image, View, Text, StyleSheet} from "@react-pdf/renderer";
import { Container, Row, Col, Table, Modal } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { useCookies } from 'react-cookie';
import { Border, ListTask } from 'react-bootstrap-icons';
import { line } from 'd3-shape';

const VistaIngPdf = ({pedido, VerIngPdf, linea, empresa, lineas_adicionales, proveedor, contacto, direccion_envio}) =>{
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [hoy] = useState(new Date);

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
            margin: 30,
            wrap: true,
            marginBottom: 30,
            //marginTop: 30,
            //marginLeft: 30,
            //marginRight: 30
        },
        page2:{
           // backgroundColor: "green",
            marginLeft: 30,
            marginRight: 30,
        },        
        section: {
            flexDirection: 'row',
            flexGrow: 1,
           // backgroundColor: "red"
        },
        imagen: {
            fixed: true,
            margin: 5,
            padding: 5,
            flex: 1,
            flexDirection: "column",
            //backgroundColor: "yellow",
            fontSize: 13
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
                <Text render={({ pageNumber, totalPages }) => ("  ")} fixed />
                <View style={styles.page}>
                    <View style={styles.section}>
                        <View style={styles.imagen}>
                            <Image src= {empresa.logo}/>
                        </View>
                        <View style={styles.section3}>
                            <Text>Iconos # 2</Text>
                        </View>
                    </View>                
                    <View style={styles.page2}>               
                        <View style={styles.section}>
                            <View style={styles.section3}>
                                <Text>Date:</Text>
                                <Text>to:</Text>
                                <Text>Company:</Text>
                                <Text>Subject:</Text>
                                <Text>From:</Text>
                            </View>
                            <View style={styles.section4}>
                                <Text>{pedido.fecha_creacion}</Text>
                                {contacto ? <Text>{contacto.nombre}</Text>:<Text>   </Text>}
                                <Text>{proveedor.nombre}</Text>
                                <Text>Order:</Text>
                                <Text>{pedido.creado_por.get_full_name}</Text>
                            </View>
                            <View style={styles.section4}>
                                <Text>Delivery Address:</Text>
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
                                <Text>Nº Order: {pedido.numero}</Text>                            
                            </View>
                        </View>
                    </View>
                    <View style={styles.page2}>
                        <View style={styles.section}>
                            <View style={styles.section5}>
                                <Text>Dear Sirs:</Text>
                                <Text>We confirm you the order of the following items/spares:</Text>
                            </View>
                        </View>
                    </View>
                    { linea != null ?
                        <View style={styles.page}>
                            <View style={styles.sectionTabla}>
                                <View style={styles.section7}><Text>Qty</Text></View>
                                <View style={styles.section6}><Text>description</Text></View>
                                <View style={styles.section8}><Text>Price/Unit</Text></View>
                                <View style={styles.section8}><Text>Dcnt.</Text></View>
                                <View style={styles.section8}><Text>Total</Text></View>
                            </View>                                          
                        </View>                    
                    :null}
                    {parseData()}
                    { lineas_adicionales != null ?
                        <View style={styles.page}>
                            <View style={styles.sectionTabla}>
                                <View style={styles.section7}><Text>Qty</Text></View>
                                <View style={styles.section6}><Text>Description</Text></View>
                                <View style={styles.section8}><Text>Price/Unit</Text></View>
                                <View style={styles.section8}><Text>Dcnt.</Text></View>
                                <View style={styles.section8}><Text>Total</Text></View>
                            </View>                                          
                        </View>                    
                    :null}
                    {parse2Data()}
                    <View style={styles.page2}> 
                        <View style={styles.section}>
                            <View style={styles.section5}><Text>Looking forward to hearing from you soon,</Text></View>                                              
                        </View>
                        <View style={styles.section}> 
                            <View style={styles.section7}></View>                        
                            <View style={styles.section10}><Text>{pedido.creado_por.get_full_name}</Text></View>                       
                        </View>
                        <View style={styles.section}> 
                            <View style={styles.section7}></View>                                            
                            <View style={styles.section10}><Text>Technical Department</Text></View>
                        </View>
                    </View>
                    <Text render={({ pageNumber, totalPages }) => ("  ")} fixed />
                </View>
            </Page>
        </Document> 
    )    
}
export default VistaIngPdf;