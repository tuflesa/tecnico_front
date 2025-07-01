import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';


const Programadores = () => {
    const [user] = useCookies(['tec-user']);
    const [token] = useCookies(['tec-token']);
    const [celdas, setCeldas] = useState([]);
    
    const poner_icono = () => {
        console.log('estamos dentro del color');
/*         console.log('esto vale celda_qs: ', celda_qs);
    
        celda_qs.forEach(item => {
            if (item.operacion?.icono_celda !== undefined) {
                item.icono = item.operacion.icono_celda;
            }
        });
    
        console.log('esto vale celda_qs después: ', celda_qs); */
    }; 
    
    const grabar_icono = () => {
        
        console.log('entramos a grabar_icono y celda vale....: ')
        let color_asignado='';
        for(var x=0;x<celdas.length;x++){
            //var naranja = celdas[x].conjunto.elementos.some(element => element.rodillo.operacion !== celdas[x].operacion.id);
            const colores = {
                naranja: '#FFA500',
                azul: '#2196F3',
                verde: '#4CAF50',
                amarillo: '#FFEB3B'
            };
            if(celdas[x].conjunto.elementos.some(element => element.rodillo.nombre === 'Sin_Rodillo')){
                console.log('ENTRA EN AMARILLO: ', celdas)
                color_asignado=colores.amarillo;
            }
            else if(celdas[x].conjunto.elementos.some(element => element.rodillo.operacion !== celdas[x].operacion.id)){
                console.log('ENTRA EN NARANJA: ', celdas)
                color_asignado=colores.naranja;
            }
            else if(celdas[x].conjunto.operacion!==celdas[x].operacion.id){
                console.log('ENTRA EN NARANJA POR OPERACIÓN: ', celdas)
                color_asignado=colores.naranja;
            }
            else if(celdas[x].bancada.tubo_madre!==celdas[x].conjunto.tubo_madre){
                console.log('ENTRA EN AZUL: ', celdas)
                color_asignado=colores.azul;
            }
            else if(celdas[x].conjunto.operacion===celdas[x].operacion.id && celdas[x].bancada.tubo_madre===celdas[x].conjunto.tubo_madre){
                console.log('ENTRA EN VERDE: ', celdas)
                color_asignado=colores.verde;
            }
            else if(celdas[x].conjunto.elementos.some(element => element.rodillo.nombre === 'Sin_Rodillo')){
                console.log('ENTRA EN AMARILLO: ', celdas)
                color_asignado=colores.amarillo;
            }
            /* for(var y=0; y<celdas[142].conjunto.elementos.length;y++){
                if(celdas[142].conjunto.elementos[y].rodillo.nombre==='Sin_Rodillo'){
                    color_asignado=colores.amarillo;
                }
            } */
        
            color_asignado && celdas && axios.patch(BACKEND_SERVER + `/api/rodillos/celda/${celdas[x].id}/`,{
                color_celda: color_asignado,
            },
            {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => { 
                console.log('DESPUES DE GRABAR: ',res.data);
            })
            .catch(err => { console.log(err);})
        }
    };

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/rodillos/celda_program/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }     
        })
        .then( res => { 
            setCeldas(res.data);
            console.log('recogida de celdas: ',res.data);
        })
        .catch(err => { console.log(err);})
    },[token]);

    return (
        <Container className='mt-5'>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Acciones de Programadores</h5>
                    <button onClick={poner_icono}>ICONO</button>
                    <button onClick={grabar_icono}>GRABAR_ICONO</button>
                </Col>
            </Row>
        </Container>
    )
}

export default Programadores;