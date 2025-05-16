import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal, Tab, Tabs } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const RodConjunto = ({show, setShow, elementos_formacion, handleClose, grupo_nom, operacion_marcada, grupoId, grupoEspesor, empresa_id, maquina, tubomadre, grupo_bancadas, colorAzul, colorAzulB, colorVerde, colorAmarillo, bancada_id, bancada_otraformacion}) => {
    const [token] = useCookies(['tec-token']);
    const [bancadaId, setBancadaId] = useState(bancada_id); // Estado para bancada_id

    const [ejes, setEjes] = useState(null);
    const [rodillos, setRodillos] = useState(null);
    const [rod_generico, setRodGenerico] = useState(null);
    const [conjuntos_exist, setConjuntos_exist] = useState([]);
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
    const [espesores_unidos, setEspesores_unidos] = useState(``);
    const [nombreGrupo, setNombreGrupo] = useState(``);
    const [icono_celda, setIcono_celda] = useState([]);
    const [es_generico, setEsGenerico] = useState(null);
    
    var bancadas_nuevas=[''];
    var bancadas_nuevas2=[''];
    var conjunto_id='';

    const [datos, setDatos] = useState({
        bancada_elegida: bancada_id? bancada_id:'',
        bancadas_guardar: grupo_bancadas ? grupo_bancadas : [''],
        operacion_filtro: '',
        tubo_madre_filtro: '',
        conjunto_elegido: '',
        icono_celda:colorVerde || elementos_formacion.length===0?(elementos_formacion[0]?.icono?elementos_formacion[0].icono.id:operacion_marcada?operacion_marcada.icono_celda:''):'',
    });
    
    useEffect(() => {
        setDatos(prevDatos => ({
            ...prevDatos,
            icono_celda: colorVerde || elementos_formacion.length===0?(elementos_formacion[0]?.icono?elementos_formacion[0].icono.id:operacion_marcada.icono_celda):''
        }));
    }, [operacion_marcada]);

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

    useEffect(() => { //recogemos todos los iconos posibles para la operación
        axios.get(BACKEND_SERVER + `/api/rodillos/icono_celda/?pertenece_grupo=${true}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setIcono_celda(res.data.slice(3));  //QUITAREMOS 3 PERO HAY OTROS 3 RESERVADOS QUE NO CUMPLEN CON ESTO ?pertenece_grupo=${true}
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(() => { //BUSCAMOS, LAS OPERACIONES PARA EL FILTRO DE CONJUNTOS DE OTRAS FORMACIONES.
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
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/rodillos/?operacion__id=${operacion_marcada.id}&grupo__tubo_madre=${tubomadre}`,{
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

    useEffect(() => { //RODILLOS QUE PODEMOS USAR EN ESTA OPERACIÓN CON ESTE GRUPO
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/rodillos/?es_generico=${true}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setRodGenerico(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, operacion_marcada]);

    useEffect(() => {
        var valormenos=tubomadre -120;
        var valormayor=tubomadre +120;
        if(!datos.tubo_madre_filtro){
            valormenos = tubomadre -120;
            valormayor = tubomadre +120;
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
            setConjuntos_exist(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [filtro]);

    useEffect(() => { //PARA OBTENER LOS Ø DE TUBO MADRE UNICOS
        axios.get(BACKEND_SERVER + `/api/rodillos/grupo_only/?tubo_madre__gte=${tubomadre-120}&tubo_madre__lte=${tubomadre+20}&maquina__empresa=${empresa_id}`,{
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

    /* useEffect(() => { //SI TENEMOS LOS 3 ELEMENTOS ACUMULAMOS LO SELECCIONADO
        if(rod_id && selectedEje && operacion_rod && tubo_madre_rod){
            setEjesRodillos([...EjesRodillos, {eje: selectedEje, rodillo: rod_id, operacion: operacion_rod, TuboMadreRod:tubo_madre_rod}]);
        }        
    }, [rod_id, selectedEje, operacion_rod, tubo_madre_rod]); */

    useEffect(() => {
            if (rod_id && selectedEje && operacion_rod && tubo_madre_rod) {
                setEjesRodillos(prevEjesRodillos => {
                    const existe = prevEjesRodillos.some(e => e.eje === selectedEje);
        
                    if (existe) {
                        // Si ya existe, lo reemplazamos
                        return prevEjesRodillos.map(e => 
                            e.eje === selectedEje 
                                ? { eje: selectedEje, rodillo: rod_id, operacion: operacion_rod, TuboMadreRod:tubo_madre_rod, es_generico: es_generico}
                                : e
                        );
                    } else {
                        // Si no existe, lo agregamos
                        return [...prevEjesRodillos, { eje: selectedEje, rodillo: rod_id, operacion: operacion_rod, TuboMadreRod:tubo_madre_rod, es_generico: es_generico}];
                    }
                });
            }
        }, [rod_id, selectedEje, operacion_rod, tubo_madre_rod]);
    
    useEffect(() => { //BUSCAMOS LAS BANCADAS QUE PRECISAMOS PARA ESTA OPERACIÓN
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/bancada_grupos/?seccion=${operacion_marcada.seccion.id}&tubo_madre__gte=${tubomadre-120}&tubo_madre__lte=${tubomadre+10}`,{
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
        let nulos = EjesRodillos.filter(rodillo=> rodillo.es_generico==='true').length
        if(nulos>EjesRodillos.length/2){
            alert('No podemos poner tantos rodillos nulos en una formación.')
            return;
        }
        else{
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
                    if(EjesRodillos.length===0){
                        alert('Introduce algún dato');
                        return;
                    }
                    var rodillo_tubo_madre = EjesRodillos[0].TuboMadreRod;
                    var rodillo_operacion = EjesRodillos[0].operacion;
                    var no_coincide=false;
                    //var x=0;
                    for(var x=0;x<EjesRodillos.length;x++){
                        if(EjesRodillos[x].TuboMadreRod!==rodillo_tubo_madre||EjesRodillos[x].operacion!==rodillo_operacion){
                            no_coincide=true;
                            alert('Los rodillos seleccionados no coinciden en su Ø o su operación');
                            handlerCancelar();
                            break
                        }
                    }
                    if(no_coincide===false){
                        if(colorVerde===true || colorAmarillo===true){ 
                            const confirmacion = window.confirm('Ya tenemos elementos creados originales ¿Deseas cambiarlos?'); //Si tengo ya un juego original para esta formación, no puedo poner otro.
                            if(confirmacion){
                                ActualizarElementoVerde();
                                return;
                            }
                            else{
                                return;
                            }
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

    const ActualizarElementoVerde = () => {
        for(var x=0;x<EjesRodillos.length;x++){
            for(var y=0; y<rodillo_elegido.length;y++){
                if(parseInt(EjesRodillos[x].eje)===rodillo_elegido[y].eje.id && parseInt(EjesRodillos[x].operacion)===rodillo_elegido[y].conjunto.operacion.id){
                    const rodillo_nuevo = EjesRodillos[x];
                    axios.get(BACKEND_SERVER + `/api/rodillos/elemento/?eje=${EjesRodillos[x].eje}`, { //modificamos los elementos.
                       
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                            }     
                    })
                    .then( res => {
                        axios.patch(BACKEND_SERVER + `/api/rodillos/elemento/${res.data[0].id}/`, { //modificamos los elementos.
                            rodillo: rodillo_nuevo.rodillo,
                        }, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                                }     
                        })
                        .then( res => {
                            window.location.href=`/rodillos/grupo_editar/${grupoId}`;
                        })
                        .catch(err => { 
                            console.error(err);
                        })
                    })
                    .catch(err => { 
                        console.error(err);
                    })
                    
                }
                
            }
        }
     }

    const GuardarConjuntoElemento = () => { 
        if(EjesRodillos.length===ejes.length){//cantidad de rodillo igual a cantidad de ejes
            axios.post(BACKEND_SERVER + `/api/rodillos/conjunto/`, { //creamos conjunto, (Operación y Tubo_madre del rodillo).
                operacion: operacion_rod,
                tubo_madre:tubo_madre_rod,
                espesores: espesores_unidos!=='÷'?espesores_unidos:'',
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
            icono: datos.icono_celda,
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

    const ActualizarIcono = (id_bancada) => {
        axios.patch(BACKEND_SERVER + `/api/rodillos/celda/${elementos_formacion[0].id}/`, { //modificamos id imagen
            icono: parseInt(datos.icono_celda),
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
            espesores: grupoEspesor,
            nombre_grupo: operacion_marcada.seccion.nombre + '-' + nombreGrupo,
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
        const [rodilloId, operacion, grupo, eje, espesor_1, espesor_2, grupo_nombre, generico] = selectedValue.split(',');
        const grupoID = grupo;
        const operacion_rodillo = operacion;
        const valores_rodillo = selectedValue;
        const rodillo_id = rodilloId;
        const ejeId_posicion = eje;
        const espesores = espesor_1 + '÷' + espesor_2;
        const nombre_grupo = grupo_nombre;
        const gen = generico;
        setRod_Id(rodillo_id);
        setGrupoId_Rod(grupoID);
        setOperacionRod(operacion_rodillo);
        setEspesores_unidos(espesores);
        setEsGenerico(gen);
        const nuevaSeleccionRodilloId = {...selectRodilloId};
        nuevaSeleccionRodilloId[ejeId_posicion] = valores_rodillo;
        setSelectedEje(ejeId_posicion);
        setSelectRodilloId(nuevaSeleccionRodilloId); //solo lo uso para la posición del rodillo en el conjunto
        setNombreGrupo(nombre_grupo.split('-').slice(1).join('-'))
    }

    const handleInputChange_conjunto = (event) => {
        setDatos(prevDatos => ({
            ...prevDatos,
            conjunto_elegido: event.target.value
        }));
    }

    const handleInputChange_icono = (event) => {
        const { value } = event.target;
        setDatos(prevDatos => ({
            ...prevDatos,
            icono_celda: value
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
                                                type="text"
                                                name={eje.id}
                                                value={
                                                    rodillo_elegido && 
                                                    rodillo_elegido.find(rod => 
                                                        rod.eje.tipo.id === eje.tipo.id 
                                                    )?.rodillo?.nombre || ''
                                                  }
                                                readOnly={true}
                                                placeholder={eje.tipo.nombre}
                                                style={{color: 'red'}}
                                            >
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
                                                {rod_generico && rod_generico.map(rodilloGen => (
                                                    <option key={rodilloGen.id} value={`${rodilloGen.id},${operacion_marcada.id},${grupoId},${eje.id},${rodilloGen.espesor_1},${rodilloGen.espesor_2},${grupo_nom},${rodilloGen.es_generico}`}>
                                                        {rodilloGen.nombre}
                                                    </option>
                                                ))}
                                                {rodillos && rodillos.map(rodillo => {
                                                    if (rodillo.tipo === eje.tipo.id && rodillo.diametro === eje.diametro || rodillo.es_generico===true) {
                                                        return (
                                                            <option key={rodillo.id} value={`${rodillo.id},${rodillo.operacion},${rodillo.grupo.id},${eje.id},${rodillo.espesor_1},${rodillo.espesor_2},${rodillo.grupo.nombre},${rodillo.es_generico}`}>
                                                                {rodillo.nombre}
                                                            </option>
                                                        )
                                                    }
                                                })}
                                            </Form.Control>
                                        </Form.Group>
                                    ))}
                                    {colorVerde || elementos_formacion.length === 0 ? (
                                        <Form.Group controlId="icono_celda">
                                            <Form.Label style={{ color: "red" }}>Icono Celda</Form.Label>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                                {icono_celda &&
                                                    icono_celda.map((icono) => (
                                                        <Button
                                                            key={icono.id}
                                                            variant="light"
                                                            onClick={() =>
                                                                handleInputChange_icono({ target: { name: 'icono_celda', value: icono.id } })
                                                            }
                                                            style={{
                                                                border: datos.icono_celda == icono.id ? "2px solid red" : "1px solid #ccc",
                                                                padding: "5px",
                                                                borderRadius: "5px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                background: datos.icono_celda == icono.id ? "#ffe6e6" : "white",
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            <img
                                                                src={icono.icono}
                                                                alt={icono.nombre}
                                                                title={icono.nombre}
                                                                style={{ width: "30px", height: "30px" }}
                                                            />
                                                        </Button>
                                                    ))}
                                            </div>
                                        </Form.Group>
                                    ) : null}
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
                                                    {conjunto.tubo_madre + ' - ' + conjunto.espesor_1 + '÷' + conjunto.espesor_2}
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
                                                        {conjunto.espesores!==''?conjunto.operacion.nombre + '- Ø'+ conjunto.tubo_madre + '-' + conjunto.espesores : conjunto.operacion.nombre + '- Ø'+ conjunto.tubo_madre}
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
                                                label={bancada.nombre_grupo}
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
                {colorVerde?<Button variant="info" onClick={ActualizarIcono}>Actualizar icono</Button>:<Button variant="info" onClick={Guardar}>Guardar</Button>}
                <Button variant="waring" onClick={handlerCancelar}>Cancelar</Button>
            </Modal.Footer>
        </Modal>
    );
}
export default RodConjunto;