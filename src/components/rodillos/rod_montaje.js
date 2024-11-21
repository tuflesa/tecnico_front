import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Form } from 'react-bootstrap';
import logo from '../../assets/logo_bornay.svg';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import RodMontajeFiltro from './rod_montaje_filtro';
import RodMontajeConjunto from './rod_montaje_conjunto';


const RodMontaje = ({montaje_edi, setMontajeEditar}) => {
    const [user] = useCookies(['tec-user']);
    const [token] = useCookies(['tec-token']);

    const [filtro, setFiltro] = useState(`?maquina__empresa__id=${user['tec-user'].perfil.empresa.id}`);
    const [bancadas, setBancadas] = useState(null);
    //const [bancadasColor, setBancadascolor] = useState(null);
    const [bancadaCT, setBancadaCT] = useState(null);
    const [operaciones, setOperaciones] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [formaciones_completadas, setFormacionesCompletadas] = useState('');
    const [formaciones_filtradas, setFormacionesFiltradas] = useState('');
    const [operacion_marcada, setOperacionMarcada] = useState(null);
    const [show_conjunto, setShowConjunto] = useState(false);
    const [grabado, setGrabar] = useState(false);
    const [color_cel, setColor] = useState(0);


    const [datos, setDatos] = useState({
        maquina:'',
        grupo:'',
        bancada_ct:'',
        nombre:'',
        tubo_madre:'',
        grupo_tubomadre: '',
    });

    useEffect(() => { //SEPARAR DATOS QUE ENTRAN A TRAVES DEL FILTRO
        setGrabar(false);
        setFormacionesCompletadas('');
        const params = new URLSearchParams(filtro);
        const maquinaValue = params.get('maquina');
        const dimensionesValue = params.get('bancada');
        const tubo_madreValue = params.get('tubo_madre');
        const grupoIdValue = params.get('grupo');
        const nombreValue = params.get('nombre');
        setDatos({
            ...datos,
            grupo: montaje_edi?montaje_edi.grupo.id:grupoIdValue,
            grupo_tubomadre: montaje_edi?montaje_edi.grupo.tubo_madre:grupoIdValue,
            maquina: montaje_edi?montaje_edi.maquina.id:maquinaValue,
            bancada_ct: montaje_edi?montaje_edi.bancadas.id:dimensionesValue,
            nombre: montaje_edi?montaje_edi.nombre:nombreValue==='M-null-null'?'':nombreValue,
            tubo_madre: montaje_edi?montaje_edi.grupo.tubo_madre:tubo_madreValue,
            dimensiones: montaje_edi?montaje_edi.bancadas.dimensiones:dimensionesValue, 
        });
    }, [filtro, montaje_edi]);

    useEffect(() => { //recogemos las operaciones de la máquina elegida F1,F2....
        if(datos.maquina){
            axios.get(BACKEND_SERVER + `/api/rodillos/operacion/?seccion__maquina__id=${datos.maquina}`,{
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
        if(datos.maquina){
            axios.get(BACKEND_SERVER + `/api/rodillos/seccion/?maquina__id=${datos.maquina}`,{
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
        if(datos.grupo!=='null' && datos.bancada_ct!=='null'){ //buscamos las bancadas RD y luego las bancadas CT al final las juntamos
            datos.grupo && axios.get(BACKEND_SERVER + `/api/rodillos/grupo_montaje/${datos.grupo}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setBancadas(res.data.bancadas);
                datos.bancada_ct && axios.get(BACKEND_SERVER + `/api/rodillos/bancada_montaje/${datos.bancada_ct}`,{
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then( r => {
                    setBancadaCT(r.data.id);
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
        }
    }, [datos.bancada_ct, datos.grupo]);

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

    const GuardarId_Operacion = (operationId, color1, color2, color3) => {
        if(color1){
            setColor(1);
        }
        else if(color2){
            setColor(2);
        }
        else if(color3){
            setColor(3);
        }
        setOperacionMarcada(operationId); // Almacena la operación seleccionada
        setFormacionesFiltradas(formaciones_completadas.filter(formacion => formacion.operacion === operationId.id)); //pasa los elemenos de esta operación
        AbrirConjunto();
    }

    const handlerGuardar = () => { //Guardamos el montaje, primero comprobamos si ya existe.
        console.log('datos del montaje: ', datos)
        console.log('filtro del montaje: ', filtro)
        if(datos.nombre===''||datos.maquina===''||datos.grupo===''||datos.bancada_ct===''){
            alert('Revisa los datos obligatorios');
        }
        else{
            axios.get(BACKEND_SERVER + `/api/rodillos/montaje/?maquina=${datos.maquina}&grupo=${datos.grupo}&bancadas=${datos.bancada_ct}`,{ //buscamos el montaje
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( rr => {
                if(rr.data.length!==0){
                    alert('Este montaje ya está creado');
                }
                else{
                    
                    axios.post(BACKEND_SERVER + `/api/rodillos/montaje/`, { //creamos el montaje
                        nombre: datos.nombre,
                        maquina: datos.maquina,
                        grupo:datos.grupo,
                        bancadas:datos.bancada_ct,
                    }, {
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                            }     
                    })
                    .then( res => { 
                        alert('Montaje creado con exito');
                        setGrabar(true);
                    })
                    .catch( err => {
                        console.log(err);
                    });
                }
            })
            .catch( err => {
                console.log(err);
                alert('Revisa los campos obligatorios');
            });
        }
    }

    const AbrirConjunto = () => {
        setShowConjunto(true);
    }

    const CerrarConjunto = () => {
        setShowConjunto(false);
    }

    const actualizaFiltro = str => {
        setFiltro(str);
        datos.nombre='';
    }

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    return (
        <Container>
            <img src ={logo} width="200" height="200"></img>
            {montaje_edi?
                <Form>
                    <Row>
                        <Col>
                            <Form.Group controlId="empresa">
                                <Form.Label>Empresa</Form.Label>
                                <Form.Control type="text" 
                                            name='empresa' 
                                            value={montaje_edi.maquina.empresa.siglas}
                                            placeholder="Empresa"
                                            disabled
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="maquina">
                                <Form.Label>Maquina</Form.Label>
                                <Form.Control type="text" 
                                            name='maquina' 
                                            value={montaje_edi.maquina.siglas}
                                            placeholder="Maquina"
                                            disabled
                                />
                            </Form.Group>
                        </Col>
                        
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="grupo">
                                <Form.Label>Grupo</Form.Label>
                                <Form.Control type="text" 
                                            name='grupo' 
                                            value={montaje_edi.grupo.nombre}
                                            placeholder="Grupo"
                                            disabled
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="dimensiones">
                                <Form.Label>Cabeza de Turco</Form.Label>
                                <Form.Control type="text" 
                                            name='dimensiones' 
                                            value={montaje_edi.bancadas.dimensiones}
                                            placeholder="Cabeza de turco"
                                            disabled
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
                :
                <Row>
                    <Col>
                        <RodMontajeFiltro actualizaFiltro={actualizaFiltro}/>
                    </Col>
                </ Row>
            }
            <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
            {bancadas && operaciones && formaciones_completadas?grabado?<Button variant="outline-primary" disabled={grabado?true:false} onClick={handlerGuardar}>Guardar</Button>:<Button variant="outline-primary" onClick={handlerGuardar}>Guardar</Button>:''}
            <Row>
                <Col>
                    <Form.Group controlId="nombre">
                        <Form.Label>Nombre del montaje *</Form.Label>
                        <Form.Control type="text" 
                                    name='nombre' 
                                    value={datos.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Montaje"
                        />
                    </Form.Group>
                </Col>
            </Row>
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
                                            {operaciones && operaciones.map((operacion) => {
                                            if (operacion.seccion.id === seccion.id) {
                                                let colorBoton1 = false;
                                                let colorBoton2 = false;
                                                let colorBoton3 = false;
                                                formaciones_completadas && formaciones_completadas.forEach(form_completas => {
                                                    if(form_completas.bancada.tubo_madre===form_completas.conjunto.tubo_madre && form_completas.operacion===operacion.id){
                                                        colorBoton1=true; //tenemos rodillos propios
                                                    }
                                                    /* if(form_completas.operacion!==form_completas.conjunto.operacion.id && form_completas.operacion===operacion.id){
                                                        colorBoton3=true; //tenemos bancada de otra formación
                                                    } */
                                                    if( form_completas.bancada.tubo_madre!==form_completas.conjunto.tubo_madre && form_completas.operacion===operacion.id && form_completas.operacion===form_completas.conjunto.operacion){
                                                        colorBoton2=true; //tenemos conjunto de otra formación
                                                    }
                                                    if(form_completas.bancada.tubo_madre!==datos.grupo_tubomadre && form_completas.operacion===operacion.id ){
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
                                                        onClick={() => {GuardarId_Operacion(operacion, colorBoton1, colorBoton2, colorBoton3)}}
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
            
            <RodMontajeConjunto show={show_conjunto}
                    operacion_marcada={operacion_marcada}
                    handleClose={CerrarConjunto}
                    elementos_formacion={formaciones_filtradas}
                    tubo_madre={datos.tubo_madre}
                    color={color_cel}/>
        </Container>
    )
}
export default RodMontaje;