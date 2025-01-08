import { Container } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Form, Col, Row, Table } from 'react-bootstrap';
import { PlusCircle, PencilFill} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import RodModificarInstancia from './rod_modificar_instancia';

const RodInstanciasRodillo = ({rodillo}) => {
    const [token] = useCookies(['tec-token']);
    const [show_instancia, setShowInstancia] = useState(false);
    const [show_mod_instancia, setShowModInstancia] = useState(false);
    const [instancias, setInstancias] = useState(null);
    const [instancia_activa, setInstanciaActiva] = useState([]);
    const [instancias_activas, setInstanciasActivas] = useState([]);
    const [modificar_instancia, setModificarInstancia] = useState(null);

    useEffect(() => {
        if(rodillo.id){
            axios.get(BACKEND_SERVER + `/api/rodillos/instancia_listado/?rodillo__id=${rodillo.id}&obsoleta=${false}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }
            })
            .then( res => {
                setInstancias(res.data); //todas las instancias del rodillo
                const instanciaActiva = res.data.filter(instancia => instancia.activa_qs === true);
                setInstanciasActivas(instanciaActiva);//instancias activas
                if(Object.keys(instanciaActiva).length === rodillo.num_ejes){
                    setInstanciaActiva(1);
                }
                else{
                    setInstanciaActiva(0);
                }
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, rodillo]);

    const añadirInstancia = () => {
        setShowInstancia(true);
    }

    const cerrarInstancia = () => {
        setShowInstancia(false);
    }

    const ModificarInstancia = (instancia) => {
        setModificarInstancia(instancia);
        setShowModInstancia(true);
    }

    const CerrarModificarInstancia = () => {
        setShowModInstancia(false);
        setModificarInstancia();
        //window.location.reload();
    }

    return (
        <Container className='mt-5 pt-1'>
            <Form>
                {rodillo.length!==0?
                    <React.Fragment> 
                        <Form.Row>
                        <Col>
                            <Row>
                                <Col>
                                <h5 className="pb-3 pt-1 mt-2">Añadir Instancia:</h5>
                                </Col>
                                <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                        <PlusCircle className="plus mr-2" size={30} onClick={añadirInstancia}/>
                                </Col>
                            </Row>
                        </Col>
                        </Form.Row>
                    </React.Fragment>
                :null}
            </Form>
                {instancias?instancias.length!==0?
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Material</th>
                                <th>Ø fondo (mm)</th>
                                <th>Ø exterior (mm)</th>
                                <th>Ø centro (mm)</th>
                                <th>Ancho (mm)</th>
                                <th>Activa QS</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            { instancias && instancias.map( instancia => {
                                return (
                                    <React.Fragment key={instancia.id}>
                                        <tr key={instancia.id}>
                                            <td>{instancia.nombre}</td>
                                            <td>{instancia.material.nombre}</td>
                                            <td>{'Ø'+instancia.diametro}</td>
                                            <td>{'Ø'+instancia.diametro_ext}</td>
                                            <td>{'Ø'+instancia.diametro_centro}</td>
                                            <td>{instancia.ancho}</td>
                                            <td>{instancia.activa_qs===false?'NO':'SI'}</td>
                                            <td><Link title='Modificar'onClick={() => ModificarInstancia(instancia)}>
                                                    <PencilFill className="mr-3 pencil"/>
                                                </Link>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                )})
                            }
                        </tbody>
                    </Table>
                :null:null}

                {rodillo?
                    <RodModificarInstancia show={show_instancia}
                                        rodillo={rodillo}
                                        handlerClose={cerrarInstancia}
                                        instancia_activa={instancia_activa}
                                        instancias_activas={instancias_activas}
                                        />
                :''}
                {modificar_instancia?
                    <RodModificarInstancia show={show_mod_instancia}
                                        handlerClose={CerrarModificarInstancia}
                                        instancia={modificar_instancia}
                                        instancia_activa={instancia_activa}
                                        instancias_activas={instancias_activas}
                                        rodillo={rodillo}
                                        />
                :''}

        </Container>
    );
}

export default RodInstanciasRodillo;
