//Modal para mostrar los documentos de los rectificados asociados con una instancia
//Se ven desde la pantalla del rodillo en las acciones de las intancias
import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';

const RodDocRectificadoModal = ({ show, handlerClose, instancia }) => {
    const [token] = useCookies(['tec-token']);
    const [documentos, setDocumentos] = useState([]);

    useEffect(() => {
        instancia && instancia.id && axios.get(BACKEND_SERVER + `/api/rodillos/doc_rectificado/?linea_rectificacion__instancia=${instancia.id}`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setDocumentos(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, instancia]);

    return (
        <Modal show={show} onHide={handlerClose}>
            <Modal.Header closeButton>
                <Modal.Title>Documentos de {instancia?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {documentos.length > 0 ?
                    <ul>
                        {documentos.map(doc => (
                            <li key={doc.id}>
                                <a href={doc.archivo} target="_blank" rel="noopener noreferrer">
                                    {doc.archivo.split('/').pop()}
                                </a>
                            </li>
                        ))}
                    </ul>
                    : <p>Esta instancia no tiene documentos asociados.</p>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handlerClose}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
}
export default RodDocRectificadoModal;