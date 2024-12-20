//Modificar y crear una instancia
import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useBarcode } from 'react-barcodes';

const RodModificarInstancia = ({show, handlerClose, instancia, instancia_activa, instancias_activas, diametro_eje, rodillo}) => {
    const [token] = useCookies(['tec-token']);
    const [materiales, setMateriales] = useState([]);
    const [posiciones, setPosiciones] = useState([]);
    const [posiciones_filtradas, setPosiciones_filtradas] = useState([]);
    const [datos, setDatos] = useState({
        id: instancia? instancia.id:null,
        nombre: instancia?instancia.nombre:'',
        rodillo: instancia?instancia.rodillo.id:'',
        material: instancia?instancia.material.id:'',
        especial: instancia?instancia.especial:'',
        diametroFG: instancia?instancia.diametro:'',
        diametroEXT: instancia?instancia.diametro_ext:'',
        diametroCentro: instancia?instancia.diametro_centro:'',
        activa_qs:instancia?instancia.activa_qs:false,
        obsoleta: instancia?instancia.obsoleta:false,
        ancho: instancia?instancia.ancho:'',
        posicion: instancia?instancia.posicion:'',
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

    // Leer posiciones
    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/posicion/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then((res) => {
            let posicionesFiltradas = [];
            if (instancias_activas) {
                // Filtramos las posiciones excluyendo las ya activas
                posicionesFiltradas = res.data.filter(
                    (posicion) =>
                        !instancias_activas.some(
                            (instancia) => instancia.posicion === posicion.id
                        )
                );

                // Agregamos explícitamente la posición que coincida con datos.posicion si existe
                const posicionDatos = res.data.find(
                    (posicion) => posicion.id === datos.posicion
                );
                if (posicionDatos && !posicionesFiltradas.some((p) => p.id === datos.posicion)) {
                    posicionesFiltradas.push(posicionDatos);
                }
            }
            else{
                posicionesFiltradas = res.data;
            }
            setPosiciones_filtradas(posicionesFiltradas);
            setPosiciones(res.data);
        })
        .catch((err) => {
            console.log(err);
        });
    }, [token, show, datos.posicion]);

    const GuardarInstancia = () => {
        if(parseFloat(datos.diametroFG)>parseFloat(datos.diametroEXT)){
            alert('El diámetro de fondo no puede ser superior al diámetro exterior. Por favor corregir.');
        }
        if(parseFloat(rodillo.diametro)>parseFloat(datos.diametroFG) || parseFloat(rodillo.diametro)===parseFloat(datos.diametroFG)){
            alert('El diámetro de fondo, no puedes ser inferior o igual al eje del rodillo. Por favor corregir.')
        }
        else if(parseFloat(datos.diametroFG)<parseFloat(datos.diametroEXT) && parseFloat(rodillo.diametro)<parseFloat(datos.diametroFG) && parseFloat(rodillo.diametro)!==parseFloat(datos.diametroFG)||parseFloat(datos.diametroFG)===parseFloat(datos.diametroEXT)){
            if (datos.material) {
                axios.post(BACKEND_SERVER + `/api/rodillos/instancia_nueva/`, {
                    nombre: rodillo.nombre + '-' + (rodillo.num_instancias+1),
                    rodillo: rodillo.id,
                    especial: false,
                    material: datos.material,
                    diametro: datos.diametroFG,
                    diametro_ext: datos.diametroEXT,
                    diametro_centro: datos.diametroCentro,
                    activa_qs: datos.activa_qs,
                    obsoleta: false,
                    ancho: datos.ancho,
                    posicion: datos.posicion,
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
                    })
                    .catch(err => { 
                        console.log(err);
                    });
                    window.location.href = `/rodillos/editar/${rodillo.id}`;
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

    const ModificarInstancia = () => {
        if(parseFloat(datos.diametroFG)>parseFloat(datos.diametroEXT)){
            alert('El diámetro de fondo no puede ser superior al diámetro exterior. Por favor corregir.');
        }
        else if(rodillo.diametro>parseFloat(datos.diametroFG) || rodillo.diametro===parseFloat(datos.diametroFG)){
            alert('El diámetro de fondo, no puedes ser inferior o igual al eje del rodillo. Por favor corregir.')
        }
        else{
            axios.patch(BACKEND_SERVER + `/api/rodillos/instancia_nueva/${instancia.id}/`, {
                material: datos.material,
                diametro: datos.diametroFG,
                diametro_ext: datos.diametroEXT,
                diametro_centro: datos.diametroCentro,
                activa_qs: datos.obsoleta?false:datos.activa_qs,
                obsoleta: datos.obsoleta,
                ancho: datos.ancho,
                posicion: datos.posicion,
                }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`,
                }
            })
            .then(r => {
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
        if(instancias_activas){
            if(instancias_activas.length < rodillo.num_ejes && !rodillo.rectificado_por_parejas){
                setDatos({
                    ...datos,
                    activa_qs:!datos.activa_qs
                })
            }
            else{
                if(datos.activa_qs===true){
                    setDatos({
                        ...datos,
                        activa_qs:!datos.activa_qs
                    }) 
                }
                else{
                    if(rodillo.rectificado_por_parejas){
                        alert('Estamos trabajando por parejas. No se pueden poner más instancia activa para QS, desactiva antes la señalada.');
                    }
                    else{
                        alert('No se pueden poner más instancia activa para QS, desactiva alguna antes. Numero de ejes: '+ rodillo.num_ejes + ' Numero de instancias activas: ' + instancias_activas.length);
                    }                    
                    setDatos({
                        ...datos,
                        activa_qs:false
                    })
                }
            }
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
            posicion: '',
        })
        instancia=[];
        handlerClose();
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

    return(
        <Modal show={show} onHide={handlerClose} backdrop="static" keyboard={false} animation={false}>
            <Modal.Body>
                <Row>
                    <Col>
                        {datos.id?<h5>Modificar instancia al rodillo</h5>:<h5>Agregar instancia al rodillo</h5>}
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
                            <Form.Label>Introduce el diámetro de fondo (mm)</Form.Label>
                            <Form.Control
                                name="diametroFG"
                                type="text"
                                placeholder="Ø fondo"
                                value={datos.diametroFG}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="diametro_ext">
                            <Form.Label>Introduce el diámetro de exterior (mm)</Form.Label>
                            <Form.Control
                                name="diametroEXT"
                                type="text"
                                placeholder="Ø ext"
                                value={datos.diametroEXT}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="diametroCentro">
                            <Form.Label>Introduce el diámetro de centro (mm)</Form.Label>
                            <Form.Control
                                name="diametroCentro"
                                type="text"
                                placeholder="Ø centro"
                                value={datos.diametroCentro}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="ancho">
                            <Form.Label>Introduce el ancho (mm)</Form.Label>
                            <Form.Control
                                name="ancho"
                                type="text"
                                placeholder="Introduce ancho"
                                value={datos.ancho}
                                onChange={handleInputChange}
                            />
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
                        {datos.activa_qs && <Form.Group controlId="posicion">
                            <Form.Label>Selecciona posición</Form.Label>
                            <Form.Control 
                                        as="select" 
                                        value={datos.posicion} 
                                        name="posicion" 
                                        onChange={handleInputChange}>
                                <option value="">Selecciona una opción</option> {/* Opción predeterminada */}
                                {posiciones_filtradas.map((posicion, index) => (
                               //{(datos.posicion ? posiciones : instancias_activas ? posiciones_filtradas: posiciones).map((posicion, index) => (
                                    <option key={index} value={posicion.id}>
                                    {posicion.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>}
                    
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
                {datos.id?<Button variant="warning" onClick={ModificarInstancia}>Modificar</Button>:<Button variant="warning" onClick={GuardarInstancia}>Guardar</Button>}
                <Button variant="warning" onClick={cerrarInstancia}>Cancelar</Button>
                {datos.id && <Button variant='info' className={'mx-2'} onClick={ImprimirBarcode}>Imprimir Etiqueta</Button>}
            </Modal.Footer>
        </Modal>
    );
}
export default RodModificarInstancia;