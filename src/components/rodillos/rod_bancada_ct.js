import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Form } from 'react-bootstrap';
import logo from '../../assets/Bornay.svg';
import logoTuf from '../../assets/logo_tuflesa.svg';
import { useCookies } from 'react-cookie';
import RodBancadaCTFiltro from './rod_bancada_ct_filtro';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import RodConjuntoCT from './rod_crear_conjunto_ct';

const RodBancadaCT = ({bancada}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [operaciones, setOperaciones] = useState([]);
    const [secciones, setSecciones] = useState(null);
    const [maquina, setMaquina] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [dimensiones, setDimensiones] = useState('');
    const [filtro, setFiltro] = useState(`?maquina__empresa__id=${user['tec-user'].perfil.empresa.id}&pertenece_grupo=${false}`);
    const [operacion_marcada, setOperacionMarcada] = useState(null);
    const [show_conjunto, setShowConjunto] = useState(false);
    const [formaciones_completadas, setFormacionesCompletadas] = useState('');
    const [formaciones_filtradas, setFormacionesFiltradas] = useState('');

    useEffect(() => { //SEPARAR DATOS QUE ENTRAN A TRAVES DEL FILTRO
        if(!bancada){
            const params = new URLSearchParams(filtro);
            const maquinaValue = params.get('maquina');
            const empresaValue = params.get('maquina__empresa__id');
            const dimensionesValue = params.get('dimensiones');
            setMaquina(maquinaValue);
            setEmpresa(empresaValue);
            setDimensiones(dimensionesValue);
        }
        else{
            setMaquina(bancada.seccion.maquina.id);
            setEmpresa(bancada.seccion.maquina.empresa.id);
            setDimensiones(bancada.dimensiones);
            setFiltro(`?maquina__empresa__id=${bancada.seccion.maquina.empresa.id}&pertenece_grupo=${false}&maquina=${bancada.seccion.maquina.id}&dimensiones=${dimensiones}`);
        }
    }, [filtro, bancada]); 

    useEffect(() => {
        maquina && axios.get(BACKEND_SERVER + `/api/rodillos/seccion/`+filtro,{
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

    useEffect(() => { //Recogemos las celdas ya creadas según empresa, máquina, elegidos
        dimensiones && maquina && empresa && axios.get(BACKEND_SERVER + `/api/rodillos/celda_select/?bancada__seccion__maquina__id=${maquina}&bancada__seccion__maquina__empresa=${empresa}&bancada__seccion__pertenece_grupo=${false}&bancada__dimensiones=${dimensiones}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( rr => {
            setFormacionesCompletadas(rr.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [maquina, empresa, dimensiones]);

    useEffect(() => { //recogemos las operaciones de la máquina elegida
        if(maquina){
            axios.get(BACKEND_SERVER + `/api/rodillos/operacion_ct/?seccion__maquina__id=${maquina}`,{
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
        setOperacionMarcada(operationId); // Almacena la operación seleccionada
        setFormacionesFiltradas(formaciones_completadas.filter(formacion => formacion.conjunto.operacion === operationId.id)); //pasa los elemenos de esta operación
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
            <img src ={user['tec-user'].perfil.empresa.id===1?logo:logoTuf} width="200" height="200"></img>
            {!bancada?
                <Row>
                    <Col>
                        <RodBancadaCTFiltro actualizaFiltro={actualizaFiltro}/>
                    </Col>
                </ Row>
            :
                <Row>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa *</Form.Label>
                            <Form.Control type="text" 
                                        name='empresa' 
                                        value={bancada.seccion.maquina.empresa.siglas}
                                        disabled
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="maquina">
                            <Form.Label>Máquina *</Form.Label>
                            <Form.Control type="text" 
                                        name='maquina' 
                                        value={bancada.seccion.maquina.siglas}
                                        disabled
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="dimensiones">
                            <Form.Label>Descripción *</Form.Label>
                            <Form.Control type="text" 
                                        name='dimensiones' 
                                        value={bancada.dimensiones}
                                        disabled
                            />
                        </Form.Group>
                    </Col>
                </Row>
            }
            {maquina? 
                <Row>
                    <Col>
                        <h5 className="mb-3 mt-3">Bancadas de Cabeza de Turco</h5>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    {secciones && secciones.map(seccion => (
                                        <th key={seccion.id} colSpan={operaciones.filter(op => op.seccion.id === seccion.id).length}>
                                        {seccion.nombre}
                                    </th>
                                    ))}
                                </tr>
                                {/* Encabezado para las operaciones bajo cada sección */}
                                {secciones?.map(seccion => (
                                    operaciones
                                        .filter(op => op.seccion.id === seccion.id)
                                        .map(operaciones => (
                                            //<th key={seccion.id} colSpan={(operaciones && Array.isArray(operaciones)) ? operaciones.filter(op => op.seccion.id === seccion.id).length || 1 : 1}>
                                            <th key={`${seccion.id}-${operaciones.id}`} colSpan={1}>
                                                {operaciones.nombre}
                                            </th>
                                        ))
                                ))}
                            </thead>
                            <tbody>
                                <tr>
                                    {secciones?.map(seccion => (
                                        operaciones
                                            .filter(op => op.seccion.id === seccion.id)
                                            .map(operacion => {
                                                let esVerde = null;
                                                if (Array.isArray(formaciones_completadas)) {
                                                    formaciones_completadas.forEach(form_completas => {
                                                        if (form_completas.conjunto.operacion === operacion.id) {
                                                            esVerde = form_completas;  // Guardamos el objeto encontrado
                                                        }
                                                    });
                                                }
                                                return (
                                                    <td key={`${seccion.id}-${operacion.id}`}>
                                                        <Button
                                                            className={`btn ${esVerde ? 'btn-verde' : 'btn-gris-primary'} btn-sm`}
                                                            onClick={() => dimensiones ? GuardarId_Operacion(operacion) : alert('Elige dimensiones')}
                                                        >
                                                            {esVerde ? (
                                                                <img
                                                                    src={esVerde.icono.icono}
                                                                    alt={operacion.nombre}
                                                                    style={{ width: '20px', height: '20px', marginRight: '5px' }}
                                                                />
                                                            ) : (
                                                                operacion.nombre
                                                            )}
                                                        </Button>
                                                    </td>
                                                );
                                            })
                                    ))}
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row> 
            :''} 
            <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
            <RodConjuntoCT show={show_conjunto}
                    setShow={setShowConjunto}
                    operacion_marcada={operacion_marcada}
                    handleClose={CerrarConjunto}
                    elementos_formacion={formaciones_filtradas}
                    dimensiones={dimensiones}
                    bancada_id={formaciones_completadas.length>0?formaciones_completadas[0].bancada.id:null}/>
        </Container>
    )
}
export default RodBancadaCT;