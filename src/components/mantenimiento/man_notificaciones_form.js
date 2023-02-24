import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';
import { PlusCircle, Receipt } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';

const NotificacionForm = ({nota, setNota}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [hoy] = useState(new Date);
    const [show_error, setShowError] = useState(false);
    const handleCloseError = () => setShowError(false);
    const [usuarios, setUsuarios] = useState(null);
    const [destrezas, setDestrezas] = useState(null);
    const soyTecnico = user['tec-user'].perfil.destrezas.filter(s => s === 6);
    const [empresas, setEmpresas] = useState(null);
    const [zonas, setZonas] = useState(null);

    const [datos, setDatos] = useState({
        id: nota.id? nota.id : null,
        que: nota.id?nota.que:null,
        cuando: nota.id?nota.cuando:null,
        donde: nota.id?nota.donde:null,
        quien: nota? nota.quien: user['tec-user'].perfil.usuario,
        como: nota.id? nota.como : null,
        cuanto: nota.id? nota.cuanto : '',
        porque: nota.id? nota.porque : '',
        fecha_creacion: nota.id ? nota.fecha_creacion :(hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
        //para: nota? nota.para: '',
        revisado: nota.id? nota.revisado : false,
        descartado: nota.id?nota.descartado:false,
        finalizado: nota.id?nota.finalizado:false,
        conclusion: nota.id? nota.conclusion : null,
        empresa: nota?nota.empresa:'',
        zona: nota?nota.zona:'',
        numero: nota.id? nota.numero:null,
    });

    useEffect(()=>{
        setDatos({
            id: nota.id? nota.id : null,
            que: nota.id?nota.que:null,
            cuando: nota.id?nota.cuando:null,
            donde: nota.id?nota.donde:null,
            quien: nota? nota.quien: user['tec-user'].perfil.usuario,
            como: nota.id? nota.como : null,
            cuanto: nota.id? nota.cuanto : '',
            porque: nota.id? nota.porque : '',
            fecha_creacion: nota.id ? nota.fecha_creacion :(hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
            //para: nota.id? nota.para : '',
            revisado: nota.id? nota.revisado : false,
            descartado: nota.id?nota.descartado:false,
            finalizado: nota.id?nota.finalizado:false,
            conclusion: nota.id? nota.conclusion : null,
            empresa: nota?nota.empresa:user['tec-user'].perfil.empresa.id,
            zona: nota?nota.zona:user['tec-user'].perfil.zona?user['tec-user'].perfil.zona.id:'',
            numero: nota.id? nota.numero:null,
        });
    },[nota]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/administracion/usuarios/?perfil__empresa__id=${user['tec-user'].perfil.empresa.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setUsuarios(res.data.sort(function(a, b){
                if(a.get_full_name > b.get_full_name){
                    return 1;
                }
                if(a.get_full_name < b.get_full_name){
                    return -1;
                }
                return 0;
            }))
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, datos.empresa]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/mantenimiento/especialidades/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setDestrezas(res.data.filter(d=>d.nombre==='Técnico'));
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
        axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${user['tec-user'].perfil.empresa.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setZonas(res.data);
        })
        .catch( err => {
            console.log(err);
        }); 
    }, [token, datos.empresa]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })  
    }

    const crearNota = (event) => {
        event.preventDefault();
        if(datos.zona===null||datos.zona===''){
            setShowError(true);
        }
        else{
            axios.post(BACKEND_SERVER + `/api/mantenimiento/notificacion_nueva/`, {
                que: datos.que,
                cuando: datos.cuando,
                donde: datos.donde,
                //para: datos.para,
                quien: user['tec-user'].perfil.usuario,
                como: datos.como,
                cuanto: datos.cuanto,
                porque: datos.porque,
                fecha_creacion: datos.fecha_creacion,            
                revisado: datos.revisado,
                descartado: datos.descartado,
                finalizado: datos.finalizado,
                conclusion: datos.conclusion,
                empresa: datos.empresa,
                zona: datos.zona,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }     
            })
            .then( res => { 
                setNota(res.data);
                window.confirm('La notificación se ha creado correctamente');
                window.location.href="javascript: history.go(-1)"
                
            })
            .catch(err => { 
                setShowError(true);
                console.log(err);
            });
        }
    } 

    const actualizarNota = (event) => {
        event.preventDefault();
        axios.patch(BACKEND_SERVER + `/api/mantenimiento/notificacion_nueva/${nota.id}/`, {
            que: datos.que,
            cuando: datos.cuando,
            donde: datos.donde,
            //para: datos.para,
            //quien: datos.quien,
            como: datos.como,
            cuanto: datos.cuanto,
            porque: datos.porque,
            fecha_creacion: datos.fecha_creacion,            
            revisado: datos.revisado,
            descartado: datos.descartado,
            finalizado: datos.finalizado,
            conclusion: datos.conclusion,
            zona: datos.zona,
            //empresa: datos.empresa,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setNota(res.data);
        })
        .catch(err => { 
            setShowError(true);
            console.log(err);
        })
    } 

    const desactivar = () => {
        if(user['tec-user'].perfil.puesto.nombre==='Operador'){
            return true;
        }
    }

    return(
        <Container className="mb-5 mt-5">
            <Row className="justify-content-center"> 
                {nota.id?
                    <h5 className="pb-3 pt-1 mt-2">Detalle de la Notificación</h5>:
                    <h5 className="pb-3 pt-1 mt-2">Nueva Notificación</h5>}
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <h5 className="pb-3 pt-1 mt-2">Datos básicos:</h5>
                    <Form >
                        <Row>
                            <Col>
                                <Form.Group controlId="numero">
                                    <Form.Label>Numero Notificación</Form.Label>
                                    <Form.Control type="text" 
                                                name='numero' 
                                                disabled
                                                value={datos.numero}/>
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="quien">
                                    <Form.Label>Creado por (*)</Form.Label>
                                    <Form.Control   type="text" 
                                                    name='quien' 
                                                    disabled
                                                    value={datos.quien.get_full_name}/>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="fecha_creacion">
                                    <Form.Label>Fecha Creación (*)</Form.Label>
                                    <Form.Control type="date" 
                                                name='fecha_creacion' 
                                                value={datos.fecha_creacion}
                                                onChange={handleInputChange} 
                                                placeholder="Fecha creación" />
                                </Form.Group>
                            </Col> 
                            <Col>
                                <Form.Group controlId="empresa">
                                    <Form.Label>Empresa</Form.Label>
                                    <Form.Control as="select"  
                                                name='empresa' 
                                                value={datos.empresa}
                                                onChange={handleInputChange}
                                                placeholder="Empresa"
                                                disabled>
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
                                    <Form.Label>Zona (*)</Form.Label>
                                    <Form.Control   as="select" 
                                                    value={datos.zona}
                                                    name='zona'
                                                    onChange={handleInputChange}
                                                    disabled={desactivar()}> 
                                                    <option key={0} value={''}>Sin Zona asignada</option>                                      
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
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group id="que">
                                    <Form.Label>Qué sucede(*)</Form.Label>
                                    <Form.Control type="text" 
                                                name='que' 
                                                value={datos.que}
                                                onChange={handleInputChange} 
                                                placeholder="Qué Sucede"
                                                autoFocus
                                    />
                                </Form.Group>
                            </Col>  
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group id="cuando">
                                    <Form.Label>Cuándo sucede(*)</Form.Label>
                                    <Form.Control type="text" 
                                                name='cuando' 
                                                value={datos.cuando}
                                                onChange={handleInputChange} 
                                                placeholder="Cuándo Sucede"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group id="donde">
                                    <Form.Label>Dónde sucede(*)</Form.Label>
                                    <Form.Control type="text" 
                                                name='donde' 
                                                value={datos.donde}
                                                onChange={handleInputChange} 
                                                placeholder="Dónde Sucede"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group id="como">
                                    <Form.Label>Cómo te diste cuenta(*)</Form.Label>
                                    <Form.Control type="text" 
                                                name='como' 
                                                value={datos.como}
                                                onChange={handleInputChange} 
                                                placeholder="Cómo Sucede"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group id="cuanto">
                                    <Form.Label>Cuantas veces se repite(*)</Form.Label>
                                    <Form.Control type="text" 
                                                name='cuanto' 
                                                value={datos.cuanto}
                                                onChange={handleInputChange} 
                                                placeholder="Una vez al día, constantemente..."
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group id="porque">
                                    <Form.Label>Por qué crees que ocurre(*)</Form.Label>
                                    <Form.Control type="text" 
                                                name='porque' 
                                                value={datos.porque}
                                                onChange={handleInputChange} 
                                                placeholder="Por que crees que ocurre"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>    
                        <Row> 
                            {nota.id?
                                <h5 className="pb-3 pt-1 mt-2">Estado de la notificación</h5>:null}
                        </Row>
                        <Row>
                            <Col>
                            {nota.id?
                                <Form.Group controlId="revisado">
                                <Form.Label>Revisado</Form.Label>
                                <Form.Control as="select" 
                                                value={datos.revisado}
                                                name='revisado'
                                                onChange={handleInputChange}
                                                disabled={desactivar()}>
                                    <option key={0} value={''}>Todos</option>
                                    <option key={1} value={true}>Si</option>
                                    <option key={2} value={false}>No</option>
                                </Form.Control>
                            </Form.Group>
                            : null}
                            </Col>
                            <Col>
                            {nota.id?
                                <Form.Group controlId="descartado">
                                <Form.Label>Descartado</Form.Label>
                                <Form.Control as="select" 
                                                value={datos.descartado}
                                                name='descartado'
                                                onChange={handleInputChange}
                                                disabled={desactivar()}>
                                    <option key={0} value={''}>Todos</option>
                                    <option key={1} value={true}>Si</option>
                                    <option key={2} value={false}>No</option>
                                </Form.Control>
                            </Form.Group>
                            : null}
                            </Col>
                            <Col>
                            {nota.id?
                                <Form.Group controlId="finalizado">
                                    <Form.Label>Finalizado</Form.Label>
                                    <Form.Control as="select" 
                                                    value={datos.finalizado}
                                                    name='finalizado'
                                                    onChange={handleInputChange}
                                                    disabled={desactivar()}>
                                        <option key={0} value={''}>Todos</option>
                                        <option key={1} value={true}>Si</option>
                                        <option key={2} value={false}>No</option>
                                    </Form.Control>
                                </Form.Group>
                            : null}
                            </Col>
                        </Row>   
                        <Row>                        
                            <Col>
                            {nota.id?
                                <Form.Group id="conclusion">
                                    <Form.Label>Conclusiones</Form.Label>
                                    <Form.Control type="text" 
                                                name='conclusion' 
                                                value={datos.conclusion}
                                                onChange={handleInputChange} 
                                                placeholder="Conclusiones"
                                                disabled={desactivar()}
                                    />
                                </Form.Group>
                            : null}
                            </Col>                            
                        </Row>                                      
                        <Form.Row className="justify-content-center">
                            {nota.id ? 
                                <Button variant="info" type="submit" className={'mx-2'} onClick={actualizarNota}>Actualizar</Button> :
                                <Button variant="info" type="submit" className={'mx-2'} onClick={crearNota}>Guardar</Button>
                            }
                            <Button variant="info" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar</Button>
                        </Form.Row>
                    </Form>
                </Col>
            </Row>
            <Modal show={show_error} onHide={handleCloseError} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>Error al guardar formulario. Revise que todos los campos con asterisco esten cumplimentados</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseError}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}
export default NotificacionForm;