import React from 'react';
import { Document, Page, Image, View, Text, StyleSheet } from "@react-pdf/renderer";
import { useCookies } from 'react-cookie';

const VistaIngPdf = ({pedido, verIngPdf, fecha_creacion, linea, empresa, lineas_adicionales, proveedor, contacto, direccion_envio}) =>{
    var total_pedido= 0;

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
                                <View style={styles.section6}><Text>{data.descripcion_proveedor +" "+ (data.repuesto.fabricante? " - " + data.repuesto.fabricante:'') + (" - " + data.repuesto.modelo? data.repuesto.modelo:'')}</Text></View>
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
            linea.map( l => {{total_pedido+=Number(l.total)}})
        }
    }
    function Total_adic(){
        lineas_adicionales.map( linea => {{total_pedido+=Number(linea.total)}})
    }

    /* const ExampleSvg = () => (
        <Svg width="200" height="200" viewBox="-100 -100 200 250">
            <Polygon points="0,0 80,120 -80,120" fill="#234236" />
            <Polygon points="0,-40 60,60 -60,60" fill="#0C5C4C" />
            <Polygon points="0,-80 40,0 -40,0" fill="#38755B" />
            <Rect x="-20" y="120" width="40" height="30" fill="#A32B2D" />
        </Svg>
    ); */

    /* const ExampleSvg = () => (
        <Svg version="1.0" xmlns="http://www.w3.org/2000/svg"
            width="474.000000pt" height="237.000000pt" viewBox="0 0 474.000000 237.000000"
            preserveAspectRatio="xMidYMid meet">
            <G transform="translate(0.000000,237.000000) scale(0.100000,-0.100000)"
            fill="#000000" stroke="none">
            <Path d="M1017 1593 c-4 -3 -7 -199 -7 -435 l0 -428 430 0 430 0 0 435 0 435
            -423 0 c-233 0 -427 -3 -430 -7z"/>
            <Path d="M2209 1324 c-24 -29 27 -72 54 -45 8 8 8 14 -1 23 -9 9 -12 8 -12 -5
            0 -20 -13 -22 -29 -4 -14 17 5 38 27 30 10 -4 13 -2 8 5 -10 17 -31 15 -47 -4z"/>
            <Path d="M2301 1293 c0 -25 1 -26 9 -8 12 27 12 35 0 35 -5 0 -10 -12 -9 -27z"/>
            <Path d="M2385 1298 c-6 -20 -8 -20 -12 -5 -2 9 -9 17 -14 17 -21 0 -3 -35 19
            -38 18 -3 22 1 22 22 0 32 -5 33 -15 4z"/>
            <Path d="M2430 1285 l0 -35 25 16 c31 20 29 48 -3 52 -19 3 -22 -1 -22 -33z
            m35 16 c3 -5 1 -12 -5 -16 -5 -3 -10 1 -10 9 0 18 6 21 15 7z"/>
            <Path d="M2514 1306 c-7 -18 3 -36 19 -35 9 0 9 2 0 6 -18 7 -16 33 1 33 8 0
            17 -8 20 -17 4 -14 4 -14 3 2 -3 24 -35 33 -43 11z"/>
            <Path d="M1928 1218 c-3 -7 -3 -53 -2 -103 1 -49 3 -157 3 -238 l1 -148 86 3
            c82 3 88 5 108 31 29 39 31 184 3 215 -11 12 -16 26 -11 33 4 7 10 26 14 43
            l7 31 11 -27 c6 -14 21 -36 33 -47 21 -20 34 -21 200 -21 171 0 179 1 205 23
            51 44 41 166 -15 197 -12 6 -93 10 -193 10 -193 0 -204 -4 -231 -70 l-14 -35
            -6 42 c-10 58 -34 73 -123 73 -49 0 -73 -4 -76 -12z m127 -128 l0 -65 -32 -3
            -33 -3 0 64 c0 35 3 67 7 71 4 4 19 6 33 4 24 -3 25 -6 25 -68z m473 54 c31
            -21 26 -64 -8 -81 -38 -19 -243 -17 -280 2 -37 19 -40 57 -8 79 33 23 264 23
            296 0z m-467 -204 c15 -9 19 -22 19 -64 0 -61 -14 -79 -57 -74 -27 3 -28 6
            -31 62 -2 32 -1 65 2 72 6 17 40 18 67 4z"/>
            <Path d="M2640 979 l0 -250 32 3 32 3 -3 88 c-1 51 1 87 7 87 5 0 20 -39 33
            -87 l24 -88 39 -3 c34 -3 37 -1 31 17 -3 12 -17 59 -29 105 l-24 84 34 33 c33
            32 34 35 34 111 0 88 -16 132 -52 142 -13 3 -53 6 -90 6 l-68 0 0 -251z m129
            167 c7 -8 11 -37 9 -68 -3 -53 -3 -53 -38 -56 l-35 -3 -3 51 c-2 28 0 60 3 70
            7 24 47 27 64 6z"/>
            <Path d="M2877 1223 c-4 -3 -7 -116 -7 -250 l0 -243 35 0 35 0 1 143 1 142 46
            -140 47 -140 45 0 45 0 0 245 0 245 -30 0 -30 0 -3 -142 c-1 -79 -6 -143 -10
            -143 -5 0 -14 24 -22 53 -7 28 -26 94 -42 145 l-29 92 -38 0 c-21 0 -41 -3
            -44 -7z"/>
            <Path d="M3252 1213 c-5 -10 -21 -74 -36 -143 -27 -128 -64 -291 -73 -323 -4
            -16 1 -18 33 -15 l38 3 21 100 c16 80 24 101 39 103 29 6 39 -12 61 -111 20
            -92 20 -92 53 -95 25 -3 32 0 32 15 -1 10 -25 122 -54 248 -52 224 -54 230
            -79 233 -17 2 -29 -3 -35 -15z m47 -200 c1 -7 -6 -13 -14 -13 -15 0 -21 40 -8
            54 7 7 21 -18 22 -41z"/>
            <Path d="M3350 1221 c0 -5 23 -68 50 -140 49 -128 50 -133 50 -241 l0 -110 35
            0 35 0 0 115 c0 114 0 116 50 243 28 71 50 131 50 135 0 9 -52 9 -66 -1 -6 -4
            -22 -40 -36 -81 -13 -41 -28 -76 -34 -78 -5 -1 -22 34 -39 80 -29 78 -32 82
            -62 85 -18 2 -33 -1 -33 -7z"/>
            </G>
        </Svg>
    ); */

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
        totalNumber: {
            marginRight: 70,
            fontSize: 14,
            bottom: 30,
            left: 0,
            right: 0,
            textAlign: 'right',
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
                            {/* <ExampleSvg /> */}
                        </View>
                    </View>
                    <View style={styles.page2}>               
                        <View style={styles.section}>
                            <View style={styles.section44}>
                                <Text>Date: {fecha_creacion}</Text>
                                {contacto ? <Text>to:   {contacto.nombre}</Text>:<Text>   </Text>}
                                <Text>Company:  {proveedor.nombre}</Text>
                                <Text>Subject:  Pedido</Text>
                                <Text>From: {pedido.creado_por.get_full_name}</Text>
                            </View>
                            <View style={styles.section4}>
                                <Text>Delivery Address:</Text>
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
                                <Text>Nº Order: {pedido.numero}</Text>                            
                            </View>
                        </View>
                    </View>
                    <View style={styles.page2}>
                        <View style={styles.section}>
                            <View style={styles.section3}>
                                <Text>Ordering remarks: {pedido.observaciones}</Text>                            
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
                    { linea !== '' ?
                        <View style={styles.page3} fixed>
                            <View style={styles.sectionTabla}>
                                <View style={styles.section6}><Text>Description</Text></View>
                                <View style={styles.section7}><Text>Qty</Text></View>
                                <View style={styles.section7}><Text>Unit</Text></View>
                                <View style={styles.section8}><Text>Price/Unit</Text></View>
                                <View style={styles.section8}><Text>Dcnt.</Text></View>
                                <View style={styles.section8}><Text>Total</Text></View>
                            </View>                                          
                        </View>                    
                    :null}
                    {parseData()}
                    
                    {parse2Data()}
                </View>
                {Total()}
                {Total_adic()}
                <View style={styles.totalNumber}><Text>Order total: {Number.parseFloat(total_pedido).toFixed(2)}€</Text></View>
                <View style={styles.page2}>
                    <View style={styles.section}>
                        <View style={styles.section3}>
                            <Text>Ordering remarks:  {pedido.observaciones2}</Text>                            
                        </View>
                    </View>
                </View>
                <View style={styles.page2}>
                    <View style={styles.section}>
                        <View style={styles.section3}>
                            <Text>Note: Please indicate the order number on the delivery note.</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (`${pageNumber} / ${totalPages}`)} fixed />
                <View style={styles.page}fixed></View>                
            </Page>
        </Document>         
    )    
}
export default VistaIngPdf;