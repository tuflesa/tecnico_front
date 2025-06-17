import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Modal } from 'react-bootstrap';
import { Receipt, Paperclip, CardImage } from 'react-bootstrap-icons';
import logo from '../../assets/Bornay.svg';
import logoTuf from '../../assets/logo_tuflesa.svg';
import { useCookies } from 'react-cookie';
import RodMontajeListadoFiltro from './Rod_montaje_listado_filtro';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import RodMontajeAnotaciones from './rod_montaje_anotaciones';

const RodTooling = () => {
    const [user] = useCookies(['tec-user']);
    const [token] = useCookies(['tec-token']);
    const [montajes, setMontajes] = useState(null)
    const [filtro, setFiltro] = useState(``);
    const [show, setShow] = useState(false);
    const [celdas, setCeldas] = useState(null);
    const [conjuntosCel, setConjuntosCel] = useState(null);
    const [maquina, setMaquina] = useState(null);
    const [operaciones, setOperaciones] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [icono_celda, setIcono_celda] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);
    const [setModalComentarios, setShowModalComentarios] = useState(false);
    const [montajeSeleccionado, setMontajeSeleccionado] = useState(null);
    const [comentariosMontaje, setComentariosMontaje] = useState('');
    const [show_anotaciones, setShowAnotaciones] = useState(false);
    const [resultado, setResultado] = useState([]);

    
    useEffect(() => { //SEPARAR DATOS QUE ENTRAN A TRAVES DEL FILTRO
        const params = new URLSearchParams(filtro);
        const maquinaValue = params.get('maquina__id');
        setMaquina(maquinaValue);
        setMontajes([]);
    }, [filtro]);

    // Mapa de operaciones por sección (añadir cerca del inicio del componente)
    const operacionesPorSeccion = React.useMemo(() => {
        if (!operaciones) return {};
        
        const map = {};
        operaciones.forEach(op => {
        if (!map[op.seccion.id]) {
            map[op.seccion.id] = [];
        }
        map[op.seccion.id].push(op);
        });
        return map;
    }, [operaciones]);

    useEffect(() => {
        if (!maquina) return;
        const fetchDatos = async () => {
            try {
                const operacionesRes = await axios.get(
                    `${BACKEND_SERVER}/api/rodillos/operacion/?seccion__maquina__id=${maquina}`,
                    { headers: { 'Authorization': `token ${token['tec-token']}` } }
                );
                const operacionesData = operacionesRes.data;
                setOperaciones(operacionesData);

                const montajesRes = await axios.get(
                    `${BACKEND_SERVER}/api/rodillos/montaje_tooling/${filtro}`,
                    { headers: { 'Authorization': `token ${token['tec-token']}` } }
                );
                const nuevosMontajes = montajesRes.data.map(m => ({
                    ...m,
                    grupo: {
                        ...m.grupo,
                        bancadas: (m.grupo?.bancadas ?? []).concat(m.bancadas ?? [])
                    }
                }));
                setMontajes(nuevosMontajes);
                // Traer celdas desde backend
                const todasLasBancadasIds = nuevosMontajes.flatMap(montaje =>
                    montaje.grupo?.bancadas?.map(b => b.id) || []
                );

                if (todasLasBancadasIds.length > 0) {
                    const queryString = todasLasBancadasIds.map(id => `bancada__id=${id}`).join('&');
                    const celdaRes = await axios.get(
                        `${BACKEND_SERVER}/api/rodillos/celda_select/?${queryString}`,
                        { headers: { 'Authorization': `token ${token['tec-token']}` } }
                    );
                    const todasLasCeldas = nuevosMontajes.map(montaje => {
                    const celdasDelMontaje = [];

                    montaje.grupo?.bancadas?.forEach(bancada => {
                        if (Array.isArray(bancada.celdas)) {
                        // Añadimos todas las celdas de esta bancada, y agregamos el montajeId
                        const celdasConMontajeId = bancada.celdas.map(c => ({
                            ...c,
                            montajeId: montaje.id
                        }));
                        celdasDelMontaje.push(...celdasConMontajeId);
                        }
                    });

                    return celdasDelMontaje;
                    });
                    setCeldas(todasLasCeldas);
                    // Aquí ejecutamos DatosFinales sobre los montajes que ya tienen celdas
                    const resultadoFinal = DatosFinales(nuevosMontajes, operacionesData);
                    setResultado(resultadoFinal);
                }

            } catch (err) {
                console.error(err);
            }
        };

        fetchDatos();
    }, [maquina]);

    useEffect(() => { //recogemos las secciones de la máquina elegida
        maquina && axios.get(BACKEND_SERVER + `/api/rodillos/seccion/` + filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setSecciones(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [maquina]);

    useEffect(() => {
        if (celdas) {
            const datosTablaCel = celdas.flatMap(e => { //en esta operación creamos un array con la información que queremos mostras
                if (e) {
                    return e.map(d => ({
                        cel:d,
                        seccion: d.operacion.seccion,
                        operacion: d.operacion,
                        bancada: d.bancada,
                    }));
                }
                return [];
            });
            setConjuntosCel(datosTablaCel);
        } else {
            setConjuntosCel(null);
        }
    }, [celdas]);

    useEffect(() => { //recogemos todos los iconos posibles para la operación
        axios.get(BACKEND_SERVER + `/api/rodillos/icono_celda/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setIcono_celda(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    const DatosFinales = (montajes, operaciones) => {
        const operacionIds = operaciones.map(op => op.id);
        montajes.forEach((montaje) => {
            const fila = [];
            const celdaMap = new Map();
            if (montaje.grupo && Array.isArray(montaje.grupo.bancadas)) {
                montaje.grupo.bancadas.forEach((bancada) => {
                    if (Array.isArray(bancada.celdas)) {
                        bancada.celdas.forEach((celda) => {
                            const operacionId = celda?.operacion?.id;
                            if (operacionId) {
                                celdaMap.set(operacionId, {
                                    color_celda: celda.color_celda || null,
                                    operacion_id: operacionId,
                                    icono_id: celda.icono?.id || null,
                                    conjunto: celda.conjunto,
                                    cel_id: celda.id || null,
                                });
                            }
                        });
                    }
                });
            }
            operacionIds.forEach((id) => {
                fila.push(celdaMap.get(id) || null);
            });
            resultado.push({
                id: montaje.id,
                anotaciones: montaje.anotaciones || null,
                anotaciones_montaje: montaje.anotaciones_montaje || null,
                nombre_montaje: montaje.nombre || null,
                espesores: montaje.grupo.espesor_1 + '÷' + montaje.grupo.espesor_2 || null,
                tubo_madre: montaje.grupo.tubo_madre || null,
                dimensiones: montaje.bancadas.dimensiones || null,
                titular_grupo: montaje.titular_grupo,
                fila
            });
        });
        return resultado;
    };
    
    const actualizaFiltro = str => {
        setFiltro(str);
    }

    const handleOpenModal = (celda) => {
        setCeldaSeleccionada(celda);
        setShowModal(true);
    };
    
    const handleCloseModal = () => {
        setShowModal(false);
        setCeldaSeleccionada(null);
    };

    const handleOpenModalComentarios = (montaje) => {
        setMontajeSeleccionado(montaje);
        setComentariosMontaje(montaje.anotciones_montaje || 'No hay comentarios.');
        setShowModalComentarios(true);
    };
    
    const handleCloseModalComentarios = () => {
        setShowModalComentarios(false);
        setMontajeSeleccionado(null);
    };

    const AbrirAnotacion = (montaje) => {
        setMontajeSeleccionado(montaje);
        setShowAnotaciones(true);
    }

    const CerrarAnotacion = () => {
        setShowAnotaciones(false);
    }

    const obtenerIcono = (id) => {
        const icono = icono_celda.find(i => i.id === id);
        return icono ? icono.icono : '';
    };


    return (
        <Container fluid>
            <img src ={user['tec-user'].perfil.empresa.id===1?logo:logoTuf} width="200" height="200"></img>
            <Row>
                <Col>
                    <RodMontajeListadoFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
            {maquina && conjuntosCel!==null && conjuntosCel.length!==0 &&(
                <Row>
                    <Col>
                        <h5 className="mb-3 mt-3">Bancadas</h5>
                        <Table striped bordered hover>
                        <thead>
                            {(() => {
                                // Preprocesamos los datos fuera del JSX
                                const seccionHeaders = [];
                                const operacionHeaders = [];
                                if (secciones && operaciones) {
                                const operacionesPorSeccion = {};
                                operaciones.forEach(op => {
                                    if (!operacionesPorSeccion[op.seccion.id]) {
                                    operacionesPorSeccion[op.seccion.id] = [];
                                    }
                                    operacionesPorSeccion[op.seccion.id].push(op);
                                });
                                secciones.forEach(seccion => {
                                    const operacionesDeSeccion = operacionesPorSeccion[seccion.id] || [];
                                    seccionHeaders.push(
                                    <th key={seccion.id} colSpan={operacionesDeSeccion.length}>
                                        {seccion.nombre}
                                    </th>
                                    );
                                    operacionesDeSeccion.forEach(operacion => {
                                    operacionHeaders.push(
                                        <th key={operacion.id}>
                                        <img 
                                            src={operacion.icono.icono} 
                                            alt="" 
                                            style={{ width: '30px', height: '30px' }} 
                                        />
                                        <p>{operacion.nombre}</p>
                                        </th>
                                    );
                                    });
                                });
                                }
                                
                                return (
                                <>
                                    <tr>
                                    <th>Nombre</th>
                                    <th>Espesor</th>
                                    <th>Tubo madre</th>
                                    <th>CT</th>
                                    {seccionHeaders}
                                    <th>Acciones</th>
                                    </tr>
                                    <tr>
                                    <th></th>
                                    <th></th>
                                    <th>{'Ø'}</th>
                                    <th>{'mm'}</th>
                                    {operacionHeaders}
                                    <th></th>
                                    </tr>
                                </>
                                );
                            })()}
                            </thead>
                            <tbody>
                                {resultado.map(montaje => (
                                    <tr key={montaje.id}>
                                        <td>{montaje.nombre_montaje}</td>
                                        <td>{montaje.espesores}</td>
                                        <td>{'Ø' + montaje.tubo_madre}</td>
                                        <td>{montaje.dimensiones || '-'}</td>
                                        {montaje.fila.map((celda, i) => (
                                            <td key={i} style={{ backgroundColor: celda?.color_celda && celda.color_celda !== '#4CAF50' && celda.color_celda !== '#2196F3'? celda.color_celda : 'transparent' }}>
                                                {celda ? (
                                                    <button onClick={() => handleOpenModal(celda)} style={{border: "none", background: "none", padding: 0, cursor: "pointer"}} >
                                                        <img src={celda.color_celda==='#FFA500' || celda.color_celda === '#2196F3'? obtenerIcono(1): celda.conjunto?.tubo_madre > montaje.tubo_madre? obtenerIcono(1): montaje.titular_grupo ? obtenerIcono(celda.icono_id) :celda.conjunto?.tubo_madre===null?obtenerIcono(celda.icono_id): obtenerIcono(1)} alt="" width={30} height={30} />
                                                    </button>
                                                ) : (
                                                    <div style={{ width: '30px', height: '30px' }} />
                                                )}
                                            </td>
                                        ))}
                                    <td>
                                        <Receipt 
                                        className="mr-3 pencil" 
                                        onClick={() => handleOpenModalComentarios(montaje)} 
                                        style={{
                                            cursor: montaje.anotciones_montaje ? 'pointer' : 'not-allowed', 
                                            opacity: montaje.anotciones_montaje ? 1 : 0.5
                                        }}     
                                        />
                                        <Paperclip 
                                        className="mr-3 pencil" 
                                        onClick={() => AbrirAnotacion(montaje)} 
                                        style={{
                                            cursor: montaje.anotaciones.length !== 0 ? 'pointer' : 'not-allowed', 
                                            opacity: montaje.anotaciones.length !== 0 ? 1 : 0.5
                                        }}     
                                        />
                                    </td>
                                    </tr>
                                ))}
                            </tbody>
                            
                        </Table>
                    </Col>
                </Row> 
            )}
             {/* Modal para mostrar los rodillos en cada celda*/}
             <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Rodillos</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ textAlign: "center" }}>
                    {celdaSeleccionada && (
                    <div style={{ textAlign: "left" }}>
                        {celdaSeleccionada?.conjunto?.elementos?.map((elemento, index) => (
                        <div key={index} style={{ marginBottom: "5px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                            <span>{elemento.eje.tipo.nombre}</span>
                            <span>{elemento.rodillo.nombre}</span>
                            </div>
                            {index < celdaSeleccionada.conjunto.elementos.length - 1 && <hr style={{ margin: "5px 0", borderTop: "1px solid #ccc" }} />}
                        </div>
                        ))}
                    </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                    Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Modal Comenarios de montaje */}
            <Modal show={setModalComentarios} onHide={handleCloseModalComentarios} size='xl'>
                <Modal.Header closeButton>
                    <Modal.Title>Comentarios de {montajeSeleccionado?.nombre}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{comentariosMontaje}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModalComentarios}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
            <RodMontajeAnotaciones show={show_anotaciones}
                    montaje={montajeSeleccionado?montajeSeleccionado:[]}
                    handleClose={CerrarAnotacion}
                    tooling={true}/>
        </Container>
    )
}
export default RodTooling;