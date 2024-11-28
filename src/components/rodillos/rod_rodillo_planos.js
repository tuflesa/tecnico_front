import { Container } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import { Form, Col, Row, Table } from 'react-bootstrap';
import PlanoForm from './rod_plano_nuevo';
import { PlusCircle, Clipboard, Trash} from 'react-bootstrap-icons';
import {invertirFecha} from '../utilidades/funciones_fecha';
import RodRevisionForm from './rod_revision_form';

const RodPlanosRodillo = ({rodillo, rodillo_nuevo, tipo_plano_id}) => {
    const [user] = useCookies(['tec-user']);
    const [token] = useCookies(['tec-token']);
    const [planos, setPlanos] = useState(null);
    const [show_plano, setShowPlano] = useState(false);
    const [show, setShow] = useState(false);
    const [valor_conjuntos, setValorConjuntos] = useState('');
    const [filaSeleccionada, setFilaSeleccionada] = useState(null);
    const [plano_id, setPlano_id] = useState('');
    const [plano_nombre, setPlano_nombre] = useState('');
    const [showRevision, setShowRevision] = useState(false);
    const [pulsamos_revision, setPulsamosRevision] = useState(false);
    const [revisiones, setRevisiones] = useState('');
    const [revisiones_lenght, setRevisionesLenght] = useState('');
    const soySuperTecnico = user['tec-user'].perfil.puesto.nombre==='Director Técnico'?true:false;

    useEffect(() => {
        if(plano_nombre!=='' && plano_id!==''){
            setShowRevision(true);
        }
    }, [pulsamos_revision, plano_nombre, plano_id, revisiones_lenght]);

    useEffect(() => {
        if(rodillo.id){
            axios.get(BACKEND_SERVER + `/api/rodillos/plano/?rodillos=${rodillo.id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }
            })
            .then( res => {
                setPlanos(res.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, rodillo]);

    const abrirConjuntos = (plano) => {     
        axios.get(BACKEND_SERVER + `/api/rodillos/revision_conjuntos/?plano=${plano}`,{ //REVISIONES DE LOS PLANOS
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setRevisiones(res.data);
            setShow(!show);                          
            if(show){
                const tabla = (
                    <div>
                    <h2 style={{textAlign: 'center'}}>Revisiones del plano</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Motivo</th>
                                <th>Nombre</th>
                                <th>Archivo</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {res.data && res.data.map( conjunto => {
                                return (
                                    <React.Fragment key={conjunto.id}>
                                        <tr key={conjunto.id}>
                                            <td>{conjunto.motivo}</td>
                                            <td>{conjunto.nombre}</td>
                                            <td>
                                                <a href={conjunto.archivo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Haz clic para abrir el PDF">
                                                {conjunto.archivo}
                                                </a>
                                            </td>
                                            
                                            <td>{invertirFecha(String(conjunto.fecha))}</td>
                                        </tr>
                                    </React.Fragment>
                                )})
                            }
                        </tbody>
                    </Table>
                    </div>
                );
                setValorConjuntos(tabla);
                setFilaSeleccionada(plano);
            }
            else{
                setValorConjuntos('');
                setFilaSeleccionada('');
                setRevisiones(null);
            }
        })
        .catch( err => {
            console.log(err);
        });
        
        
    };

    const eliminarPlano = (plano) => { 
        var confirmacion = window.confirm('¿Confirma que desea eliminar este plano, en este rodillo?');
        if(confirmacion){
            for(var x=0;x<plano.rodillos.length;x++){
                if(plano.rodillos[x]===rodillo_nuevo.id){
                    plano.rodillos.splice(x,1); //elimina el elemento que cumple la condición.
                }
            }
            if(plano.rodillos.length===0){
                var eliminacion = window.confirm('Este plano no está en otro rodillo, va a eliminar el plano. ¿Desea continuar?');
                if(eliminacion){
                    axios.delete(BACKEND_SERVER + `/api/rodillos/plano/${plano.id}/`,{
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                            }
                    })
                    .then( res => {
                        window.location.href = `/rodillos/editar/${rodillo.id}`; 
                    })
                    .catch( err => {
                        console.log(err);
                    });
                }
            }
            else{
                axios.patch(BACKEND_SERVER + `/api/rodillos/plano/${plano.id}/`, {
                    rodillos: plano.rodillos,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                        }     
                })
                .then( res => { 
                    window.location.href = `/rodillos/editar/${rodillo.id}`;
                })
                .catch(err => { 
                    console.log(err);
                })
            }
            
        }    
    };

    const NuevaRevision = (plano) => {
        axios.get(BACKEND_SERVER + `/api/rodillos/revision_planos/?plano__id=${plano.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setRevisiones(res.data);
            setRevisionesLenght(res.data.length);
        })
        .catch( err => {
            console.log(err);
        });

        setPlano_id(plano.id);
        setPlano_nombre(plano.nombre);
        setPulsamosRevision(!pulsamos_revision);
    }

    const añadirPlano = () => {
        setShowPlano(true);
    }
    
    const cerrarPlano = () => {
        setShowPlano(false);
    }

    const handleInputChange = (planoId, newValue) => {
        axios.patch(`${BACKEND_SERVER}/api/rodillos/plano/${planoId}/`, {
                xa_rectificado: newValue }, 
                {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                }
            )
            .then(response => {
                // Actualizar el estado de 'planos' localmente
                setPlanos(prevPlanos =>
                    prevPlanos.map(plano =>
                        plano.id === planoId 
                            ? { ...plano, xa_rectificado: newValue } 
                            : plano
                    )
                );
            })
            .catch(error => {
                console.error('Error al actualizar xa_rectificado:', error);
            });
    };    

    return (
        <Container className='mt-5 pt-1'>
            <Form>
                {rodillo.length!==0?
                    <React.Fragment> 
                        <Form.Row>
                        <Col>
                            <Row>
                                <Col>
                                <h5 className="pb-3 pt-1 mt-2">Añadir Plano:</h5>
                                </Col>
                                <Col className="d-flex flex-row-reverse align-content-center flex-wrap">
                                        <PlusCircle className="plus mr-2" size={30} onClick={añadirPlano}/>
                                </Col>
                            </Row>
                        </Col>
                        </Form.Row>
                    </React.Fragment>
                :null}
            </Form>
            {planos?planos.length!==0?
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Revisiones</th>
                            <th>Nombre</th>
                            <th>Cod Antiguo</th>
                            <th>Descripción</th>
                            <th>Para rectificado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        { planos && planos.map( plano => {
                            return (
                                <React.Fragment key={plano.id}>
                                    <tr key={plano.id}>
                                        <td>
                                            <button type="button" className="btn btn-default" value={plano.id} name='prueba' onClick={event => {abrirConjuntos(plano.id)}}>--</button>
                                        </td>
                                        <td>{plano.nombre}</td>
                                        <td>{plano.cod_antiguo}</td>
                                        <td>{plano.descripcion}</td>
                                        <td>
                                            <input 
                                                type="checkbox" 
                                                checked={plano.xa_rectificado} 
                                                readOnly 
                                                onChange={(e) => handleInputChange(plano.id, e.target.checked)} 
                                                disabled={!soySuperTecnico}
                                            />
                                        </td>
                                        <td>
                                            <Clipboard className="mr-3 pencil" onClick={event => {NuevaRevision(plano)}}/>   
                                            <Trash className="mr-3 pencil" onClick={event => {eliminarPlano(plano)}}/>                                                      
                                        </td>
                                    </tr>
                                    {filaSeleccionada === plano.id && (
                                        <tr>
                                            <td colSpan="4">{valor_conjuntos}</td>
                                        </tr>
                                        )}
                                </React.Fragment>
                            )})
                        }
                    </tbody>
                </Table>
            :"No hay planos relacionados con este rodillo":null}

            <PlanoForm show={show_plano}
                                handleCloseParametros={cerrarPlano}
                                rodillo_id={rodillo.id}
                                rodillo={rodillo}
                                plano_length = {planos?planos.length:0}/>
            {plano_id!==''&& revisiones_lenght!==''?
                <RodRevisionForm showRev={showRevision}
                            plano_id={plano_id}
                            plano_nombre={plano_nombre}
                            setShowRevision={setShowRevision}
                            show_revision={showRevision}
                            tipo_plano_id={tipo_plano_id}
                            rodillo_id={rodillo.id}
                            rodillo={rodillo}
                            revisiones={revisiones}
                            revisiones_lenght={revisiones_lenght}/>:''}
        </Container>
    );
}

export default RodPlanosRodillo;
