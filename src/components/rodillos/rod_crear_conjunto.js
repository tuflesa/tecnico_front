import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal, Tab, Tabs } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const RodConjunto = ({show, setShow, handleClose, operacion_marcada, grupoId, maquina, tubomadre, elementos_formacion, grupo_bancadas, colorAzul, colorAzulB, colorVerde, bancada_id, bancada_otraformacion}) => {
    const [token] = useCookies(['tec-token']);
    const [bancadaId, setBancadaId] = useState(bancada_id); // Estado para bancada_id

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
    const [rod_id, setRod_Id] = useState(''); //para guardar la informacion en EjesRodillos
    const [rodillo_elegido, setRodillo_elegido] = useState([]);
    const [bancadas, setBancadas] = useState(null);
    const [operaciones_filtro, setOperaciones_filtro] = useState([]);
    const [tuboMadre_unicos, setTuboMadre_unicos] = useState([]);
    const [filtro, setFiltro] = useState(``);
    
    var bancadas_nuevas=[''];
    var bancadas_nuevas2=[''];
    var conjunto_id='';

    const [datos, setDatos] = useState({
        bancada_elegida: '',
        bancadas_guardar: grupo_bancadas ? grupo_bancadas : [''],
        operacion_filtro: '',
        tubo_madre_filtro: '',
        conjunto_elegido: '',
    });

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
            axios.get(BACKEND_SERVER + `/api/rodillos/elemento_select/?conjunto__id=${elementos_formacion[0].conjunto.id}`,{
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
        var valormenos=tubomadre -10;
        var valormayor=tubomadre +10;
        if(!datos.tubo_madre_filtro){
            valormenos = tubomadre -10;
            valormayor = tubomadre +10;
        }
        else{
            valormenos = datos.tubo_madre_filtro;
            valormayor = datos.tubo_madre_filtro;
        }
        setFiltro(`&operacion__id=${datos.operacion_filtro}&tubo_madre__gte=${valormenos}&tubo_madre__lte=${valormayor}`);
    }, [datos.operacion_filtro, datos.tubo_madre_filtro, tubomadre, operacion_marcada]);

    useEffect(() => { //PARA OBTENER LOS CONJUNTO YA CREADOS
        filtro && operacion_marcada && tubomadre && axios.get(BACKEND_SERVER + `/api/rodillos/conjunto_operacion/?operacion__seccion__id=${operacion_marcada.seccion.id}`+filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            seConjuntos_exist(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [filtro]);

    useEffect(() => { //PARA OBTENER LOS Ø DE TUBO MADRE UNICOS
        axios.get(BACKEND_SERVER + `/api/rodillos/grupo_only/?tubo_madre__gte=${tubomadre-10}&tubo_madre__lte=${tubomadre+10}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }
            })
            .then( res => {
                setTuboMadre_unicos(res.data);
            })
            .catch( err => {
                console.log(err);
            });
    }, [token, tubomadre, operacion_marcada]);

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

    const Guardar = () => {
        if(datos.bancada_elegida){ //si hemos elegido una bancada de otra formación
            bancadas_nuevas = grupo_bancadas?grupo_bancadas:[''];
            bancadas_nuevas2 = grupo_bancadas?grupo_bancadas.map(bancada => bancada.id):'';
            if(bancada_id){
                alert('Si ya tenemos bancada de grupo, no podemos coger una bancada adicional');
                bancadas_nuevas2=[''];
                return;
            }
            else{
                bancadas_nuevas2.push(datos.bancada_elegida);
                ActualizarGrupo(bancadas_nuevas2);
                return;
            }
        }
        else{ 
            if(datos.conjunto_elegido){ //conjunto de otra formación
                if(colorAzul){//¿tenia ya conjunto? sustituyo conjunto en celda
                    SustituirConjuntoEnCelda(datos.conjunto_elegido);
                }
                if(colorAzulB){//¿tenia ya conjunto naranja? sustituyo conjunto en celda
                    SustituirConjuntoEnCelda(datos.conjunto_elegido);
                }
                else{
                    if(bancada_id || bancadaId){
                        if(bancada_id){
                            GuardarCelda(bancada_id); //tengo bancada, crear celda
                        }
                        if(bancadaId){
                            GuardarCelda(bancadaId); //tengo bancada grabada sin actualizar, crear celda
                        }
                    }
                    else{
                        GuardarBancada(); //crear bancada y celda
                    }
                }
            }
            else{ //rodillos nuestros
                var rodillo_tubo_madre = EjesRodillos[0].TuboMadreRod;
                var rodillo_operacion = EjesRodillos[0].operacion;
                var no_coincide=false;
                var x=0;
                for(x=0;x<EjesRodillos.length;x++){
                    if(EjesRodillos[x].TuboMadreRod!==rodillo_tubo_madre||EjesRodillos[x].operacion!==rodillo_operacion){
                        no_coincide=true;
                        alert('Los rodillos seleccionados no coinciden en su Ø o su operación');
                        handlerCancelar();
                        break
                    }
                }
                if(no_coincide===false){
                    if(colorVerde===true){ 
                        alert('Ya tenemos elementos creados originales'); //Si tengo ya un juego original para esta formación, no puedo poner otro.
                    }
                    if(colorAzul===true || colorVerde===false){ //no tengo conjunto ni elemento
                        GuardarConjuntoElemento();
                    }
                }
                else{
                    alert('Por favor selecciona todos los elementos del conjunto');
                }
            }
        }
    }

    const SustituirConjuntoEnCelda = (conjuntoId)=>{
        conjuntoId && axios.patch(BACKEND_SERVER + `/api/rodillos/celda/${elementos_formacion[0].id}/`, {
            conjunto: conjuntoId,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => { 
            handleClose();
            setShow(false);
            window.location.href=`/rodillos/grupo_editar/${grupoId}`;
        })
        .catch(err => { 
            console.error(err);
        })
    }

    const GuardarConjuntoElemento = () => { 
        if(EjesRodillos.length===ejes.length){//cantidad de rodillo igual a cantidad de ejes
            axios.post(BACKEND_SERVER + `/api/rodillos/conjunto/`, { //creamos conjunto, (Operación y Tubo_madre del rodillo).
                operacion: operacion_rod,
                tubo_madre:tubo_madre_rod,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }     
            })
            .then( r => { 
                conjunto_id=r.data.id;
                var y=1;
                for(var x=0;x<EjesRodillos.length;x++){
                    axios.post(BACKEND_SERVER + `/api/rodillos/elemento/`, { //creamos los elementos.
                        conjunto: r.data.id,
                        eje: EjesRodillos[x].eje,
                        rodillo: EjesRodillos[x].rodillo,
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                            }     
                    })
                    .then( res => {   
                        y=y+1;
                        if(y>(EjesRodillos.length)){
                            if(colorAzul===true){
                                SustituirConjuntoEnCelda(r.data.id); //tengo celda solo sustituyo el numero del conjunto en dicha celda
                            }
                            else if(colorAzulB===true){
                                SustituirConjuntoEnCelda(r.data.id); //tengo celda solo sustituyo el numero del conjunto en dicha celda
                            }
                            else if(colorAzul===false && colorVerde===false){
                                if(bancada_id || bancadaId){
                                    GuardarCelda(bancada_id); //tengo bancada creo celda
                                }
                                else{
                                    GuardarBancada(); //creo bancada y celda
                                }
                            } 
                        }    
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
    }

    const GuardarCelda = (id_bancada) => {
        if(datos.conjunto_elegido){
            conjunto_id=datos.conjunto_elegido;
        }
        id_bancada && axios.post(BACKEND_SERVER + `/api/rodillos/celda/`, { //creamos celda
            bancada: id_bancada,
            conjunto: conjunto_id,
            icono:null,
            operacion: operacion_id,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => { 
            handleClose();
            setShow(false);
            window.location.href=`/rodillos/grupo_editar/${grupoId}`;
        })
        .catch(err => { 
            console.error(err);
        })
    }

    const GuardarBancada = () => {  
        bancadas_nuevas = grupo_bancadas?grupo_bancadas:[''];
        bancadas_nuevas2 = grupo_bancadas?grupo_bancadas.map(bancada => bancada.id):'';
        axios.post(BACKEND_SERVER + `/api/rodillos/bancada/`, { //creamos la bancada
            seccion: operacion_marcada.seccion.id,
            tubo_madre: tubomadre,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => { 
            bancadas_nuevas2.push(res.data.id);
            setBancadaId(res.data.id);
            GuardarCelda(res.data.id);
            ActualizarGrupo(bancadas_nuevas2);
        })
        .catch(err => { 
            console.error(err);
        })
    }

    const ElimniarBancada = () => { 
        bancadas_nuevas = grupo_bancadas.filter(bancada => bancada.id !== bancada_otraformacion.id).map(bancada => bancada.id);
        ActualizarGrupo(bancadas_nuevas);
    }

    const ActualizarGrupo = (actualizar_bancadas) => {
        var idsBancadas=[];
        idsBancadas = actualizar_bancadas.map(bancada => bancada.id);
        datos.bancadas_guardar && actualizar_bancadas && axios.patch(BACKEND_SERVER + `/api/rodillos/grupo_only/${grupoId}/`, {
            bancadas: actualizar_bancadas,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => { 
            datos.bancadas_guardar=[];
            setShow_act(false);
            window.location.href=`/rodillos/grupo_editar/${grupoId}`;
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
        setFiltro(``);
        bancada_otraformacion='';
        colorAzul=false;
        colorAzulB=false;
        colorVerde=false;
        setDatos({
            ...datos,
            bancada_elegida:'',
            bancadas_guardar:[],
            operacion_filtro:'',
            tubo_madre_filtro:``,

        });
    }

    const handleInputChange = (event) => {
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
        setDatos(prevDatos => ({
            ...prevDatos,
            conjunto_elegido: event.target.value
        }));
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
                                                if (rod.eje.tipo.id === eje.tipo.id && rod.rodillo.diametro === eje.diametro) {
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
                                            disabled={bancada_otraformacion.id?true:false}
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
                                            onChange={handleInputChangeOpFiltro} 
                                            disabled={colorVerde?true:bancada_otraformacion.id?true:false}> {/*si tenemos rodillos nuestros, no podemos coger de otro*/}
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
                                    <Form.Group controlId="tubo_madre">
                                        <Form.Label>Tubo Madre</Form.Label>
                                        <Form.Control 
                                            as="select" 
                                            value={datos.tubo_madre_filtro}
                                            name='tubo_madre'
                                            onChange={handleInputChangeTuboFiltro} 
                                            disabled={colorVerde?true:bancada_otraformacion.id?true:false}>
                                            <option key={0} value={``}>Todas</option>
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
                                            disabled={colorVerde?true:bancada_otraformacion.id?true:false}
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
                                                checked={(bancada_id && bancada_id === bancada.id) || (bancada_otraformacion.id && bancada_otraformacion.id === bancada.id) || (datos.bancada_elegida === bancada.id)}
                                                onChange={()=>handleInputChangeBancada(bancada.id)}
                                                disabled={bancada_id?true:colorAzul?true:bancada_otraformacion.id?true:false}
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
                {bancada_otraformacion.id?<Button variant="info" onClick={ElimniarBancada}>Eliminar Bancada</Button>:''}
                <Button disabled={bancada_otraformacion.id?true:false} variant="info" onClick={Guardar}>Guardar</Button>
                <Button variant="waring" onClick={handlerCancelar}>Cancelar</Button>
            </Modal.Footer>
        </Modal>
    );
}
export default RodConjunto;