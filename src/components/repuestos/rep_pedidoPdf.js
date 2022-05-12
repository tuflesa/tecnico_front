import React, { useState, useEffect } from 'react';
import { Document, Page, Image, View, Text, StyleSheet } from "@react-pdf/renderer";
import { useCookies } from 'react-cookie';

const VistaPdf = ({pedido, VerPdf, fecha_creacion, linea, empresa, lineas_adicionales, proveedor, contacto, direccion_envio}) =>{
    const [token] = useCookies(['tec-token']);
    /* const [im, setIm] = useState({
        uri: empresa.logo,
        method:'GET',
        headers:{
            'Authorization': `token ${token['tec-token']}`
            }
    }); */

    const formatNumber = (numero) =>{
        return new Intl.NumberFormat('de-DE',{ style: 'currency', currency: 'EUR' }).format(numero)
    }

    const formatPorcentaje = (numero) =>{
        return new Intl.NumberFormat('de-DE').format(numero)
    }

    function parseData(){
        if(linea){
            return linea.map((data, i)=>{
                return(
                    <View key={i}>
                        <View style={styles.page2}>
                            <View style={styles.section}>
                                <View style={styles.section6}><Text>{data.repuesto.nombre + " - " + data.repuesto.fabricante + " - " + data.repuesto.modelo}</Text></View>
                                <View style={styles.section7}><Text>{data.cantidad}</Text></View>
                                <View style={styles.section7}><Text>{data.repuesto.unidad_siglas}</Text></View>
                                <View style={styles.section9}><Text>{formatNumber(data.precio)}</Text></View>
                                <View style={styles.section9}><Text>{formatPorcentaje(data.descuento) + '%'}</Text></View>
                                <View style={styles.section9}><Text>{formatNumber(data.total)}</Text></View>
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
                                <View style={styles.section6}><Text>{data.descripcion}</Text></View>
                                <View style={styles.section7}><Text>{data.cantidad}</Text></View>
                                <View style={styles.section7}><Text>{null}</Text></View>
                                <View style={styles.section9}><Text>{formatNumber(data.precio)}</Text></View>
                                <View style={styles.section9}><Text>{formatPorcentaje(data.descuento) + '%'}</Text></View>
                                <View style={styles.section9}><Text>{formatNumber(data.total)}</Text></View>
                            </View>
                        </View>
                    </View>
                )
            })
        }
    }
    const styles = StyleSheet.create({
        page:{
            margin: 30,
        },
        page2:{
            marginLeft: 30,
            marginRight: 30,
        },
        page3:{
            marginLeft: 30,
            marginRight: 30,
            marginTop: 15,
            marginBottom: 15
        },
        section: {
            flexDirection: 'row',
            flexGrow: 1,
        },
        imagen: {
            fixed: true,
            width: 200,
            height: 80,
            margin: 5,
            padding: 5,
            flexGrow: 1,
            flexDirection: "column",
        },
        iconos: {
            fixed: true,
            margin: 5,
            padding: 5,
            flex: 1,
            flexDirection: "column",
        },
        section3: {
            margin: 5,
            padding: 5,
            flex: 1,
            flexDirection: "column",
            fontSize: 10
        },
        section44: {
            margin: 5,
            padding: 5,
            flex: 5,
            flexDirection: "column",
            fontSize: 10
        },
        section4: {
            margin: 5,
            padding: 5,
            flex: 2,
            flexDirection: "column",
            fontSize: 10
        },
        section5: {
            margin: 5,
            padding: 5,
            flex: 1,
            flexDirection: "column",
            fontSize: 8
        },
        section6: {
            margin: 5,
            padding: 5,
            flex: 6,
            flexDirection: "column",
            fontSize: 10,
        },
        section7: {
            margin: 5,
            padding: 5,
            flex: 1,
            flexDirection: "column",
            fontSize: 10,
        },
        section8: {
            margin: 5,
            padding: 5,
            flex: 2,
            flexDirection: "column",
            textAlign: 'center',
            fontSize: 10,
        },
        section9: {
            margin: 5,
            padding: 5,
            flex: 2,
            flexDirection: "column",
            textAlign: 'right',
            fontSize: 10,
        },
        section10: {
            margin: 2,
            flex: 3,
            flexDirection: "column",
            fontSize: 8
        },
        sectionTabla: {
            flexDirection: 'row',
            flexGrow: 1,
            borderBottom: true
        },
        pageNumber: {
            position: 'absolute',
            fontSize: 9,
            bottom: 30,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'grey',
          },
    });
    return(     
        <Document>
            <Page size="A4">
                <Text render={({ pageNumber, totalPages }) => ("  ")} fixed />            
                <View style={styles.page} >
                    <View fixed>
                        <View style={styles.imagen}>
                            <Image src= { empresa.logo } width="500" height="500"/>
                        </View>
                        {/* <View style={styles.section3}>
                            <Image style={styles.iconos} src="components\repuestos\images\logo-AENOR-9001.jpg"/>
                        </View> */}
                    </View>
                    <View style={styles.page2}>               
                        <View style={styles.section}>
                            {/* <View style={styles.section3}>
                                <Text>Fecha:</Text>
                                <Text>Atención:</Text>
                                <Text>Empresa:</Text>
                                <Text>Asunto:</Text>
                                <Text>De:</Text>
                            </View> */}
                            <View style={styles.section44}>
                                <Text>Fecha:    {fecha_creacion}</Text>
                                {contacto ? <Text>Atención: {contacto.nombre}</Text>:<Text>   </Text>}
                                <Text>Empresa:  {proveedor.nombre}</Text>
                                <Text>Asunto:   Pedido</Text>
                                <Text>De:   {pedido.creado_por.get_full_name}</Text>
                            </View>
                            <View style={styles.section4}>
                                <Text>Dirección de Envío:</Text>
                                <Text>{empresa.nombre}</Text>
                                <Text>{direccion_envio.direccion}</Text>
                                <Text>{direccion_envio.poblacion}</Text>
                                <Text>{direccion_envio.codpostal + ' - ' + direccion_envio.provincia}</Text>
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
                            <View style={styles.section3}>
                                <Text>Observaciones pedido: {pedido.observaciones}</Text>                            
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
                    { linea !== '' ?
                        <View style={styles.page3} fixed>
                            <View style={styles.sectionTabla}>
                                <View style={styles.section6}><Text>Descripción</Text></View>
                                <View style={styles.section7}><Text>Cant.</Text></View>
                                <View style={styles.section7}><Text>Und.</Text></View>
                                <View style={styles.section8}><Text>Precio</Text></View>
                                <View style={styles.section8}><Text>Dto.</Text></View>
                                <View style={styles.section8}><Text>Total</Text></View>
                            </View>                                          
                        </View>                    
                    :null}
                    {parseData()}
                    
                    {parse2Data()}
                </View>
                <View style={styles.page2}>
                    <View style={styles.section}>
                        <View style={styles.section3}>
                            <Text>Observaciones pedido: {pedido.observaciones2}</Text>                            
                        </View>
                    </View>
                </View>
                <View style={styles.page2}>
                    <View style={styles.section}>
                        <View style={styles.section3}>
                            <Text>Nota: Por favor indicar en nº de pedido en el albarán de entrega.</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (`${pageNumber} / ${totalPages}`)} fixed />
                <View style={styles.page}fixed></View>                
            </Page>
        </Document>         
    )    
}
export default VistaPdf;