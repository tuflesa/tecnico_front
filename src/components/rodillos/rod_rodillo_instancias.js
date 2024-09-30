import { Container } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Form, Col, Row, Table } from 'react-bootstrap';
import { PlusCircle, Clipboard, Trash} from 'react-bootstrap-icons';
import {invertirFecha} from '../utilidades/funciones_fecha';
import RodCrearInstancia from './rod_crear_instancia';

const RodInstanciasRodillo = ({rodillo}) => {
    const [token] = useCookies(['tec-token']);
    const [show_instancia, setShowInstancia] = useState(false);
    const [rodillo_nuevo, setRodilloNuevo] = useState('');
    const [instancias, setInstancias] = useState(null);
    const [instancias_length, setInstanciasLength] = useState(null);

    useEffect(() => {
        if(rodillo.id){
            axios.get(BACKEND_SERVER + `/api/rodillos/instancia_listado/?rodillo__id=${rodillo.id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }
            })
            .then( res => {
                setInstancias(res.data);
                setRodilloNuevo(rodillo);
                setInstanciasLength(res.data.length);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, rodillo]);

    const añadirInstancia = () => {
        setShowInstancia(true);
    }

    const cerrarInstancia = () => {
        setShowInstancia(false);
    }

    return (
        <Container className='mt-5 pt-1'>
            <Form>
                {rodillo.length!==0?
                    <React.Fragment> 
                        <Form.Row>
                        <Col>
                            <Row>
                                <Col>
                                <h5 className="pb-3 pt-1 mt-2">Añadir Instancia:</h5>
                                </Col>
                                <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                        <PlusCircle className="plus mr-2" size={30} onClick={añadirInstancia}/>
                                </Col>
                            </Row>
                        </Col>
                        </Form.Row>
                    </React.Fragment>
                :null}
            </Form>
                {instancias?instancias.length!==0?
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Material</th>
                                <th>Especial</th>
                                <th>Diámetro FG</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            { instancias && instancias.map( instancia => {
                                return (
                                    <React.Fragment key={instancia.id}>
                                        <tr key={instancia.id}>
                                            <td>{instancia.nombre}</td>
                                            <td>{instancia.material.nombre}</td>
                                            <td>{instancia.especial===false?'NO':'SI'}</td>
                                            <td>{'Ø'+instancia.diametro}</td>
                                        </tr>
                                    </React.Fragment>
                                )})
                            }
                        </tbody>
                    </Table>
                :null:null}
                <RodCrearInstancia show={show_instancia}
                                    rodillo_id={rodillo_nuevo.id}
                                    rodillo={rodillo_nuevo}
                                    handleClose={cerrarInstancia}
                                    instancias_length={instancias_length}/>

        </Container>
    );
}

export default RodInstanciasRodillo;
