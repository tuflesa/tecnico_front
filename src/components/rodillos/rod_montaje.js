import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Form } from 'react-bootstrap';
import logo from '../../assets/Bornay.svg';
import logoTuf from '../../assets/logo_tuflesa.svg';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import RodMontajeFiltro from './rod_montaje_filtro';
import RodMontajeConjunto from './rod_montaje_conjunto';
import RodMontajeAnotaciones from './rod_montaje_anotaciones';


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
    const [grabado, setGrabar] = useState(true);
    const [color_cel, setColor] = useState(0);
    const [select_Archivo, setSelectArchivo] = useState(montaje_edi?.id?montaje_edi.archivo:'');
    const [show_anotaciones, setShowAnotaciones] = useState(false);
    const [montaje, setMontaje] = useState([montaje_edi?montaje_edi:[]]);


    const [datos, setDatos] = useState({
        maquina:'',
        grupo:'',
        bancada_ct:'',
        nombre:'',
        tubo_madre:'',
        grupo_tubomadre: '',
        titular: montaje_edi?montaje_edi.titular_grupo:false,
        actualizar: montaje_edi?montaje_edi.id?true:false:false,
        anotaciones_montaje: montaje_edi?montaje_edi.anotciones_montaje:'',
        archivo: montaje_edi?.id?montaje_edi.archivo:'',
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

    const ActualizarMontaje = () => {

        const formData = new FormData();
        formData.append("titular_grupo", datos.titular);
        formData.append("anotciones_montaje", datos.anotaciones_montaje);
        formData.append("nombre", datos.nombre);
        
        // Solo agregar el archivo si existe y es un objeto `File`
        if (select_Archivo instanceof File) {
            formData.append("archivo", select_Archivo);
        }
        
        axios.patch(BACKEND_SERVER + `/api/rodillos/montaje/${montaje_edi.id}/`, formData, {
            headers: {
                'Authorization': `token ${token['tec-token']}`,
            }
        })
        .then(res => {
            alert('Actualizado con éxito');
        })
        .catch(err => {
            console.log(err);
        });
        
    }

    const GuardarMontaje = () => { //Guardamos el montaje, primero comprobamos si ya existe.
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
                    const formData = new FormData();
                    formData.append("nombre", datos.nombre);
                    formData.append("maquina", datos.maquina);
                    formData.append("grupo", datos.grupo);
                    formData.append("bancadas", datos.bancada_ct);
                    formData.append("titular_grupo", datos.titular);
                    formData.append("anotciones_montaje", datos.anotaciones_montaje);

                    // Solo agregar el archivo si existe
                    if (select_Archivo instanceof File) {
                        formData.append("archivo", select_Archivo);
                    }
                    
                    axios.post(BACKEND_SERVER + `/api/rodillos/montaje/`, formData, { //creamos el montaje
                        headers: {
                            'Authorization': `token ${token['tec-token']}`
                            }     
                    })
                    .then( res => { 
                        setMontaje(res.data);
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

    const AñadirAnotacion = () =>{
        AbrirAnotacion();
    }

    const AbrirConjunto = () => {
        setShowConjunto(true);
    }

    const CerrarConjunto = () => {
        setShowConjunto(false);
    }
    
    const AbrirAnotacion = () => {
        setShowAnotaciones(true);
    }

    const CerrarAnotacion = () => {
        setShowAnotaciones(false);
        window.location.reload();
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

    const handleInputChange_titular = (event) => {
        setDatos(prevDatos => ({
            ...prevDatos,
            titular: !prevDatos.titular
        }));
    }

    const handleInputChange_archivo = (event) => {
        const file = event.target.files[0];
        setSelectArchivo(file);
        setDatos({
            ...datos,
            archivo: file ? file.name : '',  // Actualiza el nombre del archivo en `datos`
        });
    };

    return (
        <Container>
            <img src ={user['tec-user'].perfil.empresa.id===1?logo:logoTuf} width="200" height="200"></img>
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
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="titular">
                        <Form.Check type="checkbox" 
                                    name='titular'
                                    label="¿Titular de grupo?"
                                    checked = {datos.titular}
                                    onChange = {handleInputChange_titular} />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group controlId="anotaciones_montaje">
                        <Form.Label>Anotaciones del montaje</Form.Label>
                        <Form.Control as="textarea" rows={2}
                                    name='anotaciones_montaje' 
                                    value={datos.anotaciones_montaje}
                                    onChange={handleInputChange}
                                    placeholder="antotaciones"
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <form encType='multipart/form-data'>
                        <Form.Group controlId="archivo">
                            <Form.Label>Archivo: </Form.Label>
                            <Form.Control type="file" 
                                        name='archivo' 
                                        onChange={handleInputChange_archivo} />
                        </Form.Group>
                    </form>
                    {select_Archivo && (
                        <Form.Text className="text-muted d-block mb-3">
                            Archivo guardado:  
                            <a href={select_Archivo} target="_blank" rel="noopener noreferrer">
                                <strong> {datos.archivo.split('/').pop()} </strong>
                            </a>
                        </Form.Text>
                    )}
                </Col>
            </Row>
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
            {(bancadas && operaciones && formaciones_completadas) && (
                grabado || datos.actualizar ? 
                    <Button variant="outline-primary" onClick={ActualizarMontaje}>Actualizar</Button> :
                    <Button variant="outline-primary" onClick={GuardarMontaje}>Guardar</Button>
            )}
            <Button variant="outline-primary" type="submit" className={'mx-2'} onClick={() => window.history.back()}>Cancelar / Volver</Button>
            {grabado || datos.actualizar?<Button variant="outline-primary" onClick={AñadirAnotacion}>Añadir anotaciones</Button>:''}
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
            <RodMontajeAnotaciones show={show_anotaciones}
                    montaje={montaje_edi?montaje_edi:montaje}
                    handleClose={CerrarAnotacion}
                    tooling={false}/>
        </Container>
    )
}
export default RodMontaje;