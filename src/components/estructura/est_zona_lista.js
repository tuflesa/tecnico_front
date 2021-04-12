import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import EstZonaFiltro from './est_zona_filtro';

const EstZonaLista = () => {
    const [token] = useCookies(['tec-token']);
    const [zonas, setZonas] = useState([]);
    const [filtro, setFiltro] = useState('')

    const actualizaFiltro = str => {
        setFiltro(str);
    }

    useEffect(()=>{
        axios.get(BACKEND_SERVER + '/api/estructura/zona/' + filtro, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then(res => {
            // console.log(res.data);
            setZonas(res.data);
        })
    },[token, filtro]);

    return ( 
        <Container>
            <Row>
                <Col xs="12" sm="4">
                    <EstZonaFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de zonas</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                            <th>Siglas</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zonas && zonas.map( zona => {
                                return (
                                    <tr key={zona.id}>
                                        <td>{zona.siglas}</td>
                                        <td>{zona.nombre}</td>
                                        <td>
                                            <Link to={`/estructura/zona/${zona.id}`}>
                                                <PencilFill className="mr-3 pencil"/>
                                            </Link>
                                            <Trash className="trash" />
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            
        </Container>
     );
}
 
export default EstZonaLista;