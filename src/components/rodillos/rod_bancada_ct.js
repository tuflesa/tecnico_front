import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import logo from '../../assets/logo_bornay.svg';
import { useCookies } from 'react-cookie';
import RodBancadaCTFiltro from './rod_bancada_ct_filtro';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import RodConjunto from './rod_crear_conjunto';

const RodBancadaCT = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [operaciones, setOperaciones] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [maquina, setMaquina] = useState('');
    const [grupo, setGrupo] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [dimensiones, setDimensiones] = useState('');
    const [filtro, setFiltro] = useState(`?maquina__empresa__id=${user['tec-user'].perfil.empresa.id}&pertence_grupo=${false}`);
    const [operacion_marcada, setOperacionMarcada] = useState(null);
    const [show_conjunto, setShowConjunto] = useState(false);
    const [formaciones_completadas, setFormacionesCompletadas] = useState('');
    const [formaciones_filtradas, setFormacionesFiltradas] = useState('');

    useEffect(() => { //SEPARAR DATOS QUE ENTRAN A TRAVES DEL FILTRO
        const params = new URLSearchParams(filtro);
        const maquinaValue = params.get('maquina');
        const grupoValue = params.get('grupo');
        const empresaValue = params.get('maquina__empresa__id');
        const dimensionesValue = params.get('dimensiones');
        setMaquina(maquinaValue);
        setGrupo(grupoValue);
        setEmpresa(empresaValue);
        setDimensiones(dimensionesValue);
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

    useEffect(() => { //Recogemos las celdas ya creadas según empresa, máquina, elegidos
        maquina && empresa && axios.get(BACKEND_SERVER + `/api/rodillos/celda_select/?bancada__seccion__maquina__id=${maquina}&bancada__seccion__maquina__empresa=${empresa}&bancada__seccion__pertenece_grupo=${false}`,{
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
    }, [maquina, empresa]);

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

    useEffect(() => { //para pintar las casillas de distinto color, añadimos nuevoCampo = true si tienen valor
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
      }, [operaciones, formaciones_completadas]);

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
            <Row>
                <Col>
                    <RodBancadaCTFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            {maquina? 
                <Row>
                    <Col>
                        <h5 className="mb-3 mt-3">Bancadas</h5>
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
                                                const nuevoCampo = formaciones_completadas.some(form_completas => form_completas.conjunto.operacion === operacion.id);
                                                return (
                                                <Button
                                                    key={operacion.id}
                                                    className={`btn ${nuevoCampo ? 'btn-primary' : 'btn-outline-dark'} btn-sm`}
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
                    grupoId={grupo}
                    maquina={maquina}
                    tubomadre={dimensiones}
                    elementos_formacion={formaciones_filtradas}/>
        </Container>
    )
}
export default RodBancadaCT;