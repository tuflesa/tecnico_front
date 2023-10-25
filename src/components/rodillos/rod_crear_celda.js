import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Modal } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const RodConjunto = ({show, handleClose, operacion_id}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
//operacion_id es Operacion con Seccion
    useEffect(() => {
        console.log('esto vale operacion_id en crear celda');
        console.log(operacion_id);
    }, [token, operacion_id]);

    const handlerCancelar = () => {
        handleClose();
    } 

    return(
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={ false } animation={false} size="lg">
            <Modal.Header>
                <Modal.Title>Nuevo Conjunto de Elementos</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="info" onClick={'GuardarConjunto'}>Guardar</Button>
                <Button variant="waring" onClick={handlerCancelar}>Cancelar</Button>
            </Modal.Footer>
        </Modal>
    );
}
export default RodConjunto;