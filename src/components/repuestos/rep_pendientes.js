import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table } from 'react-bootstrap';
import ReactExport from 'react-data-export';

const RepPendientes = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [pendientes, setPendientes] = useState(null);
    const [lineasPendientes, setLineasPendientes] = useState(null);
    
    const [datos, setDatos] = useState({
        empresa: user['tec-user'].perfil.empresa.id,
    });

    const [filtro, setFiltro] = useState(`?empresa=${datos.empresa}&&finalizado=${false}`);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimo_detalle/?almacen__empresa__id=${datos.empresa}&&stock_act<cantidad`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setPendientes(res.data.filter( s => s.stock_act < s.cantidad));
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);   

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/repuestos/linea_pedido/?pedido__finalizado=${'False'}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( rs => {
            setLineasPendientes(rs.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    return (
        <Container>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Repuestos Stock Pendiente</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Stock Actual</th>
                                <th>Stock Mínimo</th>
                                <th>Pedido</th>
                                <th>Cant. por recibir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendientes && pendientes.map( pendiente => {
                                return (
                                    <tr key={pendiente.id}>
                                        <td>{pendiente.repuesto.nombre}</td>
                                        <td>{pendiente.stock_act}</td>
                                        <td>{pendiente.cantidad}</td>
                                        <td>{lineasPendientes && lineasPendientes.map( lineas => {
                                            if(lineas.repuesto === pendiente.repuesto.id){                                               
                                                return(lineas.pedido.numero) 
                                            }
                                        })}                                            
                                        </td> 
                                        <td>{lineasPendientes && lineasPendientes.map( lineas => {
                                            if(lineas.repuesto === pendiente.repuesto.id){                                               
                                                return(lineas.por_recibir) 
                                            }
                                        })}                                            
                                        </td>

                                    </tr>
                                )
                            })
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>

    )
}
export default RepPendientes;