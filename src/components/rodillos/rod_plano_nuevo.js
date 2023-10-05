import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Modal, Button, Form, Col, Row, Tab, Tabs, ListGroup } from 'react-bootstrap';


const PlanoForm = ({show, handleCloseParametros, tipo_seccion, tipo_rodillo, rodillo_id, rodillo_tipo_plano}) => {
    const [token] = useCookies(['tec-token']);
    const [tipo_plano, setTipoPlano] = useState([]);
    const [parametros, setParametros] = useState([]);
    const hoy = new Date();
    const fechaString = hoy.getFullYear() + '-' + ('0' + (hoy.getMonth()+1)).slice(-2) + '-' + ('0' + hoy.getDate()).slice(-2);
    const [introParametros, setIntroParametros] = useState(false);
    const [valorParametro, setValorParametro] = useState('');
    const [archivo, setArchivo] = useState(null);

    const [datos, setDatos] = useState({
        tipo_plano: rodillo_tipo_plano,
        nombre: '',
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

    const handlerCancelar = () => {
        setIntroParametros(false);
        setDatos({
            ...datos,
            tipo_plano: '',
            nombre: '',
            fecha: fechaString,
            archivo:'',
        })
        handleCloseParametros()
    }

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const CargaPlano = () =>{;
        setIntroParametros(true);
        axios.get(BACKEND_SERVER + `/api/rodillos/plano_parametros/${datos.tipo_plano}`,{
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

    const GuardarPlano = () =>{;
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
              .then(res => { 
                alert('Plano guardado correctamente');
                if(valorParametro){
                    for(var x=0;x<=valorParametro.length;x++){
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
            console.log(err);
        })
        }
        handlerCancelar();
    }

    const handleValorChange = (parametroId, nuevoValor)=> {
        const parametrosCopia = [...parametros];
        const indice = parametrosCopia.findIndex(parametro => parametro.id === parametroId);
        parametrosCopia[indice].valor = nuevoValor;
        setValorParametro(parametrosCopia);
    }

    const handleInputChange_archivo = (event)=> {
        const selectedFile = event.target.files[0];
        setArchivo(selectedFile);
    }

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
                                <div key={'0'} className="mb-3">
                                <Form.Check
                                    reverse
                                    label="1"
                                    name="group1"
                                    type={'checkbox'}
                                    id={`0`}
                                />
                                <Form.Check
                                    reverse
                                    label="2"
                                    name="group1"
                                    type={'checkbox'}
                                    id={`1`}
                                />
                                <Form.Check
                                    reverse
                                    disabled
                                    label="3 (disabled)"
                                    type={'checkbox'}
                                    id={`2`}
                                />
                                </div>
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
                                                    value={datos.tipo_plano}
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
                                        <Form.Label>Archivo</Form.Label>
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
                        {!introParametros? <Button variant="outline-primary" onClick={CargaPlano}>Activar Parametros</Button>:''}
                    </Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-primary" onClick={GuardarPlano}>Guardar</Button>
                <Button variant="waring" onClick={handlerCancelar}>Cancelar</Button>
            </Modal.Footer>
            
        </Modal>
    );
}
export default PlanoForm;