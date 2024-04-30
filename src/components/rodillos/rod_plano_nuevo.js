import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Modal, Button, Form, Col, Row, Tab, Tabs } from 'react-bootstrap';


const PlanoForm = ({show, handleCloseParametros,rodillo_id, rodillo, plano_length}) => {
    const [token] = useCookies(['tec-token']);
    const hoy = new Date();
    const fechaString = hoy.getFullYear() + '-' + ('0' + (hoy.getMonth()+1)).slice(-2) + '-' + ('0' + hoy.getDate()).slice(-2);
    const [archivo, setArchivo] = useState(null);
    const [PlanosExistentes, setPlanosExistentes] = useState(null);
    const [checkboxSeleccionados, setCheckboxSeleccionados] = useState([]);
    var valor = null;

    const [datos, setDatos] = useState({
        nombre: rodillo?'PL' + '-' + rodillo.nombre + '-' + (plano_length+1) : null,
        fecha: fechaString,
        archivo:'',
        motivo: 'nuevo',
        cod_antiguo: '',
        descripcion: '',
        nombre_revision: rodillo?'PL' + '-' + rodillo.nombre + '-' + (plano_length+1)+'-'+'R'+(0) : null,
    });

    useEffect(() => {
        if (rodillo) {
            setDatos(prevDatos => ({
                ...prevDatos,
                nombre: 'PL' + '-' + rodillo.nombre + '-' + (plano_length + 1)
            }));
        }
    }, [rodillo, plano_length]);

    useEffect(() => { //Filtramos los planos existentes con la misma máquina, operación y tipo (sup - inf - lat...)
        rodillo.id && axios.get(BACKEND_SERVER + `/api/rodillos/planos_existentes/?rodillos__tipo=${rodillo.tipo.id}&rodillos__operacion__id=${rodillo.operacion.id}&rodillos__operacion__seccion__maquina__id=${rodillo.operacion.seccion.maquina.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setPlanosExistentes(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, rodillo]);

    const handlerCancelar = () => {
        setDatos({
            ...datos,
            fecha: fechaString,
            archivo:'',
        })
        setCheckboxSeleccionados([]);
        handleCloseParametros()
    }

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const GuardarPlano = async () => {
        if (checkboxSeleccionados.length !== 0) {
            const requests = [];
            for (var z = 0; z < checkboxSeleccionados.length; z++) {
                valor = parseInt(checkboxSeleccionados[z]);
                var idRodillo = parseInt(rodillo_id);
        
                try {
                    const res = await axios.get(BACKEND_SERVER + `/api/rodillos/plano/${valor}`, {
                        headers: {
                        'Authorization': `token ${token['tec-token']}`
                        }
                    });
            
                    //setRodillos([...res.data.rodillos, idRodillo]);
            
                    requests.push(
                        axios.patch(BACKEND_SERVER + `/api/rodillos/plano/${valor}/`, {
                        rodillos: [...res.data.rodillos, idRodillo],
                        }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }
                        })
                    );

                } 
                catch (err) {
                console.log(err);
                }
            }
            try{
                await Promise.all(requests);
                handlerCancelar();
                window.location.href = `/rodillos/editar/${rodillo_id}`;
            } catch(err){
                console.log(err);
            }
        }
        else{
            if(archivo===null){
                alert('Por favor incluye un archivo');
            }
            else{
                var newRodillos=[];
                newRodillos = [parseInt(rodillo_id)]
                axios.post(BACKEND_SERVER + `/api/rodillos/plano_nuevo/`, {
                    nombre: datos.nombre,
                    rodillos: newRodillos,
                    cod_antiguo: datos.cod_antiguo,
                    descripcion: datos.descripcion,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                        }     
                })
                .then( res => { 
                    const formData = new FormData();
                        formData.append('plano', res.data.id);
                        formData.append('motivo', datos.motivo);
                        formData.append('archivo', archivo); // Aquí asumiendo que 'archivo' es el archivo seleccionado.
                        formData.append('fecha', datos.fecha);
                        formData.append('nombre', datos.nombre_revision);
                    
                    axios.post(BACKEND_SERVER + `/api/rodillos/revision_plano/`, formData, {
                        headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `token ${token['tec-token']}`
                        }
                    })
                    .then(re => { 
                        alert('Plano guardado correctamente');
                        window.location.href = `/rodillos/editar/${rodillo_id}`;
                    })
                    .catch(err => { 
                        console.error(err);
                    });
                    })
                }
            handlerCancelar();
        }
    }

    const handleInputChange_archivo = (event)=> {
        const selectedFile = event.target.files[0];
        setArchivo(selectedFile);
    }

    const handleCheckboxChange = (event) => {
        const checkboxId = event.target.id;
        if (event.target.checked) {
            // Agrega el checkbox seleccionado al estado
            setCheckboxSeleccionados([...checkboxSeleccionados, checkboxId]);
        } else {
            // Elimina el checkbox deseleccionado del estado
            setCheckboxSeleccionados(checkboxSeleccionados.filter(id => id !== checkboxId));
        }
    };
    
    const plano_marcado = (plano) => {
        for(var x=0;x<plano.rodillos.length;x++){
            if(plano.rodillos[x].id===rodillo_id){
                return(true);
            }
        }
    };

    return(
        <Modal show={show} onHide={handleCloseParametros} backdrop="static" keyboard={ false } animation={false} size="lg">
            <Modal.Header>
                    <Modal.Title>Añadir Plano</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs
                    defaultActiveKey="Plano_nuevo"
                    id="uncontrolled-tab-example"
                    className="mb-3"
                    >
                    <Tab eventKey="Plano" title="Plano existente">
                        <Form>
                            {PlanosExistentes && PlanosExistentes.map(plano => (
                                <div key={plano.id} className="mb-3">
                                    <Form.Check
                                        reverse
                                        label={plano.nombre}
                                        name="existente"
                                        type={'checkbox'}
                                        id={plano.id}
                                        onChange={handleCheckboxChange}
                                        disabled={plano_marcado(plano)}
                                    />
                                </div>
                            ))}
                        </Form>
                    </Tab>
                    <Tab eventKey="Plano_nuevo" title="Plano nuevo">
                        <Row>
                            <Col>
                                <Form.Group controlId="nombre">
                                    <Form.Label>Nombre plano *</Form.Label>
                                    <Form.Control type="text" 
                                                name='nombre' 
                                                value={datos.nombre}
                                                onChange={handleInputChange} 
                                                placeholder="Nombre plano"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="cod_antiguo">
                                    <Form.Label>Código antiguo</Form.Label>
                                    <Form.Control type="text" 
                                                name='cod_antiguo' 
                                                value={datos.cod_antiguo}
                                                onChange={handleInputChange} 
                                                placeholder="Codigo antiguo"
                                                autoFocus
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="descripcion">
                                    <Form.Label>Descripción plano</Form.Label>
                                    <Form.Control type="text" 
                                                name='descripcion' 
                                                value={datos.descripcion}
                                                onChange={handleInputChange} 
                                                placeholder="Descripción plano"
                                    />
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
                    </Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-primary" onClick={GuardarPlano}>Guardar</Button>
                <Button variant="warning" onClick={handlerCancelar}>Cancelar</Button>
            </Modal.Footer>
            
        </Modal>
    );
}
export default PlanoForm;