import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { constants } from 'buffer';

const RodConjunto = ({show, handleClose, operacion_marcada, grupoId, maquina}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [ejes, setEjes] = useState(null);
    const [rodillos, setRodillos] = useState(null);
    const [selectedEje, setSelectedEje] = useState(null);
    const [selectRodilloId, setSelectRodilloId] = useState({});
    const [EjesRodillos, setEjesRodillos] = useState([]);
    const [operacion_id, setOperacionId] = useState('');
    const [tubo_madre, setTuboMadre] = useState('');
    const [grupo, setGrupo] = useState(null);
    const [rod_id, setRod_Id] = useState(''); //para guardar la informacion en EjesRodillos
    //const [elemento_seleccionado, setElementoSeleccionado] = useState(null); //para comprobar si el conjunto esta ya creado

    //operacion_marcada es Operacion con Seccion

    /* useEffect(() => {
        maquina && grupoId && axios.get(BACKEND_SERVER + `/api/rodillos/elemento_select/?conjunto__bancada__seccion__maquina__id=${maquina}&conjunto__bancada__seccion__grupos=${grupoId}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setElementoSeleccionado(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [maquina, grupoId]); */
    
    useEffect(() => { //PARA OBTENER LOS EJES DE LA OPERACION Y FILTRAR LOS RODILLOS
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/eje/?operacion=${operacion_marcada.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEjes(res.data);
            setOperacionId(operacion_marcada.id);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, operacion_marcada]);

    useEffect(() => { //PARA OBTENER DEL GRUPO EL TUBO_MADRE
        grupoId && axios.get(BACKEND_SERVER + `/api/rodillos/grupo/${grupoId}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setGrupo(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, grupoId, operacion_marcada]);

    useEffect(() => { //RODILLOS QUE PODEMOS USAR EN ESTA OPERACIÓN CON ESTE GRUPO
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/rodillo_editar/?operacion=${operacion_marcada.id}&grupoId=${grupoId}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setRodillos(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, operacion_marcada]);

    useEffect(() => { //SI TENEMSO LOS 3 ELEMENTOS ACUMULAMOS LO SELECCIONADO
        if(rod_id && selectedEje && tubo_madre){
            setEjesRodillos([...EjesRodillos, {eje: selectedEje, rodillo: rod_id, operacion: operacion_id, tubo_madre:tubo_madre}]);
        }        
    }, [rod_id, selectedEje, tubo_madre]);

    const GuardarConjunto = () => {
        //primero comprobamos si existe la bancada y si no, se crea, igual con el conjunto y por consiguiente con el elemento.
        var bancada_id='';
        axios.get(BACKEND_SERVER + `/api/rodillos/bancada_grupos/?seccion=${operacion_marcada.seccion.id}&grupos=${grupoId}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            
            //guardamos primero la Bancada, con el id de bancada guardamos el Conjunto y con el id de conjunto guardamos el Elemento
            if(EjesRodillos.length===ejes.length){
                if(res.data.length===0){
                    bancada_id=(res.data[0].id);
                    axios.post(BACKEND_SERVER + `/api/rodillos/bancada/`, {
                        seccion: operacion_marcada.seccion.id,
                        grupos: [grupoId],
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                            }     
                    })
                    .then( res => { 
                        axios.post(BACKEND_SERVER + `/api/rodillos/conjunto/`, {
                            bancada: res.data.id,
                            operacion: operacion_id,
                            icono:null,
                            tubo_madre:tubo_madre,
                        }, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                                }     
                        })
                        .then( r => { 
                            for(var x=0;x<EjesRodillos.length;x++){
                                axios.post(BACKEND_SERVER + `/api/rodillos/elemento/`, {
                                    conjunto: r.data.id,
                                    eje: EjesRodillos[x].eje,
                                    rodillo: EjesRodillos[x].rodillo,
                                }, {
                                    headers: {
                                        'Authorization': `token ${token['tec-token']}`
                                        }     
                                })
                                .then( res => { 
                                })
                                .catch(err => { 
                                    console.error(err);
                                })
                            }
                        })
                        .catch(err => { 
                            console.error(err);
                        })
                    })
                    .catch(err => { 
                        console.error(err);
                    });
                    handlerCancelar();
                }
                else{
                    axios.get(BACKEND_SERVER + `/api/rodillos/elemento_select/?conjunto__bancada__seccion__id=${operacion_marcada.seccion.id}&conjunto__bancada__grupos=${grupoId}&conjunto__operacion=${operacion_marcada.id}`,{
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }
                    })
                    .then( rr => {
                        //setElementoSeleccionado(rr.data);
                        if(rr.data.length===0){
                            axios.post(BACKEND_SERVER + `/api/rodillos/conjunto/`, {
                                bancada: bancada_id,
                                operacion: operacion_id,
                                icono:null,
                                tubo_madre:tubo_madre,
                            }, {
                                headers: {
                                    'Authorization': `token ${token['tec-token']}`
                                    }     
                            })
                            .then( r => { 
                                for(var x=0;x<EjesRodillos.length;x++){
                                    axios.post(BACKEND_SERVER + `/api/rodillos/elemento/`, {
                                        conjunto: r.data.id,
                                        eje: EjesRodillos[x].eje,
                                        rodillo: EjesRodillos[x].rodillo,
                                    }, {
                                        headers: {
                                            'Authorization': `token ${token['tec-token']}`
                                            }     
                                    })
                                    .then( res => { 
                                    })
                                    .catch(err => { 
                                        console.error(err);
                                    })
                                }
                            })
                            .catch(err => { 
                                console.error(err);
                            })
                        }
                        else{
                            for(var x=0;x<rr.data.length;x++){
                                axios.patch(BACKEND_SERVER + `/api/rodillos/elemento/${rr.data[x].id}/`, {
                                    eje: parseInt(EjesRodillos[x].eje),
                                    rodillo: parseInt(EjesRodillos[x].rodillo),
                                }, {
                                    headers: {
                                        'Authorization': `token ${token['tec-token']}`
                                        }     
                                })
                                .then( res => { 
                                })
                                .catch(err => { 
                                    console.error(err);
                                })
                            }
                        }
                    })
                }
            }
            else{
                alert('Por favor selecciona todos los elementos del conjunto');
            }
        })
        .catch( err => {
            console.log(err);
        });
    } 

    const handleInputChange = (event) => {
        const campoNombre = event.target.name;
        const idRodillo = event.target.value;
        setRod_Id(idRodillo);
        const nuevaSeleccionRodilloId = {...selectRodilloId};
        nuevaSeleccionRodilloId[campoNombre] = idRodillo;
        setSelectedEje(campoNombre);
        setSelectRodilloId(nuevaSeleccionRodilloId);
        setTuboMadre(grupo.tubo_madre);
    }

    const handlerCancelar = () => {
        setTuboMadre(null);
        setEjesRodillos([]);
        setSelectRodilloId({});
        setSelectedEje(null);
        handleClose();
    }
    
    return(
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={ false } animation={false} size="lg">
            <Modal.Header>
                <Modal.Title>Nuevo Conjunto de Elementos</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col>
                        {ejes && ejes.map(eje => (
                            <Form.Group controlId={eje.id} key={eje.id}>
                                <Form.Label>{eje.tipo.nombre}</Form.Label>
                                <Form.Control
                                    as="select"
                                    name={eje.id}
                                    value={selectRodilloId[eje.id] || ''}
                                    onChange={handleInputChange}
                                    placeholder={eje.tipo.nombre}
                                >
                                    <option key={0} value={''}>Todas</option>
                                    {rodillos && rodillos.map(rodillo => {
                                        if (rodillo.tipo === eje.tipo.id && rodillo.diametro === eje.diametro) {
                                            return (
                                                <option key={rodillo.id} value={rodillo.id}>
                                                    {rodillo.nombre}
                                                </option>
                                            )
                                        }
                                    })}
                                </Form.Control>
                            </Form.Group>
                        ))}
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="info" onClick={GuardarConjunto}>Guardar</Button>
                <Button variant="waring" onClick={handlerCancelar}>Cancelar</Button>
            </Modal.Footer>
        </Modal>
    );
}
export default RodConjunto;