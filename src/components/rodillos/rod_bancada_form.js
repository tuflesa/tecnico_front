import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import RodConjunto from './rod_crear_conjunto';

const RodBancada = ({visible, grupo, setGrupo}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [operaciones, setOperaciones] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [maquina, setMaquina] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [tubo_madre, setTuboMadre] = useState('');
    const [operacion_marcada, setOperacionMarcada] = useState(null);
    const [show_conjunto, setShowConjunto] = useState(false);
    const [formaciones_completadas, setFormacionesCompletadas] = useState('');
    const [formaciones_filtradas, setFormacionesFiltradas] = useState('');

    useEffect(() => {
        setMaquina(grupo.maquina.id);
        setEmpresa(grupo.maquina.empresa.id);
        setTuboMadre(grupo.tubo_madre);        
    }, [grupo]);

    useEffect(() => {
        grupo.id && axios.get(BACKEND_SERVER + `/api/rodillos/seccion/?maquina__empresa__id=${grupo.maquina.empresa.id}&id=${grupo.id}&maquina=${grupo.maquina.id}&pertenece_grupo=${true}&grupo=${grupo.id}&tubo_madre=${grupo.tubo_madre}`,{
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
    }, [token, grupo]);

    useEffect(() => { //Recogemos las celdas ya creadas según el grupo, elegidos
        const formacionesCompletadasArray = [];
        let objetosAcumulados = 0;
        for(var x=0;x<grupo.bancadas.length;x++){
            //maquina && empresa && grupo && axios.get(BACKEND_SERVER + `/api/rodillos/celda_select/?bancada__seccion__maquina__id=${maquina}&bancada__seccion__maquina__empresa=${empresa}&bancada__tubo_madre=${tubo_madre}`,{
            if (maquina && empresa && grupo) {
                axios.get(BACKEND_SERVER + `/api/rodillos/celda_select/?bancada__id=${grupo.bancadas[x]}`,{
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then( rr => {
                    formacionesCompletadasArray.push(...rr.data);
                    objetosAcumulados += rr.data.length;
                    if (objetosAcumulados === formacionesCompletadasArray.length) {//si tengo todas las respuesta, paso la información a formacionescompletadas.
                        setFormacionesCompletadas(formacionesCompletadasArray);
                    }
                })
                .catch( err => {
                    console.log(err);
                });
            }
        }
    }, [grupo, maquina, empresa]);

    useEffect(() => { //recogemos las operaciones de la máquina elegida
        if(maquina){
            axios.get(BACKEND_SERVER + `/api/rodillos/operacion/?seccion__maquina__id=${maquina}&seccion__pertenece_grupo=${true}`,{
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

    const GuardarId_Operacion = (operationId) => {
        setOperacionMarcada(operationId); // Almacena la operación seleccionada
        setFormacionesFiltradas(formaciones_completadas? formaciones_completadas.filter(formacion => formacion.conjunto.operacion === operationId.id):[]); //pasa los elementos de esta operación
        AbrirConjunto();
    }

    const AbrirConjunto = () => {
        setShowConjunto(true);
    }

    const CerrarConjunto = () => {
        setShowConjunto(false);
    }

    return (
        <Container style = {{display: visible? 'block': 'none'}}>
            {maquina? 
                <Row>
                    <Col>
                        <h5 className="mb-3 mt-3">Formación de Bancadas / rojo = bancada de otra formación /</h5>
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
                                            {operaciones && operaciones.map((operacion) => {
                                            if (operacion.seccion.id === seccion.id) {
                                                let nuevoCampo = false;
                                                let nuevoCampo2 = false;
                                                formaciones_completadas && formaciones_completadas.forEach(form_completas => {
                                                    if(form_completas.conjunto.operacion===operacion.id){
                                                        nuevoCampo=true;
                                                    }
                                                    if(form_completas.bancada.tubo_madre!==grupo.tubo_madre && form_completas.conjunto.operacion===operacion.id){
                                                        nuevoCampo2=true;
                                                    }
                                                });
                                                return (
                                                    <Button
                                                        key={operacion.id}
                                                        className={`btn ${nuevoCampo2 ? 'btn-danger' : nuevoCampo ? 'btn-primary' : 'btn-outline-dark'} btn-sm`}
                                                        onClick={() => {grupo?GuardarId_Operacion(operacion):alert('Elige grupo')}}
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
            <RodConjunto show={show_conjunto}
                    operacion_marcada={operacion_marcada}
                    handleClose={CerrarConjunto}
                    grupoId={grupo.id}
                    maquina={maquina}
                    tubomadre={tubo_madre}
                    elementos_formacion={formaciones_filtradas}/>
        </Container>
    )
}
export default RodBancada;