import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import { arch } from 'process';

const RodRevisionForm = ({plano_id, show, setShowRevision, show_revision, tipo_plano_id, rodillo_id }) => {
    const [token] = useCookies(['tec-token']);
    const [archivo, setArchivo] = useState(null);
    const hoy = new Date();
    const fechaString = hoy.getFullYear() + '-' + ('0' + (hoy.getMonth()+1)).slice(-2) + '-' + ('0' + hoy.getDate()).slice(-2);
    const [introParametros, setIntroParametros] = useState(false);
    const [valorParametro, setValorParametro] = useState('');
    const [tipo_plano, setTipoPlano] = useState([]);
    const [parametros, setParametros] = useState([]);

    const [datos, setDatos] = useState({
        tipo_plano: tipo_plano,
        nombre: '',
        fecha: fechaString,
        motivo: '',
    });

    const CargarParametros = () =>{;
        setIntroParametros(!introParametros);
        axios.get(BACKEND_SERVER + `/api/rodillos/plano_parametros/${tipo_plano_id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setParametros(res.data.nombres);
        })
        .catch( err => {
            console.log(err);
        });
    }

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

        axios.post(BACKEND_SERVER + `/api/rodillos/revision_plano/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `token ${token['tec-token']}`
            }
            })
            .then(res => { 
                alert('Plano guardado correctamente');
                window.location.href = `/rodillos/editar/${rodillo_id}`;
                if(valorParametro){
                    for(var x=0;x<valorParametro.length;x++){
                        axios.post(BACKEND_SERVER + `/api/rodillos/parametros/`, {
                            nombre: valorParametro[x].nombre,
                            revision: res.data.id,
                            valor: valorParametro[x].valor,
                        }, {
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                                }     
                        })
                        .then( res => { 
                            console.log('parametros guardados');
                        })
                        .catch(err => { 
                            console.error(err);
                        });
                    }
                }
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
        setIntroParametros(false);
    }

    const handleInputChange_archivo = (event)=> {
        const selectedFile = event.target.files[0];
        setArchivo(selectedFile);
    }

    const handleValorChange = (parametroId, nuevoValor)=> {
        const parametrosCopia = [...parametros];
        const indice = parametrosCopia.findIndex(parametro => parametro.id === parametroId);
        parametrosCopia[indice].valor = nuevoValor;
        setValorParametro(parametrosCopia);
    }

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    useEffect(() => {
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
    }, [token]);

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
                        <Form.Group controlId="motivo">
                            <Form.Label>Motivo *</Form.Label>
                            <Form.Control type="text"  
                                        name='motivo' 
                                        value={datos.motivo}
                                        onChange={handleInputChange}> 
                            </Form.Control>
                        </Form.Group>
                    </Col>
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
                {introParametros?
                <Row>
                    <Col>
                        <table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                { parametros && parametros.map( parametro => {
                                    return (
                                        <tr key={parametro.id}>
                                            <td>{parametro.descripcion}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    name={`valor_${parametro.id}`}
                                                    value={parametro.valor || ''}
                                                    onChange={(e)=>handleValorChange(parametro.id, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    )})
                                }
                            </tbody>
                        </table>
                    </Col>
                </Row>:''}
                {tipo_plano_id?introParametros? <Button variant="outline-primary" onClick={CargarParametros}>Desactivar Parametros</Button>:<Button variant="outline-primary" onClick={CargarParametros}>Activar Parametros</Button>:'Plano sin parametros'}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="info" onClick={GuardarRevision}>Guardar</Button>
                <Button variant="waring" onClick={handlerCancelar}>Cancelar</Button>
            </Modal.Footer>
        </Modal>
    );
}
 
export default RodRevisionForm;