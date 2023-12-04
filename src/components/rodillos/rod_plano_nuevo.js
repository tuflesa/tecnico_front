import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Modal, Button, Form, Col, Row, Tab, Tabs, Alert } from 'react-bootstrap';


const PlanoForm = ({show, handleCloseParametros, tipo_seccion, tipo_rodillo, rodillo_id, rodillo_tipo_plano, rodillo_t}) => {
    const [token] = useCookies(['tec-token']);
    const [tipo_plano, setTipoPlano] = useState([]);
    const [parametros, setParametros] = useState([]);
    const hoy = new Date();
    const fechaString = hoy.getFullYear() + '-' + ('0' + (hoy.getMonth()+1)).slice(-2) + '-' + ('0' + hoy.getDate()).slice(-2);
    const [archivo, setArchivo] = useState(null);
    const [PlanosExistentes, setPlanosExistentes] = useState(null);
    const [checkboxSeleccionados, setCheckboxSeleccionados] = useState([]);
    //const [rodillos, setRodillos] = useState([]);
    //const [rodillo, setRodillo] = useState([]);
    var valor = null;

    const [datos, setDatos] = useState({
        tipo_plano: rodillo_tipo_plano?rodillo_tipo_plano:'',
        nombre: null,
        fecha: fechaString,
        archivo:'',
        motivo: 'nuevo',
    });

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/tipo_plano/?tipo_seccion=${tipo_seccion}&tipo_rodillo=${tipo_rodillo}`,{
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

    useEffect(() => {
        if(datos.tipo_plano){
            axios.get(BACKEND_SERVER + `/api/rodillos/plano_parametros/${datos.tipo_plano}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }
            })
            .then( res => {
                setParametros(res.data.nombres); //para sacar los nombres de los parametros de este tipo de plano
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [datos.tipo_plano]);

    useEffect(() => { //se recogen los plano que cuadran con el tipo de rodillo
        datos.tipo_plano && axios.get(BACKEND_SERVER + `/api/rodillos/planos_existentes/?rodillos__tipo_plano=${datos.tipo_plano}`,{
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
    }, [token, rodillo_tipo_plano, datos.tipo_plano]);

    const handlerCancelar = () => {
        setDatos({
            ...datos,
            //tipo_plano: '',
            nombre: '',
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
        if(datos.tipo_plano){
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
                        
                        axios.post(BACKEND_SERVER + `/api/rodillos/revision_plano/`, formData, {
                            headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `token ${token['tec-token']}`
                            }
                        })
                        .then(re => { 
                            alert('Plano guardado correctamente');
                            if(rodillo_t.tipo_plano===null){
                                for(var x=0;x<parametros.length;x++){ //damos de alta los parámetros con valor 0
                                    axios.post(BACKEND_SERVER + `/api/rodillos/parametros_estandar/`, {
                                        nombre: parametros[x].nombre,
                                        rodillo: rodillo_id,
                                        valor: 0,
                                    }, {
                                        headers: {
                                            'Authorization': `token ${token['tec-token']}`
                                            }     
                                    })
                                    .then( r => { 
                                    })
                                    .catch(err => { 
                                        console.error(err);
                                    });
                                }
                            }
                            
                            window.location.href = `/rodillos/editar/${rodillo_id}`;
                        })
                        .catch(err => { 
                            console.error(err);
                        });
                        })
                    
                        if(datos.tipo_plano!==''){
                            axios.patch(BACKEND_SERVER + `/api/rodillos/rodillo_nuevo/${rodillo_id}/`, {
                                tipo_plano: datos.tipo_plano,
                            }, {
                                headers: {
                                    'Authorization': `token ${token['tec-token']}`
                                    }     
                            })
                            .then( res => { 
                            })
                            .catch(err => { 
                                console.log(err);
                            })
                    
                    .catch(err => { 
                        Alert('Revisa los campos obligatorios');
                        console.log(err);
                    })
                    }
                }
                handlerCancelar();
            }
        }
        else{
            alert('Por favor introduce el Tipo de plano, gracias');
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
                                                autoFocus
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="tipo_plano">
                                    <Form.Label>Tipo de plano</Form.Label>
                                    <Form.Control as="select" 
                                                    value={rodillo_tipo_plano!==null?rodillo_tipo_plano:datos.tipo_plano}
                                                    name='tipo_plano'
                                                    onChange={handleInputChange}
                                                    disabled={rodillo_tipo_plano!==null}>
                                        <option key={0} value={0}>Todos</option>
                                        {tipo_plano && tipo_plano.map( tipo => {
                                            return (
                                            <option key={tipo.id} value={tipo.id}>
                                                {tipo.nombre}
                                            </option>
                                            )
                                        })}
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