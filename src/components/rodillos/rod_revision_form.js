import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import { arch } from 'process';

const RodRevisionForm = ({plano_id, show, setShowRevision, show_revision, tipo_plano_id, rodillo_id, rodillo, plano_nombre, revisiones, revisiones_lenght}) => {
    const [token] = useCookies(['tec-token']);
    const [archivo, setArchivo] = useState(null);
    const hoy = new Date();
    const fechaString = hoy.getFullYear() + '-' + ('0' + (hoy.getMonth()+1)).slice(-2) + '-' + ('0' + hoy.getDate()).slice(-2);
    const [tipo_plano, setTipoPlano] = useState([]);
    //const [revisiones, setRevisiones] = useState('');

    const [datos, setDatos] = useState({
        tipo_plano: tipo_plano,
        nombre: plano_nombre+'-'+'R'+revisiones_lenght+'',
        fecha: fechaString,
        motivo: '',
    });

    useEffect(() => {
        if(tipo_plano_id){
            axios.get(BACKEND_SERVER + `/api/rodillos/tipo_plano/${tipo_plano_id}/`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }
            })
            .then( res => {
                setTipoPlano(res.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token]);

    const GuardarRevision = () =>{
        if(archivo===null){
            alert('Por favor incluye un archivo');
        }
        else{
        const formData = new FormData();
            formData.append('plano', plano_id);
            formData.append('motivo', datos.motivo);
            formData.append('archivo', archivo); // Aquí asumiendo que 'archivo' es el archivo seleccionado.
            formData.append('fecha', datos.fecha);
            formData.append('nombre', datos.nombre);

        axios.post(BACKEND_SERVER + `/api/rodillos/revision_plano/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `token ${token['tec-token']}`
            }
            })
            .then(res => { 
                window.location.href = `/rodillos/editar/${rodillo_id}`;
            })
            .catch(err => { 
            console.error(err);
            alert('Revisa todos los datos obligatorios');
            });
            handlerCancelar();
        }
    }

    const handlerCancelar = () => {
        setShowRevision(false);
    }

    const handleInputChange_archivo = (event)=> {
        const selectedFile = event.target.files[0];
        setArchivo(selectedFile);
    }
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    return(
        <Modal show={show_revision} onHide={handlerCancelar} backdrop="static" keyboard={ false } animation={false} size="lg">
            <Modal.Header>
                <Modal.Title>Añadir Revisión del plano</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Form.Group controlId="tipo_plano">
                            <Form.Label>Tipo Plano *</Form.Label>
                            <Form.Control type="text"  
                                        name='tipo_plano' 
                                        value={tipo_plano.nombre}
                                        onChange={handleInputChange}
                                        disabled={true}> 
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="nombre">
                            <Form.Label>Nombre *</Form.Label>
                            <Form.Control type="text"  
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange}
                                        disabled={true}> 
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="fecha">
                            <Form.Label>Fecha *</Form.Label>
                            <Form.Control type="date"  
                                        name='fecha' 
                                        value={datos.fecha}
                                        onChange={handleInputChange}>  
                            </Form.Control>
                        </Form.Group>
                    </Col> 
                    <Col>
                        <form encType='multipart/form-data'>
                            <Form.Group controlId="archivo">
                                <Form.Label>Archivo *</Form.Label>
                                <Form.Control type="file"  
                                            name='archivo' 
                                            onChange={handleInputChange_archivo}>  
                                </Form.Control>
                            </Form.Group>
                        </form>
                    </Col>                       
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="motivo">
                            <Form.Label>Motivo *</Form.Label>
                            <Form.Control as="textarea"  
                                        rows={1}
                                        name='motivo' 
                                        value={datos.motivo}
                                        onChange={handleInputChange}> 
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="info" onClick={GuardarRevision}>Guardar</Button>
                <Button variant="waring" onClick={handlerCancelar}>Cancelar</Button>
            </Modal.Footer>
        </Modal>
    );
}
 
export default RodRevisionForm;