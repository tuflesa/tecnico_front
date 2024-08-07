import { Container } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';
import { Button, Form, Col, Row, Table } from 'react-bootstrap';
import { PlusCircle, Clipboard, Trash} from 'react-bootstrap-icons';
import PlanoForm from './rod_plano_nuevo';
import {invertirFecha} from '../utilidades/funciones_fecha';
import RodRevisionForm from './rod_revision_form';
import RodParametrosEstandar from './rod_parametros_estandar';
import logo from '../../assets/logo_bornay.svg';

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
    const [planos, setPlanos] = useState(null);
    const [valor_conjuntos, setValorConjuntos] = useState('');
    const [show, setShow] = useState(false);
    const [filaSeleccionada, setFilaSeleccionada] = useState(null);
    const [, setRevisiones] = useState(null);
    const [parametros, setParametros] = useState(null); // PARAMETROS GUARDADOS
    const [plano_id, setPlano_id] = useState(null);
    const [plano_nombre, setPlano_nombre] = useState(null);
    const [showRevision, setShowRevision] = useState(false);
    const [showParametros, setShowParametros] = useState(false);
    const [tipos_planos, setTiposPlanos] = useState(null);
    const [formas, setForma] = useState([]);
    const [no_modificar, setNoModificar] = useState(false);
    const [no_modificar_tipoplano, setNoModificar_tipoplano] = useState(false);
    
    const [show_plano, setShowPlano] = useState(false);

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
        if(rodillo.id){
            axios.get(BACKEND_SERVER + `/api/rodillos/plano/?rodillos=${rodillo.id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }
            })
            .then( res => {
                setPlanos(res.data);
                if(res.data.length!==0){
                    setNoModificar(true);
                }
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, rodillo]);

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
                setDatos({
                    ...datos,
                    nombre:String(datos.zona_siglas+'-'+datos.operacion_nombre+'-'+datos.tipo_rodillo_siglas+'-'+'Ø'+datos.grupo_tubo_madre),
                })
            }
        }
        else{
            if(datos.forma_nombre==='Redondo'){
                if(!datos.nombre&&datos.zona_siglas&&datos.operacion_nombre&&datos.tipo_rodillo_siglas&&datos.dimension_perfil){
                    setDatos({
                        ...datos,
                        nombre:String(datos.zona_siglas+'-'+datos.operacion_nombre+'-'+datos.tipo_rodillo_siglas+'-'+'Ø'+datos.dimension_perfil),
                    })
                }
            }
            else{
                if(!datos.nombre&&datos.zona_siglas&&datos.operacion_nombre&&datos.tipo_rodillo_siglas&&datos.descripcion_perfil){
                    setDatos({
                        ...datos,
                        nombre:String(datos.zona_siglas+'-'+datos.operacion_nombre+'-'+datos.tipo_rodillo_siglas+'-'+datos.descripcion_perfil),
                    })
                }
            }
        }
    },[datos, datos.tipo_rodillo_siglas]);

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
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                        }     
                })
                .then( res => { 
                    window.location.href = `/rodillos/editar/${res.data.id}`;
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

    const añadirPlano = () => {
        setShowPlano(true);
    }

    const añadirParametros = () => {
        setShowParametros(true);
    }

    const cerrarParametros = () => {
        setShowParametros(false);
    }

    const cerrarPlano = () => {
        setShowPlano(false);
    }

    const abrirConjuntos = (plano) => {        
        axios.get(BACKEND_SERVER + `/api/rodillos/revision_conjuntos/?plano=${plano}`,{ //REVISIONES DE LOS PLANOS
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setRevisiones(res.data);
            setShow(!show);                          
            if(show){
                const tabla = (
                    <div>
                    <h2 style={{textAlign: 'center'}}>Revisiones del plano</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Motivo</th>
                                <th>Nombre</th>
                                <th>Archivo</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {res.data && res.data.map( conjunto => {
                                return (
                                    <React.Fragment key={conjunto.id}>
                                        <tr key={conjunto.id}>
                                            <td>{conjunto.motivo}</td>
                                            <td>{conjunto.nombre}</td>
                                            <td>
                                                <a href={conjunto.archivo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Haz clic para abrir el PDF">
                                                {conjunto.archivo}
                                                </a>
                                            </td>
                                            
                                            <td>{invertirFecha(String(conjunto.fecha))}</td>
                                        </tr>
                                        {/* {filaSeleccionadaParametros === conjunto.id && (
                                            <tr>
                                                <td colSpan="3">{valor_parametros}</td>
                                            </tr>
                                        )} */}
                                    </React.Fragment>
                                )})
                            }
                        </tbody>
                    </Table>
                    </div>
                );
                setValorConjuntos(tabla);
                setFilaSeleccionada(plano);
            }
            else{
                setValorConjuntos('');
                setFilaSeleccionada('');
                setRevisiones(null);
            }
        })
        .catch( err => {
            console.log(err);
        });
        
        
    };

    const eliminarPlano = (plano) => { 
        var confirmacion = window.confirm('¿Confirma que desea eliminar este plano, en este rodillo?');
        if(confirmacion){
            for(var x=0;x<plano.rodillos.length;x++){
                if(plano.rodillos[x]===datos.rodillo_id){
                    plano.rodillos.splice(x,1); //elimina el elemento que cumple la condición.
                }
            }
            if(plano.rodillos.length===0){
                var eliminacion = window.confirm('Este plano no está en otro rodillo, va a eliminar el plano. ¿Desea continuar?');
                if(eliminacion){
                    axios.delete(BACKEND_SERVER + `/api/rodillos/plano/${plano.id}/`,{
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                            }
                    })
                    .then( res => {
                        window.location.href = `/rodillos/editar/${rodillo.id}`; 
                    })
                    .catch( err => {
                        console.log(err);
                    });
                }
            }
            else{
                axios.patch(BACKEND_SERVER + `/api/rodillos/plano/${plano.id}/`, {
                    rodillos: plano.rodillos,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                        }     
                })
                .then( res => { 
                    window.location.href = `/rodillos/editar/${rodillo.id}`;
                })
                .catch(err => { 
                    console.log(err);
                })
            }
            
        }    
    };

    const NuevaRevision = (plano) => {
        setPlano_id(plano.id);
        setPlano_nombre(plano.nombre);
        setShowRevision(true);
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
                {rodillo.length!==0?
                    <Row style={{marginBottom:'10px'}}>
                        <Col style={{color:'red'}}>Debemos introducir el tipo de plano y actualizar, si queremos añadir un plano ya creado</Col>
                    </Row>
                :''}
                <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
                {rodillo?rodillo.length===0?<Button variant="outline-primary" onClick={GuardarRodillo}>Guardar</Button>:<Button variant="outline-primary" onClick={ActualizarRodillo}>Actualizar</Button>:''}
                {rodillo.tipo_plano?parametros?parametros.length===0?<Button className={'mx-2'} onClick={añadirParametros}>Añadir Parámetros</Button>:<Button className={'mx-2'} onClick={añadirParametros}>Editar Parámetros</Button>:'':''}
                {rodillo.length!==0?
                    <React.Fragment> 
                        <Form.Row>
                        <Col>
                            <Row>
                                <Col>
                                <h5 className="pb-3 pt-1 mt-2">Añadir Plano:</h5>
                                </Col>
                                <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                        <PlusCircle className="plus mr-2" size={30} onClick={añadirPlano}/>
                                </Col>
                            </Row>
                        </Col>
                        </Form.Row>
                    </React.Fragment>
                :null}
            </Form>
            {planos?planos.length!==0?
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Revisiones</th>
                            <th>Nombre</th>
                            <th>Cod Antiguo</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        { planos && planos.map( plano => {
                            return (
                                <React.Fragment key={plano.id}>
                                    <tr key={plano.id}>
                                        <td>
                                            <button type="button" className="btn btn-default" value={plano.id} name='prueba' onClick={event => {abrirConjuntos(plano.id)}}>--</button>
                                        </td>
                                        <td>{plano.nombre}</td>
                                        <td>{plano.cod_antiguo}</td>
                                        <td>{plano.descripcion}</td>
                                        <td>
                                            <Clipboard className="mr-3 pencil" onClick={event => {NuevaRevision(plano)}}/>   
                                            <Trash className="mr-3 pencil" onClick={event => {eliminarPlano(plano)}}/>                                                      
                                        </td>
                                    </tr>
                                    {filaSeleccionada === plano.id && (
                                        <tr>
                                            <td colSpan="4">{valor_conjuntos}</td>
                                        </tr>
                                        )}
                                </React.Fragment>
                            )})
                        }
                    </tbody>
                </Table>
            :"No hay planos relacionados con este rodillo":null}
            
            <PlanoForm show={show_plano}
                           handleCloseParametros={cerrarPlano}
                           rodillo_id={rodillo.id}
                           rodillo={rodillo}
                           plano_length = {planos?planos.length:0}/>
            
            <RodRevisionForm showRev={showRevision}
                           plano_id={plano_id}
                           plano_nombre={plano_nombre}
                           setShowRevision={setShowRevision}
                           show_revision={showRevision}
                           tipo_plano_id={datos.tipo_plano}
                           rodillo_id={rodillo.id}
                           rodillo={rodillo}/>
            
            <RodParametrosEstandar showPa={showParametros}
                           tipo_plano_id={datos.tipo_plano}
                           rodillo_id={rodillo.id}
                           rodillo_inf={rodillo}
                           handleClose={cerrarParametros}
                           parametros_intro={parametros}/>

        </Container>
    );
}
export default RodRodilloForm;