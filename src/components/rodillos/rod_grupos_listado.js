import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { PencilFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const RodGruposListado = () => {
    const [token] = useCookies(['tec-token']);
    const [lineas, setLineas] = useState(null);
    const [valor_conjuntos, setValorConjuntos] = useState('');
    const [show, setShow] = useState(false);
    const [filaSeleccionada, setFilaSeleccionada] = useState(null);
    //const [bancadas, setBancadas] = useState(null);
    const [celdas, setCeldas] = useState(null);
    const [elementos, setElementos] = useState(null);
    const [conjuntos, setConjuntos] = useState(null);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/grupo/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setLineas(res.data);
            console.log(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    const cogerDatos = async (linea) => {
        try {
            // Hacer las solicitudes a las celdas de todas las bancadas y lo guarda en solicitudesCeldas
            const solicitudesCeldas = linea.bancadas.map(bancadaId => {
                return axios.get(BACKEND_SERVER + `/api/rodillos/celda_select/?bancada__id=${bancadaId}`, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                });
            });
            // Esperar a que todas las solicitudes a las celdas se completen y pasamos la info a respuestasCeldas
            const respuestasCeldas = await Promise.all(solicitudesCeldas);
            // Busco para cada Celda el elemento con el id del conjunto
            const solicitudesElementos = respuestasCeldas.map(res => {
                return Promise.all(res.data.map(celda => {
                    return axios.get(BACKEND_SERVER + `/api/rodillos/elemento_select/?conjunto__id=${celda.conjunto.id}`, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }
                    });
                }));
            });
            // Espero a que todas las solicitudes de elementos y copio la info en respuestasElementos
            const respuestasElementos = await Promise.all(solicitudesElementos);
            // Actualizar los estados
            setFilaSeleccionada(linea.id);
            setShow(!show);
            //setBancadas(linea.bancadas);
            setCeldas(respuestasCeldas.map(res => res.data));
            setElementos(respuestasElementos.map(res => res.map(r => r.data)));
        } catch (error) {
            console.log(error);
        }
    };
      
    useEffect(() => {
        if (show && celdas) {
            const conjuntosTabla = elementos && elementos.map(e => {
                return e && e.map(c => {
                    return c && c.map(d => {
                        return (
                            <tr key={d.id}>
                                <td>{d.conjunto.operacion.nombre}</td>
                                <td>{d.rodillo.grupo.tubo_madre}</td>
                                <td>{d.eje.diametro}</td>
                                <td>{d.rodillo.nombre}</td>
                            </tr>
                        )
                    })
                })
            });

            setConjuntos(conjuntosTabla);
        } else {
            setConjuntos(null);
        }
    }, [show, celdas, elementos]);

    return (
        <Container className='mt-5'>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Listado de Grupos de montaje</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th style={{ width: 10 }}>boton</th>
                                <th>Nombre</th>
                                <th>Máquina</th>
                                <th>Tubo Madre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineas && lineas.map(linea => {
                                return (
                                    <React.Fragment key={linea.id}>
                                        <tr>
                                            <td>
                                                <button type="button" className="btn btn-default" value={linea.id} name='prueba' onClick={event => { cogerDatos(linea) }}>--</button>
                                            </td>
                                            <td>{linea.nombre}</td>
                                            <td>{linea.maquina.siglas}</td>
                                            <td>{'Ø' + linea.tubo_madre}</td>
                                            <td><Link title='Detalle/Modificar'to={`/rodillos/grupo_editar/${linea.id}`}><PencilFill className="mr-3 pencil"/></Link></td>
                                        </tr>
                                        {filaSeleccionada === linea.id && (
                                            <tr>
                                                <td colSpan="4">
                                                        <Table striped bordered hover>
                                                            <thead>
                                                                <tr>
                                                                    <th>Operación</th>
                                                                    <th>Tubo madre</th>
                                                                    <th>Eje</th>
                                                                    <th>Rodillo</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {conjuntos}
                                                            </tbody>
                                                        </Table>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    )
}


export default RodGruposListado;