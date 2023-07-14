import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';

const RodPlanos = () => {
    const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState([]);
    const [rodillos, setRodillos] = useState([]);
    const [token] = useCookies(['tec-token']);
    
    const [datos, setDatos] = useState({
        nombre: '',
    });

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/lista_rodillos/`, {
            headers: {
            'Authorization': `token ${token['tec-token']}`
            }
        })
        .then(res => {
          setRodillos(res.data);
        })
        .catch(err => {
          console.log(err);
        });
    }, [token]);
  
    const handleCheckboxChange = (event) => {
        const { value } = event.target;
        if (opcionesSeleccionadas.includes(value)) {
            setOpcionesSeleccionadas(opcionesSeleccionadas.filter(opcion => opcion !== value));
        } else {
            setOpcionesSeleccionadas([...opcionesSeleccionadas, value]);
        }
    };

    const GuardarPlano = () => {
        axios.post(BACKEND_SERVER + `/api/rodillos/crear_plano/`, {
            nombre: datos.nombre,
            rodillos: opcionesSeleccionadas,
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }     
        })
        .then( res => { 
            console.log('plano creado');
        })
        .catch(err => { console.log(err);})
    };
  
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value           
        });
    }

    return (
      <Container className='mt-5'>
        <h5 className="mb-3 mt-3">Dar de alta un plano</h5>      
        
        <Form>
            <Form.Group controlId="nombre">
                <Form.Label>Nombre del plano</Form.Label>
                <Form.Control type="text" 
                            name='nombre' 
                            value={datos.nombre}
                            onChange={handleInputChange} 
                            placeholder="Plano"
                            autoFocus
                />
            </Form.Group>
            <h5 className="mb-3 mt-3">Elige los Rodillos del plano</h5>
            {rodillos.map(rodillo => (
                <Form.Check
                    key={rodillo.id}
                    type="checkbox"
                    id={`checkbox-${rodillo.id}`}
                    label={rodillo.nombre}
                    value={String(rodillo.id)} // Convertir a cadena de texto
                    checked={opcionesSeleccionadas.includes(String(rodillo.id))} // Convertir a cadena de texto
                    onChange={handleCheckboxChange}
                />
          ))}
        </Form>
        <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
        <Button variant="outline-primary" onClick={GuardarPlano}>Guardar</Button>
      </Container>
    );
  }
  
  export default RodPlanos;
  
  
  