import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Form, Col } from 'react-bootstrap';

const FiltroTareasTrabajador = ({actualizaFiltro}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [usuarios, setUsuarios] = useState(null);
    const [datos, setDatos] = useState({
        nombre_persona:'',
        fecha_inicio_lte:'',
        fecha_inicio_gte:'',
    })

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/administracion/usuarios/?perfil__empresa__id=${user['tec-user'].perfil.empresa.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setUsuarios(res.data.sort(function(a, b){
                if(a.get_full_name > b.get_full_name){
                    return 1;
                }
                if(a.get_full_name < b.get_full_name){
                    return -1;
                }
                return 0;
            }))
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(()=>{
        const filtro = (`?trabajador=${datos.nombre_persona}&fecha_inicio__lte=${datos.fecha_inicio_lte}&fecha_inicio__gte=${datos.fecha_inicio_gte}`);
        actualizaFiltro(filtro);
    },[ datos.nombre_persona, datos.fecha_inicio_gte, datos.fecha_inicio_lte, token]);

    

    return(
        <Container className="mt-5">
            <h5 className="mt-5">Filtro</h5>
            <Form>
                <Row>
                    <Col>
                        <Form.Group controlId="nombre_persona">
                            <Form.Label>Trabajo realizado por:</Form.Label>
                            <Form.Control as="select"  
                                        name='nombre_persona' 
                                        value={datos.nombre_persona}
                                        onChange={handleInputChange}
                                        placeholder="Trabajador">
                                        <option key={0} value={''}>Todas</option>    
                                        {usuarios && usuarios.map( usuario => {
                                            return (
                                            <option key={usuario.id} value={usuario.id}>
                                                {usuario.get_full_name}
                                            </option>
                                            )
                                        })}
                        </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha_inicio_gte">
                            <Form.Label>Fecha Inicio Posterior a</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_inicio_gte' 
                                        value={datos.fecha_inicio_gte}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha inicio posterior a..." />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fecha_inicio_lte">
                            <Form.Label>Fecha Inicio Anterior a</Form.Label>
                            <Form.Control type="date" 
                                        name='fecha_inicio_lte' 
                                        value={datos.fecha_inicio_lte}
                                        onChange={handleInputChange} 
                                        placeholder="Fecha inicio anterior a..." />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}

export default FiltroTareasTrabajador;