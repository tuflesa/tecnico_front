import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal, Tab, Tabs, Alert } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const RodConjunto = ({show, handleClose, operacion_marcada, grupoId, maquina, tubomadre, elementos_formacion, grupo_bancadas}) => {
    const [token] = useCookies(['tec-token']);

    const [ejes, setEjes] = useState(null);
    const [rodillos, setRodillos] = useState(null);
    const [conjuntos_exist, seConjuntos_exist] = useState([]);
    const [selectedEje, setSelectedEje] = useState(null);
    const [selectRodilloId, setSelectRodilloId] = useState({});
    const [operacion_rod, setOperacionRod] = useState('');
    const [EjesRodillos, setEjesRodillos] = useState([]);
    const [operacion_id, setOperacionId] = useState('');
    const [grupoId_rod, setGrupoId_Rod] = useState(0);
    const [tubo_madre_rod, setTuboMadreRod] = useState(0);
    const [show_act, setShow_act] = useState(false);
    const [grupos, setGrupo] = useState(null);
    const [rod_id, setRod_Id] = useState(''); //para guardar la informacion en EjesRodillos
    const [rodillo_elegido, setRodillo_elegido] = useState([]);
    const [bancadas, setBancadas] = useState(null);
    const [operaciones_filtro, setOperaciones_filtro] = useState([]);
    const [tuboMadre_unicos, setTuboMadre_unicos] = useState([]);
    const [filtro, setFiltro] = useState(``);
    
    var bancadas_nuevas=[''];
    
    

    const [datos, setDatos] = useState({
        bancada_elegida:'',
        bancadas_guardar:grupo_bancadas?grupo_bancadas:[],
        operacion_filtro:'',
        tubo_madre_filtro:``,
    });

    useEffect(() => {
        console.log('operacion_marcada:',operacion_marcada);
        console.log('cambio de datos:',datos);
    }, [token, datos]);

    useEffect(() => {
        if (grupoId_rod!==null && rodillos) {
            for(var y=0;y<rodillos.length;y++){
                if(rodillos[y].grupo.id === parseInt(grupoId_rod)){
                    setTuboMadreRod(rodillos[y].grupo.tubo_madre);
                    break
                }
            }
        }
    }, [grupoId_rod]);

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

    useEffect(() => { //BUSCAMOS, LAS OPERACIONES DE LA SECCIÓN MARCADA.
        if(operacion_marcada!==null){ 
            axios.get(BACKEND_SERVER + `/api/rodillos/operacion/?seccion=${operacion_marcada.seccion.id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setOperaciones_filtro(res.data);
                console.log('estas son las operaciones', res.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, operacion_marcada]);

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

    /* useEffect(() => { 
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/conjunto_operacion/?operacion.seccion=${operacion_marcada.seccion.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setConjuntos(res.data);
            console.log('los conjuntos cogidos serían',res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, operacion_marcada]); */

    useEffect(() => { //PARA OBTENER LOS GRUPOS
        grupoId && axios.get(BACKEND_SERVER + `/api/rodillos/grupo_only/`,{
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
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/rodillos/?operacion__id=${operacion_marcada.id}&grupo__id=${grupoId}`,{
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

    useEffect(() => {
        setFiltro(`&operacion__id=${datos.operacion_filtro}`)
    }, [datos.operacion_filtro, datos.tubo_madre_filtro]);

    useEffect(() => { //PARA OBTENER LOS CONJUNTO YA CREADOS
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/conjunto_operacion/?operacion__seccion__id=${operacion_marcada.seccion.id}`+filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            seConjuntos_exist(res.data);
            console.log('conjuntos existentes.....:',res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [operacion_marcada, grupoId, token, filtro]);

    useEffect(() => { //PARA OBTENER LOS Ø DE TUBO MADRE UNICOS
            axios.get(BACKEND_SERVER + `/api/rodillos/grupo_only/`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }
            })
            .then( res => {
                setTuboMadre_unicos(res.data);
                console.log('Tubo madre unicos.....:',res.data);
            })
            .catch( err => {
                console.log(err);
            });
    }, [conjuntos_exist, token]);

    useEffect(() => { //SI TENEMOS LOS 3 ELEMENTOS ACUMULAMOS LO SELECCIONADO
        if(rod_id && selectedEje && operacion_rod && tubo_madre_rod){
            setEjesRodillos([...EjesRodillos, {eje: selectedEje, rodillo: rod_id, operacion: operacion_rod, TuboMadreRod:tubo_madre_rod}]);
        }        
    }, [rod_id, selectedEje, operacion_rod, tubo_madre_rod]);
    
    useEffect(() => { //BUSCAMOS LAS BANCADAS QUE PRECISAMOS PARA ESTA OPERACIÓN
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/bancada/?seccion=${operacion_marcada.seccion.id}&tubo_madre__gte=${tubomadre-10}&tubo_madre__lte=${tubomadre+10}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setBancadas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, operacion_marcada]);

    const GuardarConjunto = () => {
        var rodillo_tubo_madre = EjesRodillos[0].TuboMadreRod;
        var rodillo_operacion = EjesRodillos[0].operacion;
        var no_coincide=true;
        var x=0;
        for(x=0;x<EjesRodillos.length;x++){
            if(EjesRodillos[x].TuboMadreRod!==rodillo_tubo_madre||EjesRodillos[x].operacion!==rodillo_operacion){
                no_coincide=false;
                alert('Los rodillos seleccionados no coinciden en su Ø o su operación');
                handlerCancelar();
                break
            }
        }
        if(no_coincide===true){
            //primero comprobamos si existe la bancada y si no, se crea, igual con LA CELDA, CONJUNTO y por consiguiente con el ELEMENTO.
            var bancada_id='';
            axios.get(BACKEND_SERVER + `/api/rodillos/bancada_grupos/?seccion=${operacion_marcada.seccion.id}&tubo_madre=${tubomadre}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                if(res.data.length!==0){ //si hay bancada cojo el id
                    alert('SI TENEMOS BANCADA');
                    bancada_id=res.data[0].id;
                    if(datos.bancada_elegida){
                        alert('Si ya tenemos bancada de grupo, no podemos coger una bancada adicional');
                        return;
                    }
                }
                //guardamos primero la Bancada, guardamos el Conjunto y con el id de conjunto guardamos el Elemento, AL FINAL GUARDAMOS CELDA CON ID BANCADA E ID CONJUNTO
                if(EjesRodillos.length===ejes.length || datos.bancada_elegida){
                    bancadas_nuevas = datos.bancadas_guardar;//datos.bancadas_guardar = tiene las bancadas ya guardadas en este grupo
                    if(datos.bancada_elegida){ //si hemos elegido una bancada de otra formación
                        bancadas_nuevas.push(datos.bancada_elegida);
                        alert('elegimos bancada de otra formación, por lo que solo actualizamos grupo, metiendo la bancada ya creada');
                        setShow_act(true);
                        ActualizarGrupo(bancadas_nuevas);
                        return;
                    }
                    else if(res.data.length===0){
                        axios.post(BACKEND_SERVER + `/api/rodillos/bancada/`, { //creamos la bancada
                            seccion: operacion_marcada.seccion.id,
                            tubo_madre: tubomadre,
                        }, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                                }     
                        })
                        .then( res => { 
                            bancadas_nuevas.push(res.data.id);
                            axios.post(BACKEND_SERVER + `/api/rodillos/conjunto/`, { //creamos conjunto, con operacion y tubo_madre del rodillo que debe de coincidir todos.
                                operacion: operacion_rod,
                                tubo_madre:tubo_madre_rod,
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
                                    operacion: operacion_marcada.id,
                                }, {
                                    headers: {
                                        'Authorization': `token ${token['tec-token']}`
                                        }     
                                })
                                .then( res => {  
                                    setShow_act(true);
                                    ActualizarGrupo(bancadas_nuevas);
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
                    }
                    //CAMBIAR LA BUSQUEDA DE ELEMENTO_SELECT A CELDA COMPARANDO OPERACION Y BANCADA
                    if(bancada_id){ //ya tenemos la bancada creada y buscamos si tenemos conjunto
                        axios.get(BACKEND_SERVER + `/api/rodillos/elemento_select/?conjunto__tubo_madre=${tubo_madre_rod}&conjunto__operacion=${operacion_marcada.id}`,{
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                            }
                        })
                        .then( rr => {
                            //TENDREMOS QUE VER SI LO QUE HEMOS ELEGIDO ESTA EN OTRO CONJUNTO O SE CREA NUEVO
                            if(rr.data.length===0){ //no tenemos conjunto, vamos a crear conjunto y elementos
                                axios.post(BACKEND_SERVER + `/api/rodillos/conjunto/`, { //creamos conjunto
                                    operacion: operacion_rod,
                                    tubo_madre:tubo_madre_rod,
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
                                        operacion: operacion_marcada.id,
                                    }, {
                                        headers: {
                                            'Authorization': `token ${token['tec-token']}`
                                            }     
                                    })
                                    .then( res => {  
                                        alert('estaba la bancada pero esta celda es nueva');
                                    })
                                    .catch(err => { 
                                        console.error(err);
                                        return;
                                    })
                                })
                                .catch(err => { 
                                    console.error(err);
                                })
                                handlerCancelar();
                            }
                            else{ //el conjunto y elementos ya existen y machacamos la información
                                //TENDREMOS QUE VER SI LO QUE HEMOS ELEGIDO ESTA EN OTRO CONJUNTO O SE CREA NUEVO
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
                                        alert('el conjunto ya existia y hemos machacado');
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
            setDatos({
                ...datos,
                bancada_elegida : ''
            });
        }
    } 

    const ActualizarGrupo = (actualizar_bancadas) => {
        datos.bancadas_guardar && actualizar_bancadas && axios.patch(BACKEND_SERVER + `/api/rodillos/grupo/${grupoId}/`, {
            bancadas: actualizar_bancadas,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => { 
            datos.bancadas_guardar=[];
            setShow_act(false);
        })
        .catch(err => { 
            console.error(err);
        })
        handlerCancelar();
    }

    const handlerCancelar = () => {
        setGrupoId_Rod(null);
        setEjesRodillos([]);
        setSelectRodilloId({});
        setSelectedEje(null);
        setOperacionRod('');
        handleClose();
        setDatos({
            ...datos,
            bancada_elegida : ''
        });
    }

    const handleInputChange = (event) => {
        console.log('tiene que venir el conjunto')
        const selectedValue = event.target.options[event.target.selectedIndex].value;
        const [rodilloId, operacion, grupo, eje] = selectedValue.split(',');
        const grupoID = grupo;
        const operacion_rodillo = operacion;
        const valores_rodillo = selectedValue;
        const rodillo_id = rodilloId;
        const ejeId_posicion = eje;
        setRod_Id(rodillo_id);
        setGrupoId_Rod(grupoID);
        setOperacionRod(operacion_rodillo);
        const nuevaSeleccionRodilloId = {...selectRodilloId};
        nuevaSeleccionRodilloId[ejeId_posicion] = valores_rodillo;
        setSelectedEje(ejeId_posicion);
        setSelectRodilloId(nuevaSeleccionRodilloId); //solo lo uso para la posición del rodillo en el conjunto
    }

    const handleInputChange_conjunto = (event) => {
        console.log('RECOJO EL CONJUNTO YA CREADO');
        console.log(event);
    }

    const handleInputChangeBancada = (bancadaId) => {
        setDatos(prevDatos => ({
            ...prevDatos,
            bancada_elegida: bancadaId
        }));
    };

    const handleInputChangeOpFiltro = (event) => {
        setDatos(prevDatos => ({
            ...prevDatos,
            operacion_filtro: event.target.value
        }));
    };

    const handleInputChangeTuboFiltro = (event) => {
        setDatos(prevDatos => ({
            ...prevDatos,
            tubo_madre_filtro: event.target.value
        }));
    };
    
    
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
                                            //onChange={handleInputChange}
                                            placeholder={eje.tipo.nombre}
                                            style={{fontWeight: 'bold', color: 'red'}}
                                        >
                                            {rodillo_elegido && rodillo_elegido.map(rod => {
                                                if (rod.eje.tipo.id === eje.tipo.id && rod.rodillo.diametro === eje.diametro && rod.conjunto.operacion.id === eje.operacion) {
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
                                                if (rodillo.tipo === eje.tipo.id && rodillo.diametro === eje.diametro) {
                                                    return (
                                                        <option key={rodillo.id} value={`${rodillo.id},${rodillo.operacion},${rodillo.grupo.id},${eje.id}`}>
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
                    <Tab eventKey="conjunto_existente" title="Conjunto rodillo otra formación">
                        <Form>
                            <Row>               {/*FILTROS*/}
                                <Col>
                                    <Form.Group controlId="operacion">
                                        <Form.Label>Operación</Form.Label>
                                        <Form.Control 
                                            as="select" 
                                            value={datos.operacion_filtro}
                                            name='operacion'
                                            onChange={handleInputChangeOpFiltro} >
                                            <option key={0} value={''}>Todas</option>
                                            {operaciones_filtro && operaciones_filtro.map(operacion => (
                                                <option key={operacion.id} value={operacion.id}>
                                                    {operacion.nombre}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    {/* <Form.Group controlId="tubo_madre">
                                        <Form.Label>Nombre Montaje</Form.Label>
                                        <Form.Control type="text" 
                                                    name='tubo_madre' 
                                                    value={datos.tubo_madre_filtro}
                                                    onChange={handleInputChangeTuboFiltro} 
                                                    placeholder="tubo madre" 
                                                    autoFocus />
                                    </Form.Group> */}
                                    <Form.Group controlId="tubo_madre">
                                        <Form.Label>Tubo Madre</Form.Label>
                                        <Form.Control 
                                            as="select" 
                                            value={datos.tubo_madre_filtro}
                                            name='tubo_madre'
                                            onChange={handleInputChangeTuboFiltro} >
                                            <option key={0} value={0}>Todas</option>
                                            {tuboMadre_unicos && tuboMadre_unicos.map(conjunto => (
                                                <option key={conjunto.id} value={conjunto.tubo_madre}>
                                                    {conjunto.tubo_madre}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Group controlId="conjunto">
                                        <Form.Label>Conjunto existente</Form.Label>
                                        <Form.Control
                                            as="select"
                                            name='conjunto'
                                            value={datos.conjunto_elegido}
                                            onChange={handleInputChange_conjunto}
                                            placeholder="Conjunto Existente"
                                        >
                                            <option key={0} value={''}>Conjuntos rodillos otras formaciones</option>
                                            {conjuntos_exist && conjuntos_exist.map(conjunto => {
                                                return (
                                                    <option key={conjunto.id} value={conjunto.id}>
                                                        {conjunto.operacion.nombre + '- Ø'+ conjunto.tubo_madre}
                                                    </option>
                                                )
                                            })}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Tab>
                    <Tab eventKey="bancadas_existente" title="Bancadas de otras formación">
                        <Form>
                            <Row>
                                <Col>
                                    <Form.Group controlId="bancadas">
                                        <Form.Label>Bancadas (Selecciona una opción)</Form.Label>
                                        {bancadas && bancadas.map((bancada)=>(
                                            <Form.Check
                                                key={bancada.id}
                                                type="checkbox"
                                                label={bancada.nombre}
                                                value = {datos.bancada_elegida}
                                                checked ={datos.bancada_elegida === bancada.id}
                                                onChange={()=>handleInputChangeBancada(bancada.id)}
                                            />
                                        ))}
                                    </Form.Group>
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