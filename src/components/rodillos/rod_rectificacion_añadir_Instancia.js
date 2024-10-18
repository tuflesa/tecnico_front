import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Container, Table } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Trash } from 'react-bootstrap-icons';
import axios from 'axios';
import { constants } from 'buffer';

const RodRectificacionAñadirInstancia = ({rectificacion, datos, cambioCodigo, numeroBar, setNumeroBar}) => {
    const [token] = useCookies(['tec-token']);
    const [lineasInstancias, setLineasInstancias] = useState([]);
    const [instancias_maquina, setInstanciaMaq] = useState([]);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/rodillos/instancia_listado/?rodillo__operacion__seccion__maquina__id=${datos.zona}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setInstanciaMaq(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, datos.zona]);

    useEffect(() => {
        if (lineasInstancias) {
            const nuevasLineasInstancias = lineasInstancias.map(linea => ({
                ...linea,
                fecha_estimada: datos.fecha_estimada
            }));
            setLineasInstancias(nuevasLineasInstancias);
        }
    }, [datos.fecha_estimada]);

    useEffect(()=>{
        datos.id_instancia && datos.fecha_estimada && axios.get(BACKEND_SERVER + `/api/rodillos/instancia_listado/${datos.id_instancia}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            const instanciaRepetido = lineasInstancias.filter(l => l.id === datos.id_instancia);
            const instancia_maquina = instancias_maquina.filter(l => l.id === datos.id_instancia);
            if(instancia_maquina.length===0){
                alert('Esta instancia no corresponde a la máquina/zona señalada, gracias.')
                setNumeroBar({
                    ...numeroBar,
                    id_instancia: ''
                });
            }
            else if(instanciaRepetido.length===0 && instancia_maquina.length!==0){
                setLineasInstancias([...lineasInstancias, {
                    id: res.data.id,
                    nombre: res.data.nombre,
                    diametro: res.data.diametro,
                    diametro_ext: res.data.diametro_ext,
                    ancho: res.data.ancho,
                    fecha_estimada: datos.fecha_estimada,
                }]);
            }
        })
        .catch( err => {
            console.log(err);
        });
    }, [cambioCodigo]);

    const handleInputChange_fecha = (linea) => (event) => {
        const { value } = event.target;
        // Actualiza el estado de lineasInstancias
        setLineasInstancias((prev) =>
            prev.map((instancia) =>
                instancia.id === linea.id ? { ...instancia, fecha_estimada: value } : instancia
            )
        );
    };

    const borrarLinea = (linea) => {
        const newLineas = lineasInstancias.filter( l => l.id !== linea.id);
        setLineasInstancias(newLineas);
    }

    return(
        <Container className='mt-5 pt-1'>
            <Form.Row className="justify-content-center">
                {datos.linea || rectificacion ? 
                    <Button variant="danger" type="submit" className={'mx-2'} onClick={'GuardarLineas'}>Mandar Ficha</Button>:null                                
                }
            </Form.Row>
            {datos.linea || rectificacion ?
                <Row>
                    <Col>
                        <h5 className="mb-3 mt-3">Lista de Instancias</h5>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Nombre</th>
                                    <th>Diámetro Fondo</th>                                
                                    <th>Diámetro Exterior</th>
                                    <th>Ancho</th>
                                    <th>Fecha estimada</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineasInstancias.map(linea => {
                                    return (
                                        <tr>
                                            <td>{linea.id}</td>
                                            <td>{linea.nombre}</td>
                                            <td>{linea.diametro}</td>
                                            <td>{linea.diametro_ext}</td> 
                                            <td>{linea.ancho}</td>  
                                            <td>
                                                <Form.Group controlId="fecha_estimada">
                                                    <Form.Control type="date" 
                                                                name='fecha_estimada' 
                                                                value={linea.fecha_estimada}
                                                                onChange={handleInputChange_fecha(linea)} 
                                                                placeholder="Fecha estimada" />
                                                </Form.Group>
                                            </td>
                                            <td>
                                                <Trash className="mr-3 pencil"  onClick={event => {borrarLinea(linea)}} />
                                            </td>                             
                                        </tr>
                                )})}
                            </tbody>
                        </Table>
                    </Col>                
                </Row>
            :null}
            <Form.Row className="justify-content-center">
                {datos.linea || rectificacion ? 
                    <Button variant="danger" type="submit" className={'mx-2'} onClick={'GuardarLineas'}>Mandar Ficha</Button>:null                                
                }
            </Form.Row>
        </Container>
    );
}
export default RodRectificacionAñadirInstancia;