import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';
import { Button, Form, Col, Row, Container } from 'react-bootstrap';
import RodBancada from './rod_bancada_form';
import logo from '../../assets/Bornay.svg';
import logoTuf from '../../assets/logo_tuflesa.svg';

const RodGrupo = ({grupo, setGrupo, mostrarBancada}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [empresas, setEmpresas] = useState(null);
    const [zonas, setZonas] = useState([]);
    const [mostrarRodBancada] = useState(mostrarBancada);

    const [datos, setDatos] = useState({
        id: grupo.id? grupo.id:null,
        empresa: grupo.id?grupo.maquina.empresa_id:user['tec-user'].perfil.empresa.id,
        zona: grupo.id?grupo.maquina.id:'',
        tubo_madre: grupo.id?grupo.tubo_madre:'',
        nombre: grupo.id?grupo.nombre:'',
        bancadas_elegidas:grupo.id?grupo.bancadas:[],
        espesor_1: grupo.id?grupo.espesor_1:'',
        espesor_2: grupo.id?grupo.espesor_2:'',
    });

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(() => {
        if (datos.tubo_madre && datos.espesor_1 && datos.espesor_2 && datos.nombre==="") {
            setDatos({
                ...datos,
                nombre: 'Grupo-'+'Ø'+datos.tubo_madre+'-'+datos.espesor_1+'÷'+datos.espesor_2
            });
        }
    }, [datos.tubo_madre, datos.espesor_1, datos.espesor_2, !datos.nombre]);

    useEffect(() => {
        if (datos.empresa === '') {
            setZonas([]);
            setDatos({
                ...datos,
                zona: '',
                seccion: '',
                equipo: ''
            });
        }
        else {
            datos.empresa && axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}&es_maquina_tubo=${true}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                setZonas(res.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.empresa]);

    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleInputChange_zona = (event) => {
        const selectedOption = event.target.options[event.target.selectedIndex];
        const id = event.target.value;
        const espesor1 = selectedOption.getAttribute('data-espesor1');
        const espesor2 = selectedOption.getAttribute('data-espesor2');
    
        setDatos({
            ...datos,
            zona: id,
            espesor_1: espesor1,
            espesor_2: espesor2,
        });
    };
    
    
    const GuardarGrupo = (event) => {
        event.preventDefault();
        axios.get(BACKEND_SERVER + `/api/rodillos/grupo_nuevo/?tubo_madre=${datos.tubo_madre}&maquina=${datos.zona}&espesor_1=${datos.espesor_1}&espesor_2=${datos.espesor_2}&nombre=${datos.nombre}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            if(res.data.length!==0){
                alert('Este grupo ya existe');
            }
            else{
                axios.post(BACKEND_SERVER + `/api/rodillos/grupo_only/`, {
                    nombre: datos.nombre,
                    maquina: datos.zona,
                    tubo_madre: datos.tubo_madre,
                    espesor_1: datos.espesor_1,
                    espesor_2: datos.espesor_2,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then(res => { 
                    window.location.href=`/rodillos/grupo_editar/${res.data.id}`;       
                })
                .catch(err => { 
                    console.log(err);
                    alert('Falta datos, por favor rellena todos los campos obligatorios.');
                });
            }
        })
        .catch( err => {
            console.log(err);
        });
        
    };  

    const ActualizarGrupo = (event) => {
        event.preventDefault();
                axios.patch(BACKEND_SERVER + `/api/rodillos/grupo_only/${grupo.id}/`, {
                    nombre: datos.nombre,            
                    espesor_1: datos.espesor_1,
                    espesor_2: datos.espesor_2,
                }, {
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }
                })
                .then(res => { 
                    window.location.href=`/rodillos/grupo_editar/${res.data.id}`;
                })
                .catch(err => { 
                    console.log(err);
                    alert('Falta datos, por favor rellena todos los campos obligatorios.');
                });
        //     }
        // });
    };

    const styles = {
        textAlign: 'right',
        color: 'red',
        fontSize: 'smaller'}

    return (
        <Container className='mt-5'>
            <img src ={user['tec-user'].perfil.empresa.id===1?logo:logoTuf} width="200" height="200"></img>
            {grupo.id?<h5 className='mt-5'>Editar Grupo</h5>:<h5 className='mt-5'>Nuevo Grupo</h5>}
            <Form >
                <Row>
                    <Col>
                        <Form.Group controlId="nombre">
                            <Form.Label>Nombre del grupo</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange} 
                                        placeholder="Nombre grupo"
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="tubo_madre">
                            <Form.Label>Ø del tubo madre *</Form.Label>
                            <Form.Control type="text" 
                                        name='tubo_madre' 
                                        value={datos.tubo_madre}
                                        onChange={handleInputChange} 
                                        placeholder="Ø tubo madre"
                                        autoFocus
                                        disabled={grupo.length!==0}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa *</Form.Label>
                            <Form.Control as="select"  
                                        name='empresa' 
                                        value={datos.empresa}
                                        onChange={handleInputChange}
                                        placeholder="Empresa"
                                        disabled={grupo.length!==0}>
                                        <option key={0} value={''}>Todas</option>    
                                        {empresas && empresas.map( empresa => {
                                            return (
                                            <option key={empresa.id} value={empresa.id}>
                                                {empresa.nombre}
                                            </option>
                                            )
                                        })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="zona">
                            <Form.Label>Zona *</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.zona}
                                            name='zona'
                                            onChange={handleInputChange_zona}
                                            disabled={grupo.length!==0}>
                                <option key={0} value={''}>Todas</option>
                                {zonas && zonas.map( zona => {
                                    return (
                                    <option key={zona.id} value={zona.id} data-espesor1={zona.espesor_1} data-espesor2 = {zona.espesor_2}>
                                        {zona.siglas}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="espesor_1">
                            <Form.Label>Rango espesor menor *</Form.Label>
                            <Form.Control type="text" 
                                            name='espesor_1'
                                            value={datos.espesor_1}
                                            onChange={handleInputChange}
                                            placeholder='Rango espesores'
                                            disabled={grupo.length!==0}>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="espesor_2">
                            <Form.Label>Rango espesor mayor *</Form.Label>
                            <Form.Control type="text" 
                                            name='espesor_2'
                                            value={datos.espesor_2}
                                            onChange={handleInputChange}
                                            placeholder='Rango espesores'
                                            disabled={grupo.length!==0}>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
            <h5 style={styles}>Solo se permite el punto para poner el décimal, no guardará si ponemos coma</h5>

            <Button variant="outline-primary" type="submit" className={'mx-2'} href="javascript: history.go(-1)">Cancelar / Volver</Button>
            {grupo.length===0?<Button variant="outline-primary" onClick={GuardarGrupo}>Guardar</Button>:<Button variant="outline-primary" onClick={ActualizarGrupo}>Actualizar</Button>}
            <div className="vw-100 position-relative" style={{ left: '50%', marginLeft: '-50vw' }}>
                {mostrarRodBancada && <RodBancada visible={mostrarRodBancada} grupo={grupo} setGrupo={setGrupo} />}
            </div>
        </Container>
    )
}
 
export default RodGrupo;