import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import useInterval from '../utilidades/use_interval';

const CargaForm = ({ carga }) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [basculas, setBasculas] = useState([]);
    const [basculasEmpresa, setBasculasEmpresa] = useState([]);
    const [peso, setPeso] = useState(0);
    const [pesoDisabled, setPesoDisabled] = useState(false);
    const [empresas, setEmpresas] = useState([]);
    const [agencias, setAgencias] = useState([]);
    const [datos, setDatos] = useState({
        empresa: carga.empresa,
        matricula: carga.matricula,
        remolque: carga.remolque,
        agencia: carga ? carga.agencia : 0,
        telefono: carga.telefono,
        fecha_entrada: carga.fecha_entrada,
        hora_entrada: carga.hora_entrada,
        tara: Number.isInteger(parseInt(carga.tara)) ? carga.tara : '',
        destino: carga.destino,
        bruto: Number.isInteger(parseInt(carga.bruto)) ? carga.bruto : '',
        fecha_salida: carga.fecha_salida,
        bascula: '',
        observaciones: ''
    });
 
    useEffect(()=>{
        axios.get(BACKEND_SERVER + '/api/cargas/bascula/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            //console.log(res.data);
            setBasculas(res.data);
        })
        .catch( err => {
            console.log(err);
        });

    },[token]);

    useEffect(()=>{
        if (basculas !== []) {
            const b_filter = basculas.filter(bascula => bascula.empresa === parseInt(datos.empresa));
            console.log(b_filter);
            setBasculasEmpresa(b_filter);
            if (b_filter.length > 0){
                // console.log('hay basculas');
                console.log(b_filter[0].id);
                datos.bascula = b_filter[0].id;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[basculas, datos.empresa]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            //console.log(res.data);
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });

        axios.get(BACKEND_SERVER + '/api/cargas/agencia/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            //console.log(res.data);
            setAgencias(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    const actualizarDatos = (event) => {
        event.preventDefault()
        console.log('Actualizar datos...' + datos.empresa + ' ' + datos.bruto + ' ' + datos.remolque)

        if (datos.fecha_salida === null) { // && Number.isInteger(parseInt(datos.bruto))) {
            datos.fecha_salida = new Date();
            datos.fecha_salida.setHours( datos.fecha_salida.getHours() + 2 );
            console.log(datos.fecha_salida);
        } 
        // if (datos.bruto===''){
        //     datos.bruto = null;
        //     datos.fecha_salida = null;
        // }
        
        axios.put(BACKEND_SERVER + `/api/cargas/carga/${carga.id}/`, {
            empresa: datos.empresa,
            matricula: datos.matricula,
            remolque: datos.remolque,
            telefono: datos.telefono,
            agencia: datos.agencia === 0 ? null : datos.agencia,
            fecha_entrada: datos.fecha_entrada,
            hora_entrada: datos.hora_entrada,
            tara: datos.tara,
            destino: datos.destino,
            bruto: !pesoDisabled || datos.bruto ? datos.bruto : peso,
            fecha_salida: datos.fecha_salida,
            observaciones: datos.observaciones
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }     
        })
        .then( res => { 
            console.log(res);
            window.location.href = "/cargas";
        })
        .catch(err => { console.log(err);})
    }

    const crearDatos = (event) => {
        event.preventDefault()
        console.log('Crear datos...' + datos.empresa + ' ' + datos.tara + ' ' + datos.remolque)
        
        axios.post(BACKEND_SERVER + `/api/cargas/carga/`, {
            empresa: datos.empresa,
            matricula: datos.matricula,
            remolque: datos.remolque,
            telefono: datos.telefono,
            agencia: datos.agencia === 0 ? null : datos.agencia,
            fecha_entrada: datos.fecha_entrada,
            hora_entrada: datos.hora_entrada,
            tara: !pesoDisabled ? (Number.isInteger(parseInt(datos.tara)) ? datos.tara : null) : peso,
            destino: datos.destino,
            bruto: Number.isInteger(parseInt(datos.bruto)) ? datos.bruto : null,
            fecha_salida: datos.fecha_salida,
            observaciones: datos.observaciones
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }     
        })
        .then( res => { 
            console.log(res);
            window.location.href = "/cargas";
        })
        .catch(err => { console.log(err);})
    }

    const handleInputChange = (event) => {
        // console.log(event.target.name)
        // console.log(event.target.value)
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleDisabled = () => {
        return user['tec-user'].perfil.nivel_acceso.nombre === 'local'
    }

    const actualizaPeso = () =>{
        // console.log('lectura de la bascula');
        const mi_bascula = basculasEmpresa.filter(b => b.id === parseInt(datos.bascula))[0];
        // console.log(mi_bascula);
        if(mi_bascula.url){
            // console.log(mi_bascula.url);
            axios.get(mi_bascula.url)
            .then(res =>{
                if (Number.isInteger(parseInt(res.data.peso))){
                    console.log(res.data.peso);
                    setPeso(res.data.peso);
                    setPesoDisabled(true);
                }
                else {
                    console.log(res.data);
                    setPeso('Sin lectura');
                    setPesoDisabled(false);
                }
            })
            .catch(err => {
                console.log(err);
            });
        }
        else {
            console.log('No hay url de la bascula');
            setPeso('Sin lectura');
            setPesoDisabled(false);
        }
    }
    useInterval(actualizaPeso, 1000);

    return ( 
        <Container>
            <Row className="justify-content-center"> 
            {carga.id ?
                <h5 className="pb-3 pt-1 mt-2">Editar Carga</h5>:
                <h5 className="pb-3 pt-1 mt-2">Nueva Carga</h5>}
            </Row>
            <Row className="justify-content-center">
                <Form >
                    <Row>
                        <Col>
                            <Form.Group controlId="empresa">
                                <Form.Label>Empresa</Form.Label>
                                <Form.Control as="select" 
                                            value={datos.empresa}
                                            name='empresa'
                                            onChange={handleInputChange}
                                            disabled={handleDisabled()}>
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
                            <Form.Group controlId="bascula">
                                <Form.Label>Bascula</Form.Label>
                                <Form.Control as="select" 
                                            value={datos.bascula}
                                            name='bascula'
                                            onChange={handleInputChange}>
                                    {basculasEmpresa && basculasEmpresa.map( b => {
                                        return (
                                        <option key={b.id} value={b.id}>
                                            {b.nombre}
                                        </option>
                                        )
                                    })}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="Peso">
                                <Form.Label>Peso</Form.Label>
                                <Form.Control type="text" 
                                            name='peso' 
                                            value={peso}
                                            disabled/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="matricula">
                                <Form.Label>Matricula</Form.Label>
                                <Form.Control type="text" 
                                            name='matricula' 
                                            value={datos.matricula}
                                            onChange={handleInputChange} 
                                            placeholder="Matrícula" />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="fecha">
                                <Form.Label>Fecha entrada</Form.Label>
                                <Form.Control type="date" 
                                                name='fecha_entrada'
                                                value={datos.fecha_entrada}
                                                onChange={handleInputChange}
                                                readOnly />
                            </Form.Group>        
                        </Col>
                        <Col>
                            <Form.Group controlId="remolque">
                                <Form.Label>Remolque</Form.Label>
                                <Form.Control type="text" 
                                            name='remolque' 
                                            value={datos.remolque}
                                            onChange={handleInputChange} 
                                            placeholder="Remolque" 
                                            required/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="hora">
                                <Form.Label>Hora</Form.Label>
                                <Form.Control type="text" 
                                            name='hora_entrada' 
                                            value={datos.hora_entrada}
                                            onChange={handleInputChange} 
                                            placeholder="Hora de entrada"
                                            readOnly />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="agencia">
                                <Form.Label>Agencia</Form.Label>
                                <Form.Control as="select" 
                                            value={datos.agencia}
                                            name='agencia'
                                            onChange={handleInputChange}>
                                    <option key={0} value={null}>-------</option>
                                    {agencias && agencias.map( agencia => {
                                        return (
                                        <option key={agencia.id} value={agencia.id}>
                                            {agencia.nombre}
                                        </option>
                                        )
                                    })}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="tara">
                                <Form.Label>Tara</Form.Label>
                                <Form.Control type="text" 
                                            name='tara' 
                                            value={carga.id ? datos.tara : pesoDisabled ? peso : datos.tara}
                                            onChange={handleInputChange} 
                                            placeholder="Tara"
                                            disabled={pesoDisabled}
                                            required />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="telefono">
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control type="text" 
                                            name='telefono' 
                                            value={datos.telefono}
                                            onChange={handleInputChange} 
                                            placeholder="Telefono" />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="bruto">
                                <Form.Label>Bruto</Form.Label>
                                <Form.Control type="text" 
                                            name='bruto' 
                                            value={carga.id && pesoDisabled && !datos.bruto ? peso : datos.bruto}
                                            onChange={handleInputChange} 
                                            placeholder="Bruto" 
                                            disabled={pesoDisabled}/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="destino">
                                <Form.Label>Destino</Form.Label>
                                <Form.Control type="text" 
                                            name='destino' 
                                            value={datos.destino}
                                            onChange={handleInputChange} 
                                            placeholder="Destino" />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="neto">
                                <Form.Label>Neto</Form.Label>
                                <Form.Control type="text" 
                                            name='neto' 
                                            value={parseInt(datos.bruto) > parseInt(datos.tara) ? datos.bruto - datos.tara : null}
                                            placeholder="Neto" 
                                            disabled={true}/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="observaciones">
                                <Form.Label>Observaciones</Form.Label>
                                <Form.Control type="text" 
                                            name='observaciones' 
                                            value={datos.observaciones}
                                            placeholder="Observaciones" 
                                            onChange={handleInputChange}
                                            />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        {carga.id ? 
                            <Button variant="info" type="submit" className="mr-3" onClick={actualizarDatos}>Actualizar</Button> :
                            <Button variant="info" type="submit" className="mr-3" onClick={crearDatos}>Guardar</Button>
                        }
                        <Link to='/cargas'>
                            <Button variant="warning" className="mr-3">
                                Cancelar
                            </Button>
                        </Link>
                    </Row>
                </Form>
            </Row>
        </Container>
    );
}
 
export default CargaForm;