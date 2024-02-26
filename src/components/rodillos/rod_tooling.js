import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Form } from 'react-bootstrap';
import logo from '../../assets/logo_bornay.svg';
import { useCookies } from 'react-cookie';
import RodMontajeListadoFiltro from './Rod_montaje_listado_filtro';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

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

    useEffect(() => { //SEPARAR DATOS QUE ENTRAN A TRAVES DEL FILTRO
        const params = new URLSearchParams(filtro);
        const maquinaValue = params.get('maquina__id');
        setMaquina(maquinaValue);
        setMontajes([]);
    }, [filtro]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/montaje_tooling/`+filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setMontajes(res.data);
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
    }, [token, filtro]);

    useEffect(() => { //recogemos las secciones de la máquina elegida
        axios.get(BACKEND_SERVER + `/api/rodillos/seccion/`+filtro,{
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
    }, [token, filtro]);

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
                                operacion: d.conjunto.operacion,
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
            const datosTablaCelCT = celdasCT.flatMap(e => { //en esta operación creamos un array con la información que queremos mostras
                if (e) {
                    return e.map(d => ({
                        cel:d,
                        seccion: d.bancada.seccion.id,
                        operacion: d.conjunto.operacion,
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
           setConjuntosCompletadosCel(unimos);
        } else {
            setConjuntosCompletadosCel(null);
        }
    }, [conjuntosCel, conjuntosCelCT]);

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
                    });
                });
    
                const solicitudesCeldasCT = axios.get(BACKEND_SERVER + `/api/rodillos/celda_select/?bancada__id=${montaje.bancadas.id}`, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
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

    return (
        <Container>
            <img src ={logo} width="200" height="200"></img>
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
                                    <th>{'Nombre'}</th> 
                                    {secciones && secciones.map(seccion => (
                                        <th key={seccion.id}>
                                            {seccion.nombre}
                                            <Row>
                                                {operaciones && operaciones.map((operacion) => (
                                                    operacion.seccion.id === seccion.id && (
                                                        <Col key={operacion.id}>
                                                            <img 
                                                                src={operacion.icono} 
                                                                alt="" // Sin texto alternativo 
                                                                style={{ width: '30px', height: '30px' }} 
                                                            />
                                                        </Col>
                                                    )
                                                ))}
                                            </Row>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {montajes && montajes.map(montaje => (
                                    <tr key={montaje.id}>
                                        <td>{montaje.grupo.nombre} - {montaje.nombre}</td> 
                                        {secciones && secciones.map(seccion => (
                                            <React.Fragment key={seccion.id}>
                                                {bancadas && bancadas.map(bancada => {
                                                    if (bancada.seccion === seccion.id && montaje.id === bancada.montaje_id) {
                                                        return (
                                                            <td key={seccion.id}>
                                                                {conjuntos_completadosCel && conjuntos_completadosCel.map((conjunto) => {
                                                                    if (conjunto.seccion === seccion.id && bancada.id === conjunto.bancada) {
                                                                        return (
                                                                            <td key={conjunto.cel.id}>
                                                                                <img 
                                                                                    src={conjunto.cel.icono} 
                                                                                    alt="" // Sin texto alternativo 
                                                                                    style={{ width: '35px', height: '35px' }} 
                                                                                />
                                                                            </td>
                                                                        );                                                                      
                                                                    }
                                                                    return null;
                                                                })}  
                                                            </td>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>


                        </Table>
                    </Col>
                </Row> 
            )}
        </Container>
    )
}
export default RodTooling;