import React, { useState, useEffect } from 'react';
import './repuestos.css';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { filter } from 'd3';


const Programadores = () => {
    const [user] = useCookies(['tec-user']);
    const [token] = useCookies(['tec-token']);

    const soyProgramador = user['tec-user'].perfil.destrezas.filter(s => s === 7);
    const [lista_repuestos, setListaRepuestos] = useState(null);

    const CrearListado = ()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/lista/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setListaRepuestos(res.data);
            for(var x=0; x<res.data.length; x++){
                for(var y=0; y<res.data[x].proveedores.length; y++){
                    axios.post(BACKEND_SERVER + `/api/repuestos/precio/`, {
                        repuesto: res.data[x].id,
                        proveedor: res.data[x].proveedores[y],
                        precio: 0,
                        descuento: 0, 
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                          }     
                    })
                    .then( res => { 
                        console.log('ya estaaaaaa');
                    })
                    .catch(err => { console.log(err);})
                }
            }
        })
        .catch( err => {
            console.log(err);
        });
    }

    return (
        <Container className='mt-5'>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Acciones de Programadores</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Crear lista precio - proveedor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <th><Button variant="info" onClick={event =>{CrearListado()}}>Crear lista</Button></th>
                        </tbody>
                    </Table>
                </Col>
            </Row>            
        </Container>        
    )
}

export default Programadores;