import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Trash, PencilFill, Receipt } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import ManPartesFiltro from './man_partes_filtro';



const ManListaPartes = () => {
    const [token] = useCookies(['tec-token']);
    
    const [partes, SetPartes]  = useState(null);
    const [filtro, setFiltro] = useState('');

    const actualizaFiltro = str => {
        setFiltro(str);
    }
    
    useEffect(()=>{
        axios.get(BACKEND_SERVER + '/api/mantenimiento/parte_trabajo/' + filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            SetPartes(res.data.sort(function(a, b){
                if(a.id > b.id){
                    return 1;
                }
                if(a.id < b.id){
                    return -1;
                }
                return 0;
            }))
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro]);    

    return (
        <Container>            
            <Row>
                <Col>
                    <ManPartesFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <Row>                
                <Col>
                    <h5 className="mb-3 mt-3">Listado de Partes</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Creado Por</th>                               
                                <th>Observaciones</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partes && partes.map( parte => {
                                return (
                                    <tr key={parte.id}>
                                        <td>{parte.nombre}</td>
                                        <td>{parte.tipo_nombre}</td>
                                        <td>{parte.creado_nombre}</td>
                                        <td>{parte.observaciones}</td>
                                        <td>
                                            <Link to={`/mantenimiento/listado/${parte.id}`}>
                                                <PencilFill className="mr-3 pencil"/>                                                
                                            </Link>                                            
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    )
}

export default ManListaPartes;