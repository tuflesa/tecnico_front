import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Form } from 'react-bootstrap';
import logo from '../../assets/logo_bornay.svg';
import { useCookies } from 'react-cookie';
import RodBancadaCTFiltro from './rod_bancada_ct_filtro';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import RodConjuntoCT from './rod_crear_conjunto_ct';

const RodBancadaCT = ({bancada}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [operaciones, setOperaciones] = useState(null);
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
            const params = new URLSearchParams(filtro);
            const maquinaValue = bancada.seccion.maquina.id;
            const empresaValue = bancada.seccion.maquina.empresa.id;
            const dimensionesValue = bancada.dimensiones;
            setMaquina(maquinaValue);
            setEmpresa(empresaValue);
            setDimensiones(dimensionesValue);
        }
    }, [filtro, bancada]);

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

    /* useEffect(() => { //para pintar las casillas de distinto color, añadimos nuevoCampo = true si tienen valor
        if (operaciones && formaciones_completadas) {
          const nuevasOperaciones = operaciones.map(operacion => {
            let nuevoCampo = false;
            for (let y = 0; y < formaciones_completadas.length; y++) {
              if (operacion.id === formaciones_completadas[y].conjunto.operacion) {
                // Si hay una coincidencia, establecemos nuevoCampo en true
                nuevoCampo = true;
                break; // Salimos del bucle ya que ya encontramos una coincidencia
              }
            }
            // Devolvemos una nueva operación incluyendo el campo nuevoCampo
            return { ...operacion, nuevoCampo };
          });
        }
      }, [operaciones, formaciones_completadas]); */

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
            <img src ={logo} width="200" height="200"></img>
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
                            <Form.Label>Dimensiones *</Form.Label>
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
                                        <th key={seccion.id}>{seccion.nombre}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {secciones && secciones.map(seccion => (
                                        <td key={seccion.id}>
                                            {operaciones && formaciones_completadas && operaciones.map((operacion) => {
                                            if (operacion.seccion.id === seccion.id) {
                                                const colorBoton = formaciones_completadas.some(form_completas => form_completas.conjunto.operacion === operacion.id);
                                                return (
                                                <Button
                                                    key={operacion.id}
                                                    className={`btn ${colorBoton ? 'btn-verde-primary' : 'btn-gris-primary'} btn-sm`}
                                                    onClick={() => {dimensiones?GuardarId_Operacion(operacion):alert('Elige dimensiones')}}
                                                >
                                                    {operacion.nombre}
                                                </Button>
                                                );
                                            }
                                            })}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row> 
            :''} 
            <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
            <RodConjuntoCT show={show_conjunto}
                    operacion_marcada={operacion_marcada}
                    handleClose={CerrarConjunto}
                    elementos_formacion={formaciones_filtradas}
                    dimensiones={dimensiones}
                    bancada_id={formaciones_completadas.length>0?formaciones_completadas[0].bancada.id:null}/>
        </Container>
    )
}
export default RodBancadaCT;