import React, { useEffect } from 'react';
import { Document, Page, Image, View, Text, StyleSheet } from "@react-pdf/renderer";
import { useCookies } from 'react-cookie';

const VistaPdf = ({pedido, VerPdf, linea, empresa, lineas_adicionales, proveedor, contacto, direccion_envio}) =>{
    const [token] = useCookies(['tec-token']);
    useEffect(()=>{
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
            margin: 30,
        },
        page2:{
           // backgroundColor: "green",
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
           // backgroundColor: "red"
        },
        imagen: {
            fixed: true,
            margin: 5,
            padding: 5,
            flex: 0.7,
            flexDirection: "column",
           // backgroundColor: "blue",
            //fontSize: 13
        },
        iconos: {
            fixed: true,
            margin: 5,
            padding: 5,
            flex: 1,
           // backgroundColor: "yellow",
            flexDirection: "column",
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
        },
        section7: {
            margin: 5,
            padding: 5,
            flex: 1,
            flexDirection: "column",
            //backgroundColor: "blue",
            fontSize: 13,
        },
        section8: {
            margin: 5,
            padding: 5,
            flex: 2,
            flexDirection: "column",
            //backgroundColor: "blue",
            textAlign: 'center',
            fontSize: 13,
        },
        section9: {
            margin: 5,
            padding: 5,
            flex: 2,
            flexDirection: "column",
            textAlign: 'right',
            //backgroundColor: "blue",
            fontSize: 13,
        },
        section10: {
            margin: 2,
            flex: 3,
            flexDirection: "column",
            //backgroundColor: "yellow",
            fontSize: 11
        },
        sectionTabla: {
            flexDirection: 'row',
            flexGrow: 1,
            borderBottom: true
           // backgroundColor: "red"
        },
        pageNumber: {
            position: 'absolute',
            fontSize: 12,
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
                    <View style={styles.section} fixed>
                        <View style={styles.imagen}>
                            <Image src= {empresa.logo}/>
                        </View>
                        <View style={styles.section3}>
                            <Image style={styles.iconos} src="components\repuestos\images\logo-AENOR-9001.jpg"/>
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
                                {contacto ? <Text>{contacto.nombre}</Text>:<Text>   </Text>}
                                <Text>{proveedor.nombre}</Text>
                                <Text>Pedido</Text>
                                <Text>{pedido.creado_por.get_full_name}</Text>
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
                            <View style={styles.section5}>
                                <Text>Muy Sres. nuestros:</Text>
                                <Text>Les confirmamos nuestro pedido para el suministro del material que detallamos a continuacion:</Text>
                            </View>
                        </View>
                    </View>
                    { linea !== '' ?
                        <View style={styles.page3} fixed>
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
                    {/* { lineas_adicionales != '' ?
                        <View style={styles.page3}>
                            <View style={styles.sectionTabla}>
                                <View style={styles.section7}><Text>Cant.</Text></View>
                                <View style={styles.section6}><Text>Descripción</Text></View>
                                <View style={styles.section8}><Text>Precio</Text></View>
                                <View style={styles.section8}><Text>Dto.</Text></View>
                                <View style={styles.section8}><Text>Total</Text></View>
                            </View>                                          
                        </View>                    
                    :null} */}
                    {parse2Data()}
                    <View style={styles.page}wrap={false}>
                        {/* <View style={styles.section}>
                            <View style={styles.section5}><Text>Sin más por el momento, reciban un afectuoso saludo.</Text></View>                                              
                        </View> */}
                        <View style={styles.section}> 
                            <View style={styles.section7}></View>                        
                            <View style={styles.section10}><Text>{pedido.creado_por.get_full_name}</Text></View>                       
                        </View>
                        <View style={styles.section}> 
                            <View style={styles.section7}></View>                                            
                            <View style={styles.section10}><Text>Dpto. Técnico</Text></View>
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