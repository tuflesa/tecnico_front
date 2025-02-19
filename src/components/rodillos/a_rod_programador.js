import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';


const Programadores = () => {
    const [user] = useCookies(['tec-user']);
    const [token] = useCookies(['tec-token']);
    const [celdas, setCeldas] = useState([]);
    let celda_qs = [];
    
    const poner_icono = () => {
        console.log('estamos dentro del poner_icono');
        console.log('esto vale celda_qs: ', celda_qs);
    
        celda_qs.forEach(item => {
            if (item.operacion?.icono_celda !== undefined) {
                item.icono = item.operacion.icono_celda;
            }
        });
    
        console.log('esto vale celda_qs después: ', celda_qs);
    }; 
    
    const grabar_icono = () => {
        for(var x=0;x<celda_qs.length;x++){
            celda_qs && axios.patch(BACKEND_SERVER + `/api/rodillos/celda/${celda_qs[x].id}/`,{
                icono: celda_qs[x].icono,
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
        celda_qs=celdas;
        console.log('CAMBIAN LAS CELDAS: ',celda_qs);
    },[celda_qs]);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/rodillos/celda_qs/?icono_isnull=${true}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }     
        })
        .then( res => { 
            setCeldas(res.data);
            console.log(res.data);
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