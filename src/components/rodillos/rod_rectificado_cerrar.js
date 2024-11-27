import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Container, Modal, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import {invertirFecha} from '../utilidades/funciones_fecha';

const RodCerrarRectificado = ({show, datos_finalizar, CerrarModal, donde, lineas_rectificacion}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [hoy] = useState(new Date());

    const [datos_nuevos, setDatosNuevos] = useState({
        id_linea:datos_finalizar?datos_finalizar.id:'',
        //rodillo_eje: datos_finalizar?datos_finalizar.instancia.rodillo.diametro:'',
        rectificacion_id: datos_finalizar?datos_finalizar.rectificado:'',
        diametroF_antiguo: datos_finalizar?datos_finalizar.diametro:'',
        diametroExt_antiguo: datos_finalizar?datos_finalizar.diametro_ext:'',
        diametroAncho_antiguo: datos_finalizar?datos_finalizar.ancho:'',
        diametroCentro_antiguo: datos_finalizar?datos_finalizar.diametro_centro:'',
        rectificado_por: user['tec-user'],
        diametroF_nuevo: datos_finalizar?datos_finalizar.nuevo_diametro:'',
        diametroExt_nuevo: datos_finalizar?datos_finalizar.nuevo_diametro_ext:'',
        diametroAncho_nuevo: datos_finalizar?datos_finalizar.nuevo_ancho?datos_finalizar.nuevo_ancho:datos_finalizar.ancho:'',
        diametroCentro_nuevo: datos_finalizar?datos_finalizar.nuevo_diametro_centro:'',
        fecha_rectificado: (hoy.getFullYear() + '-'+String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0')),
    });

    const handleInputChange_nuevo = (event) => {
        setDatosNuevos({
            ...datos_nuevos,
            [event.target.name] : event.target.value
        })
    }

    const GuardarDatos = () => { 
        if(parseFloat(datos_nuevos.diametroF_nuevo)>parseFloat(datos_nuevos.diametroExt_nuevo)){
            alert('Diámetro fondo no puede ser mayor que el diámetro exterior. Por favor, corregir.');
            return;
        }
        else if(parseFloat(datos_nuevos.diametroExt_nuevo)>=parseFloat(datos_nuevos.diametroExt_antiguo) || parseFloat(datos_nuevos.diametroF_nuevo)>=parseFloat(datos_nuevos.diametroF_antiguo)){
            alert('Diámetro nuevo no puede ser superior o igual al diámetro antiguo. Por favor, corregir.');
            return;
        }
        else if(parseFloat(datos_nuevos.diametroAncho_nuevo)>parseFloat(datos_nuevos.diametroAncho_antiguo)){
            alert('El ancho nuevo no puede ser superior al ancho antiguo. Por favor, corregir.');
            return;
        }
        else if(datos_nuevos.rodillo_eje>parseFloat(datos_nuevos.diametroF_nuevo) || datos_nuevos.rodillo_eje===parseFloat(datos_nuevos.diametroF_nuevo)){
            alert('El diámetro de fondo, no puedes ser inferior o igual al eje del rodillo. Por favor corregir.');
            return;
        }
        else{
            axios.patch(BACKEND_SERVER + `/api/rodillos/linea_rectificacion/${datos_nuevos.id_linea}/`, { 
                nuevo_diametro: datos_nuevos.diametroF_nuevo,
                nuevo_diametro_ext:datos_nuevos.diametroExt_nuevo,
                nuevo_ancho: datos_nuevos.diametroAncho_nuevo,
                nuevo_diametro_centro: datos_nuevos.diametroCentro_nuevo,
                rectificado_por: datos_nuevos.rectificado_por.id,
                fecha_rectificado: datos_nuevos.fecha_rectificado,
                finalizado: true,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }     
            })
            .then( res => {  
                axios.patch(BACKEND_SERVER + `/api/rodillos/instancia_nueva/${res.data.instancia}/`, { //Actualizamos los datos de la instancia
                    diametro: datos_nuevos.diametroF_nuevo,
                    diametro_ext:datos_nuevos.diametroExt_nuevo,
                    ancho: datos_nuevos.diametroAncho_nuevo,
                    diametro_centro:datos_nuevos.diametroCentro_nuevo,
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
                const cerrar_ficha = lineas_rectificacion.filter(linea => linea.rectificado === res.data.rectificado && linea.id !== res.data.id && linea.finalizado === false);
                if(cerrar_ficha.length===0){
                    axios.patch(BACKEND_SERVER + `/api/rodillos/rectificacion_nueva/${datos_nuevos.rectificacion_id}/`, { //Cerramos la ficha
                        finalizado: true,
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
                window.location.reload(); //actualizo página
            })
            .catch(err => { 
                console.error(err);
            })
        }
        //setShowDatosNuevos(false);
    }

    const cerrar = () =>{
        CerrarModal();
    }

    return(
        <Modal show={show} backdrop="static" keyboard={ false } animation={false}>
            <Modal.Header closeButton>
                <Modal.Title>Medidas nuevas del rodillo</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Row>
                        <Col>
                            <Form.Group controlId="rectificado_por">
                                <Form.Label>Rectificado por:</Form.Label>
                                <Form.Control type="text" 
                                            name='rectificado_por' 
                                            value={datos_nuevos.rectificado_por.get_full_name}
                                            disabled/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="diametroFG">
                                <Form.Label>Diámetro fondo</Form.Label>
                                <Form.Control type="text" 
                                            name='diametroFG' 
                                            value={datos_nuevos.diametroF_antiguo}
                                            disabled/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="nuevo_diametro">
                                <Form.Label>Diámetro fondo nuevo</Form.Label>
                                <Form.Control type="text" 
                                            name='diametroF_nuevo' 
                                            onChange={handleInputChange_nuevo} 
                                            value={datos_nuevos.diametroF_nuevo}
                                            autoFocus/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="diametroFG">
                                <Form.Label>Diámetro exterior</Form.Label>
                                <Form.Control type="text" 
                                            name='diametroExt_antiguo' 
                                            value={datos_nuevos.diametroExt_antiguo}
                                            disabled/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="diametroExt_nuevo">
                                <Form.Label>Diámetro exterior nuevo</Form.Label>
                                <Form.Control type="text" 
                                            name='diametroExt_nuevo' 
                                            onChange={handleInputChange_nuevo} 
                                            value={datos_nuevos.diametroExt_nuevo}/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="diametroAncho_antiguo">
                                <Form.Label>Ancho </Form.Label>
                                <Form.Control type="text" 
                                            name='diametroAncho_antiguo' 
                                            value={datos_nuevos.diametroAncho_antiguo}
                                            disabled/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="diametroAncho_nuevo">
                                <Form.Label>Ancho nuevo</Form.Label>
                                <Form.Control type="text" 
                                            name='diametroAncho_nuevo' 
                                            onChange={handleInputChange_nuevo} 
                                            value={datos_nuevos.diametroAncho_nuevo}/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="diametroCentro_antiguo">
                                <Form.Label>Diámetro centro</Form.Label>
                                <Form.Control type="text" 
                                            name='diametroCentro_antiguo' 
                                            value={datos_nuevos.diametroCentro_antiguo}
                                            disabled/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="diametroCentro_nuevo">
                                <Form.Label>Diámetro centro nuevo</Form.Label>
                                <Form.Control type="text" 
                                            name='diametroCentro_nuevo' 
                                            onChange={handleInputChange_nuevo} 
                                            value={datos_nuevos.diametroCentro_nuevo}/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="fecha_rectificado">
                                <Form.Label>Fecha Rectificado</Form.Label>
                                <Form.Control type="text" 
                                            name='fecha_rectificado' 
                                            value={invertirFecha(String(datos_nuevos.fecha_rectificado))}
                                            disabled/>
                            </Form.Group>
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={GuardarDatos}>Grabar</Button>
                <Button variant="secondary" onClick={cerrar}>Cancelar</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default RodCerrarRectificado;