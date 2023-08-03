import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table } from 'react-bootstrap';

const RodGruposListado = () => {
    const [token] = useCookies(['tec-token']);
    const [lineas, setLineas] = useState(null);
    const [valor_conjuntos, setValorConjuntos] = useState('');
    const [show, setShow] = useState(false);
    const [filaSeleccionada, setFilaSeleccionada] = useState(null);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/grupos/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setLineas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    const abrirConjuntos = (linea) => {
        setShow(!show);
        if(show){
            const tabla = (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Conjuntos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {linea.conjuntos && linea.conjuntos.map( conjunto => {
                            return (
                                <tr key={conjunto.id}>
                                    <td>{conjunto.nombre}</td>
                                </tr>
                            )})
                        }
                    </tbody>
                </Table>
            );
            setValorConjuntos(tabla);
            setFilaSeleccionada(linea.id);
        }
        else{
            setValorConjuntos('');
        }
      };

    return(
        <Container className='mt-5'>  
            <Row>                
                <Col>
                    <h5 className="mb-3 mt-3">Listado de Grupos de montaje</h5>                    
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th style={{width:10}}>boton</th>
                                <th>Nombre</th>
                                <th>Máquina</th>
                                <th>Tubo Madre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineas && lineas.map( linea => {
                                return (
                                    <React.Fragment key={linea.id}>
                                        <tr>
                                            <td>
                                                <button type="button" className="btn btn-default" value={linea.id} name='prueba' onClick={event => {abrirConjuntos(linea)}}>--</button>
                                            </td>
                                            <td>{linea.nombre}</td>
                                            <td>{linea.maquina.siglas}</td>
                                            <td>{'Ø' + linea.tubo_madre}</td>
                                        </tr>
                                        {filaSeleccionada === linea.id && (
                                            <tr>
                                                <td colSpan="4">{valor_conjuntos}</td>
                                            </tr>
                                            )}
                                    </React.Fragment>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    )
}

export default RodGruposListado;