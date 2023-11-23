import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal, Tab, Tabs } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { constants } from 'buffer';

const RodConjunto = ({show, handleClose, operacion_marcada, grupoId, maquina, tubomadre}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [ejes, setEjes] = useState(null);
    const [rodillos, setRodillos] = useState(null);
    const [rodillo_exist, setRodillo_exist] = useState([]);
    const [selectedEje, setSelectedEje] = useState(null);
    const [selectRodilloId, setSelectRodilloId] = useState({});
    const [EjesRodillos, setEjesRodillos] = useState([]);
    const [operacion_id, setOperacionId] = useState('');
    const [tubo_madre, setTuboMadre] = useState('');
    const [grupo, setGrupo] = useState(null);
    const [rod_id, setRod_Id] = useState(''); //para guardar la informacion en EjesRodillos
    
    useEffect(() => { //PARA OBTENER LOS EJES DE LA OPERACION Y FILTRAR LOS RODILLOS;
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
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/rodillo_editar/?operacion=${operacion_marcada.id}&grupo=${grupoId}`,{
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
    }, [token, operacion_marcada, grupoId]);

    useEffect(() => { //PARA OBTENER LOS RODILLOS EXISTENTES DE LA MISMA SECCIÓN;
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/rodillos_existentes/?operacion__seccion__tipo=${operacion_marcada.seccion.tipo}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setRodillo_exist(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [operacion_marcada, grupoId]);

    useEffect(() => { //SI TENEMOS LOS 3 ELEMENTOS ACUMULAMOS LO SELECCIONADO
        if(rod_id && selectedEje && tubo_madre){
            setEjesRodillos([...EjesRodillos, {eje: selectedEje, rodillo: rod_id, operacion: operacion_id, tubo_madre:tubo_madre}]);
        }        
    }, [rod_id, selectedEje, tubo_madre]);

    const GuardarConjunto = () => {
        //primero comprobamos si existe la bancada y si no, se crea, igual con LA CELDA, conjunto y por consiguiente con el elemento.
        var bancada_id='';
        axios.get(BACKEND_SERVER + `/api/rodillos/bancada_grupos/?seccion=${operacion_marcada.seccion.id}&tubo_madre=${tubo_madre}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            if(res.data.length!==0){
                bancada_id=res.data[0].id;
            }
            //guardamos primero la Bancada, guardamos el Conjunto y con el id de conjunto guardamos el Elemento, AL FINAL GUARDAMOS CELDA CON ID BANCADA E ID CONJUNTO
            if(EjesRodillos.length===ejes.length){
                if(res.data.length===0){
                    axios.post(BACKEND_SERVER + `/api/rodillos/bancada/`, { //creamos bancada
                        seccion: operacion_marcada.seccion.id,
                        tubo_madre: tubomadre,
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                            }     
                    })
                    .then( res => { 
                        axios.post(BACKEND_SERVER + `/api/rodillos/conjunto/`, { //creamos conjunto
                            operacion: operacion_id,
                            tubo_madre:tubo_madre,
                        }, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                                }     
                        })
                        .then( r => { 
                            for(var x=0;x<EjesRodillos.length;x++){
                                axios.post(BACKEND_SERVER + `/api/rodillos/elemento/`, { //creamos con id de conjunto el elemento
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
                            axios.post(BACKEND_SERVER + `/api/rodillos/celda/`, { //creamos CELDA con el Id de bancada y el Id de conjunto
                                conjunto: r.data.id,
                                bancada: res.data.id,
                                icono: null,
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
                else{ //ya tenemos la bancada creada y buscamos si tenemos conjunto
                    //axios.get(BACKEND_SERVER + `/api/rodillos/conjunto/?tubo_madre=${tubo_madre}&operacion=${operacion_marcada.id}`,{
                    axios.get(BACKEND_SERVER + `/api/rodillos/elemento_select/?conjunto__tubo_madre=${tubo_madre}&conjunto__operacion=${operacion_marcada.id}`,{
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }
                    })
                    .then( rr => {
                        if(rr.data.length===0){ //no tenemos conjunto, vamos a crear conjunto y elementos
                            axios.post(BACKEND_SERVER + `/api/rodillos/conjunto/`, { //creamos conjunto
                                operacion: operacion_id,
                                tubo_madre:tubo_madre,
                            }, {
                                headers: {
                                    'Authorization': `token ${token['tec-token']}`
                                    }     
                            })
                            .then( r => { 
                                for(var x=0;x<EjesRodillos.length;x++){//creamos elementos
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
                                axios.post(BACKEND_SERVER + `/api/rodillos/celda/`, { //creamos CELDA con el Id de bancada y el Id de conjunto
                                    conjunto: r.data.id,
                                    bancada: bancada_id,
                                    icono: null,
                                }, {
                                    headers: {
                                        'Authorization': `token ${token['tec-token']}`
                                        }     
                                })
                                .then( res => {  
                                })
                                .catch(err => { 
                                    console.error(err);
                                    //return;
                                })
                            })
                            .catch(err => { 
                                console.error(err);
                            })
                            handlerCancelar();
                        }
                        else{ //el conjunto y elementos ya existen y machacamos la información
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
                            handlerCancelar();
                        }
                    })
                }
                handlerCancelar();
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
                <Tabs
                    defaultActiveKey="conjunto_nuevo"
                    id="uncontrolled-tab-example"
                    className="mb-3"
                    >
                    <Tab eventKey="conjunto_nuevo" title="Rodillo">
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
                    </Tab>
                    <Tab eventKey="conjunto_existente" title="Rodillo otra formación">
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
                                            {rodillo_exist && rodillo_exist.map(rod_exist => {
                                                if (rod_exist.diametro === eje.diametro) {
                                                    return (
                                                        <option key={rod_exist.id} value={rod_exist.id}>
                                                            {rod_exist.nombre}
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
                    </Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="info" onClick={GuardarConjunto}>Guardar</Button>
                <Button variant="waring" onClick={handlerCancelar}>Cancelar</Button>
            </Modal.Footer>
        </Modal>
    );
}
export default RodConjunto;