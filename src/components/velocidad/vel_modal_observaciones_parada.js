import { Modal, Button, Container} from 'react-bootstrap';

const ModalObservacionesParada = ({ showObs, onHideObs, observacion }) => {

    return (
        <Container>
            <Modal show={showObs} onHide={onHideObs} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Observaciones de la Parada</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{observacion}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHideObs}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ModalObservacionesParada;