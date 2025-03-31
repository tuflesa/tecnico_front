import React, { useState, useEffect } from 'react';
import './repuestos.css';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
//import { filter } from 'd3';
import logo from '../../assets/icono_1.svg';
//import cuchilla from '../../assets/cuchilla_1.svg';
//import logo_bor from '../../assets/bitmap.svg';


const Programadores = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [linea_stock, setLineaStock] = useState(null);

    const Listado_Stocks = () => {
        axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimo_detalle/?repuesto__es_critico=${false}&almacen__id=${21}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setLineaStock(res.data);
            console.log('stocks: ',res.data);
        })
        .catch(err => { console.log(err);})
    }

    const cambiar_stocks = () => {
        console.log('esto vale linea_stock: ', linea_stock);
        for(var x=0; x<linea_stock.length; x++){
            console.log('DENTRO DEL FOR')
            axios.patch(BACKEND_SERVER + `/api/repuestos/stocks_minimos/${linea_stock[x].id}/`,{
                cantidad: 0,
                cantidad_aconsejable: linea_stock[x].cantidad,
            },
            {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( r => {
                console.log('cambios realizados en: ', r.data)
            })
            .catch( err => {
                console.log(err);
            })
        }
    }

    return (
        <Container className='mt-5'>
            <Row>
                <Col>
                    
                    <h5 className="mb-3 mt-3">Acciones de Programadores</h5>  
                    <h5><img src = {logo}></img></h5>                 
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Crear lista precio - proveedor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <th><Button variant="info" onClick={event =>{Listado_Stocks()}}>1- Repasar listado de stocks</Button></th>
                            <th><Button variant="info" onClick={event =>{cambiar_stocks()}}>1- Pasar stocks</Button></th>
                        </tbody>
                    </Table>
                </Col>
            </Row>  
        </Container>        
    )
}

export default Programadores;