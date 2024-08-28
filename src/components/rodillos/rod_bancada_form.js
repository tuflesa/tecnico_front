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
    const [formaciones_completadas, setFormacionesCompletadas] = useState('');
    const [formaciones_filtradas, setFormacionesFiltradas] = useState('');
    const [colorVerde, setColorVerde] = useState(false);
    const [colorAzul, setColorAzul] = useState(false);
    const [colorAzulB, setColorAzulB] = useState(false);
    const [show_conjunto, setShowConjunto] = useState(false);
    const [bancada_id, setBancada_id] = useState('');
    const [bancada_otraformacion, setBancadaOtraFormacion] = useState('');

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
                axios.get(BACKEND_SERVER + `/api/rodillos/celda_select/?bancada__id=${grupo.bancadas[x].id}`,{
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

    useEffect(() => { //cogemos el id de la bancada marcada
        if (grupo && operacion_marcada) {
            const EncuentraBancada = grupo.bancadas.find(grupo_bancada =>
                grupo_bancada.seccion.tipo === operacion_marcada.seccion.tipo
            );
            if (EncuentraBancada) {
                if(EncuentraBancada.tubo_madre === tubo_madre){
                    setBancada_id(EncuentraBancada.id);
                }
                else{
                    setBancadaOtraFormacion(EncuentraBancada);
                }                
            }
        }  
    }, [operacion_marcada, grupo]);

    const GuardarId_Operacion = (operationId, colorV, colorA, colorAB) => {
        setOperacionMarcada(operationId); // Almacena la operación seleccionada
        setFormacionesFiltradas(formaciones_completadas? formaciones_completadas.filter(formacion => formacion.operacion === operationId.id):[]); //pasa los elementos de esta operación
        let newColorVerde = colorV;
        let newColorAzul = colorA;
        let newColorAzulB = colorAB;

        if (colorV === true) {
            newColorVerde = true;
        };
        if (colorA === true) {
            newColorAzul = true;
        };
        if (colorAB === true) {
            newColorAzulB = true;
        };
        
        AbrirConjunto(newColorVerde, newColorAzul, newColorAzulB);
    }

    const AbrirConjunto = (colorV, colorA, colorAB) => {
        setColorVerde(colorV); // Actualiza el estado de colorVerde
        setColorAzul(colorA); // Actualiza el estado de colorAzul de conjunto
        setColorAzulB(colorAB); // Actualiza el estado de colorAzul de bancada
          
        setShowConjunto(true);    
    }

    const CerrarConjunto = () => {
        setBancadaOtraFormacion('');
        setBancada_id('');
        setShowConjunto(false);
    }

    return (
        <Container style = {{display: visible? 'block': 'none'}}>
            {maquina? 
                <Row>
                    <Col>
                        <h5 className="mb-3 mt-3">Formación de Bancadas</h5>
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
                                                let colorBoton1 = false;
                                                let colorBoton2 = false;
                                                let colorBoton3 = false;
                                                formaciones_completadas && formaciones_completadas.forEach(form_completas => {
                                                    if(form_completas.conjunto.operacion===operacion.id && form_completas.bancada.tubo_madre===form_completas.conjunto.tubo_madre && form_completas.bancada.tubo_madre===grupo.tubo_madre ){
                                                        colorBoton1=true; //tenemos rodillos propios
                                                    }
                                                    if(form_completas.operacion!==form_completas.conjunto.operacion.id && form_completas.operacion===operacion.id && form_completas.bancada.tubo_madre===form_completas.conjunto.tubo_madre){
                                                        colorBoton3=true; //tenemos bancada de otra formación
                                                    }
                                                    if( form_completas.bancada.tubo_madre!==form_completas.conjunto.tubo_madre && form_completas.operacion===operacion.id && form_completas.operacion===form_completas.conjunto.operacion){
                                                        colorBoton2=true; //tenemos conjunto de otra formación
                                                    }
                                                    if(form_completas.bancada.tubo_madre!==grupo.tubo_madre && form_completas.operacion===operacion.id ){
                                                        colorBoton2=true; //tenemos bancada de otra formación
                                                    }
                                                    if(form_completas.operacion!==form_completas.conjunto.operacion && form_completas.bancada.tubo_madre!==form_completas.conjunto.tubo_madre && form_completas.operacion===operacion.id){
                                                        colorBoton3=true; //tenemos conjunto de otra formación y de otra posición
                                                    }
                                                });
                                                return (
                                                    <Button
                                                        key={operacion.id}
                                                        className={`btn ${colorBoton2 ? 'btn-primary' : colorBoton1 ? 'btn-verde' : colorBoton3? 'btn-naranja-primary' : 'btn-gris-primary'} btn-sm`}
                                                        onClick={() => {grupo?GuardarId_Operacion(operacion, colorBoton1, colorBoton2, colorBoton3):alert('Elige grupo')}}
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
            {operacion_marcada?
            <RodConjunto show={show_conjunto}
                    setShow={setShowConjunto}
                    operacion_marcada={operacion_marcada}
                    handleClose={CerrarConjunto}
                    grupoId={grupo.id}
                    grupoEspesor={grupo.espesor_1 +'÷'+grupo.espesor_2}
                    grupo_bancadas={grupo.bancadas}
                    maquina={maquina}
                    tubomadre={tubo_madre}
                    elementos_formacion={formaciones_filtradas}
                    colorAzul={colorAzul}
                    colorAzulB={colorAzulB}
                    colorVerde={colorVerde}
                    bancada_id={bancada_id}
                    bancada_otraformacion={bancada_otraformacion}
                    empresa_id={empresa}/>
            :''}
        </Container>
    )
}
export default RodBancada;