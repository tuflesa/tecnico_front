import React, { Component, useState, useEffect } from 'react';
import { Document, Page, Image, View, Text, StyleSheet} from "@react-pdf/renderer";
import { Container, Row, Col, Table, Modal } from 'react-bootstrap';
import {invertirFecha} from '../utilidades/funciones_fecha';
import { useCookies } from 'react-cookie';
import { ListTask } from 'react-bootstrap-icons';
import { line } from 'd3-shape';

const VistaPdf = ({pedido, VerPdf, linea, empresa, lineas_adicionales, proveedor}) =>{
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [hoy] = useState(new Date);

    console.log('que vale lineas_adicionales');
    //console.log(empresas);
    console.log(linea);
 
    function parseData(){
        if(linea){
            return linea.map((data, i)=>{
                return(
                    <View key={i}>
                        <View style={{flexDirection: "row", margin:5}}>
                            <View style={{flexDirection: "column", flex: 5}}>
                                <Text>{data.repuesto.nombre}</Text>
                            </View>
                            <View style={{flexDirection: "column", flex: 1, textAlign: 'right'}}>
                                <Text>{data.cantidad}</Text>
                            </View>
                            <View style={{flexDirection: "column", flex: 3, textAlign: 'right'}}>
                               <Text>{data.precio + '€'}</Text>
                            </View>
                            <View style={{flexDirection: "column", flex: 3, textAlign: 'right', marginRight: 80}}>
                               <Text>{data.precio * data.cantidad + '€' }</Text>
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
                        <View style={{flexDirection: "row", margin:5}}>
                            <View style={{flexDirection: "column", flex: 5}}>
                                <Text>{data.descripcion}</Text>
                            </View>
                            <View style={{flexDirection: "column", flex: 1, textAlign: 'right'}}>
                                <Text>{data.cantidad}</Text>
                            </View>
                            <View style={{flexDirection: "column", flex: 3, textAlign: 'right'}}>
                               <Text>{data.precio + '€'}</Text>
                            </View>
                            <View style={{flexDirection: "column", flex: 3, textAlign: 'right', marginRight: 80}}>
                               <Text>{data.precio * data.cantidad + '€' }</Text>
                            </View>
                        </View>  
                    </View>
                )
            })
        }
    }
    
    return(        
        <Document>
            <Page size="A4" style = {{margin: 50, fontSize: 12, marginRight: 50/* , backgroundColor: 'tomato' */}} > 
                <View style={{flexDirection: "column", margin: 20, justifyContent: "center"}}>
                    <View style={{flex: 2, flexDirection: "row", justifyContent: 'space-between', padding: 10}}>
                        <View style = {{flex:0.5}}><Text>Proveedor:</Text></View>
                        <View style = {{flex:0.5}}><Text>Dirección Entrega:</Text></View>
                    </View>
                    <View style={{flex: 2, flexDirection: "row", justifyContent: 'space-between', padding: 10}}>
                        <View style = {{flex:0.5}}><Text>{proveedor.nombre}</Text></View>
                        <View style = {{flex:0.5}}><Text>{empresa.nombre}</Text></View>
                    </View>
                    <View style={{flex: 2, flexDirection: "row", justifyContent: 'space-between', padding: 10}}>
                        <View style = {{flex:0.5}}><Text>{proveedor.direccion}</Text></View>
                        <View style = {{flex:0.5}}><Text>{empresa.direccion}</Text></View>
                    </View>
                    <View style={{flex: 2, flexDirection: "row", padding: 10}}>
                        <View style = {{flex:0.5}}><Text>Población:</Text></View>
                        <View style = {{flex:0.5}}><Text>{empresa.poblacion}</Text></View>
                    </View>
                    <View style={{flex: 2, flexDirection: "row", padding: 10}}>
                        <View style = {{flex:0.5}}><Text>Código Postal:</Text></View>
                        <View style = {{flex:0.5}}><Text>{empresa.codpostal}</Text></View>
                    </View>
                    <View style={{flex: 2, flexDirection: "row", padding: 10}}>
                        <View style = {{flex:0.5}}><Text>{proveedor.telefono}</Text></View>
                        <View style = {{flex:0.5}}><Text>{empresa.telefono}</Text></View>
                    </View>
                </View>                      
                <View style={{flexDirection: "column", margin: 20, justifyContent: "center"}}>
                    <View style={{flexDirection: "row", flex:0.5, padding: 10}}>
                        <View style = {{flex:0.25}}><Text>Num-Pedido:</Text></View>
                        <View style = {{flex:0.4}}><Text>{pedido.numero}</Text></View>
                    </View>
                    <View style={{flexDirection: "row", flex:0.5, padding: 10}}>
                        <View style = {{flex:0.3}}><Text>Fecha de Pedido:</Text></View>
                        <View style = {{flex:0.6}}><Text>{pedido.fecha_creacion}</Text></View>
                    </View>
                </View> 
                { linea.length>0 ?
                <View>
                    <View style={{flexDirection: "row", marginRight: 90, borderBottom: true, borderBottomWidth: 2, borderBottomColor:"red"}}>
                        <View style={{flexDirection: "column", flex: 5}}>
                            <Text>Repuesto:</Text>                            
                        </View>
                        <View style={{flexDirection: "column", flex: 1}}>
                            <Text>Cant.:</Text>                            
                        </View>
                        <View style={{flexDirection: "column", flex: 3}}>
                            <Text>Precio:</Text>                           
                        </View>
                        <View style={{flexDirection: "column", flex: 3}}>
                            <Text>Total:</Text>                           
                        </View>
                    </View>
                    {parseData()}
                </View> 
                :null} 
                { lineas_adicionales.length>0 ?
                <View>
                    <View style={{flexDirection: "row", marginRight: 80, marginTop:70, borderBottom: true, borderBottomWidth: 2, borderBottomColor:"red"}}>
                        <View style={{flexDirection: "column", flex: 3}}>
                            <Text>Descripción:</Text>                            
                        </View>
                        <View style={{flexDirection: "column", flex: 2}}>
                            <Text>Cant.:</Text>                            
                        </View>
                        <View style={{flexDirection: "column", flex: 2}}>
                            <Text>Precio:</Text>                           
                        </View>
                        <View style={{flexDirection: "column", flex: 2}}>
                            <Text>Total:</Text>                           
                        </View>
                    </View>
                    {parse2Data()}
                </View>
                :null}          
            </Page>
        </Document>
    )    
}
export default VistaPdf;