import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useBarcode } from 'react-barcodes';

const RodModificarInstancia = ({show, handlerClose, instancia, instancia_activa, instancia_activa_id, rodillo_eje, rodillo}) => {
    const [token] = useCookies(['tec-token']);
    const [materiales, setMateriales] = useState([]);
    const [select_Archivo, setSelectArchivo] = useState(instancia?instancia.archivo:'');
    const [datos, setDatos] = useState({
        id: instancia.id? instancia.id:null,
        nombre: instancia.id?instancia.nombre:'',
        rodillo: instancia.id?instancia.rodillo.id:'',
        material: instancia.id?instancia.material.id:'',
        especial: instancia.id?instancia.especial:'',
        diametroFG: instancia.id?instancia.diametro:'',
        diametroEXT: instancia.id?instancia.diametro_ext:'',
        activa_qs:instancia.id?instancia.activa_qs:'',
        obsoleta: instancia.id?instancia.obsoleta:'',
        archivo: instancia.id?instancia.archivo:'',
    });
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

    const ModificarInstancia = () => {
        if(parseFloat(datos.diametroFG)>parseFloat(datos.diametroEXT)){
            alert('El diámetro de fondo no puede ser superior al diámetro exterior. Por favor corregir, gracias');
        }
        else if(rodillo_eje>parseFloat(datos.diametroFG) || rodillo_eje===parseFloat(datos.diametroFG)){
            alert('El diámetro de fondo, no puedes ser inferior o igual al eje del rodillo. Por favor corregir, gracias')
        }
        else{
            const formData = new FormData();
            formData.append('material', datos.material);
            formData.append('especial', datos.especial);
            formData.append('diametro', datos.diametroFG);
            formData.append('diametro_ext', datos.diametroEXT);
            formData.append('activa_qs', datos.activa_qs);
            formData.append('obsoleta', datos.obsoleta);
            if (select_Archivo) {
                formData.append('archivo', select_Archivo); // Solo agrega si existe un archivo
            }
            axios.patch(BACKEND_SERVER + `/api/rodillos/instancia_nueva/${instancia.id}/`, formData, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(r => {
                if(datos.obsoleta===true){
                    axios.patch(BACKEND_SERVER + `/api/rodillos/rodillos/${rodillo.id}/`, {
                        num_instancias: rodillo.num_instancias-1,
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                        }     
                    })
                    .then(r => {
                        alert('Acaba de ANULAR una instancia de rodillo, gracias.');
                    })
                    .catch(err => { 
                        console.log(err);
                    });
                }
                window.location.href = `/rodillos/editar/${instancia.rodillo.id}`;
            })
            .catch(err => { 
                alert('NO SE ACTUALIZA LA INSTANCIA, REVISAR');
                console.log(err);
            });
        }
    }   

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleInputChange_qs = (event) => {
        if(event.target.value==='on' && instancia_activa && instancia_activa_id[0].id!==instancia.id){
            alert('Ya hay una instancia activa para QS, quitar antes de activar otra, gracias');
        }
        else{
            setDatos({
                ...datos,
                activa_qs:!datos.activa_qs
            })
        }
    }; 

    const handleInputChange_obsoleta = (event) => {
        setDatos({
            ...datos,
            obsoleta:!datos.obsoleta
        })
    }

    const cerrarInstancia = () => {
        setDatos({
            ...datos,
            id: null,
            nombre: '',
            rodillo: '',
            material: '',
            especial: '',
            diametroFG: '',
            diametroEXT: '',
            activa_qs:'',
            obsoleta: '',
        })
        setSelectArchivo(null);
        handlerClose();
        //window.location.href = `/rodillos/editar/${instancia.rodillo.id}`;
    }

    function Barcode({datos}) {
        const {inputRef}  = useBarcode({
          value: String(datos.id).padStart(12,'0'),
          options: {
            format: "ean13",
            flat: true,
            height: 60,
            fontSize: 16,
          }            
        }); 
        return <svg id="barcode-canvas" ref={inputRef}/>;
    }; 

    const ImprimirBarcode = () => {
        var container = document.getElementById('barcode');
        var width = "100%";
        var height = "100%";
        var printWindow = window.open('', 'PrintMap','width=' + width + ',height=' + height);
        printWindow.document.writeln('<center>'+'Grupo Bornay'+'</br>'+container.innerHTML + '</br>' + datos.id + '-' + datos.nombre + '</center>');
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    }
    
    const handleInputChange_archivo = (event) => {
        setSelectArchivo(event.target.files[0]);
    };

    return(
        <Modal show={show} onHide={handlerClose} backdrop="static" keyboard={false} animation={false}>
            <Modal.Body>
                <Row>
                    <Col>
                        <h5>Modificar instancia al rodillo</h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="formSelectTrueFalse">
                            <Form.Label>¿La instancia del rodillo es especial?</Form.Label>
                            <Form.Control as="select" onChange={handleInputChange} name='especial'>
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
                            <Form.Control as="select" value={datos.material} name="material" onChange={handleInputChange}>
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
                                name="diametroFG"
                                type="text"
                                placeholder="Introduce el Ø FG"
                                value={datos.diametroFG}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="diametro_ext">
                            <Form.Label>Introduce el diámetro de EXT</Form.Label>
                            <Form.Control
                                name="diametroEXT"
                                type="text"
                                placeholder="Introduce el Ø EXT"
                                value={datos.diametroEXT}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="archivo">
                            <Form.Label>Selecciona un archivo</Form.Label>
                            {datos.archivo && (
                                <Form.Text className="text-muted d-block">
                                    Archivo guardado: <a href={datos.archivo} target="_blank" rel="noopener noreferrer">{datos.archivo}</a>
                                </Form.Text>
                            )}
                            <Form.Control type="file" onChange={handleInputChange_archivo} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="activa_qs">
                            <Form.Check type="checkbox" 
                                        name='activa_qs'
                                        label="¿Activa en QS?"
                                        checked = {datos.activa_qs}
                                        onChange = {handleInputChange_qs} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="obsoleta">
                            <Form.Check type="checkbox" 
                                        label="obsoleta"
                                        checked = {datos.obsoleta}
                                        onChange = {handleInputChange_obsoleta} />
                        </Form.Group>
                    </Col>
                    <Col>
                        <div id='barcode'>
                            {datos.id && <Barcode datos={datos}/>}
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="warning" onClick={ModificarInstancia}>Modificar</Button>
                <Button variant="warning" onClick={cerrarInstancia}>Cancelar</Button>
                {datos.id && <Button variant='info' className={'mx-2'} onClick={ImprimirBarcode}>Imprimir Etiqueta</Button>}
            </Modal.Footer>
        </Modal>
    );
}
export default RodModificarInstancia;