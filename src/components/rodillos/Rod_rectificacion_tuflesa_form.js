import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Container } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import RodBuscarInstanciaCodBarras from './rod_buscar_instancia_codbarras';
import logo from '../../assets/Bornay.svg';
import logoTuf from '../../assets/logo_tuflesa.svg';

const RodRectificacion_TuflesaForm = ({rectificacion, setRectificacion, lineas_rectificandose, setLineasRectificandose}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [hoy] = useState(new Date());
    const [hoy_10] = useState(() => {
        const fecha = new Date(hoy); // Crea una copia de hoy
        fecha.setDate(fecha.getDate() + 10); // Suma 10 días
        return fecha; // Devuelve la nueva fecha
    });
    const [zonas, setZonas] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [cambioCodigo, setCambioCodigo] = useState(false);
    const [show_list_rodillos, setShowListRodillos] = useState(null);
    const [rectificacion_nueva, setRectificacion_nueva] = useState([]);
    const [rectificados_pendientes, setRectificadosPendientes] = useState([]); //ya manadados a rectificar
    const visible = user['tec-user'].perfil.puesto.nombre==='Técnico'||user['tec-user'].perfil.puesto.nombre==='Director Técnico'?true:rectificacion?false:true;
    const [proveedores, setProveedores] = useState([]);

    const [datos, setDatos] = useState({
        id: rectificacion? rectificacion.id : '',
        empresa: rectificacion? rectificacion.empresa: user['tec-user'].perfil.empresa.id,
        zona: rectificacion? rectificacion.maquina.id: user['tec-user'].perfil.zona?user['tec-user'].perfil.zona.id:'',
        numero: rectificacion?rectificacion.numero:'',
        creado_por: rectificacion?rectificacion.creado_por.get_full_name:user['tec-user'].get_full_name,
        fecha: rectificacion?rectificacion.fecha: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()===31?(hoy.getDate()-1):(hoy.getDate())).padStart(2,'0')),
        linea: false,
        id_instancia:'',
        activado: rectificacion?true:false,
        disabled: rectificacion?rectificacion.finalizado?true:false:false,
        finalizado: rectificacion?rectificacion.finalizado:false,
        proveedor: lineas_rectificandose?lineas_rectificandose[0].proveedor.id:'',
        fecha_estimada: rectificacion?rectificacion.fecha_estimada 
            : (hoy_10.getFullYear() + '-' + 
            String(hoy_10.getMonth() + 1).padStart(2, '0') + '-' + 
            String(hoy_10.getDate()).padStart(2, '0')),

            });

    const [numeroBar, setNumeroBar] = useState({
        id_instancia: '',
        idCod: '',
    });

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/proveedor/?de_rectificado=${true}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setProveedores(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(() => {
        const handleEnterKey = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Anula el comportamiento por defecto del Enter (submit)
            }
        };
    
        document.addEventListener('keydown', handleEnterKey);
    
        return () => {
            document.removeEventListener('keydown', handleEnterKey);
        };
    }, []);

    useEffect(() => {
        datos.zona && axios.get(BACKEND_SERVER + `/api/rodillos/listado_linea_rectificacion/?instancia__rodillo__operacion__seccion__maquina__id=${datos.zona}&finalizado=${false}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setRectificadosPendientes(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, datos.zona]);
    

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
        setDatos({
            ...datos,
            id_instancia: '',
        });
    }, [cambioCodigo]);

    useEffect(() => {
        if (datos.empresa === '') {
            setZonas([]);
            setDatos({
                ...datos,
                maquina: '',
            });
        }
        else {
            axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}&es_maquina_tubo=${true}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setZonas(res.data);
                setDatos({
                    ...datos,
                    maquina: '',
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.empresa]);

    const GuardarRectificacion = (event) => {
        event.preventDefault();
        if((datos.empresa === "2" && datos.proveedor.trim() !== '') || datos.empresa!=="2"){
            axios.post(BACKEND_SERVER + `/api/rodillos/rectificacion_nueva/`, {
                empresa: datos.empresa,
                fecha: datos.fecha,
                creado_por: user['tec-user'].id,
                maquina: datos.zona,
                finalizado: false,
                fecha_estimada: datos.fecha_estimada,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }     
            })
            .then( res => { 
                setDatos({
                    ...datos,
                    linea : true,
                    numero : res.data.numero,
                    id : res.data.id,
                    activado : true,
                })
                setRectificacion_nueva(res.data);
            })
            .catch(err => { console.log(err);})
        }
        else{
            alert('Debes de indicar un proveedor.');
        }
    }
    
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleInputChange_estimada = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
        if(datos.activado){
            axios.patch(BACKEND_SERVER + `/api/rodillos/rectificacion_nueva/${datos.id}/`, {
                fecha_estimada: event.target.value,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }     
            })
            .then( res => { 
                alert('Ficha actualizada');
            })
            .catch(err => { console.log(err);})
        }
        setCambioCodigo(!cambioCodigo);
    }

    const handleInputChangeCodBarras = (event) => { 
        setNumeroBar ({
            ...numeroBar,
            [event.target.name] : event.target.value                
        });
        if(numeroBar.id_instancia.length===11){
            setDatos({
                ...datos,
                id_instancia: parseInt(numeroBar.id_instancia),
            });
            setNumeroBar({
                ...numeroBar,
                id_instancia: ''
            });
            setCambioCodigo(!cambioCodigo);
        }
    }

    const abrirListRodillos = () => {
        setShowListRodillos(true);
    }

    const cerrarListRodillos = () => {
        setShowListRodillos(false);
    }

    const handleFinalizado = (event) => {
        setDatos({
            ...datos,
            finalizado : !datos.finalizado
        })
    }

    return(
        <Container className='mt-5 pt-1'>
            <img src ={user['tec-user'].perfil.empresa.id===1?logo:logoTuf} width="200" height="200"></img>
            <Form >
                <Row>
                    {rectificacion? <h5>Rectificado</h5> : <h5>Nueva orden de Rectificado</h5>}
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="numero">
                            <Form.Label>Numero Rectificado</Form.Label>
                            <Form.Control type="text" 
                                        name='numero' 
                                        disabled
                                        value={datos.numero}/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="nombre">
                            <Form.Label>Creado por:</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.creado_por} 
                                        placeholder="Creado por"
                                        disabled
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="proveedor">
                            <Form.Label>Proveedor *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.proveedor}
                                            name='proveedor'
                                            onChange={handleInputChange}
                                            disabled = {datos.activado}>
                                <option key={0} value={''}>Todas</option>
                                {proveedores && proveedores.map( proveedor => {
                                    return (
                                    <option key={proveedor.id} value={proveedor.id}>
                                        {proveedor.nombre}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.empresa}
                                            name='empresa'
                                            onChange={handleInputChange}
                                            disabled = {datos.activado}>
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
                                            value={datos.zona}
                                            name='zona'
                                            onChange={handleInputChange}
                                            disabled = {datos.activado}>
                                <option key={0} value={''}>Todas</option>
                                {zonas && zonas.map( zona => {
                                    return (
                                    <option key={zona.id} value={zona.id}>
                                        {zona.siglas}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha">
                            <Form.Label>Fecha *</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha' 
                                        value={datos.fecha}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha creación" 
                                        disabled={datos.disabled}/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha_estimada">
                            <Form.Label>Fecha Estimada*</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_estimada' 
                                        value={datos.fecha_estimada}
                                        onChange={handleInputChange_estimada} 
                                        placeholder="Fecha estimada"/>
                        </Form.Group>
                    </Col>
                    {datos.finalizado?
                        <Col className="d-flex align-items-end">
                            <Form.Group className="mb-3" controlId="finalizado">
                                <Form.Check type="checkbox" 
                                            label="Finalizado"
                                            checked = {datos.finalizado}
                                            disabled
                                            onChange = {handleFinalizado} />
                            </Form.Group>
                        </Col>
                    :''}
                </Row>
                <Form.Row className="justify-content-center">
                    {datos.activado===false? 
                        <Button variant="info" type="submit" className={'mx-2'} onClick={GuardarRectificacion}>Guardar</Button>:''
                    }
                    {lineas_rectificandose?
                        <Button variant="info" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>:null
                    }
                </Form.Row> 
            </Form>
            {datos.linea || rectificacion && !datos.disabled ?
                <Form>     
                    <Row>   
                        {visible?         
                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label className="mt-2">Codigo Barras (con lector) </Form.Label>
                                    <Form.Control
                                                type="text"
                                                id="id_instancia"
                                                tabIndex={2}
                                                name='id_instancia' 
                                                value={numeroBar.id_instancia}
                                                onChange={handleInputChangeCodBarras}
                                                placeholder="Codigo de barras" 
                                                autoFocus/>
                                </Form.Group>
                            </Col>
                        :''}
                        {visible?
                            <Col xs={6} className="d-flex flex-column">
                                <Button variant="info" className={'mt-auto mx-2'} onClick={abrirListRodillos}>Buscar Rodillo</Button> 
                            </Col>
                        :''}
                    </Row>  
                </Form>
            : null}
            <RodBuscarInstanciaCodBarras
                    datos={datos}
                    rectificacion={rectificacion_nueva.length!==0?rectificacion_nueva:rectificacion}
                    numeroBar={numeroBar}
                    setNumeroBar={setNumeroBar}
                    cambioCodigo={cambioCodigo}
                    show_list_rodillos={show_list_rodillos}
                    cerrarListRodillos={cerrarListRodillos}
                    rectificados_pendientes={rectificados_pendientes}
                    lineas_rectificandose={lineas_rectificandose}
                    setLineasRectificandose={setLineasRectificandose}
                    proveedor={datos.proveedor}/>
        </Container>
    );
}
export default RodRectificacion_TuflesaForm;