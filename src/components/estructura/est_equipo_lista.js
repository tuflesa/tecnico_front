import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Trash, PencilFill } from 'react-bootstrap-icons';
import EstEquipoFiltro from './est_equipo_filtro';


const EstEquipoLista = () => {
    const [token] = useCookies(['tec-token']);
    const [equipos, setEquipos] = useState([]);
    const [filtro, setFiltro] = useState('')

    const actualizaFiltro = str => {
        setFiltro(str);
    }

    useEffect(()=>{
        axios.get(BACKEND_SERVER + '/api/estructura/equipo/' + filtro, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then(res => {
            // console.log(res.data);
            setEquipos(res.data);
        })
    },[token, filtro]);

    return ( 
        <Container>
            <Row>
                <Col xs="12" sm="4">
                    <EstEquipoFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de equipos</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                            <th>Zona</th>
                            <th>Seccion</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipos && equipos.map( equipo => {
                                return (
                                    <tr key={equipo.id}>
                                        <td>{equipo.siglas_zona}</td>
                                        <td>{equipo.seccion_nombre}</td>
                                        <td>{equipo.nombre}</td>
                                        <td>
                                            <Link to={`/estructura/equipo/${equipo.id}`}>
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
 
export default EstEquipoLista;