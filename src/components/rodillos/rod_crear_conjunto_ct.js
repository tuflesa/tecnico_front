import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal, Tab, Tabs } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const RodConjuntoCT = ({show, handleClose, operacion_marcada, elementos_formacion, dimensiones, bancada_id}) => {
    const [token] = useCookies(['tec-token']);

    const [ejes, setEjes] = useState(null);
    const [rodillos, setRodillos] = useState(null);
    const [rodillo_exist, setRodillo_exist] = useState([]);
    const [selectedEje, setSelectedEje] = useState(null);
    const [selectRodilloId, setSelectRodilloId] = useState({});
    const [selectRodilloNom, setSelectRodilloNom] = useState({});
    const [EjesRodillos, setEjesRodillos] = useState([]);
    const [operacion_id, setOperacionId] = useState('');
    const [rod_id, setRod_Id] = useState(''); //para guardar la informacion en EjesRodillos
    const [rod_nom, setRod_Nom] = useState(''); //para guardar la informacion en EjesRodillos
    const [rodillo_elegido, setRodillo_elegido] = useState([]);
    const [filtro, setFiltro] = useState(``);

    const [datos, setDatos] = useState({
        dimension: '',
    });

    useEffect(() => { //BUSCAMOS, SI LOS HAY, ELEMENTOS (RODILLOS) DEL CONJUNTO SELECCIONADO.
        if(elementos_formacion.length>0){ 
            axios.get(BACKEND_SERVER + `/api/rodillos/elemento_select/?conjunto=${elementos_formacion[0].conjunto.id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setRodillo_elegido(res.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
        else{
            setRodillo_elegido([]);
        }
    }, [token, elementos_formacion]);

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

    useEffect(() => { //RODILLOS QUE PODEMOS USAR EN ESTA OPERACIÓN CON ESTE GRUPO
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/rodillo_editar/?operacion=${operacion_marcada.id}`,{
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

    useEffect(() => { //PARA OBTENER LOS RODILLOS EXISTENTES DE LA MISMA SECCIÓN;
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/rodillos_existentes/?operacion__seccion__tipo=${operacion_marcada.seccion.tipo}`+ filtro,{
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
    }, [operacion_marcada, filtro]);

    useEffect(() => { //SI TENEMOS LOS 3 ELEMENTOS ACUMULAMOS LO SELECCIONADO
        if(rod_id && selectedEje && dimensiones){
            setEjesRodillos([...EjesRodillos, {eje: selectedEje, rodillo: rod_id, operacion: operacion_id, dimensiones:dimensiones}]);
        }        
    }, [rod_id, selectedEje, dimensiones]);

    const GuardarConjuntoCT = () => {
        if(bancada_id){
            if(elementos_formacion.length>0){ //hay celda, machacamos el elemento
                for(var x=0;x<EjesRodillos.length;x++){
                    axios.patch(BACKEND_SERVER + `/api/rodillos/elemento/${rodillo_elegido[x].id}/`, {
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
                window.location.href=`/rodillos/bacada_ct_editar/${bancada_id}`;
            }
            else{
                GuardarConjunto_Elemento(bancada_id);
            }
        }
        else{
            GuardarBancada();
        }
    }

    const GuardarBancada = () => {
        if(EjesRodillos.length===ejes.length){
            axios.post(BACKEND_SERVER + `/api/rodillos/bancada/`, { //creamos bancada
                seccion: operacion_marcada.seccion.id,
                dimensiones: dimensiones,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }     
            })
            .then( res => {
                bancada_id = res.data.id;
                GuardarConjunto_Elemento(res.data.id);
            })
            .catch(err => { 
                console.error(err);
            }); 
        }
    }

    const GuardarConjunto_Elemento = (bancadaId) => {
        axios.post(BACKEND_SERVER + `/api/rodillos/conjunto/`, { //creamos conjunto
            operacion: operacion_id,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( r => {   
            GuardarCelda(bancadaId,r.data.id);//mandamos los 2 id para crear la celda
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
            window.location.href=`/rodillos/bacada_ct_editar/${bancadaId}`;
        })
        .catch(err => { 
            console.error(err);
        })
    }

    const GuardarCelda = (bancadaId, conjuntoId) => {
        axios.post(BACKEND_SERVER + `/api/rodillos/celda/`, { //creamos CELDA con el Id de bancada y el Id de conjunto
            conjunto: conjuntoId,
            bancada: bancadaId,
            icono: null,
            operacion: operacion_id,
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

    const handlerCancelar = () => {
        setEjesRodillos([]);
        setSelectRodilloId({});
        setSelectRodilloNom({});
        setSelectedEje(null);
        handleClose();
        datos.dimension='';
    }   

    const handleInputChangeDimension = (event) => {
        setDatos(prevDatos => ({
            ...prevDatos,
            dimension: event.target.value
        }));
    };
    
    const handleInputChange = (event) => {
        const campoNombre = event.target.name;
        const idRodillo = event.target.value;
        setRod_Id(idRodillo);
        const nuevaSeleccionRodilloId = {...selectRodilloId};
        nuevaSeleccionRodilloId[campoNombre] = idRodillo;
        setSelectedEje(campoNombre);
        setSelectRodilloId(nuevaSeleccionRodilloId);
    }

    const handleInputChangeRodExi = (event) => {
        const [id, rodillo_nombre] = event.target.value.split(',');
        const campoNombre = event.target.name;
        const idRodillo = id;
        const nomRodillo = rodillo_nombre;
        setRod_Id(idRodillo);
        setRod_Nom(nomRodillo);
        const nuevaSeleccionRodilloId = {...selectRodilloId};
        const nuevaSeleccionRodilloNom = {...selectRodilloNom};
        nuevaSeleccionRodilloId[campoNombre] = idRodillo;
        nuevaSeleccionRodilloNom[campoNombre] = nomRodillo;
        setSelectedEje(campoNombre);
        setSelectRodilloId(nuevaSeleccionRodilloId);
        setSelectRodilloNom(nuevaSeleccionRodilloNom);
    };

    useEffect(() => {
        setFiltro(`&nombre__icontains=${datos.dimension}`)
    }, [datos.dimension]);
    
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
                                            as="text"
                                            name={eje.id}
                                            value={rodillo_elegido[eje.id] || ''}
                                            onChange={handleInputChange}
                                            placeholder={eje.tipo.nombre}
                                        >
                                            {rodillo_elegido && rodillo_elegido.map(rod => {
                                                if (rod.eje.tipo.id === eje.tipo.id && rod.conjunto.operacion.id === eje.operacion) {
                                                    return (
                                                        <option key={rod.rodillo.id} value={rod.rodillo.id}>
                                                            {rod.rodillo.nombre}
                                                        </option>
                                                    )
                                                }
                                            })}
                                        </Form.Control>
                                        <Form.Control
                                            as="select"
                                            name={eje.id}
                                            value={selectRodilloId[eje.id] || ''}
                                            onChange={handleInputChange}
                                            placeholder={eje.tipo.nombre}
                                        >
                                            <option key={0} value={''}>Elegir rodillo</option>
                                            {rodillos && rodillos.map(rodillo => {
                                                if (rodillo.tipo === eje.tipo.id && rodillo.diametro === eje.diametro && dimensiones.includes(parseInt(rodillo.dimension_perfil))) { 
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
                                    <Form.Group controlId="dimension">
                                        <Form.Label style={{color: 'red'}}>Filtrar por Dimensiones</Form.Label>
                                        <Form.Control type="text" 
                                                    name='dimension' 
                                                    value={datos.dimension}
                                                    onChange={handleInputChangeDimension}                                        
                                                    placeholder="Contiene"
                                                    style={{color: 'red'}}/>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                {ejes && ejes.map(eje => (
                                    <Form.Group controlId="rod_elegido">
                                        <Form.Label>Rodillo {eje.tipo.nombre}</Form.Label>
                                        <Form.Control type="text" 
                                                    name='rod_elegido' 
                                                    value={selectRodilloNom[eje.id]}                                       
                                                    placeholder="Rodillo"
                                                    style={{ color: 'blue' }}/>
                                        <Form.Control
                                            as="select"
                                            name={eje.id}
                                            value={selectRodilloId[eje.id] || ''}
                                            onChange={handleInputChangeRodExi}
                                            placeholder={eje.tipo.nombre}
                                        >
                                            <option key={0} value={''}>Elegir rodillo</option>
                                            {rodillo_exist && rodillo_exist.map(rod_exist => {
                                                if (rod_exist.diametro === eje.diametro) {
                                                    return (
                                                        <option key={rod_exist.id} value={`${rod_exist.id},${rod_exist.nombre}`}>
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
                <Button variant="info" onClick={GuardarConjuntoCT}>Guardar</Button>
                <Button variant="waring" onClick={handlerCancelar}>Cancelar</Button>
            </Modal.Footer>
        </Modal>
    );
}
export default RodConjuntoCT;