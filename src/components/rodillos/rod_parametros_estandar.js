import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import { arch } from 'process';

const RodParametrosEstandar = ({ rodillo_id, handleClose, showPa, rodillo_inf }) => {
    const [valorParametro, setValorParametro] = useState('');
    const [parametros, setParametros] = useState([]);
    const [tipo_plano, setTipoPlanos] = useState('');
    const [token] = useCookies(['tec-token']);
    
    useEffect(() => {
        if(rodillo_id){
            axios.get(BACKEND_SERVER + `/api/rodillos/parametros_estandar/?rodillo=${rodillo_id}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }
            })
            .then( r => {
                setParametros(r.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/tipo_plano/${rodillo_inf.tipo_plano}/`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            setTipoPlanos(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    const GuardarParametros = () =>{
        for(var x=0;x<valorParametro.length;x++){
            axios.patch(BACKEND_SERVER + `/api/rodillos/parametros_estandar/${valorParametro[x].id}/`, {
                valor: valorParametro[x].valor,
            }, {
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                    }     
            })
            .then( res => { 
            })
            .catch(err => { 
                console.error(err);
            });
        }
        handleClose();
    }

    const handleValorChange = (parametroId, nuevoValor)=> {
        const parametrosCopia = [...parametros];
        const indice = parametrosCopia.findIndex(parametro => parametro.id === parametroId);
        parametrosCopia[indice].valor = nuevoValor;
        setValorParametro(parametrosCopia);
    }

    const handlerCancelar = () => {
        handleClose()
    }    

    return(
        <Modal show={showPa} onHide={handleClose} backdrop="static" keyboard={ false } animation={false} size="lg">
            <Modal.Header>
                <Modal.Title>Añadir Parámetros Estándar del Rodillos</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {parametros.length===0?
                    <Row>
                        <h5>No tenemos asignado tipo de plano, no existen parametros asignados a este rodillo</h5>
                    </Row>
                :
                    <Row>
                        <Col>
                            <table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Nombre / Valor</th>
                                        <th>Imagen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            { parametros && parametros.map( parametro => {
                                                return (
                                                    <tr key={parametro.id}>
                                                        <td>{parametro.nombre}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                name={`valor_${parametro.id}`}
                                                                value={parametro.valor || ''}
                                                                onChange={(e)=>handleValorChange(parametro.id, e.target.value)}
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </td>
                                        <td>
                                            <img width='500' height='400' className='img-croquis' src={tipo_plano.croquis} alt="Croquis"/>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </Col>
                    </Row>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="info" onClick={GuardarParametros}>Guardar</Button>
                <Button variant="waring" onClick={handlerCancelar}>Cancelar</Button>
            </Modal.Footer>
        </Modal>
    );
}
 
export default RodParametrosEstandar;