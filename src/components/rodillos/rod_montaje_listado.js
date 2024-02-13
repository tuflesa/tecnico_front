import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PencilFill, Trash } from 'react-bootstrap-icons';
import RodMontajeListadoFiltro from './Rod_montaje_listado_filtro';
import logo from '../../assets/logo_bornay.svg';

const RodMontajeListado = () => {
    const [user] = useCookies(['tec-user']);
    const [token] = useCookies(['tec-token']);

    const [montajes, setMontajes] = useState(null)
    const [filtro, setFiltro] = useState(``);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/montaje_listado/`+filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setMontajes(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro]);

    const actualizaFiltro = str => {
        setFiltro(str);
    }

    return ( 
        <Container>
            <img src ={logo} width="200" height="200"></img>
            <Row>
                <Col>
                    <RodMontajeListadoFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Montajes</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Máquina</th>
                                <th>Grupo</th>
                                <th>Cabeza de Turco</th>
                            </tr>
                        </thead>
                        <tbody>
                            {montajes && montajes.map( montaje => {
                                return (
                                    <tr key={montaje.id}>
                                        <td>{montaje.nombre}</td>
                                        <td>{montaje.maquina.siglas}</td>
                                        <td>{montaje.grupo.nombre}</td>
                                        <td>{montaje.bancadas.dimensiones}</td>
                                        <td>
                                            <Link to={`/rodillos/montaje_editar/${montaje.id}`}>
                                                <PencilFill className="mr-3 pencil"/>
                                            </Link>
                                            <Trash className="trash"  onClick={'handlerBorrar'} />
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
 
export default RodMontajeListado;