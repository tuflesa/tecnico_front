import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Modal, Button, Form, Col, Row, } from 'react-bootstrap';


const ParametrosForm = ({show, handleCloseParametros}) => {
    const [token] = useCookies(['tec-token']);
    const [tipo_plano, setTipoPlano] = useState([]);
    const [parametros, setParametros] = useState([]);
    const hoy = new Date();
    const fechaString = hoy.getFullYear() + '-' + ('0' + (hoy.getMonth()+1)).slice(-2) + '-' + ('0' + hoy.getDate()).slice(-2);
    const [introParametros, setIntroParametros] = useState(false);
    const [valorParametro, setValorParametro] = useState('');

    const [datos, setDatos] = useState({
        tipo_plano: '',
        nombre: '',
        fecha: fechaString,
    });

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/rodillos/tipo_plano/',{
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

            console.log(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }

    const GuardarParametros = () =>{;
        console.log('aquí guardará los datos almacenados en valor parametro y se saldrá');
        console.log(valorParametro);
        handlerCancelar();

    }

    const handleValorChange = (parametroId, nuevoValor)=> {
        const parametrosCopia = [...parametros];
        const indice = parametrosCopia.findIndex(parametro => parametro.id === parametroId);
        parametrosCopia[indice].valor = nuevoValor;
        setValorParametro(parametrosCopia);
    }

    return(
        <Modal show={show} onHide={handleCloseParametros} backdrop="static" keyboard={ false } animation={false} size="lg">
            <Modal.Header>
                    <Modal.Title>Añadir Parametros</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Button variant="outline-primary" onClick={'BuscarPlano'}>Buscar Plano</Button>
                </Row>
                <Row>
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
                    <Col>
                        <Form.Group controlId="tipo_plano">
                            <Form.Label>Tipo de plano *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.tipo_plano}
                                            name='tipo_plano'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
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
                </Row>
                :''}
            </Modal.Body>
            <Modal.Footer>
                {!introParametros? <Button variant="outline-primary" onClick={CargaPlano}>Activar Parametros</Button>:<Button variant="outline-primary" onClick={GuardarParametros}>Guardar Parametros</Button>}
                <Button variant="waring" onClick={handlerCancelar}>Cancelar</Button>
            </Modal.Footer>
            
        </Modal>
    );
}
export default ParametrosForm;