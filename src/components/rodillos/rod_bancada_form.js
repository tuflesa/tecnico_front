import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import logo from '../../assets/logo_bornay.svg';
import rod_inf from '../../assets/rod_inf.svg';
import rod_sup from '../../assets/rod_sup.svg';
import { useCookies } from 'react-cookie';
import RodBancadaFiltro from './rod_bancada_filtro';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { setMaxListeners } from 'process';
import { useLocation } from 'react-router-dom';
import RodConjunto from './rod_crear_conjunto';

const RodBancada = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [operaciones, setOperaciones] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [maquina, setMaquina] = useState('');
    const [grupo, setGrupo] = useState('');
    const [filtro, setFiltro] = useState(`?maquina__empresa__id=${user['tec-user'].perfil.empresa.id}`);
    const [operacion_marcada, setOperacionMarcada] = useState(null);
    const [show_conjunto, setShowConjunto] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(filtro);
        const maquinaValue = params.get('maquina');
        const grupoValue = params.get('grupo');
        setMaquina(maquinaValue);
        setGrupo(grupoValue);
    }, [filtro]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/seccion/`+filtro,{
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
    }, [token, filtro]);

    useEffect(() => {
        if(maquina){
            axios.get(BACKEND_SERVER + `/api/rodillos/operacion/?seccion__maquina__id=${maquina}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( r => {
                setOperaciones(r.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [maquina]);

    const actualizaFiltro = str => {
        setFiltro(str);
    }

    const GuardarId_Operacion = (operationId) => {
        setOperacionMarcada(operationId); // Almacena el la operación seleccionada
        AbrirConjunto();
    }

    const AbrirConjunto = () => {
        setShowConjunto(true);
    }

    const CerrarConjunto = () => {
        setShowConjunto(false);
    }

    return (
        <Container>
            <img src ={logo} width="200" height="200"></img>
            <Row>
                <Col>
                    <RodBancadaFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            {maquina? 
                <Row>
                    <Col>
                        <h5 className="mb-3 mt-3">Bancada</h5>
                        <Table striped bordered hover>
                            <thead>
                                {secciones && secciones.map(seccion => (
                                    <th key={seccion.id}>{seccion.nombre}</th>
                                ))}
                            </thead>
                            <tbody>
                                    {secciones && secciones.map(seccion => (
                                        <td key={seccion.id}>
                                            {operaciones && operaciones.map((operacion) => {
                                                if (operacion.seccion.id === seccion.id) {
                                                return (
                                                    <Button className="btn btn-outline-dark btn-sm" key={operacion.id} onClick={()=> GuardarId_Operacion(operacion)}>{operacion.nombre}</Button>
                                                    
                                                    //<td key={operacion.id}>{operacion.nombre}</td>
                                                )
                                                }
                                            })}
                                        </td>
                                    ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row> 
            :''} 
            <RodConjunto show={show_conjunto}
                        operacion_marcada={operacion_marcada}
                        handleClose={CerrarConjunto}
                        grupoId={grupo}
                        maquina={maquina}/>
        </Container>
    )
}
export default RodBancada;