import React , { useState, useEffect } from "react";
import { Container, Row, Form, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const ManListaFiltro = ({actualizaFiltro}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']); 
    const [empresas, setEmpresas] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [zonas, setZonas] = useState(null);
    const [equipos, setEquipos] = useState(null);

    const [datos, setDatos] = useState({
        id: '',
        nombre: '',
        especialidad: '',
        prioridad_menor: '',
        prioridad_mayor: '',
    });

    const [especialidades, setEspecialidades] = useState(null);
    const [tipotarea, setTipoTarea] = useState(null);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/mantenimiento/especialidades/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEspecialidades(res.data.sort(function(a, b){
                if(a.nombre > b.nombre){
                    return 1;
                }
                if(a.nombre < b.nombre){
                    return -1;
                }
                return 0;
            }))
        })
        .catch( err => {
            console.log(err); 
        })       
    }, [token]);    

    useEffect(()=>{
        const filtro = `?nombre__icontains=${datos.nombre}&especialidad=${datos.especialidad}&prioridad__lte=${datos.prioridad_menor}&prioridad__gte=${datos.prioridad_mayor}`;                
        actualizaFiltro(filtro);
    },[datos.id, datos.nombre, datos.especialidad,datos.prioridad_mayor, datos.prioridad_menor, token]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    return (
        <Container>
            <h5 className="mb-3 mt-3">Filtro</h5>
            <Form>
                <Row>                    
                    <Col>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Nombre contiene</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange}                                        
                                        placeholder="Nombre contiene"
                                        autoFocus/>
                        </Form.Group>
                    </Col>                                                            
                    <Col>
                        <Form.Group controlId="especialidades">
                            <Form.Label>Especialidades</Form.Label>
                            <Form.Control as="select"  
                                        name='especialidad' 
                                        value={datos.especialidad}
                                        onChange={handleInputChange}
                                        placeholder="Especialidad">
                                            <option key={0} value={''}>Todos</option>
                                        {especialidades && especialidades.map( especialidad => {
                                            return (
                                            <option key={especialidad.id} value={especialidad.id}>
                                                {especialidad.nombre}
                                            </option>
                                            )
                                        })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="menorque">
                            <Form.Label>Prioridad menor que:</Form.Label>
                            <Form.Control type="text" 
                                        name='prioridad_menor' 
                                        value={datos.prioridad_menor}
                                        onChange={handleInputChange}                                        
                                        placeholder="Prioridad menor que"
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="mayorque">
                            <Form.Label>Prioridad mayor que:</Form.Label>
                            <Form.Control type="text" 
                                        name='prioridad_mayor' 
                                        value={datos.prioridad_mayor}
                                        onChange={handleInputChange}                                        
                                        placeholder="Prioridad mayor que"
                            />
                        </Form.Group>
                    </Col>                    
                </Row>               
            </Form>
        </Container>
    );
}
export default ManListaFiltro;