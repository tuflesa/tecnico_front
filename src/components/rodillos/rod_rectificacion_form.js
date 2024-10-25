import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Container } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import RodBuscarInstanciaCodBarras from './rod_buscar_instancia_codbarras';

const RodRectificacionForm = ({rectificacion, setRectificacion}) => {
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

    const [datos, setDatos] = useState({
        id: rectificacion? rectificacion.id : '',
        empresa: rectificacion? rectificacion.empresa: user['tec-user'].perfil.empresa.id,
        zona: rectificacion? rectificacion.maquina.id: '',
        numero: rectificacion?rectificacion.numero:'',
        creado_por: rectificacion?rectificacion.creado_por.get_full_name:user['tec-user'].id,
        fecha: rectificacion?rectificacion.fecha: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()===31?(hoy.getDate()-1):(hoy.getDate())).padStart(2,'0')),
        linea: false,
        id_instancia:'',
        activado: rectificacion?true:false,
        finalizado: rectificacion?rectificacion.finalizado:false,
        fecha_estimada: rectificacion 
            ? (function() {
                const fechaRectificacion = new Date(rectificacion.fecha);
                fechaRectificacion.setDate(fechaRectificacion.getDate() + 10); // Sumar 10 días
                return fechaRectificacion.getFullYear() + '-' + 
                    String(fechaRectificacion.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(fechaRectificacion.getDate()).padStart(2, '0');
            })() 
            : (hoy_10.getFullYear() + '-' + 
            String(hoy_10.getMonth() + 1).padStart(2, '0') + '-' + 
            String(hoy_10.getDate()).padStart(2, '0')),

            });

    const [numeroBar, setNumeroBar] = useState({
        id_instancia: '',
        idCod: '',
    });

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
    }, [datos.zona]);
    

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
            axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`,{
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
        axios.post(BACKEND_SERVER + `/api/rodillos/rectificacion_nueva/`, {
            empresa: datos.empresa,
            fecha: datos.fecha,
            creado_por: datos.creado_por,
            maquina: datos.zona,
            finalizado: false,
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

    const actualizarDatos = (event) => {
        event.preventDefault();
        axios.patch(BACKEND_SERVER + `/api/rodillos/rectificacion_nueva/${datos.id}/`, {
            fecha: datos.fecha,
            maquina: datos.zona,
            finalizado: datos.finalizado,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
        })
        .catch(err => { console.log(err);})
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
            <Form >
                <Row>
                    {rectificacion? <h5>Rectificado</h5> : <h5>Nuevo Rectificado</h5>}
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
                                        onChange={handleInputChange} 
                                        placeholder="Creado por"
                                        disabled
                            />
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
                                        placeholder="Fecha creación" />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha_estimada">
                            <Form.Label>Fecha Estimada*</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_estimada' 
                                        value={datos.fecha_estimada}
                                        onChange={handleInputChange_estimada} 
                                        placeholder="Fecha estimada" />
                        </Form.Group>
                    </Col>
                    <Col className="d-flex align-items-end">
                        <Form.Group className="mb-3" controlId="finalizado">
                            <Form.Check type="checkbox" 
                                        label="Finalizado"
                                        checked = {datos.finalizado}
                                        onChange = {handleFinalizado} 
                                        disabled = {rectificacion?false:true}/>
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Row className="justify-content-center">
                    {datos.linea || rectificacion ? 
                        <Button variant="info" type="submit" className={'mx-2'} onClick={actualizarDatos}>Actualizar</Button> :
                        <Button variant="info" type="submit" className={'mx-2'} onClick={GuardarRectificacion}>Guardar</Button>                                
                    }
                    <Button variant="info" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
                </Form.Row> 
            </Form>
            {datos.linea || rectificacion  ?
                <Form>     
                    <Row>            
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
                        <Col xs={6} className="d-flex flex-column">
                            <Button variant="info" className={'mt-auto mx-2'} onClick={abrirListRodillos}>Buscar Rodillo</Button> 
                        </Col>
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
                    rectificados_pendientes={rectificados_pendientes}/>
        </Container>
    );
}
export default RodRectificacionForm;