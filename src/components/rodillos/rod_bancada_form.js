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
    const [colorAmarillo, setColorAmarillo] = useState(false);
    const [show_conjunto, setShowConjunto] = useState(false);
    const [bancada_id, setBancada_id] = useState('');
    const [bancada_otraformacion, setBancadaOtraFormacion] = useState('');
    const [formacion_marcada, setFormacionMarcada] = useState('');

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

    const GuardarId_Operacion = (operationId, colorBoton2, formacionSeleccionada) => {
        setOperacionMarcada(operationId); // Almacena la operación seleccionada
        setFormacionMarcada(formacionSeleccionada);
        setFormacionesFiltradas(formaciones_completadas? formaciones_completadas.filter(formacion => formacion.operacion === operationId.id):[]); //pasa los elementos de esta operación
        let newColorVerde = false;
        let newColorAzul = false;
        let newColorAzulB = false;
        let newColorAmarillo = false;

        if (formacionSeleccionada?.color_celda === '#4CAF50') { //verde
            newColorVerde = true;
        };
        if (formacionSeleccionada?.color_celda === '#2196F3') { //azul
            newColorAzul = true;
        };
        if (formacionSeleccionada?.color_celda === '#FFEB3B') { //amarillo
            newColorAmarillo = true;
        };
        if (formacionSeleccionada?.color_celda === '#FFA500') { //naranja
            newColorAzulB = true;
        };
        
        AbrirConjunto();
    }

    const AbrirConjunto = () => {

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
                                                let colorBoton2 = false; //color azul - bancada completa
                                                let iconoOperacion = null;
                                                let formacionSeleccionada = null;
                                                formaciones_completadas &&
                                                    formaciones_completadas.forEach(form_completas => {
                                                        if (
                                                            form_completas.bancada.tubo_madre !== grupo.tubo_madre &&
                                                            form_completas.operacion === operacion.id
                                                        ) {
                                                            colorBoton2 = true; // Bancada de otra formación
                                                            iconoOperacion = form_completas.icono && form_completas.icono.icono ? form_completas.icono.icono : '';
                                                            formacionSeleccionada = form_completas;
                                                        }
                                                        else{
                                                            //verde
                                                            if(form_completas.color_celda === '#4CAF50' && form_completas.operacion === operacion.id){
                                                                iconoOperacion = form_completas.icono && form_completas.icono.icono ? form_completas.icono.icono : '';
                                                                formacionSeleccionada = form_completas;
                                                            }
                                                            if(form_completas.color_celda === '#FFEB3B' && form_completas.operacion === operacion.id){
                                                                iconoOperacion = form_completas.icono && form_completas.icono.icono ? form_completas.icono.icono : '';
                                                                formacionSeleccionada = form_completas;
                                                            }
                                                            //naranja
                                                            if(form_completas.color_celda === '#FFA500' && form_completas.operacion === operacion.id){
                                                                iconoOperacion = form_completas.icono && form_completas.icono.icono ? form_completas.icono.icono : '';
                                                                formacionSeleccionada = form_completas;
                                                            }
                                                            if(form_completas.color_celda === '#2196F3' && form_completas.operacion === operacion.id){
                                                                colorBoton2 = true;
                                                                iconoOperacion = form_completas.icono && form_completas.icono.icono ? form_completas.icono.icono : '';
                                                                formacionSeleccionada = form_completas;
                                                            }
                                                        }
                                                    });

                                                return (
                                                    <td key={`${seccion.id}-${operacion.id}`}>
                                                        <Button
                                                            className={`btn ${
                                                                colorBoton2
                                                                    ? 'btn-primary'
                                                                    : formacionSeleccionada?.color_celda==='#FFEB3B'//amarillo
                                                                    ? 'btn-amarillo-primary'
                                                                    : formacionSeleccionada?.color_celda==='#4CAF50' //verde
                                                                    ? 'btn-verde'
                                                                    : formacionSeleccionada?.color_celda==='#FFA500' //naranja
                                                                    ? 'btn-naranja-primary'
                                                                    : 'btn-gris-primary'
                                                            } btn-sm`}
                                                            onClick={() =>
                                                                grupo
                                                                    ? GuardarId_Operacion(operacion, colorBoton2, formacionSeleccionada)
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
                    colorAmarillo={colorAmarillo}
                    bancada_id={bancada_id}
                    bancada_otraformacion={bancada_otraformacion}
                    empresa_id={empresa}
                    celda_marcada={formacion_marcada}/>
            :''}
        </Container>
    )
}
export default RodBancada;