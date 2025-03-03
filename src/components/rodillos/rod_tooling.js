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
    const [, setFilaSeleccionada] = useState(null);
    const [show, setShow] = useState(false);
    const [celdas, setCeldas] = useState(null);
    const [elementos, setElementos] = useState(null);
    const [celdasCT, setCeldasCT] = useState(null);
    const [elementosCT, setElementosCT] = useState(null);
    const [conjuntosCel, setConjuntosCel] = useState(null);
    const [conjuntosCelCT, setConjuntosCelCT] = useState(null);
    const [conjuntos_completadosCel, setConjuntosCompletadosCel] = useState(null);
    const [maquina, setMaquina] = useState(null);
    const [operaciones, setOperaciones] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [bancadas, setBancadas] = useState(null);
    const [icono_celda, setIcono_celda] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [celdaSeleccionada, setCeldaSeleccionada] = useState(null);
    const [setModalComentarios, setShowModalComentarios] = useState(false);
    const [montajeSeleccionado, setMontajeSeleccionado] = useState(null);
    const [comentariosMontaje, setComentariosMontaje] = useState('');
    const [show_anotaciones, setShowAnotaciones] = useState(false);
    
    useEffect(() => { //SEPARAR DATOS QUE ENTRAN A TRAVES DEL FILTRO
        const params = new URLSearchParams(filtro);
        const maquinaValue = params.get('maquina__id');
        setMaquina(maquinaValue);
        setMontajes([]);
    }, [filtro]);

    useEffect(() => {
        maquina && axios.get(BACKEND_SERVER + `/api/rodillos/montaje_tooling/`+filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            const nuevosMontajes = res.data.map(m => ({
                ...m,
                grupo: {
                    ...m.grupo,
                    bancadas: (m.grupo?.bancadas ?? []).concat(m.bancadas ?? [])
                }
            }));
            setMontajes(nuevosMontajes);
            let newBancadas = []; // Crear un nuevo array para almacenar los nuevos elementos
            for (var x = 0; x < res.data.length; x++) {
                var Idmontaje = {
                    ...res.data[x].bancadas,
                    montaje_id: res.data[x].id,
                }
                newBancadas = newBancadas.concat(Idmontaje);
                for (var y = 0; y < res.data[x].grupo.bancadas.length; y++) {
                    // Crear un nuevo objeto con el campo adicional
                    var IDmontaje = {
                        ...res.data[x].grupo.bancadas[y],
                        montaje_id: res.data[x].id,
                        seccion: res.data[x].grupo.bancadas[y].seccion.id
                    };
                    newBancadas = newBancadas.concat(IDmontaje);
                }
            }
            setBancadas(newBancadas); // Para tener todas las bancadas juntos BD y CT
            cogerDatos(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [filtro, maquina]);    

    useEffect(() => { //recogemos las secciones de la máquina elegida
        axios.get(BACKEND_SERVER + `/api/rodillos/seccion/` + filtro,{
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
    }, [filtro]);

    useEffect(() => { //recogemos las operaciones de la máquina elegida
        if(maquina){
            axios.get(BACKEND_SERVER + `/api/rodillos/operacion/?seccion__maquina__id=${maquina}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( r => {
                setOperaciones(r.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [maquina]);

    useEffect(() => {
        if (celdas) {
            const datosTablaCel = celdas.flatMap(e => { //en esta operación creamos un array con la información que queremos mostras
                if (e) {
                    return e.flatMap(c => {
                        if(c){
                            return c.map(d => ({
                                cel:d,
                                seccion: d.bancada.seccion.id,
                                operacion: d.operacion,
                                bancada: d.bancada.id,
                            }));
                        }       
                    });
                }
                return [];
            });
            setConjuntosCel(datosTablaCel);
        } else {
            setConjuntosCel(null);
        }
    }, [celdas]);

    useEffect(() => {
        if (celdasCT) {
            const datosTablaCelCT = celdasCT.flatMap(e => { //idem celdas
                if (e) {
                    return e.map(d => ({
                        repetido: 0,
                        cel:d,
                        seccion: d.bancada.seccion.id,
                        operacion: d.operacion,
                        bancada: d.bancada.id,
                    }));
                }
                return [];
            });
            setConjuntosCelCT(datosTablaCelCT);
        } else {
            setConjuntosCelCT(null);
        }
    }, [celdasCT]);

    useEffect(() => { //Para tener todas las celdas juntos BD y CT
        if (conjuntosCel && conjuntosCelCT) {
            const unimos = conjuntosCel.concat(conjuntosCelCT);
            unimos.forEach((element, index) => {
                element.numCelda = index + 1;
            });          
           setConjuntosCompletadosCel(unimos);
        } else {
            setConjuntosCompletadosCel(null);
        }
    }, [conjuntosCel, conjuntosCelCT]);

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

    const cogerDatos = async (montajes) => {
        try {
            // Arrays para almacenar la información de todos los montajes
            let todasLasCeldas = [];
            let todasLasCeldasCT = [];
            let todosLosElementos = [];
            let todosLosElementosCT = [];
    
            // Procesar cada montaje individualmente
            await Promise.all(montajes.map(async (montaje) => {
                // Hacer las solicitudes a las celdas de todas las bancadas y guardarlas en solicitudesCeldas
                const solicitudesCeldas = montaje.grupo.bancadas.map(bancadaId => {
                    return axios.get(BACKEND_SERVER + `/api/rodillos/celda_select/?bancada__id=${bancadaId.id}`, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }
                    }).then(response => {
                        response.data.forEach(item => item.montajeId = montaje.id);
                        return response;
                    });
                });
    
                const solicitudesCeldasCT = axios.get(BACKEND_SERVER + `/api/rodillos/celda_select/?bancada__id=${montaje.bancadas.id}`, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                }).then(response => {
                    response.data.forEach(item => item.montajeId = montaje.id);
                    return response;
                });
    
                // Esperar a que todas las solicitudes a las celdas se completen y pasar la info a respuestasCeldas
                const respuestasCeldas = await Promise.all(solicitudesCeldas);
                const respuestasCeldasCT = await solicitudesCeldasCT;
    
                // Buscar para cada Celda el elemento con el id del conjunto
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
    
                // Esperar a que todas las solicitudes de elementos se completen y copiar la info en respuestasElementos
                const respuestasElementos = await Promise.all(solicitudesElementos);
                const respuestasElementosCT = await solicitudesElementosCT;
    
                // Almacenar la información del montaje actual en los arrays respectivos
                todasLasCeldas.push(respuestasCeldas.map(res => res.data));
                todasLasCeldasCT.push(respuestasCeldasCT.data);
                todosLosElementos.push(respuestasElementos.map(res => res.map(r => r.data)));
                todosLosElementosCT.push(respuestasElementosCT.map(res => res.data));
            }));
    
            // Actualizar los estados con la información de todos los montajes
            setFilaSeleccionada(montajes.map(montaje => montaje.id));
            setShow(!show);
            setCeldas(todasLasCeldas);
            setCeldasCT(todasLasCeldasCT);
            setElementos(todosLosElementos); //POR SI QUIERO LUEGO HACER UN CLICK Y VER INFORMACIÓN
            setElementosCT(todosLosElementosCT);
        } catch (err) {
            console.log(err);
        }
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
                                <tr>
                                    {/* Encabezado fijo para las columnas comunes */}
                                    <th>Nombre</th>
                                    <th>Espesor</th>
                                    <th>Tubo madre</th>
                                    <th>CT</th>
                                    {/* Encabezado dinámico para las secciones */}
                                    {secciones && secciones.map(seccion => (
                                        <th key={seccion.id} colSpan={operaciones.filter(op => op.seccion.id === seccion.id).length}>
                                            {seccion.nombre}
                                        </th>
                                    ))}
                                    <th>Acciones</th>
                                </tr>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th>{'Ø'}</th>
                                    <th>{'mm'}</th>
                                    {/* Encabezado para las operaciones bajo cada sección */}
                                    {secciones && secciones.map(seccion => (
                                        operaciones
                                            .filter(op => op.seccion.id === seccion.id)
                                            .map(operacion => (
                                                <th key={operacion.id}>
                                                    <img 
                                                        src={operacion.icono.icono} 
                                                        alt="" 
                                                        style={{ width: '30px', height: '30px' }} 
                                                    />
                                                    <p>{operacion.nombre}</p>
                                                </th>
                                            ))
                                    ))}
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {montajes.map(montaje => {
                                    return (
                                    <tr key={montaje.id}>
                                        {/* Columnas principales */}
                                        <td>{montaje.nombre}</td>
                                        <td>{montaje.grupo.espesor_1 + '÷' + montaje.grupo.espesor_2}</td>
                                        <td>{'Ø' + montaje.grupo.tubo_madre}</td>
                                        <td>{montaje.bancadas?.dimensiones || '-'}</td>
                                        {secciones.map(seccion => {
                                        // Buscamos la bancada que corresponde a esta sección
                                        const bancada = montaje.grupo.bancadas.find(b => b.seccion.id === seccion.id);
                                        return operaciones
                                            .filter(op => op.seccion.id === seccion.id)
                                            .map(operacion => {
                                            // Buscamos la celda dentro de esta bancada
                                            const celda = bancada?.celdas.find(c => c.operacion.id === operacion.id);
                                            return (
                                                <td key={`${montaje.id}-${seccion.id}-${operacion.id}`} 
                                                    style={{ textAlign: 'center', 
                                                        backgroundColor: 
                                                        celda?.conjunto?.elementos && celda?.operacion?.id && celda.conjunto.elementos.some(e => e.rodillo.operacion !== celda.operacion.id) ? 'orange' 
                                                        : celda?.conjunto?.operacion && celda?.operacion?.id && celda.conjunto.operacion !== celda.operacion.id ? 'orange'
                                                        : celda?.conjunto?.operacion && celda?.operacion?.id && seccion.pertenece_grupo===true && celda.conjunto.tubo_madre < montaje.grupo.tubo_madre? '#0cf317' 
                                                        : 'transparent', }}>
                                                
                                                
                                                {celda ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px',}}>
                                                        {(
                                                        (montaje.titular_grupo === false && celda.conjunto?.tubo_madre !== null) ||
                                                        (montaje.titular_grupo === true && celda.conjunto?.tubo_madre !== null && celda.conjunto?.tubo_madre !== montaje.grupo.tubo_madre)
                                                        ) ? (
                                                        <button
                                                            onClick={() =>
                                                                handleOpenModal(celda)
                                                            }
                                                            style={{border: "none",background: "none",padding: 0,cursor: "pointer",}}
                                                            >
                                                            <img src={celda.conjunto?.tubo_madre < montaje.grupo.tubo_madre? icono_celda[2].icono: celda.conjunto?.operacion !== celda.operacion.id? icono_celda[1].icono: icono_celda[0].icono} alt="" style={{ width: "30px", height: "30px" }}/>
                                                        </button>
                                                        ) : (
                                                            <button
                                                            onClick={() =>
                                                                handleOpenModal(celda)
                                                            }
                                                            style={{border: "none",background: "none",padding: 0,cursor: "pointer",}}
                                                            >
                                                            <img src={celda.icono ? celda.icono.icono : ''} alt="" style={{ width: '30px', height: '30px' }} />
                                                        </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div style={{ width: '30px', height: '30px' }}></div>
                                                )}
                                                </td>
                                            );
                                            });
                                        })}
                                        <td>
                                            <Receipt className="mr-3 pencil" onClick={() => handleOpenModalComentarios(montaje)} 
                                                style={{cursor: montaje.anotciones_montaje ? 'pointer' : 'not-allowed', opacity: montaje.anotciones_montaje ? 1 : 0.5}}     
                                            />
                                            {/* <Paperclip className="mr-3 pencil" onClick={() => window.open(montaje.archivo)} 
                                                style={{cursor: montaje.archivo ? 'pointer' : 'not-allowed', opacity: montaje.archivo ? 1 : 0.5}} 
                                            /> */}
                                            <Paperclip className="mr-3 pencil" onClick={() => AbrirAnotacion(montaje)} 
                                                style={{cursor: montaje.anotaciones.length!==0 ? 'pointer' : 'not-allowed', opacity: montaje.anotaciones.length!==0 ? 1 : 0.5}}     
                                            />
                                        </td>
                                    </tr>
                                    );
                                })}
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