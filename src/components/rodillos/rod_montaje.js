import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Form } from 'react-bootstrap';
import logo from '../../assets/logo_bornay.svg';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import RodMontajeFiltro from './rod_montaje_filtro';


const RodMontaje = () => {
    const [user] = useCookies(['tec-user']);
    const [token] = useCookies(['tec-token']);

    const [filtro, setFiltro] = useState(`?maquina__empresa__id=${user['tec-user'].perfil.empresa.id}`);
    const [bancadas, setBancadas] = useState(null);
    const [maquina, setMaquina] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [dimensiones, setDimensiones] = useState('');
    const [operaciones, setOperaciones] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [grupo_id, setGrupoid] = useState(null);
    const [formaciones_completadas, setFormacionesCompletadas] = useState('');
    const [formaciones_filtradas, setFormacionesFiltradas] = useState('');
    const [operacion_marcada, setOperacionMarcada] = useState(null);
    const [show_conjunto, setShowConjunto] = useState(false);

    //BUSCAMOS LAS CELDAS DE LAS BANCADAS RECIBIDAS PARA PINTARLAS
    useEffect(() => { //SEPARAR DATOS QUE ENTRAN A TRAVES DEL FILTRO
        setBancadas(null);
        setFormacionesCompletadas('');
        const params = new URLSearchParams(filtro);
        const maquinaValue = params.get('maquina');
        const empresaValue = params.get('maquina__empresa__id');
        const dimensionesValue = params.get('bancada');
        const grupoValue = params.get('tubo_madre');
        setMaquina(maquinaValue);
        setEmpresa(empresaValue);
        setDimensiones(dimensionesValue);
        setGrupoid(grupoValue);
    }, [filtro]);

    useEffect(() => { //recogemos las operaciones de la máquina elegida F1,F2....
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
    }, [bancadas]);

    useEffect(() => { //recogemos las operaciones de la máquina elegida F1,F2....
        if(maquina){
            axios.get(BACKEND_SERVER + `/api/rodillos/seccion/?maquina__id=${maquina}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( r => {
                setSecciones(r.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [bancadas]);

    useEffect(() => {
        dimensiones && grupo_id && maquina && axios.get(BACKEND_SERVER + `/api/rodillos/bancada_montaje/?seccion__maquina=${maquina}&tubo_madre=${grupo_id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( res => {
            setBancadas(res.data);
            axios.get(BACKEND_SERVER + `/api/rodillos/bancada_montaje/${dimensiones}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( r => {
                setBancadas(prevBancadas => { //unimos en la misma variable las bancadas del grupo elegido con la CT.
                    return [...prevBancadas, r.data];
                });
            })
            .catch( err => {
                console.log(err);
            });
        })
        .catch( err => {
            console.log(err);
        });
    }, [dimensiones]);

    useEffect(() => { //Recogemos las celdas ya creadas según empresa, máquina, elegidos
        if(bancadas){
            let celdas =[];
            for(var x=0; x<bancadas.length;x++){
                axios.get(BACKEND_SERVER + `/api/rodillos/celda_select/?bancada__id=${bancadas[x].id}`,{
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then( rr => {
                    for(var y=0;y<rr.data.length;y++){
                        celdas.push(rr.data[y]);
                    }
                })
                .catch( err => {
                    console.log(err);
                });
            }
            setFormacionesCompletadas(celdas);
        }
    }, [bancadas]);

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

    const actualizaFiltro = str => {
        setFiltro(str);
    }

    return (
        <Container>
            <img src ={logo} width="200" height="200"></img>
            <Row>
                <Col>
                    <RodMontajeFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            {bancadas && operaciones && formaciones_completadas?
                <Row>
                    <Col>
                        <h5 className="mb-3 mt-3">Montaje de Bancadas</h5>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    {secciones && secciones.map(bancada => (
                                        <th key={bancada.id}>{bancada.nombre}</th>
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
            :null}
            <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
        </Container>
    )
}
export default RodMontaje;