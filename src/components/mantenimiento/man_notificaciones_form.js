import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Modal, Table } from 'react-bootstrap';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import {invertirFecha} from '../utilidades/funciones_fecha';

const NotificacionForm = ({nota, setNota}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [hoy] = useState(new Date());
    const [show_error, setShowError] = useState(false);
    const [show, setShow] = useState(false);
    const handleCloseError = () => setShowError(false);
    const handleClose = () => setShow(false);
    const [, setUsuarios] = useState(null);
    const [, setDestrezas] = useState(null);
    const nosoyTecnico = user['tec-user'].perfil.puesto.nombre==='Operador'||user['tec-user'].perfil.puesto.nombre==='Mantenimiento'?true:false;
    const [empresas, setEmpresas] = useState(null);
    const [zonas, setZonas] = useState(null);
    const [reclamaciones, setReclamaciones] = useState(null);
    const [act_reclamaciones, setActReclamaciones] = useState(false);
    const [errores, setErrores] = useState({}); // Estado para guardar errores
    

    const [datos, setDatos] = useState({
        id: nota.id ?? null,  // Si nota.id no está definido, usa null
        que: nota.que ?? "",  // Si nota.que está undefined, usa una cadena vacía
        cuando: nota.cuando ?? "", 
        donde: nota.donde ?? "",
        quien: nota.quien ?? "", 
        como: nota.como ?? "", 
        cuanto: nota.cuanto ?? "", 
        porque: nota.porque ?? "", 
        fecha_creacion: nota.fecha_creacion ?? (hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0')),
        revisado: nota.revisado ?? false,
        descartado: nota.descartado ?? false,
        finalizado: nota.finalizado ?? false,
        conclusion: nota.conclusion ?? "",
        empresa: nota.empresa ?? "",
        zona: nota.zona?.id ?? null,
        numero: nota.numero ?? "",
        peligrosidad: nota.peligrosidad ?? false,
        seguridad: nota.seguridad ?? false,
    });

    useEffect(()=>{
        setDatos({
            id: nota.id ?? null,  // Si nota.id no está definido, usa null
            que: nota.que ?? "",  // Si nota.que está undefined, usa una cadena vacía
            cuando: nota.cuando ?? "", 
            donde: nota.donde ?? "",
            quien: nota.quien ?? "", 
            como: nota.como ?? "", 
            cuanto: nota.cuanto ?? "", 
            porque: nota.porque ?? "", 
            fecha_creacion: nota.fecha_creacion ?? (hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0')),
            revisado: nota.revisado ?? false,
            descartado: nota.descartado ?? false,
            finalizado: nota.finalizado ?? false,
            conclusion: nota.conclusion ?? "",
            empresa: nota.empresa ?? "",
            zona: nota.zona?.id ?? null,
            numero: nota.numero ?? "",
            peligrosidad: nota.peligrosidad ?? false,
            seguridad: nota.seguridad ?? false,
        });
    },[nota, hoy]);

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
    }, [token, datos.empresa, user]);

    useEffect(() => {
        nota.id && axios.get(BACKEND_SERVER + `/api/mantenimiento/reclamos_detalle/?notificacion=${nota.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setReclamaciones(res.data);
            setActReclamaciones(false);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, nota, act_reclamaciones]);

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
    }, [token, datos.empresa, user]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })  
    }

    const handlePeligro = (event) => {
        setDatos({
            ...datos,
            peligrosidad : !datos.peligrosidad
        })
    }

    const handleSeguro = (event) => {
        setDatos({
            ...datos,
            seguridad : !datos.seguridad
        })
    }

    const validarNota = () => {
        const nuevosErrores = {};
        
        if (!datos.que || datos.que.trim() === '') nuevosErrores.que = ["Campo requerido"];
        if (!datos.cuando || datos.cuando.trim() === '') nuevosErrores.cuando = ["Campo requerido"];
        if (!datos.donde || datos.donde.trim() === '') nuevosErrores.donde = ["Campo requerido"];
        if (!datos.como || datos.como.trim() === '') nuevosErrores.como = ["Campo requerido"];
        if (!datos.cuanto || datos.cuanto.trim() === '') nuevosErrores.cuanto = ["Campo requerido"];
        if (!datos.porque || datos.porque.trim() === '') nuevosErrores.porque = ["Campo requerido"];
        if (datos.zona === null || datos.zona === '') nuevosErrores.zona = ["Campo requerido"];
        
        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            setShowError(true);
            return false;
        }
        return true;
    };

    const crearNota = (event) => {
        event.preventDefault();

        if (!validarNota()) return;
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
            peligrosidad: datos.peligrosidad,
            seguridad: datos.seguridad,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }     
        })
        .then( res => { 
            setNota(res.data);
            setErrores({}); // Reiniciar errores si la petición es exitosa
            window.confirm('La notificación se ha creado correctamente');
            window.location.href="javascript: history.go(-1)"
        })
        .catch(err => { 
            if (err.response && err.response.data) {
                setErrores(err.response.data); // Guardar los errores del backend
            } else {
                console.log(err);
            }
            alert('Faltan datos, por favor, introduce todos los datos obligatorios.')
                console.log(err);
        });
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
            peligrosidad: datos.peligrosidad,
            seguridad: datos.seguridad,
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

    const reclamar_nota = (event) => {
        var ya_reclame = reclamaciones.filter (r=>r.fecha===hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0'));
        event.preventDefault();
        if(ya_reclame.length===0){
            axios.post(BACKEND_SERVER + `/api/mantenimiento/reclamos/`, {
                notificacion: nota.id,
                fecha: hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0'),
                trabajador: user['tec-user'].perfil.usuario,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }     
            })
            .then( res => { 
                alert('Se ha notificado el reclamo de esta notificación, gracias.');
                setActReclamaciones(true);
            })
            .catch(err => { 
                console.log(err);
            })
        }
        else{
            alert('Con fecha de hoy, ya se ha reclamado esta notificación, gracias');
        }
    } 

    const desactivar = () => {
        if(nosoyTecnico){
            return true;
        }
    }

    const desactivar_zona = () => {
        if(user['tec-user'].perfil.zona){    
            return true;
        }
        else{
            return false;
        }
    }

    const listado_reclamaciones = ()=>{
        setShow(true);
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
                                                    disabled={nota.zona && nota.zona.id ? true: desactivar_zona()}
                                                    className={`form-control ${errores.zona ? 'border-red' : ''}`}> 
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
                                    <Form.Control as="textarea" rows={4}
                                                name='que' 
                                                value={datos.que}
                                                onChange={handleInputChange} 
                                                placeholder="Qué Sucede"
                                                autoFocus
                                                className={`form-control ${errores.que ? 'border-red' : ''}`}
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
                                                className={`form-control ${errores.cuando ? 'border-red' : ''}`}
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
                                                className={`form-control ${errores.donde ? 'border-red' : ''}`}
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
                                                className={`form-control ${errores.como ? 'border-red' : ''}`}
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
                                                className={`form-control ${errores.cuanto ? 'border-red' : ''}`}
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
                                                className={`form-control ${errores.porque ? 'border-red' : ''}`}
                                    />
                                </Form.Group>
                            </Col>
                        </Row> 
                        <Row>
                            <Col style={ { color: 'red' } }>
                                <Form.Group className="mb-3" controlId="peligro">
                                    <Form.Check type="checkbox" 
                                                label="Seguridad"
                                                checked = {datos.seguridad}
                                                onChange = {handleSeguro} />
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
                                    <Form.Control as="textarea" rows={4}
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
                            {nota.id ? 
                                <Button variant="info" className={'mx-2'} onClick={() => window.close()}>Cerrar</Button> :
                                <Button variant="info" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar</Button>
                            }
                            <Button variant="danger" type="submit" className={'mx-2'} onClick={reclamar_nota}>Reclamar</Button>
                            <Button variant="danger" className="mr-3 trash" onClick={event => {listado_reclamaciones()}}>R / {reclamaciones?reclamaciones.length:0}</Button>
                        </Form.Row>
                    </Form>
                </Col>
            </Row>
            <Modal show={show_error} onHide={handleCloseError} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>Error al guardar formulario. Revise la zona de la notificación</Modal.Body>
                {/* <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseError}>Cerrar</Button>
                </Modal.Footer> */}
            </Modal>

            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header>
                    <Modal.Title>Listado de reclamos:</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Trabajador</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead> 
                                {reclamaciones?                              
                                <tbody>                                    
                                    {reclamaciones && reclamaciones.map(r =>{
                                        return(
                                            <tr key={r.id}>
                                                <td>{r.trabajador?r.trabajador.get_full_name:null}</td>
                                                <td>{r.fecha?invertirFecha(String(r.fecha)):null}</td>
                                            </tr>
                                        )
                                    })}                                
                                </tbody>
                                :null}
                            </Table>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="waring" onClick={handleClose}>
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}
export default NotificacionForm;