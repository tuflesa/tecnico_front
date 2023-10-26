import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { constants } from 'buffer';

const RodConjunto = ({show, handleClose, operacion_marcada, grupoId}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [ejes, setEjes] = useState(null);
    const [rodillos, setRodillos] = useState(null);
    const [selectedEje, setSelectedEje] = useState(null);
    const [selectRodilloId, setSelectRodilloId] = useState(null);
    const [EjesRodillos, setEjesRodillos] = useState([]);
    const [operacion_id, setOperacionId] = useState('');
    const [tubo_madre, setTuboMadre] = useState('');
    const [grupo, setGrupo] = useState(null);

    //operacion_marcada es Operacion con Seccion
  
    useEffect(() => {
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/eje/?operacion=${operacion_marcada.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEjes(res.data);
            setOperacionId(operacion_marcada.id);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, operacion_marcada]);

    useEffect(() => {
        grupoId && axios.get(BACKEND_SERVER + `/api/rodillos/grupo/${grupoId}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setGrupo(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, grupoId, operacion_marcada]);

    useEffect(() => {
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/rodillo_editar/?operacion=${operacion_marcada.id}&grupoId=${grupoId}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setRodillos(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, operacion_marcada]);

    useEffect(() => {
        console.log('Esto es juntar todo');
        console.log(EjesRodillos);    
    }, [EjesRodillos]);

    useEffect(() => {
        if(selectRodilloId && selectedEje && tubo_madre){
            setEjesRodillos([...EjesRodillos, {eje: selectedEje, rodillo: selectRodilloId, operacion: operacion_id, tubo_madre:tubo_madre}]);
        }        
    }, [selectedEje, selectRodilloId, tubo_madre]);

    const handlerCancelar = () => {
        handleClose();
    } 

    const handleInputChange = (event) => {
        const campoNombre = event.target.name;
        const idRodillo = event.target.value;
        setSelectedEje(campoNombre);
        setSelectRodilloId(idRodillo);
        setTuboMadre(grupo.tubo_madre);
    }
    
    return(
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={ false } animation={false} size="lg">
            <Modal.Header>
                <Modal.Title>Nuevo Conjunto de Elementos</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col>
                        {ejes && ejes.map(eje => (
                            <Form.Group controlId={eje.id} key={eje.id}>
                                <Form.Label>{eje.tipo.nombre}</Form.Label>
                                <Form.Control
                                    as="select"
                                    name={eje.id}
                                    value={selectRodilloId || ''}
                                    onChange={handleInputChange}
                                    placeholder={eje.tipo.nombre}
                                >
                                    <option key={0} value={''}>Todas</option>
                                    {rodillos && rodillos.map(rodillo => {
                                        if (rodillo.tipo === eje.tipo.id && rodillo.diametro === eje.diametro) {
                                            return (
                                                <option key={rodillo.id} value={rodillo.id}>
                                                    {rodillo.nombre}
                                                </option>
                                            )
                                        }
                                    })}
                                </Form.Control>
                            </Form.Group>
                        ))}
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="info" onClick={'GuardarConjunto'}>Guardar</Button>
                <Button variant="waring" onClick={handlerCancelar}>Cancelar</Button>
            </Modal.Footer>
        </Modal>
    );
}
export default RodConjunto;