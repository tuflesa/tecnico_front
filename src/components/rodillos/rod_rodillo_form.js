import { Container } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';
import { Button, Form, Col, Row,} from 'react-bootstrap';
import RodParametrosEstandar from './rod_parametros_estandar';
import logo from '../../assets/logo_bornay.svg';
import RodPlanosRodillo from './rod_rodillo_planos';
import RodInstanciasRodillo from './rod_rodillo_instancias';
import RodCrearInstancia from './rod_crear_instancia';

const RodRodilloForm = ({rodillo, setRodillo}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    
    const [empresas, setEmpresas] = useState(null);
    const [zonas, setZonas] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [ejes, setEjes] = useState([]);
    const [operaciones, setOperaciones] = useState([]);
    const [tipo_rodillo, setTipoRodillo] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [parametros, setParametros] = useState(null); // PARAMETROS GUARDADOS
    const [showParametros, setShowParametros] = useState(false);
    const [tipos_planos, setTiposPlanos] = useState(null);
    const [formas, setForma] = useState([]);
    const [, setNoModificar] = useState(false);
    const [no_modificar_tipoplano, setNoModificar_tipoplano] = useState(false);
    const [rodillo_nuevo, setRodilloNuevo] = useState('');
    const [show_instancia, setShowInstancia] = useState(false);

    const [datos, setDatos] = useState({
        empresa: rodillo.id?rodillo.operacion.seccion.maquina.empresa_id:'',
        zona: rodillo.id?rodillo.operacion.seccion.maquina.id:'',
        zona_siglas: rodillo.id?rodillo.operacion.seccion.maquina.siglas:'',
        seccion: rodillo.id?rodillo.operacion.seccion.id: '',
        operacion: rodillo.id?rodillo.operacion.id:'',
        operacion_nombre: rodillo.id?rodillo.operacion.nombre:'',
        grupo: rodillo.grupo?rodillo.grupo.id:'',
        tipo_rodillo: rodillo.id?rodillo.tipo.id:'',
        nombre: rodillo.id?rodillo.nombre:'',
        tipo_seccion: rodillo.id?rodillo.operacion.seccion.tipo:'',
        tipo_plano: rodillo.id?rodillo.tipo_plano:'',
        rodillo_id: rodillo.id?rodillo.id:'',
        diametro: rodillo.id?rodillo.diametro:'', //diámetro interior, mandril del rodillo
        forma: rodillo.id?rodillo.forma:'',
        forma_nombre: '',
        descripcion_perfil: rodillo.id?rodillo.descripcion_perfil:'',
        dimension_perfil: rodillo.id?rodillo.dimension_perfil:'',
        pertenece_grupo:rodillo.id?rodillo.operacion.seccion.pertenece_grupo:'',
        grupo_tubo_madre: rodillo.grupo?rodillo.grupo.tubo_madre:'',
        tipo_rodillo_siglas: rodillo.id?rodillo.tipo.siglas:'',
        espesores: rodillo.id?rodillo.espesor:false,
        espesor_menor: rodillo.id?rodillo.espesor_1:0,
        espesor_mayor: rodillo.id?rodillo.espesor_2:0,
    });

    useEffect(() => { //si hay tipo de plano grabado, no podemos modificarlo, ya tenemos parametros dados de alta
        if(rodillo.tipo_plano){
            setNoModificar_tipoplano(true);
        }
    }, [token]);

    useEffect(() => { // si ya tenemos elemenotos vinculados a este rodillo, no podemos modificar el rodillo.
        rodillo.id && axios.get(BACKEND_SERVER + `/api/rodillos/elemento/?rodillo=${rodillo.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            if(res.data.length>0){
                setNoModificar(true);
            }
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(() => { // buscamos los ejes según la máquina elegida.
        datos.zona && datos.tipo_rodillo && datos.operacion && axios.get(BACKEND_SERVER + `/api/rodillos/eje_operacion/?operacion__seccion__maquina__id=${datos.zona}&operacion__id=${datos.operacion}&tipo=${datos.tipo_rodillo}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEjes(res.data);
            setDatos({
                ...datos,
                diametro: res.data[0].diametro,
            })
        })
        .catch( err => {
            console.log(err);
        });
    }, [datos.operacion, datos.tipo_rodillo, datos.zona]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/rodillos/forma/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setForma(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(() => {
        datos.operacion && axios.get(BACKEND_SERVER + `/api/rodillos/eje_operacion/?operacion__id=${datos.operacion}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setTipoRodillo(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [datos.operacion]);

    useEffect(() => {
        if (datos.empresa === '') {
            setZonas([]);
            setDatos({
                ...datos,
                zona: '',
                seccion: '',
                operacion: '',
                grupo: '',
            });
        }
        else {
            axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setZonas(res.data);
                if(!rodillo.id){
                    setDatos({
                        ...datos,
                        zona: '',
                        seccion: '',
                        operacion: '',
                        grupo: '',
                    });
                }
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.empresa]);

    useEffect(() => {
        if(rodillo.id){
            if(datos.zona!=rodillo.operacion.seccion.maquina.id){
                setOperaciones([]);
                setSecciones([]);
                setGrupos([]);
            }
        }
        if (datos.zona === '') {
            setSecciones([]);
            setOperaciones([]);
            setGrupos([]);
            setDatos({
                ...datos,
                seccion: '',
                operacion:'',
                grupo: '',
            });
        }
        else {
            axios.get(BACKEND_SERVER + `/api/rodillos/seccion/?maquina__id=${datos.zona}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setSecciones(res.data);
                if(!rodillo.id){
                    setOperaciones([]);
                    setDatos({
                        ...datos,
                        seccion: '',
                        operacion: '',
                        grupo: '',
                    });
                }
            })
            .catch( err => {
                console.log(err);
            });

            axios.get(BACKEND_SERVER + `/api/rodillos/grupo_nuevo/?maquina=${datos.zona}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setGrupos(res.data);
                if(res.data.length === 0){
                    alert('No tenemos ningún grupo dado de alta para esta máquina');
                }
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.zona]);

    useEffect(() => {
        if (datos.seccion === ''){
            setOperaciones([]);
            setDatos({
                ...datos,
                operacion: '',
            });
        }
        else{
            axios.get(BACKEND_SERVER + `/api/rodillos/operacion/?seccion__id=${datos.seccion}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setOperaciones(res.data);
                if(!rodillo.id){
                    setDatos({
                        ...datos,
                        operacion: '',
                    });
                }
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.seccion]);

    useEffect(() => {
        datos.tipo_seccion!=='' && datos.tipo_rodillo!=='' && axios.get(BACKEND_SERVER + `/api/rodillos/tipo_plano/?tipo_seccion=${datos.tipo_seccion}&tipo_rodillo=${datos.tipo_rodillo}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setTiposPlanos(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [rodillo.length!==0]);

    useEffect(() => { //recogemos los parámetros que tenemos ya guardados
        if(rodillo.id){
            axios.get(BACKEND_SERVER + `/api/rodillos/parametros_estandar/?rodillo=${rodillo.id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }
            })
            .then( r => {
                setParametros(r.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    },[token, rodillo, showParametros]);

    useEffect(() => { //montamos el nombre cuando tenemos todos los datos.
        if(datos.pertenece_grupo){
            if(!datos.nombre&&datos.zona&&datos.operacion&&datos.tipo_rodillo&&datos.grupo_tubo_madre){
                if(datos.espesores){
                    setDatos({
                        ...datos,
                        nombre:String(datos.zona_siglas+'-'+datos.operacion_nombre+'-'+datos.tipo_rodillo_siglas+'-'+'Ø'+datos.grupo_tubo_madre+'-'+datos.espesor_menor+'÷'+datos.espesor_mayor),
                    }) 
                }
                else{
                    setDatos({
                        ...datos,
                        nombre:String(datos.zona_siglas+'-'+datos.operacion_nombre+'-'+datos.tipo_rodillo_siglas+'-'+'Ø'+datos.grupo_tubo_madre),
                    })
                }
            }
        }
        else{
            if(datos.forma_nombre==='Redondo'){
                if(!datos.nombre&&datos.zona_siglas&&datos.operacion_nombre&&datos.tipo_rodillo_siglas&&datos.dimension_perfil){
                    if(datos.espesores){
                        setDatos({
                            ...datos,
                            nombre:String(datos.zona_siglas+'-'+datos.operacion_nombre+'-'+datos.tipo_rodillo_siglas+'-'+'Ø'+datos.dimension_perfil+'-'+datos.espesor_menor+'÷'+datos.espesor_mayor),
                        })
                    }
                    else{
                        setDatos({
                            ...datos,
                            nombre:String(datos.zona_siglas+'-'+datos.operacion_nombre+'-'+datos.tipo_rodillo_siglas+'-'+'Ø'+datos.dimension_perfil),
                        })
                    }
                }
            }
            else{
                if(!datos.nombre&&datos.zona_siglas&&datos.operacion_nombre&&datos.tipo_rodillo_siglas&&datos.descripcion_perfil){
                    if(datos.espesores){
                        setDatos({
                            ...datos,
                            nombre:String(datos.zona_siglas+'-'+datos.operacion_nombre+'-'+datos.tipo_rodillo_siglas+'-'+datos.descripcion_perfil+'-'+datos.espesor_menor+'÷'+datos.espesor_mayor),
                        }) 
                    }
                    else{
                        setDatos({
                            ...datos,
                            nombre:String(datos.zona_siglas+'-'+datos.operacion_nombre+'-'+datos.tipo_rodillo_siglas+'-'+datos.descripcion_perfil),
                        })
                    }
                }
            }
        }
    },[datos, datos.tipo_rodillo_siglas, datos.espesor_menor, datos.espesor_mayor]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value,
            nombre: '',
        })
    }

    const handleInputChangeSeccion = (event) => {
        const [valorId, valorPertenece_grupo] = event.target.value.split(',');// Ahora, seccion_id y seccion_nombre contienen los dos valores separados        
        setDatos((prevDatos)=>({
            ...prevDatos,
            seccion : parseInt(valorId),
            pertenece_grupo: valorPertenece_grupo==="true"?true:false,
            nombre: '',
            operacion: '',
        }));
    };

    const handleInputChangeZona = (event) => {
        const [Id, siglas] = event.target.value.split(',');      
        setDatos((prevDatos)=>({
            ...prevDatos,
            zona : parseInt(Id),
            zona_siglas: siglas,
            nombre: '',
        }));
    };

    const GuardarRodillo = (event) => {
        event.preventDefault();
        axios.get(BACKEND_SERVER + `/api/rodillos/rodillos/?nombre=${datos.nombre}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then(res => {
            if(res.data.length!==0){
                alert('Este rodillo ya existe');
            }
            else{
                axios.post(BACKEND_SERVER + `/api/rodillos/rodillo_nuevo/`, {
                    nombre: datos.nombre,
                    operacion: datos.operacion,
                    grupo: datos.grupo,
                    tipo: datos.tipo_rodillo,
                    tipo_plano: datos.tipo_plano,
                    diametro: datos.diametro,
                    forma: parseInt(datos.forma),
                    descripcion_perfil: datos.descripcion_perfil,
                    dimension_perfil: datos.dimension_perfil,
                    espesor: datos.espesores,
                    espesor_1: datos.espesor_menor,
                    espesor_2: datos.espesor_mayor,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                        }     
                })
                .then( res => { 
                    setRodilloNuevo(res.data);
                    añadirInstancia();
                    //window.location.href = `/rodillos/editar/${res.data.id}`; 
                })
                .catch(err => { 
                    console.log(err);
                    alert('Falta datos, por favor rellena todo los datos que tengan *');
                })
            }
        })
        .catch( err => {
            console.log(err);
        });
        
    };

    const ActualizarRodillo = (event) => {
        event.preventDefault();
        axios.patch(BACKEND_SERVER + `/api/rodillos/rodillo_editar/${rodillo.id}/`, {
            nombre: datos.nombre,
            operacion: datos.operacion,
            grupo: datos.grupo,
            tipo: datos.tipo_rodillo,
            tipo_plano: datos.tipo_plano,
            diametro: datos.diametro,
            forma: parseInt(datos.forma),
            descripcion_perfil: datos.descripcion_perfil,
            dimension_perfil: datos.dimension_perfil,
            espesor: datos.espesores,
            espesor_1: datos.espesor_menor,
            espesor_2: datos.espesor_mayor,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => { 
            if(rodillo.tipo_plano===null && res.data.tipo_plano!==null){//si estamos actualizando el tipo de plano, ponemos los parámentros.
                axios.get(BACKEND_SERVER + `/api/rodillos/plano_parametros/${res.data.tipo_plano}`,{
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                        }
                })
                .then( re => { //tenemos los nombres de los parametros con re.data.nombres
                    for(var x=0;x<re.data.nombres.length;x++){ //damos de alta los parámetros con valor 0
                        axios.post(BACKEND_SERVER + `/api/rodillos/parametros_estandar/`, {
                            nombre: re.data.nombres[x].nombre,
                            rodillo: rodillo.id,
                            valor: 0,
                        }, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                                }     
                        })
                        .then( r => { 
                            window.location.href = `/rodillos/editar/${rodillo.id}`; 
                        })
                        .catch(err => { 
                            console.error(err);
                        });
                    }
                })
                .catch( err => {
                    console.log(err);
                });
            }
            alert('Actualizado correctamente');
        })
        .catch(err => { 
            console.log(err);
            if(datos.dimension_perfil.length>2){
                alert('La longitud del campo Dimensión de perfil, no es correcta');
            }
            else{
                alert('Falta datos, por favor rellena todo los datos que tengan *');
            }
        })
    };

    const añadirInstancia = () => {
        setShowInstancia(true);
    }

    const cerrarInstancia = () => {
        setShowInstancia(false);
    }

    const añadirParametros = () => {
        setShowParametros(true);
    }

    const cerrarParametros = () => {
        setShowParametros(false);
    }

    const handleInputChangeGrupo = (event) => {
        const [id, madre] = event.target.value.split(',');
        setDatos({
            ...datos,
            grupo : id,
            grupo_tubo_madre: madre,
            nombre: '',
        });
    };

    const handleInputChangeTipo = (event) => {
        const [id, siglas] = event.target.value.split(',');
        setDatos({
            ...datos,
            tipo_rodillo : id,
            tipo_rodillo_siglas: siglas,
            nombre: '',
        });
    };

    const handleInputChangeOperacion = (event) => {
        const [id, nombre] = event.target.value.split(',');
        setDatos({
            ...datos,
            operacion : id,
            operacion_nombre: nombre,
            nombre: '',
        });
    };

    const handleInputChangeFormaPerfil = (event) => {
        const [id, nombre] = event.target.value.split(',');
        setDatos({
            ...datos,
            forma : id,
            forma_nombre: nombre,
            nombre: '',
        });
    };

    const handleInputespesores = (event) => {
        setDatos({
            ...datos,
            espesores : !datos.espesores
        })
    }

    const styles = {
        textAlign: 'right',
        color: 'red',
        fontSize: 'smaller'}

    return (
        <Container className='mt-5 pt-1'>
            <img src ={logo} width="200" height="200"></img>
            {rodillo.length===0?
                <h5 className='mt-5'>Nuevo Rodillo</h5>:
                <h5 className='mt-5'>Editar Rodillo</h5>}
            <Form >
                <Row>
                    <Form.Group controlId="nombre">
                        <Form.Label>Nombre del rodillo</Form.Label>
                        <Form.Control type="text" 
                                    className="input-auto-width"
                                    name='nombre' 
                                    value={datos.nombre}
                                    onChange={handleInputChange} 
                                    placeholder="Nombre Rodillo"
                                    disabled
                        />
                    </Form.Group>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa *</Form.Label>
                            <Form.Control as="select"  
                                        name='empresa' 
                                        value={datos.empresa}
                                        onChange={handleInputChange}
                                        disabled={rodillo.id?true:false}
                                        placeholder="Empresa"
                                        autoFocus>
                                        <option key={0} value={''}>Todas</option>    
                                        {empresas && empresas.map( empresa => {
                                            return (
                                            <option key={empresa.id} value={empresa.id}>
                                                {empresa.nombre}
                                            </option>
                                            )
                                        })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="zona">
                            <Form.Label>Zona *</Form.Label>
                            <Form.Control as="select" 
                                            value={rodillo.id ? datos.zona :`${datos.zona},${datos.zona_siglas}`}
                                            name='zona'
                                            onChange={handleInputChangeZona}
                                            disabled={rodillo.id?true:false}>
                                <option key={0} value={''}>Todas</option>
                                {zonas && zonas.map( zona => {
                                    return (
                                    <option key={zona.id} value={rodillo.id ? zona.id : `${zona.id},${zona.siglas}`}>
                                        {zona.siglas}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="seccion">
                            <Form.Label>Seccion *</Form.Label>
                            <Form.Control as="select" 
                                            value={rodillo.id ? datos.seccion :`${datos.seccion},${datos.pertenece_grupo}`}
                                            name='seccion'
                                            onChange={handleInputChangeSeccion}
                                            disabled={rodillo.id?true:false}>
                                        <option key={0} value={''}>Todas</option>
                                        {secciones && secciones.map( seccion => {
                                            return (
                                            <option key={seccion.id} value={rodillo.id ? seccion.id : `${seccion.id},${seccion.pertenece_grupo}`}>
                                                {seccion.nombre}
                                            </option>
                                            )
                                        })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="operacion">
                            <Form.Label>Operación *</Form.Label>
                            <Form.Control as="select" 
                                            value={rodillo.id ? datos.operacion :`${datos.operacion},${datos.operacion_nombre}`}
                                            name='operacion'
                                            onChange={handleInputChangeOperacion}
                                            disabled={rodillo.id?true:false}>
                                <option key={0} value={''}>Todos</option>
                                {operaciones && operaciones.map( operacion => {
                                    return (
                                    <option key={operacion.id} value={rodillo.id? operacion.id : `${operacion.id},${operacion.nombre}`}>
                                        {operacion.nombre}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                {datos.seccion?
                <React.Fragment>
                    {datos.pertenece_grupo===false?
                        <Row>
                            <Col>
                                <Form.Group controlId="forma">
                                    <Form.Label>Formas del perfil</Form.Label>
                                    <Form.Control as="select" 
                                                    value={rodillo.id? datos.forma :`${datos.forma},${datos.forma_nombre}`}
                                                    name='forma'
                                                    onChange={handleInputChangeFormaPerfil}
                                                    disabled={rodillo.id?true:false}>
                                        <option key={0} value={''}>Todos</option>
                                        {formas && formas.map( forma => {
                                            return (
                                            <option key={forma.id} value={rodillo.id? forma.id : `${forma.id},${forma.nombre}`}>
                                                {forma.nombre}
                                            </option>
                                            )
                                        })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="descripcion_perfil">
                                    <Form.Label>Descripción del perfil</Form.Label>
                                    <Form.Control type="text" 
                                                    name='descripcion_perfil'
                                                    value={datos.descripcion_perfil}
                                                    onChange={handleInputChange}
                                                    placeholder='Descripción del perfil'
                                                    disabled={rodillo.id?true:false}>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="dimension_perfil">
                                    <Form.Label>Dimensión del perfil</Form.Label>
                                    <Form.Control type="text" 
                                                    name='dimension_perfil'
                                                    value={datos.dimension_perfil}
                                                    onChange={handleInputChange}
                                                    placeholder='Dimensión del perfil'
                                                    disabled={rodillo.id?true:false}>
                                    </Form.Control>
                                </Form.Group>
                            </Col>                    
                        </Row>
                        :''}
                    <Row>
                        {datos.pertenece_grupo?
                            <Col>
                                <Form.Group controlId="grupo">
                                    <Form.Label>Grupo al que pertenece</Form.Label>
                                    <Form.Control as="select" 
                                                    value={rodillo.id ? datos.grupo :`${datos.grupo},${datos.grupo_tubo_madre}`}
                                                    name='grupo'
                                                    onChange={handleInputChangeGrupo}
                                                    disabled={rodillo.id?true:false}>
                                            <option key={0} value={''}>Todos</option>
                                            {grupos && grupos.map(grupo => {
                                                
                                                    return (
                                                    <option key={grupo.id} value={rodillo.id ? grupo.id : `${grupo.id},${grupo.tubo_madre}`}>
                                                        {grupo.nombre}
                                                    </option>
                                                    )
                                            })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        :''}
                        <Col>
                            <Form.Group controlId="tipo_rodillo">
                                <Form.Label>Tipo de Rodillo *</Form.Label>
                                <Form.Control as="select" 
                                                value={rodillo.id ? datos.tipo_rodillo :`${datos.tipo_rodillo},${datos.tipo_rodillo_siglas}`}
                                                name='tipo_rodillo'
                                                onChange={handleInputChangeTipo}
                                                disabled={rodillo.id?true:false}>
                                    <option key={0} value={''}>Todos</option>
                                    {tipo_rodillo && tipo_rodillo.map( tipo => {
                                        return (
                                        <option key={tipo.tipo.id} value={rodillo.id ? tipo.tipo.id : `${tipo.tipo.id},${tipo.tipo.siglas}`}>
                                            {tipo.tipo.nombre}
                                        </option>
                                        )
                                    })}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="diametro">
                            <Form.Label>Diametro del eje</Form.Label>
                            <Form.Control type="text" 
                                        name='diametro' 
                                        value={datos.diametro}
                                        onChange={handleInputChange} 
                                        placeholder="Diametro"
                                        disabled
                            />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3" controlId="espesores">
                                <Form.Check type="checkbox" 
                                            label="¿Rango de espesores?"
                                            checked = {datos.espesores}
                                            onChange = {handleInputespesores} />
                            </Form.Group>
                        </Col>
                        {datos.espesores?
                            <Col>
                                <Form.Group controlId="espesor_menor">
                                    <Form.Label>Rango espesor menor</Form.Label>
                                    <Form.Control type="text" 
                                                    name='espesor_menor'
                                                    value={datos.espesor_menor}
                                                    onChange={handleInputChange}
                                                    placeholder='Rango espesores'>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        : ''}
                        {datos.espesores?
                            <Col>
                                <Form.Group controlId="espesor_mayor">
                                    <Form.Label>Rango espesor mayor</Form.Label>
                                    <Form.Control type="text" 
                                                    name='espesor_mayor'
                                                    value={datos.espesor_mayor}
                                                    onChange={handleInputChange}
                                                    placeholder='Rango espesores'>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        :''}
                        {rodillo.length!==0?
                            <Col>
                                <Form.Group controlId="tipo_plano" >
                                    <Form.Label style={{color:'red'}}>Tipo de plano</Form.Label>
                                    <Form.Control as="select" 
                                                    style={{color:'red'}}
                                                    value={datos.tipo_plano}
                                                    name='tipo_plano'
                                                    onChange={handleInputChange}
                                                    disabled={no_modificar_tipoplano?true:false}>
                                        <option key={0} value={0}>Ninguno</option>
                                        {tipos_planos && tipos_planos.map( tipo => {
                                            return (
                                            <option key={tipo.id} value={tipo.id}>
                                                {tipo.nombre}
                                            </option>
                                            )
                                        })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        :''}
                    </Row>
                </React.Fragment>
                :''}
                <h5 style={styles}>Si tenemos espesores, solo se permite el punto para poner el decimal, no guardará si ponemos comas</h5>
                {rodillo.length!==0?
                    <Row style={{marginBottom:'10px'}}>
                        <Col style={{color:'red'}}>Debemos introducir el tipo de plano y actualizar, si queremos añadir un plano ya creado</Col>
                    </Row>
                :''}
                <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
                {rodillo?rodillo.length===0?<Button variant="outline-primary" onClick={GuardarRodillo}>Guardar</Button>:<Button variant="outline-primary" onClick={ActualizarRodillo}>Actualizar</Button>:''}
                {rodillo.tipo_plano?parametros?parametros.length===0?<Button className={'mx-2'} onClick={añadirParametros}>Añadir Parámetros</Button>:<Button className={'mx-2'} onClick={añadirParametros}>Editar Parámetros</Button>:'':''}
            </Form>

            <RodPlanosRodillo
                    rodillo={rodillo}
                    rodillo_nuevo={rodillo_nuevo}
                    tipo_plano_id={datos.tipo_plano}/>

            <RodInstanciasRodillo
                    rodillo={rodillo}/>

            <RodCrearInstancia show={show_instancia}
                            setShow={setShowInstancia}
                            rodillo_id={rodillo_nuevo.id}
                            rodillo={rodillo_nuevo}
                            handleClose={cerrarInstancia}
                            instancias_length={1}/>
            
            <RodParametrosEstandar showPa={showParametros}
                           tipo_plano_id={datos.tipo_plano}
                           rodillo_id={rodillo.id}
                           rodillo_inf={rodillo}
                           handlerClose={cerrarParametros}
                           parametros_intro={parametros}/>

        </Container>
    );
}
export default RodRodilloForm;