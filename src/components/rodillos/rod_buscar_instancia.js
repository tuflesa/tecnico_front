import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from 'react-bootstrap/Modal'
import { Button, Row, Form, Col, Table, Container } from 'react-bootstrap';

const BuscarInstancia = ({lineas_rectificandose, rectificacion, datos_rectificacion, show, cerrarList, setLineasInstancias, lineasInstancias, rectificados_pendientes})=>{
    const [token] = useCookies(['tec-token']);
    const [instancias_maquina, setInstanciaMaq] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [operaciones, setOperaciones] = useState([]);
    const [filtro, setFiltro] = useState(`?rodillo__operacion__seccion__maquina__id=${datos_rectificacion.zona}`);
    const [lineasInstancias_bot, setLineasInstancias_bot] = useState([]);

    const [datos, setDatos] = useState({
        id_instancia:'',
        nombre: '',
        seccion: '',
        operacion: '',
        grupo: '',
    });

    useEffect(()=>{
        if(rectificacion && lineas_rectificandose){
            setLineasInstancias_bot(lineas_rectificandose);
        }
    }, [token, lineas_rectificandose]);

    useEffect(()=>{
        const filtro1 = `?rodillo__operacion__seccion__maquina__id=${datos_rectificacion.zona}&rodillo__operacion__seccion__id=${datos.seccion}&rodillo__operacion__id=${datos.operacion}&nombre__icontains=${datos.grupo}&nombre__icontains=${datos.nombre}&id=${datos.id_instancia}`;
        actualizaFiltro(filtro1);
    },[datos, token]);

    const actualizaFiltro = str => {
        setFiltro(str);
    }

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/rodillos/instancia_listado/`+ filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            const instanciasConSeleccion = res.data.map(instancia => ({
                ...instancia,
                seleccionado: false  // Campo inicializado como 'false'
            }));
            
            setInstanciaMaq(instanciasConSeleccion);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, datos_rectificacion.zona, filtro]);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/rodillos/seccion/?maquina=${datos_rectificacion.zona}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setSecciones(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, datos_rectificacion.zona]);

    useEffect(()=>{
        datos.seccion && axios.get(BACKEND_SERVER + `/api/rodillos/operacion/?seccion__id=${datos.seccion}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setOperaciones(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [datos.seccion]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    } 

    const handleCheckboxChange = (e, id) => {
        if(e.target.checked && id && datos_rectificacion.fecha_estimada){
            axios.get(BACKEND_SERVER + `/api/rodillos/instancia_listado/${id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }
            })
            .then( async (res) => {
                const instanciaRepetido = lineasInstancias.filter(l => l.id === id)||lineasInstancias_bot.filter(l => l.id === id);
                const instancia_maquina = instancias_maquina.filter(l => l.id === id);
                if(instancia_maquina.length===0){
                    alert('Esta instancia no corresponde a la máquina/zona señalada, gracias.')
                }
                else if(instanciaRepetido.length===0 && instancia_maquina.length!==0){ //si no está repetido y es de esta máquina...
                    setLineasInstancias_bot([...lineasInstancias_bot, {
                        id: res.data.id,
                        nombre: res.data.nombre,
                        diametro: res.data.diametro,
                        diametro_ext: res.data.diametro_ext,
                        ancho: res.data.ancho,
                        fecha_estimada: datos_rectificacion.fecha_estimada,
                        num_ejes: res.data.rodillo.num_ejes,
                        archivo: res.data.rodillo.archivo,
                        rodillo_id: res.data.rodillo.id,
                    }]);
                    if(rectificacion && lineas_rectificandose){ // si estoy añadiendo pero ya tenía cabecera hecha
                        const formData = new FormData();
                        formData.append('rectificado', rectificacion.id);
                        formData.append('instancia', res.data.id);
                        formData.append('fecha', datos_rectificacion.fecha_estimada);
                        formData.append('diametro', res.data.diametro);
                        formData.append('diametro_ext', res.data.diametro_ext);
                        formData.append('ancho', res.data.ancho);
                        formData.append('nuevo_diametro', 0);
                        formData.append('nuevo_diametro_ext', 0);
                        formData.append('nuevo_ancho', 0);
                        formData.append('rectificado_por', '');
                        formData.append('tipo_rectificado', 'estandar');
                        formData.append('finalizado', false);
                        if (typeof res.data.rodillo.archivo === 'string') {
                            const response = await fetch(res.data.rodillo.archivo);
                            const blob = await response.blob();
                            let filename = res.data.rodillo.archivo.split('/').pop();                        
                            formData.append('archivo', blob, filename); // Usa el nombre del archivo extraído o el nombre por defecto
                        }
                        axios.post(BACKEND_SERVER + `/api/rodillos/linea_rectificacion/`,formData, { //Grabamos la nueva instancia elegida
                            headers: {
                                'Authorization': `token ${token['tec-token']}`
                                }     
                        })
                        .then( res => {  
                        })
                        .catch(err => { 
                            console.error(err);
                        })
                    }
                }
            })
            .catch( err => {
                console.log(err);
            });
        }
        else if (!e.target.checked) {
            // Si está desmarcado, elimina el elemento de lineasInstancias_bot
            setLineasInstancias_bot(lineasInstancias_bot.filter(linea => linea.id !== id));
        }
        const updatedInstancias = instancias_maquina.map(instancia => {
            if (instancia.id === id) {
                return {
                    ...instancia,
                    seleccionado: e.target.checked // Actualiza el campo 'seleccionado'
                };
            }
            return instancia;
        });
        setInstanciaMaq(updatedInstancias); // Actualiza el estado global
    };

    const cerrarListado = () => {
        setLineasInstancias_bot([]);
        cerrarList();
        setDatos({
            ...datos,
            id_instancia:'',
            nombre: '',
            seccion: '',
            operacion: '',
            grupo: '',
        })
    } 

    const añadirInstancia = () => {
        setLineasInstancias(prevLineasInstancias => [
            ...prevLineasInstancias, // Mantener las instancias anteriores
            ...lineasInstancias_bot   // Añadir las nuevas instancias
        ]);
        if(rectificacion && lineas_rectificandose){
            window.location.reload(); //actualizo página
        }
        cerrarList();
    } 

    const estaRectificandose = (instancia) => {
        return rectificados_pendientes.some(rectificado => rectificado.instancia.id === instancia.id);
    }
   
    return(
        <Modal show={show} backdrop="static" keyboard={ false } animation={false} size="xl">
            <Modal.Title>Buscar Rodillos</Modal.Title>
            <Modal.Header>
                <Container> 
                    <Form>                   
                        <Row>
                            <Col>
                                <Form.Group controlId="seccion">
                                    <Form.Label>Secciones *</Form.Label>
                                    <Form.Control as="select" 
                                                    value={datos.seccion}
                                                    name='seccion'
                                                    onChange={handleInputChange}>
                                        <option key={0} value={''}>Todas</option>
                                        {secciones && secciones.map( seccion => {
                                            return (
                                            <option key={seccion.id} value={seccion.id}>
                                                {seccion.nombre}
                                            </option>
                                            )
                                        })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="operacion">
                                    <Form.Label>Operaciones</Form.Label>
                                    <Form.Control as="select" 
                                                    value={datos.operacion}
                                                    name='operacion'
                                                    onChange={handleInputChange}>
                                        <option key={0} value={''}>Todas</option>
                                        {operaciones && operaciones.map( seccion => {
                                            return (
                                            <option key={seccion.id} value={seccion.id}>
                                                {seccion.nombre}
                                            </option>
                                            )
                                        })}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="formNombre">
                                    <Form.Label>Nombre Rodillo</Form.Label>
                                    <Form.Control type="text" 
                                                name='nombre' 
                                                value={datos.nombre}
                                                onChange={handleInputChange}                                        
                                                placeholder="Nombre contiene" 
                                                autoFocus/>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="id_instancia">
                                <Form.Label>Id Rodillo</Form.Label>
                                <Form.Control   type="text" 
                                                name='id_instancia' 
                                                value={datos.id_instancia}
                                                onChange={handleInputChange} 
                                                placeholder="Id rodillo" />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form> 
                </Container> 
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Sección</th>
                                    <th>Operación</th>
                                    <th>Nombre</th>
                                    <th>Seleccionar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {instancias_maquina && instancias_maquina.map( instancia => {                                    
                                    return (                                                
                                        <tr key={instancia.id}>
                                            <td>{instancia.rodillo.operacion.seccion.nombre} </td> 
                                            <td>{instancia.rodillo.operacion.nombre} </td> 
                                            <td>{instancia.nombre}</td>  
                                            <td>
                                                <input 
                                                    type="checkbox" 
                                                    checked={instancia.seleccionado} // Ligado a 'seleccionado'
                                                    disabled={estaRectificandose(instancia)}
                                                    onChange={(e) => handleCheckboxChange(e, instancia.id)} 
                                                />
                                            </td>                                        
                                        </tr>
                                    )})
                                }
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <table>
                    <tbody>
                        <tr>
                            <th>
                                <Button variant="info" onClick={añadirInstancia}>Agregar</Button>
                            </th>
                            <th>
                                <Button variant="info" onClick={cerrarListado}>Cerrar</Button>
                            </th>
                        </tr>
                    </tbody>
                </table>
            </Modal.Footer>
        </Modal>    
    )
}
export default BuscarInstancia;