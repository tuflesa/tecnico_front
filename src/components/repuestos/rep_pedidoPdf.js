import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Document, Page, Image, View, Text, StyleSheet, Svg, Path, G, Rect, Polygon } from "@react-pdf/renderer";

const VistaPdf = ({pedido, VerPdf, fecha_creacion, linea, lineas_adicionales, proveedor, contacto, direccion_envio}) =>{
    //borro empresa y lo sustituyo por pedido.empresa... la variable empresa entraba sin datos
    var total_pedido= 0;
    const [token] = useCookies(['tec-token']);

    useEffect(()=>{
        console.log('esto vale proveedor');
        console.log(proveedor);
        console.log(pedido);
    },[token]);

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
                                <View style={styles.section6}><Text>{data.descripcion_proveedor + " " + (data.repuesto.fabricante? " - " + data.repuesto.fabricante:'') + (" - " + data.modelo_proveedor? data.modelo_proveedor:'')}</Text></View>
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

    function Total(){
        if(linea){
            linea.map( l => total_pedido+=Number(l.total))
        }
    }
    function Total_adic(){
        lineas_adicionales.map( linea => total_pedido+=Number(linea.total))
    }

    const VerLogo = () => (
        <Svg version="1.0" encoding="UTF-8" id="Capa_2" data-name="Capa 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 917.27 304.08">
            <G id="Capa_2-2" data-name="Capa 2">
                <G>
                <Rect fill="#239759" x="5.39" y="5.39" width="293.2" height="293.2"/>
                <Path fill="#1d1d1b" d="m0,0v303.97h303.97V0H0Zm88.13,10.77c1.72,12.37,2.81,35.68-5.52,46.83C60.48,43.1,36.51,30.21,10.77,19.03v-8.26h77.36ZM10.77,30.8c118.69,52.86,198.03,143.34,230.09,262.4H10.77V30.8Zm282.43,262.4h-41.19c-25.14-95.9-79.92-173.9-160.45-229.58,10.81-15.02,9.02-40.88,7.45-52.85h194.19v282.43Z"/>
                <Path fill="#1d1d1b" d="m531.22,132.58h-96.03c-19.14,0-34.66,15.52-34.66,34.66v10.46c0,19.14,15.52,34.66,34.66,34.66h96.03c19.14,0,34.66-15.52,34.66-34.66v-10.46c0-19.14-15.52-34.66-34.66-34.66Zm14.47,39.48c0,10.9-8.84,19.74-19.74,19.74h-85.64c-10.9,0-19.74-8.84-19.74-19.74h0c0-10.9,8.84-19.74,19.74-19.74h85.64c10.9,0,19.74,8.84,19.74,19.74h0Z"/>
                <Polygon fill="#1d1d1b" points="896.33 130.69 871.13 195.5 845.92 130.69 824.99 130.69 860.66 222.42 860.66 304.08 881.6 304.08 881.6 222.42 917.27 130.69 896.33 130.69"/>
                <Path fill="#1d1d1b" d="m827.66,304.08h20.94s-38.23-172.9-38.23-172.9h-20.94l-37.09,172.9h20.94l15.84-73.84h22.22l16.33,73.84Zm-34.71-91.73l7.1-33.11,7.32,33.11h-14.43Z"/>
                <Path fill="#1d1d1b" d="m382.75,209.42c5.93-3.57,9.91-10.05,9.91-17.48v-40.34c0-11.28-9.14-20.42-20.42-20.42h-27.84s-20.43,0-20.43,0v172.9h20.94s24.74,0,24.74,0c15.81,0,28.62-12.81,28.62-28.62v-40.6c0-11.09-6.31-20.69-15.52-25.45Zm-10.77-47.55v33.65c0,5.36-4.34,9.7-9.7,9.7h-17.36v-53.06h17.36c5.36,0,9.7,4.34,9.7,9.7Zm7.4,107.18c0,6.06-4.92,10.98-10.98,10.98h-23.49v-52.6h23.49c6.06,0,10.98,4.92,10.98,10.98v30.64Z"/>
                <Polygon fill="#1d1d1b" points="722.53 131.18 722.53 253.36 685.24 131.18 677.6 131.18 660 131.18 656.66 131.18 656.66 304.08 677.6 304.08 677.6 186.01 715.5 304.08 722.53 304.08 738.01 304.08 743.47 304.08 743.47 131.18 722.53 131.18"/>
                <Path fill="#1d1d1b" d="m647.37,193.56v-34.17c0-15.58-12.63-28.21-28.21-28.21h-24.03s-20.94,0-20.94,0v172.9h20.94v-76.89h3.68l21.47,76.89h22.21l-21.23-77.75c14.95-3.42,26.11-16.79,26.11-32.77Zm-21.59.11c0,6.83-5.54,12.37-12.37,12.37h-18.27v-53.72h18.27c6.83,0,12.37,5.54,12.37,12.37v28.98Z"/>
                </G>
            </G>
        </Svg>
    );

    const styles = StyleSheet.create({
        page:{
            margin: 30,
        },
        page1:{
            //marginLeft: 25,
            //marginRight: 25,
            textAlign: 'justify',
            margin: 3,
            padding: 3,
            flex: 3,
            fontSize: 14,
            marginBottom: 5,
        },
        page2:{
            marginLeft: 30,
            marginRight: 30,
            marginBottom: 3,
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
            marginBottom: 3,
        },
        imagen: {
            fixed: true,
            width: 5,
            height: 80,
            margin: 5,
            padding: 5,
            //marginLeft: 5,
            flexGrow: 1,
            //flexDirection: "column",
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
            fontSize: 10,
        },
        section44: {
            margin: 3,
            padding: 3,
            flex: 3,
            flexDirection: "column",
            fontSize: 10,
        },
        section_negrita: {
            fontWeight: 'bold',
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
            flex: 8,
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
        totalNumber: {
            marginRight: 70,
            marginBottom: 3,
            fontSize: 10,
            bottom: 30,
            left: 0,
            right: 0,
            textAlign: 'right',
            color: 'grey',
        },
        ComentarioFinal: {
            position: 'absolute',
            fontSize: 9,
            bottom: 50,
            left: 15,
            right: 15,
            textAlign: 'justify',
            color: 'grey',
        },
        textWithMargin: {
            marginBottom: 5,
        },
    });
    return(     
        <Document>
            <Page size="A4">
                <Text render={({ pageNumber, totalPages }) => ("  ")} fixed /> 
                <View style={styles.page} >
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.imagen}>
                            {pedido.empresa.id === 1 ? <VerLogo /> : <Image src={pedido.empresa.logo}/>}
                        </View>
                        <View style={{ flex: 1, marginLeft: 160, justifyContent: 'center' }}>
                            <View style={styles.section_negrita}>
                                <Text style={styles.page1}>Pedido</Text>
                                <Text style={styles.section44}>Fecha: {fecha_creacion}</Text>
                                <Text style={{ ...styles.section44, marginBottom: 5 }}>Nº Pedido: {pedido.numero}</Text>
                            </View>
                        </View>
                        
                    </View>
                    <View style={styles.page2}>               
                        <View style={styles.section}>
                            <View style={styles.section44}>
                                <Text style={{color: 'grey', marginTop: 15}}>Datos Proveedor:</Text>
                                <Text>{proveedor.nombre}</Text>
                                <Text>{proveedor.cif}</Text>
                                <Text>Código:{proveedor.cod_ekon}</Text>
                                {contacto ? <Text>Att: {contacto.nombre}</Text>:<Text>   </Text>}
                                <Text>{proveedor.telefono}</Text>
                                <Text>{proveedor.direccion}</Text>
                                <Text>{proveedor.poblacion}</Text>
                                <Text>{proveedor.pais}</Text>
                                <Text style={{marginTop: 15}}>Asunto:   Pedido</Text>
                                <Text>Creado por:   {pedido.creado_por.get_full_name}</Text>
                                <Text>Email: {pedido.creado_por.email}</Text>
                            </View>
                            <View style={styles.section4}>
                                <Text style={{color: 'grey', marginTop: 15}}>Dirección de Facturación:</Text>
                                <Text>{pedido.empresa.nombre}</Text>
                                <Text>{pedido.empresa.cif}</Text>
                                <Text>{pedido.empresa.direccion}</Text>
                                <Text>{pedido.empresa.poblacion}</Text>
                                <Text>{pedido.empresa.codpostal}</Text>
                                <Text>España</Text>
                                <Text>Telf: {pedido.empresa.telefono}</Text>
                            </View>
                            <View style={styles.section4}>
                                <Text style={{color: 'grey', marginTop: 15}}>Dirección de Envío:</Text>
                                <Text>{pedido.empresa.nombre}</Text>
                                {/* <Text>{direccion_envio.cif}</Text> */}
                                <Text>{direccion_envio.direccion}</Text>
                                <Text>{direccion_envio.poblacion}</Text>
                                <Text>{direccion_envio.codpostal + ' - ' + direccion_envio.provincia}</Text>
                                <Text>España</Text>
                                <Text>Telf: {direccion_envio.telefono}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.page2}>
                        <View style={styles.section}>
                            <View style={styles.section3}>
                                {/* <Text style={styles.textWithMargin}>Nº Pedido: {pedido.numero}</Text>  */}
                                <Text style={styles.textWithMargin}>Observaciones pedido: {pedido.observaciones}</Text>                            
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
                {Total()}
                {Total_adic()}
                <View style={styles.totalNumber}>
                    <Text>Base Imponible: {Number.parseFloat(total_pedido).toFixed(2)}€</Text>
                </View>
                <View style={styles.totalNumber}>
                    {proveedor.pais!=='España'?<Text style={{marginBottom:10}}>OPERACION INTRACOMUNITARIA EXENTA DE IVA</Text>:null}
                </View>
                {/* <View style={styles.totalNumber}><Text>Iva aplicable: {'        ' + proveedor.iva}%</Text></View> */}
                {/* <View style={styles.totalNumber}><Text>Total Pedido: {Number.parseFloat((total_pedido)*(proveedor.iva/100+1)).toFixed(2)}€</Text></View> */}
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
                            <Text style={styles.textWithMargin}>Nota: Por favor indicar en nº de pedido en el albarán de entrega.</Text>
                            <Text style={styles.textWithMargin}>Condiciones de Pago: {proveedor.condicion_pago}</Text>
                            <Text style={styles.textWithMargin}>Condiciones de Entrega - Incoterm 2020: {proveedor.condicion_entrega}</Text>
                            
                        </View>
                    </View>
                </View>
                <Text style={styles.ComentarioFinal}>La empresa suministradora de los bienes y/o servicios solicitados deberá aplicar políticas que sean conformes a los objetivos de desarrollo sostenible y responsabilidad social, que incluyen un gobierno corporativo, respeto por el medio ambiente, el cumplimiento de los derechos humanos, prácticas operativas, laborales y comerciales justas y con una preocupación hacia el consumidor, la sociedad y el bien común. </Text>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (`${pageNumber} / ${totalPages}`)} fixed />
                <View style={styles.page}fixed></View>                
            </Page>
        </Document>         
    )    
}
export default VistaPdf;