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
    const [formaciones_completadas, setFormacionesCompletadas] = useState([]);
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
                let formacionesCompletadasArray = responses.flatMap(response => response.data);
                 // Asignamos colores y iconos antes de guardar en el estado
                formacionesCompletadasArray = formacionesCompletadasArray.map(form_completas => {
                    let colorBoton = "btn-gris-primary"; // Color por defecto
                    let iconoOperacion = null;

                    let tieneRodilloSinNombre = form_completas.bancada.celdas.some(celda =>
                        celda.conjunto.id === form_completas.conjunto.id &&
                        celda.conjunto.elementos.some(elemento => elemento.rodillo && elemento.rodillo.nombre === "Sin_Rodillo")
                    );

                    if (tieneRodilloSinNombre) {
                        colorBoton = "btn-amarillo-primary";
                    } else if (form_completas.conjunto.operacion === form_completas.operacion &&
                            form_completas.bancada.tubo_madre === form_completas.conjunto.tubo_madre) {
                        colorBoton = "btn-verde";
                    } else if (form_completas.bancada.tubo_madre !== form_completas.conjunto.tubo_madre &&
                            form_completas.operacion === form_completas.conjunto.operacion) {
                        colorBoton = "btn-primary"; // Azul
                    } else if (form_completas.operacion !== form_completas.conjunto.operacion &&
                            form_completas.bancada.tubo_madre !== form_completas.conjunto.tubo_madre) {
                        colorBoton = "btn-naranja-primary"; // Naranja
                    }

                    iconoOperacion = form_completas.icono?.icono || '';

                    return { ...form_completas, colorBoton, iconoOperacion };
                });

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
                                {secciones && secciones.map(seccion =>
                                    operaciones
                                        .filter(op => op.seccion.id === seccion.id)
                                        .map(operacion => {
                                            const form_completas = formaciones_completadas.find(f => f.operacion === operacion.id);

                                            return (
                                                <td key={`${seccion.id}-${operacion.id}`}>
                                                    <Button
                                                        className={`btn ${form_completas ? form_completas.colorBoton : 'btn-gris-primary'} btn-sm`}
                                                        onClick={() =>
                                                            grupo
                                                                ? GuardarId_Operacion(operacion, form_completas?.colorBoton)
                                                                : alert('Elige grupo')
                                                        }
                                                    >
                                                        {form_completas?.iconoOperacion ? (
                                                            <img
                                                                src={form_completas.iconoOperacion}
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