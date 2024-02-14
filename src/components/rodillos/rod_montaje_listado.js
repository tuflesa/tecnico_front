import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Trash, Eye } from 'react-bootstrap-icons';
import RodMontajeListadoFiltro from './Rod_montaje_listado_filtro';
import logo from '../../assets/logo_bornay.svg';

const RodMontajeListado = () => {
    const [user] = useCookies(['tec-user']);
    const [token] = useCookies(['tec-token']);

    const [montajes, setMontajes] = useState(null)
    const [filtro, setFiltro] = useState(``);
    const [refrescar, setRefrescar] = useState(false);
    const nosoyTecnico = user['tec-user'].perfil.puesto.nombre!=='Director Técnico'?false:true;
    const [filaSeleccionada, setFilaSeleccionada] = useState(null);
    const [show, setShow] = useState(false);
    const [celdas, setCeldas] = useState(null);
    const [elementos, setElementos] = useState(null);
    const [conjuntos, setConjuntos] = useState(null);
    const [celdasCT, setCeldasCT] = useState(null);
    const [elementosCT, setElementosCT] = useState(null);
    const [conjuntosCT, setConjuntosCT] = useState(null);
    const [conjuntos_completados, setConjuntosCompletados] = useState(null);

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
    }, [token, filtro, refrescar]);

    useEffect(() => {
        if (show && celdas && elementos) {
            const datosTabla = elementos.flatMap(e => { //en esta operación creamos un array con la información que queremos mostras
                if (e) {
                    return e.flatMap(c => {
                        if (c) {
                            return c.map(d => ({
                                id: d.id,
                                nombreOperacion: d.conjunto.operacion.nombre,
                                tuboMadre: d.rodillo.grupo.tubo_madre,
                                diametroEje: d.eje.diametro,
                                nombreRodillo: d.rodillo.nombre,
                                ordenOperacion: d.conjunto.operacion.orden
                            }));
                        }
                        return [];
                    });
                }
                return [];
            });
            // Ordenar por el campo ordenOperacion
            datosTabla.sort((a, b) => a.ordenOperacion - b.ordenOperacion);
            setConjuntos(datosTabla);
        } else {
            setConjuntos(null);
        }
    }, [show, celdas, elementos]);

    useEffect(() => {
        if (show && celdasCT && elementosCT) {
            const datosTablaCompletado = elementosCT.flatMap(item => (
                item.map(d => ({
                    id: d.id,
                    nombreOperacion: d.conjunto.operacion.nombre,
                    //tuboMadre: d.bancada.dimensiones,
                    diametroEje: d.eje.diametro,
                    nombreRodillo: d.rodillo.nombre,
                    ordenOperacion: d.conjunto.operacion.orden,
                    dimensioneseBancada: d.rodillo.descripcion_perfil,
                }))
            ));
            // Ordenar por el campo ordenOperacion
            datosTablaCompletado.sort((a, b) => a.ordenOperacion - b.ordenOperacion);
            setConjuntosCT(datosTablaCompletado);
        } else {
            setConjuntosCT(null);
        }
    }, [conjuntos]);

    useEffect(() => {
        if (show && conjuntos && conjuntosCT) {
           const unimos = conjuntos.concat(conjuntosCT);
           unimos.sort((a, b) => a.ordenOperacion - b.ordenOperacion);
           setConjuntosCompletados(unimos);
        } else {
            setConjuntosCompletados(null);
        }
    }, [conjuntosCT]);

    const cogerDatos = async (montaje) => {
        try {
            // Hacer las solicitudes a las celdas de todas las bancadas y lo guarda en solicitudesCeldas
            const solicitudesCeldas = montaje.grupo.bancadas.map(bancadaId => {
                return axios.get(BACKEND_SERVER + `/api/rodillos/celda_select/?bancada__id=${bancadaId}`, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                });
            });
            const solicitudesCeldasCT = axios.get(BACKEND_SERVER + `/api/rodillos/celda_select/?bancada__id=${montaje.bancadas.id}`, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            });
            // Esperar a que todas las solicitudes a las celdas se completen y pasamos la info a respuestasCeldas
            const respuestasCeldas = await Promise.all(solicitudesCeldas);
            const respuestasCeldasCT = await solicitudesCeldasCT;
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
            const solicitudesElementosCT = Promise.all(respuestasCeldasCT.data.map(ress => {
                return axios.get(BACKEND_SERVER + `/api/rodillos/elemento_select/?conjunto__id=${ress.conjunto.id}`, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                });
            }));
            // Espero a que todas las solicitudes de elementos y copio la info en respuestasElementos
            const respuestasElementos = await Promise.all(solicitudesElementos);
            const respuestasElementosCT = await solicitudesElementosCT;
            // Actualizar los estados
            setFilaSeleccionada(montaje.id);
            setShow(!show);
            setCeldas(respuestasCeldas.map(res => res.data));
            setCeldasCT(respuestasCeldasCT.data);
            setElementos(respuestasElementos.map(res => res.map(r => r.data)));
            setElementosCT(respuestasElementosCT.map(res => res.data));
            /* const dimensionesElementosCT = respuestasElementosCT.map(res => {
                const newData = res.data.map(item => ({
                    ...item,  // Conserva todas las propiedades existentes
                    dimensiones: montaje.bancadas.dimensiones  // Agrega el campo externo
                }));
                return newData;
            });
            setElementosCT(dimensionesElementosCT); */
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        console.log('DATOS QUE SALEN DESPUES DE TODOS LOS ARREGLOS ELEMENTOS');
        console.log(elementos);
        console.log(elementosCT);
        console.log(conjuntos_completados);
    }, [conjuntos_completados]);

    const EliminaMontaje = (montaje) => {
        axios.delete(BACKEND_SERVER + `/api/rodillos/montaje/${montaje.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            alert('Montaje '+montaje.nombre+' eliminado correctamente');
            setRefrescar(!refrescar);
        })
        .catch( err => {
            console.log(err);
        });
    };

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
                                <th style={{ width: 10 }}>boton</th>
                                <th>Nombre</th>
                                <th>Máquina</th>
                                <th>Grupo</th>
                                <th>Cabeza de Turco</th>
                            </tr>
                        </thead>
                        <tbody>
                            {montajes && montajes.map( montaje => {
                                return (
                                    <React.Fragment key={montaje.id}>
                                        <tr key={montaje.id}>
                                            <td>
                                                <button type="button" className="btn btn-default" value={montaje.id} name='prueba' onClick={event => { cogerDatos(montaje) }}>--</button>
                                            </td>
                                            <td>{montaje.nombre}</td>
                                            <td>{montaje.maquina.siglas}</td>
                                            <td>{montaje.grupo.nombre}</td>
                                            <td>{montaje.bancadas.dimensiones}</td>
                                            <td>
                                                <Link to={`/rodillos/montaje_editar/${montaje.id}`}>
                                                    <Eye className="mr-3 pencil"/>
                                                </Link>
                                                {nosoyTecnico?<Trash className="trash"  onClick={event =>{EliminaMontaje(montaje)}} />:''}
                                            </td>
                                        </tr>
                                        {filaSeleccionada === montaje.id && show === true && (
                                            <tr>
                                                <td colSpan="4">
                                                        <Table striped bordered hover>
                                                            <thead>
                                                                <tr>
                                                                    <th>Operación</th>
                                                                    <th>Tubo madre</th>
                                                                    <th>Dimensiones</th>
                                                                    <th>Eje</th>
                                                                    <th>Rodillo</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {conjuntos_completados && conjuntos_completados.map((conjunto, index) => (
                                                                    <tr key={index}>
                                                                        <td>{conjunto.nombreOperacion}</td>
                                                                        <td>{conjunto.tuboMadre}</td>
                                                                        <td>{conjunto.dimensioneseBancada}</td>
                                                                        <td>{conjunto.diametroEje}</td>
                                                                        <td>{conjunto.nombreRodillo}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                </td>
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
     );
}
 
export default RodMontajeListado;