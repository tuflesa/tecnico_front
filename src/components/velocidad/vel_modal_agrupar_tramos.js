import React, { useState, useEffect } from 'react';
import { Modal, Button, Container, Form, Row, Col, Table } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import moment from 'moment';
import ordenarLista from '../utilidades/ordenar_paradas';
import { useParams } from 'react-router-dom';

const ModalAgruparTramos = ({ mostrarModalTramos, cerrarModalTramos, paradas, onSaved, onLimpiar }) => {
    const { id } = useParams();

    const [token] = useCookies(['tec-token']);
    const [tipoParadas, setTipoParadas] = useState(null);
    const [codigoParada, setCodigoParada] = useState(null);
    const [palabrasClave, setPalabrasClave] = useState(null);

    const [descripcionProdDB, setdescripcionProdDB] = useState(null);
    const [idPos, setIdPos] = useState(null);
    const [IdOF, setIdOF] = useState(null);
    const [codigoProdDB, setCodigoProdDB] = useState(null);
    const [codigo_R_ProdDB, setCodigo_R_ProdDB] = useState(null);
    const [listado_ordenes, setListadoOrdenes] = useState(null);
    const [seleTipoParada, setseleTipoParada] = useState(null);
    const [seleTipoNombre, setseleTipoNombre] = useState(null);
    const [codigo_seleccionado, setCodigoSeleccionado] = useState(null);
    const [seleSiglasParada, setSiglasParada] = useState(null);
    const [palabra_seleccionado, setPalabraSeleccionado] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [paradasSeleccionadas, setParadasSeleccionadas] = useState(paradas || []);

    useEffect(() => {
        if (paradas) {
            setParadasSeleccionadas(paradas);
        }
    }, [paradas]);

    useEffect(()=>{
        seleTipoParada && palabra_seleccionado && axios.get(BACKEND_SERVER + `/api/velocidad/obtener_codigos/?tipo_parada=${seleTipoParada}&zona=${id}&palabra_clave=${palabra_seleccionado}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setCodigoParada(res.data);
        })
        .catch( err => {
            console.log(err);
        });  
    },[palabra_seleccionado]);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/velocidad/tipoparada/?para_informar=${true}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setTipoParadas(res.data);
        })
        .catch( err => {
            console.log(err);
        });  
    },[token]);

    useEffect(()=>{ //recogemos las palabras clave
        const tipo = tipoParadas?.find(t => t.id === Number(seleTipoParada));
        
        (tipo?.nombre==='Incidencia' || tipo?.nombre==='Avería') && axios.get(BACKEND_SERVER + `/api/velocidad/obtener_palabraclave/?zona=${id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setPalabrasClave(res.data);
        })
        .catch( err => {
            console.log(err);
        });
        tipo?.nombre!=='Incidencia' && tipo?.nombre!=='Avería' && seleTipoParada && axios.get(BACKEND_SERVER + `/api/velocidad/obtener_codigos_resto/?tipo_parada=${seleTipoParada}&zona=${id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setCodigoParada(res.data);
        })
        .catch( err => {
            console.log(err);
        });

    },[seleTipoParada]);

    useEffect(()=>{
        seleTipoParada && axios.get(BACKEND_SERVER + `/api/velocidad/buscar_montajes_of/?zona_id=${id}&tipo_parada_siglas=${seleSiglasParada}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setListadoOrdenes(res.data.montajes);
            setIdOF(res.data.xIdOF);
            setIdPos(res.data.xIdPos);
        })
        .catch( err => {
            console.log(err);
        });  
    },[seleTipoParada]);

    useEffect(()=>{
        if(seleSiglasParada!=="R"){
            codigoProdDB && axios.get(BACKEND_SERVER + `/api/velocidad/buscar_descripcion_paradaProdDB/?Id_codigoProdDB=${codigoProdDB}&tipo_parada_siglas=${seleSiglasParada}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setdescripcionProdDB(res.data);
            })
            .catch( err => {
                console.log(err);
            }); 
        } 
    },[codigoProdDB]);
 
    const handleInputChangeTipo = (e) => {
        const { value } = e.target;
        if (value) {
            const [id, siglas, nombre] = value.split('|');
            setseleTipoParada(id);
            setSiglasParada(siglas);
            setseleTipoNombre(nombre);
        };
                
        setPalabraSeleccionado(null);
        setPalabrasClave(null);
        setCodigoSeleccionado(null);
        setCodigoParada(null);
        setIdOF(null);
        setIdPos(null);

        const fecha_inicio = moment(paradasSeleccionadas[0].fechaInicio, 'DD/MM/YYYY').format('YYYY-MM-DD');
        const hora_inicio = paradasSeleccionadas[0].horaInicio;
        const fin = paradasSeleccionadas.length - 1;
        const fecha_fin = moment(paradasSeleccionadas[fin].fechaInicio, 'DD/MM/YYYY').format('YYYY-MM-DD');
        const hora_fin = paradasSeleccionadas[fin].horaFin;

        const params = {
            fecha_inicio,
            hora_inicio,
            fecha_fin,
            hora_fin,
            zona: id
        };

        const headers = {
            'Authorization': `token ${token['tec-token']}`
        };

        axios.get(`${BACKEND_SERVER}/api/velocidad/leer_paradas_run/`, { params, headers })
            .then(res => {
                const paradas = res.data;

                if (seleTipoNombre === 'Cambio') {
                    const nuevas_paradas = paradas.map(p => {
                        const inicio_dt = new Date(p.inicio);
                        const fin_dt = new Date(p.fin);
                        return {
                            id: p.id.toString(),
                            checked: true,
                            fechaInicio: inicio_dt.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }),
                            fechaFin: fin_dt.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }),
                            horaInicio: p.inicio.split("T")[1].replace("Z", ""),
                            horaFin: p.fin.split("T")[1].replace("Z", ""),
                            duracion: p.duracion
                        };
                    });

                    const nuevas_paradas_seleccionadas = [...paradasSeleccionadas, ...nuevas_paradas];
                    setParadasSeleccionadas(ordenarLista(nuevas_paradas_seleccionadas));

                } else {
                    const ids = paradas.map(p => p.id.toString());
                    const nuevas_paradas_seleccionadas = paradasSeleccionadas.filter(p => !ids.includes(p.id));
                    setParadasSeleccionadas(ordenarLista(nuevas_paradas_seleccionadas));
                }
            });
    };

    const handleInputChangeCodigo = (e) => {
        const { value } = e.target;
        if (value) {
            const [id, codigoBD ] = value.split('|');
            setCodigoSeleccionado(id);
            setCodigoProdDB(codigoBD);
        };
    };

    const handleInputChangeOrdenes = (e) => {
        const { value } = e.target;
        if (value) {
            const [codigoBD, descripcionBD ] = value.split('|');
            setCodigo_R_ProdDB(codigoBD);
            setdescripcionProdDB(descripcionBD);
        };
    };

    const guardartipoparada = () => {
        if (!seleTipoParada) {
            alert('Debe seleccionar un tipo de parada');
            return;
        }
        
        if (!codigo_seleccionado) {
            alert('Debe seleccionar un código de parada');
            return;
        }

        if (paradasSeleccionadas.length === 0) {
            alert('No hay paradas seleccionadas');
            return;
        }
        try {
            // Revisar si podemos mandar directamente paradasSeleccionadas
            const datos = {
                xIdOF: IdOF,
                xIdTipo: seleSiglasParada,
                xIdPos: idPos,
                xIdParada: codigoProdDB,
                xIdParada_R: codigo_R_ProdDB, // código de cambio rodillo
                xDescripcion: descripcionProdDB,
                //xFecha ???falta la fecha y el tiempo (duración) que lo tenemos en paradas
                //xTiempo ???
                xObservaciones: observaciones,
                //xTurno
                //xIgnorar = false siempre

                zona_id: id,
                tipo_parada_id: seleTipoParada,
                codigo_parada_id: codigo_seleccionado,
                paradas: paradasSeleccionadas.map(p => ({
                    id: p.id,
                    fecha_inicio: p.fechaInicio,
                    hora_inicio: p.horaInicio,
                    fecha_fin: p.fechaFin,
                    hora_fin: p.horaFin,
                    duracion: p.duracion
                }))
            };
            console.log('QUE VALE DATOS: ', datos);

            axios.post(
                `${BACKEND_SERVER}/api/velocidad/guardar_paradas_agrupadas/`,
                datos,
                {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            .then(res => {
                if (res.status === 200) {
                    // Limpiar variables
                    setParadasSeleccionadas([]);
                    setseleTipoParada(null);
                    setCodigoSeleccionado(null);
                    setPalabraSeleccionado(null);
                    setCodigoProdDB(null);
                    setCodigo_R_ProdDB(null);
                    onSaved && onSaved();
                    onLimpiar && onLimpiar();
                    setObservaciones('');
                    cerrarModalTramos();
                }
            });
            
        } catch (error) {
            console.error('Error al guardar paradas:', error);
            alert('Error al guardar las paradas: ' + (error.response?.data?.error || error.message));
        }
    }

    const cerrar_modal =()=>{
        // Limpiar variables
            setParadasSeleccionadas([]);
            setseleTipoParada(null);
            setCodigoSeleccionado(null);
            setPalabraSeleccionado(null);
            cerrarModalTramos();
            setListadoOrdenes(null);
            setIdOF(null);
            setIdPos(null);
            setCodigo_R_ProdDB(null);
            setObservaciones('');
            onLimpiar && onLimpiar();
    }

    return (
        <Container>
            <Modal show={mostrarModalTramos} onHide={cerrar_modal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Tramos Agrupados</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        <Col>
                            <Form.Group controlId="tipoparada">
                                <Form.Label>Tipo Parada</Form.Label>
                                <Form.Control as="select"  
                                            name='tipoparada' 
                                            value={ `${seleTipoParada}|${seleSiglasParada}|${seleTipoNombre}`}
                                            onChange={handleInputChangeTipo}
                                            placeholder="Tipo parada">
                                            <option key={0} value={''}>Selecciona una opción</option>
                                            {tipoParadas && tipoParadas.map( tipo => {
                                                return (
                                                <option
                                                    key={tipo.id}
                                                    value={`${tipo.id}|${tipo.siglas}|${tipo.nombre}`}
                                                    data-nombre={tipo.nombre}
                                                >
                                                    {tipo.nombre}
                                                </option>
                                                )
                                            })}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        {seleTipoParada && seleTipoParada!=='4'? //cuando no sea cambio o nulo
                            <Col>
                                <Form.Group controlId="palabraclave">
                                    <Form.Label>Palabra clave</Form.Label>
                                    <Form.Control as="select"  
                                                name='palabraclave' 
                                                value={palabra_seleccionado}
                                                onChange={(e) => setPalabraSeleccionado(e.target.value)}
                                                placeholder="Palabra clave"
                                                disabled={seleTipoParada?false:true}>
                                                <option key={0} value={''}>Selecciona una opción</option>
                                                {palabrasClave && palabrasClave.map( codigo => {
                                                    return (
                                                    <option key={codigo.id} value={codigo.id}>
                                                        {codigo.nombre}
                                                    </option>
                                                    )
                                                })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        :
                            <Col>
                                <Form.Group controlId="ordenes">
                                    <Form.Label>Listado de Ordenes</Form.Label>
                                    <Form.Control as="select"  
                                                name='ordenes' 
                                                value={ `${codigo_R_ProdDB}|${descripcionProdDB}`}
                                                onChange={handleInputChangeOrdenes}
                                                placeholder="Ordenes"
                                                disabled={seleTipoParada?false:true}>
                                                <option key="__default__" value={''}>Selecciona una opción</option>
                                                {Array.isArray(listado_ordenes) && listado_ordenes.map( orden => {
                                                    return (
                                                    <option key={orden.xIdParada} value={`${orden.xIdParada}|${orden.xDescripcion}`}>
                                                        {orden.xDescripcion}
                                                    </option>
                                                    )
                                                })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        }
                        <Col>
                            <Form.Group controlId="codigoparada">
                                <Form.Label>Codigo Parada</Form.Label>
                                <Form.Control as="select"  
                                            name='codigoparada' 
                                            value={ `${codigo_seleccionado}|${codigoProdDB}`}
                                            onChange={handleInputChangeCodigo}
                                            placeholder="Codigo parada"
                                            disabled={seleTipoParada?false:true}>
                                            <option key={0} value={''}>Selecciona una opción</option>
                                            {codigoParada && codigoParada.map( codigo => {
                                                return (
                                                <option key={codigo.id} value={`${codigo.id}|${codigo.codigoProdDB}`}>
                                                    {codigo.nombre}
                                                </option>
                                                )
                                            })}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group id="observaciones">
                                <Form.Label>Observaciones</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={2}
                                    name='observaciones' 
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    placeholder="Escriba aquí las observaciones, si las hay"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
            
                    <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>Fecha Inicio - Hora Inicio</th>
                        <th>Fecha Fin - Hora Fin</th>
                        <th>Duración</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paradasSeleccionadas.length > 0 ? (
                        paradasSeleccionadas.map((tramo, index) => (
                            <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{tramo.fechaInicio + ' - ' + tramo.horaInicio} </td>
                            <td>{tramo.fechaFin + ' - ' + tramo.horaFin}</td>
                            <td>{Number(tramo.duracion).toFixed(2)}</td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan="5" className="text-center">
                            No hay tramos disponibles
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </Table>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={cerrar_modal}>
                    Cancelar
                    </Button>
                    <Button variant="primary" onClick={() => guardartipoparada()}>
                    Guardar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ModalAgruparTramos;