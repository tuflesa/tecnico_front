import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal, Table } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { Trash} from 'react-bootstrap-icons';

const RodMontajeAnotaciones = ({show, handleClose, montaje, tooling}) => {
    const [token] = useCookies(['tec-token']);
    const [anotacionesLocales, setAnotacionesLocales] = useState([]);
    const [nuevaAnotacion, setNuevaAnotacion] = useState({
        descripcion: '',
        archivo: null
    });

    // Inicializar anotaciones locales cuando se abre el modal
    useEffect(() => {
        if (show && montaje) {
            // Verificar si montaje.anotaciones existe antes de usarlo
            const anotacionesIniciales = montaje.anotaciones || [];
            setAnotacionesLocales(anotacionesIniciales);
        }
    }, [show, montaje]);

    const handlerCancelar = () => {
        setNuevaAnotacion({
            descripcion: '',
            archivo: null,
        });
        handleClose();
    };
    
    const guardarAnotacion = () => {
        if (!nuevaAnotacion.descripcion.trim()) {
            alert("Por favor, ingrese una descripción");
            return;
        }
        const formData = new FormData();
        formData.append('descripcion', nuevaAnotacion.descripcion);
        if (nuevaAnotacion.archivo) {
            formData.append('archivo', nuevaAnotacion.archivo);
        }
        formData.append('montaje', montaje.id);

        axios.post(BACKEND_SERVER + `/api/rodillos/anotaciones/`, formData, {
            headers: {
                'Authorization': `token ${token['tec-token']}`,
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(res => {
            const nuevaAnotacionGuardada = res.data;
            setAnotacionesLocales(prevAnotaciones => [...prevAnotaciones, nuevaAnotacionGuardada]);
            setNuevaAnotacion({
                descripcion: '',
                archivo: null,
            });
        })
        .catch(err => {
            console.log(err);
            alert("Error al guardar la anotación");
        });
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setNuevaAnotacion(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const EliminaAnotacion = (anotacion_id) => {
        axios.delete(BACKEND_SERVER + `/api/rodillos/anotaciones/${anotacion_id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setAnotacionesLocales(prevAnotaciones => 
                prevAnotaciones.filter(anotacion => anotacion.id !== anotacion_id)
            );
        })
        .catch( err => {
            console.log(err);
            alert("Error al eliminar la anotación");
        });
    };

    return(
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} animation={false} size="lg">
            <Modal.Header>
                <Modal.Title>Anotaciones</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Archivo</th>
                            {tooling===false?<th>Acciones</th>:''}
                        </tr>
                    </thead>
                    <tbody>
                        {anotacionesLocales.map((anotacion, index) => (
                            <tr key={index}>
                                <td>{anotacion.descripcion}</td>
                                <td>
                                    {anotacion.archivo && (
                                        <a href={anotacion.archivo} target="_blank" rel="noopener noreferrer">
                                            Ver archivo
                                        </a>
                                    )}
                                </td>
                                {tooling===false?<td><Trash className="trash"  onClick={event =>{EliminaAnotacion(anotacion.id)}} /></td>:''}
                            </tr>
                        ))}
                        {tooling===false?
                            <tr>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="descripcion"
                                        value={nuevaAnotacion.descripcion}
                                        onChange={handleInputChange}
                                        placeholder="Nueva anotación..."
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="file"
                                        name="archivo"
                                        onChange={handleInputChange}
                                    />
                                </td>
                            </tr>
                        :''}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="warning" onClick={handlerCancelar}>Cancelar</Button>
                {tooling===false?<Button variant="primary" onClick={guardarAnotacion}>Guardar</Button>:''}
            </Modal.Footer>
        </Modal>
    );
};

export default RodMontajeAnotaciones;