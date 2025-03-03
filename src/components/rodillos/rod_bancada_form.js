import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import RodConjunto from './rod_crear_conjunto';

const RodBancada = ({visible, grupo, setGrupo}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [operaciones, setOperaciones] = useState([]);
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
        if (!maquina || !empresa || !grupo) return;

        const fetchCeldas = async () => {
            try {
                const requests = grupo.bancadas.map(bancada =>
                    axios.get(BACKEND_SERVER + `/api/rodillos/celda_select/?bancada__id=${bancada.id}`, {
                        headers: { 'Authorization': `token ${token['tec-token']}` }
                    })
                );

                const responses = await Promise.all(requests);
                const formacionesCompletadasArray = responses.flatMap(response => response.data);

                setFormacionesCompletadas(formacionesCompletadasArray);
            } catch (error) {
                console.log(error);
            }
        };

        fetchCeldas();
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
        <Container fluid style = {{display: visible? 'block': 'none'}}>
            {maquina? 
                <Row>
                    <Col>
                        <h5 className="mb-3 mt-3">Formación de Bancadas</h5>
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
                                {secciones && secciones.map(seccion => (
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
                                    {secciones && secciones.map(seccion =>
                                        operaciones
                                            .filter(op => op.seccion.id === seccion.id)
                                            .map(operacion => {
                                                let colorBoton1 = false; //color verde
                                                let colorBoton2 = false; //color azul
                                                let colorBoton3 = false; //color naranja?
                                                let iconoOperacion = null;
                                                let iconoOperacion2 = null;
                                                let iconoOperacion3 = null;

                                                formaciones_completadas &&
                                                    formaciones_completadas.forEach(form_completas => {
                                                        if (
                                                            form_completas.conjunto.operacion === operacion.id &&
                                                            form_completas.bancada.tubo_madre === form_completas.conjunto.tubo_madre &&
                                                            form_completas.bancada.tubo_madre === grupo.tubo_madre
                                                        ) {
                                                            colorBoton1 = true; // Rodillos propios
                                                            iconoOperacion = form_completas.icono && form_completas.icono.icono ? form_completas.icono.icono : '';
                                                        }
                                                        if (
                                                            form_completas.operacion !== form_completas.conjunto.operacion.id &&
                                                            form_completas.operacion === operacion.id &&
                                                            form_completas.bancada.tubo_madre === form_completas.conjunto.tubo_madre
                                                        ) {
                                                            colorBoton3 = true; // Bancada de otra formación
                                                            iconoOperacion3 = operacion.icono && operacion.icono.icono ? operacion.icono.icono : '';
                                                        }
                                                        if (
                                                            form_completas.bancada.tubo_madre !== form_completas.conjunto.tubo_madre &&
                                                            form_completas.operacion === operacion.id &&
                                                            form_completas.operacion === form_completas.conjunto.operacion
                                                        ) {
                                                            colorBoton2 = true; // Conjunto de otra formación
                                                            iconoOperacion2 = operacion.icono && operacion.icono.icono ? operacion.icono.icono : '';
                                                        }
                                                        if (
                                                            form_completas.bancada.tubo_madre !== grupo.tubo_madre &&
                                                            form_completas.operacion === operacion.id
                                                        ) {
                                                            colorBoton2 = true; // Bancada de otra formación
                                                            iconoOperacion2 = operacion.icono && operacion.icono.icono ? operacion.icono.icono : '';
                                                        }
                                                        if (
                                                            form_completas.operacion !== form_completas.conjunto.operacion &&
                                                            form_completas.bancada.tubo_madre !== form_completas.conjunto.tubo_madre &&
                                                            form_completas.operacion === operacion.id
                                                        ) {
                                                            colorBoton3 = true; // Conjunto de otra formación y otra posición
                                                            iconoOperacion3 = operacion.icono && operacion.icono.icono ? operacion.icono.icono : '';
                                                        }
                                                    });

                                                return (
                                                    <td key={`${seccion.id}-${operacion.id}`}>
                                                        <Button
                                                            className={`btn ${
                                                                colorBoton2
                                                                    ? 'btn-primary'
                                                                    : colorBoton1
                                                                    ? 'btn-verde'
                                                                    : colorBoton3
                                                                    ? 'btn-naranja-primary'
                                                                    : 'btn-gris-primary'
                                                            } btn-sm`}
                                                            onClick={() =>
                                                                grupo
                                                                    ? GuardarId_Operacion(operacion, colorBoton1, colorBoton2, colorBoton3)
                                                                    : alert('Elige grupo')
                                                            }
                                                        >
                                                            {iconoOperacion==='' ? (
                                                                operacion.nombre
                                                            ) :
                                                            iconoOperacion ? (
                                                                <img
                                                                    src={iconoOperacion}
                                                                    alt={operacion.nombre}
                                                                    style={{ width: '20px', height: '20px', marginRight: '5px' }}
                                                                />
                                                            ) :
                                                            iconoOperacion2 ? (
                                                                <img
                                                                    src={iconoOperacion2}
                                                                    alt={operacion.nombre}
                                                                    style={{ width: '20px', height: '20px', marginRight: '5px' }}
                                                                />
                                                            ) : 
                                                            iconoOperacion3 ? (
                                                                <img
                                                                    src={iconoOperacion3}
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
                                    )}
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row> 
            :''} 
            {operacion_marcada?
            <RodConjunto show={show_conjunto}
                    setShow={setShowConjunto}
                    elementos_formacion={formaciones_filtradas}
                    operacion_marcada={operacion_marcada}
                    handleClose={CerrarConjunto}
                    grupoId={grupo.id}
                    grupo_nom={grupo.nombre}
                    grupoEspesor={grupo.espesor_1 +'÷'+grupo.espesor_2}
                    grupo_bancadas={grupo.bancadas}
                    maquina={maquina}
                    tubomadre={tubo_madre}
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