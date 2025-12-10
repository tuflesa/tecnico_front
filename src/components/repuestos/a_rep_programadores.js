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
        })
        .catch(err => { console.log(err);})
    }

    const cambiar_stocks = () => {
        for(var x=0; x<linea_stock.length; x++){
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
            })
            .catch( err => {
                console.log(err);
            })
        }
    }

    const generarAnual = async () => {
        const confirmar = window.confirm("¿Deseas generar todos los horarios del año actual?");
        if (!confirmar) return;

        try {
            await axios.post(BACKEND_SERVER + `/api/velocidad/horarios/generar/`, {}, { 
                headers: {
                    'Authorization': `token ${token['tec-token']}` 
                }
            });
            alert("Año generado correctamente");
            //cargarSemana();
        } catch (error) {
            console.error("Error generando el año:", error);
            alert("Hubo un error generando el año: " + (error.response?.data?.mensaje || error.message));
        }
    };

    return (
        <Container className='mt-5'>
            <Row>
                <button
                        onClick={generarAnual}
                        style={{
                            marginBottom: "20px",
                            backgroundColor: "#16a34a",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "600"
                        }}
                    >
                        Generar año actual
                    </button>
            </Row>
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