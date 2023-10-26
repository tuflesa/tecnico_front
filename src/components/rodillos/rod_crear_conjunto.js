import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const RodConjunto = ({show, handleClose, operacion_marcada, grupo}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [ejes, setEjes] = useState(null);
    const [rodillos, setRodillos] = useState(null);
    const [selectedEje, setSelectedEje] = useState(null);
    const [selectRodilloId, setSelectRodilloId] = useState(null);

    //operacion_marcada es Operacion con Seccion
    useEffect(() => {
        console.log('Esto es lo que recogemos en datos.eje y selectedRodilloId');
        console.log(selectedEje);
        console.log(selectRodilloId);
    }, [selectRodilloId]);

    useEffect(() => {
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/eje/?operacion=${operacion_marcada.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEjes(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, operacion_marcada]);

    useEffect(() => {
        operacion_marcada && axios.get(BACKEND_SERVER + `/api/rodillos/rodillo_editar/?operacion=${operacion_marcada.id}&grupo=${grupo}`,{
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

    const handlerCancelar = () => {
        handleClose();
    } 

    const handleInputChange = (event) => {
        const campoNombre = event.target.name;
        const idRodillo = event.target.value;
        setSelectedEje(campoNombre);
        setSelectRodilloId(idRodillo);
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