import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const RodCrearInstancia = ({show, handlerClose, rodillo_id, rodillo, instancias_length, instancia_activa }) => {
    const [token] = useCookies(['tec-token']);
    const [material, setMaterial] = useState('');
    const [especial, setEspecial] = useState(false);
    const [materiales, setMateriales] = useState([]);
    const [diametroFG, setDiametroFG] = useState([]);
    const [diametroEXT, setDiametroEXT] = useState([]);
    const [activa_qs, setActivaQS] = useState(instancia_activa===true?false:true);
    const [obsoleta, setObsoleta] = useState(false);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/materiales/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setMateriales(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    const GuardarInstancia = () => {
        if(parseFloat(diametroFG)>parseFloat(diametroEXT)){
            alert('El diámetro de fondo no puede ser superior al diámetro exterior. Por favor corregir, gracias');
        }
        if(parseFloat(rodillo.diametro)>parseFloat(diametroFG) || parseFloat(rodillo.diametro)===parseFloat(diametroFG)){
            alert('El diámetro de fondo, no puedes ser inferior o igual al eje del rodillo. Por favor corregir, gracias')
        }
        else if(parseFloat(diametroFG)<parseFloat(diametroEXT) && parseFloat(rodillo.diametro)<parseFloat(diametroFG) && parseFloat(rodillo.diametro)!==parseFloat(diametroFG)||parseFloat(diametroFG)===parseFloat(diametroEXT)){
            if (material) {
                axios.post(BACKEND_SERVER + `/api/rodillos/instancia_nueva/`, {
                    nombre: rodillo.nombre + '-' + instancias_length,
                    rodillo: rodillo_id,
                    material: material,
                    especial: especial,
                    diametro: diametroFG,
                    diametro_ext: diametroEXT,
                    activa_qs: activa_qs,
                    obsoleta: obsoleta,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }     
                })
                .then(r => {
                    axios.patch(BACKEND_SERVER + `/api/rodillos/rodillos/${rodillo.id}/`, {
                        num_instancias: rodillo.num_instancias+1,
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }     
                    })
                    .then(r => {
                        alert('Acaba de CREAR una instancia de rodillo, gracias.');
                    })
                    .catch(err => { 
                        console.log(err);
                    });
                    window.location.href = `/rodillos/editar/${rodillo_id}`;
                })
                .catch(err => { 
                    alert('NO SE GUARDA LA INSTANCIA, REVISAR');
                    console.log(err);
                });
            } else {
                alert('Por favor selecciona un material.');
            }
        }
    }    

    const cerrarInstancia = () => {
        window.location.href = `/rodillos/editar/${rodillo_id}`;
    }

    const handleEspecialChange = (event) => {
        setEspecial(event.target.value);
    }; 
    
    const handleMaterialChange = (event) => {
        setMaterial(event.target.value);
    }; 

    const handleDiametroChange = (event) => {
        setDiametroFG(event.target.value);
    }; 

    const handleDiametroEXTChange = (event) => {
        setDiametroEXT(event.target.value);
    }; 

    const handleInputactiva_qs = (event) => {
        if(instancia_activa){
            alert('Ya hay una instancia activa para QS, quitar antes de activar otra, gracias');
        }
        else{
            setActivaQS(event.target.value);
        }
    }; 

    const handleInputobsoleta = (event) => {
        setObsoleta(!obsoleta);
    };

    return(
        <Modal show={show} onHide={handlerClose} backdrop="static" keyboard={false} animation={false}>
            <Modal.Body>
                <Row>
                    <Col>
                        <h5>Agregar instancia al rodillo</h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="formSelectTrueFalse">
                            <Form.Label>¿La instancia del rodillo es especial?</Form.Label>
                            <Form.Control as="select" onChange={handleEspecialChange}>
                                <option value="false">No</option>
                                <option value="true">Si</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="formSelectFromVariable">
                            <Form.Label>Selecciona el material</Form.Label>
                            <Form.Control as="select" value={material} onChange={handleMaterialChange}>
                                <option value="">Selecciona una opción</option> {/* Opción predeterminada */}
                                {materiales.map((opcion, index) => (
                                    <option key={index} value={opcion.id}>
                                        {opcion.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="diametro">
                            <Form.Label>Introduce el diámetro de FG</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Introduce el Ø FG"
                                value={diametroFG}
                                onChange={handleDiametroChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="diametro_ext">
                            <Form.Label>Introduce el diámetro de EXT</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Introduce el Ø EXT"
                                value={diametroEXT}
                                onChange={handleDiametroEXTChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="activa_qs">
                            <Form.Check type="checkbox" 
                                        label="¿Activa en QS?"
                                        checked = {activa_qs}
                                        onChange = {handleInputactiva_qs} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="obsoleta">
                            <Form.Check type="checkbox" 
                                        label="obsoleta"
                                        checked = {obsoleta}
                                        onChange = {handleInputobsoleta} />
                        </Form.Group>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="warning" onClick={GuardarInstancia}>Aceptar</Button>
                <Button variant="warning" onClick={cerrarInstancia}>Cancelar</Button>
            </Modal.Footer>
        </Modal>
    );
}
export default RodCrearInstancia;