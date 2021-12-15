import React , { useState, useEffect } from "react";
import { Container, Row, Form, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const RepListaFilto = ({actualizaFiltro}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [suma, setSuma] = useState(null);
    var sumar = null;
    

    const [datos, setDatos] = useState({
        id:'',
        nombre: '',
        fabricante: '',
        modelo: '',
        critico: '',
        tipo_repuesto: '',
        descatalogado: false,
        empresa: user['tec-user'].perfil.empresa.id,
        zona: '',
        seccion: '',
        equipo: ''
    });
    const [numeroBar, setnumeroBar] = useState({id:''});

    const [tiposRepuesto, setTiposRepuesto] = useState(null);
    const [empresas, setEmpresas] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [zonas, setZonas] = useState(null);
    const [equipos, setEquipos] = useState(null);

    useEffect(() => {
        // console.log('Leer empresas ...');
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            // console.log(res.data);
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
        // console.log(empresas);
        axios.get(BACKEND_SERVER + '/api/repuestos/tipo_repuesto/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            // console.log(res.data);
            setTiposRepuesto(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(() => {
        // console.log('Cambio en zonas ...');
        if (datos.empresa === '') {
            // console.log('Zonas vacio...');
            setZonas([]);
            setDatos({
                ...datos,
                zona: '',
                seccion: '',
                equipo: ''
            });
        }
        else {
            axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                // console.log(res.data);
                // console.log('Zonas lectura...');
                setZonas(res.data);
                setDatos({
                    ...datos,
                    zona: '',
                    seccion: '',
                    equipo: ''
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.empresa]);

    useEffect(() => {
        // console.log('Cambio en secciones ...');
        if (datos.zona === '') {
            setSecciones([]);
            setDatos({
                ...datos,
                seccion: '',
                equipo: ''
            });
        }
        else {
            axios.get(BACKEND_SERVER + `/api/estructura/seccion/?zona=${datos.zona}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                // console.log(res.data);
                setSecciones(res.data);
                setDatos({
                    ...datos,
                    seccion: '',
                    equipo: ''
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.zona]);

    useEffect(() => {
        // console.log('Cambio en equipos ...');
        if (datos.seccion === ''){
            setEquipos([]);
            setDatos({
                ...datos,
                equipo: ''
            });
        }
        else{
            axios.get(BACKEND_SERVER + `/api/estructura/equipo/?seccion=${datos.seccion}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
                // console.log(res.data);
                setEquipos(res.data);
                setDatos({
                    ...datos,
                    equipo: ''
                });
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, datos.seccion]);

    useEffect(()=>{
        const filtro1 = `?nombre__icontains=${datos.nombre}&fabricante__icontains=${datos.fabricante}&modelo__icontains=${datos.modelo}&id=${datos.id}&es_critico=${datos.critico}&descatalogado=${datos.descatalogado}&tipo_repuesto=${datos.tipo_repuesto}`;
        let filtro2 = `&equipos__seccion__zona__empresa__id=${datos.empresa}`;
        if (datos.empresa !== ''){
            filtro2 = filtro2 + `&equipos__seccion__zona__id=${datos.zona}`;
            if (datos.zona !== ''){
                filtro2 = filtro2 + `&equipos__seccion__id=${datos.seccion}`;
                if (datos.seccion !== ''){
                    filtro2 = filtro2 + `&equipos__id=${datos.equipo}`
                }
            }
        }
        
        const filtro = filtro1 + filtro2;
        
        actualizaFiltro(filtro);
    },[datos.nombre, datos.fabricante, datos.modelo, datos.id, datos.critico, datos.descatalogado, datos.empresa, datos.zona, datos.seccion, datos.equipo, datos.tipo_repuesto]);


    const handleInputChange = (event) => {
        //datos.id = parseInt (numeroBar.id);
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }

    const handleInputChange2 = (event) => {             
            setnumeroBar ({
                ...numeroBar,
                [event.target.name] : event.target.value                 
            }) 
            if(numeroBar.id.length===11){
                datos.id = parseInt (numeroBar.id);
            }
    }
    
    const handleDisabled = () => {
        return user['tec-user'].perfil.nivel_acceso.nombre === 'local'
    }

    return ( 
        <Container>
            <h5 className="mb-3 mt-3">Filtro</h5>
            <Form>
                <Row>
                    <Col>
                        <Form.Group controlId="formId">
                            <Form.Label>Codigo Barras</Form.Label>
                            <Form.Control type="text" 
                                        name='id' 
                                        value={numeroBar.id}
                                        onChange={handleInputChange2} 
                                        placeholder="Codigo de barras" />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Nombre contiene</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange} 
                                        placeholder="Nombre contiene" />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="fabricante">
                            <Form.Label>Fabricante contiene</Form.Label>
                            <Form.Control type="text" 
                                        name='fabricante' 
                                        value={datos.fabricante}
                                        onChange={handleInputChange} 
                                        placeholder="Fabricante contiene" />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="modelo">
                            <Form.Label>Modelo contiene</Form.Label>
                            <Form.Control type="text" 
                                        name='modelo' 
                                        value={datos.modelo}
                                        onChange={handleInputChange} 
                                        placeholder="Modelo contiene" />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="tipo">
                            <Form.Label>Tipo</Form.Label>
                            <Form.Control as="select"  
                                        name='tipo_repuesto' 
                                        value={datos.tipo_repuesto}
                                        onChange={handleInputChange}
                                        placeholder="Tipo repuesto">
                                            <option key={0} value={''}>Todos</option>
                                        {tiposRepuesto && tiposRepuesto.map( tipo => {
                                            return (
                                            <option key={tipo.id} value={tipo.id}>
                                                {tipo.nombre}
                                            </option>
                                            )
                                        })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="critico">
                            <Form.Label>Critico</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.critico}
                                            name='critico'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                <option key={1} value={true}>Si</option>
                                <option key={2} value={false}>No</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="descatalogado">
                            <Form.Label>Descatalogado</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.descatalogado}
                                            name='descatalogado'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                <option key={1} value={true}>Si</option>
                                <option key={2} value={false}>No</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="empresa">
                            <Form.Label>Empresa</Form.Label>
                            <Form.Control as="select"  
                                        name='empresa' 
                                        value={datos.empresa}
                                        onChange={handleInputChange}
                                        disabled={handleDisabled()}
                                        placeholder="Empresa">
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
                            <Form.Label>Zona</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.zona}
                                            name='zona'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todas</option>
                                {zonas && zonas.map( zona => {
                                    return (
                                    <option key={zona.id} value={zona.id}>
                                        {zona.siglas}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="seccion">
                            <Form.Label>Seccion</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.seccion}
                                            name='seccion'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todas</option>
                                {secciones && secciones.map( seccion => {
                                    return (
                                    <option key={seccion.id} value={seccion.id}>
                                        {seccion.nombre}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="equipo">
                            <Form.Label>Equipo</Form.Label>
                            <Form.Control as="select" 
                                            value={datos.equipo}
                                            name='equipo'
                                            onChange={handleInputChange}>
                                <option key={0} value={''}>Todos</option>
                                {equipos && equipos.map( equipo => {
                                    return (
                                    <option key={equipo.id} value={equipo.id}>
                                        {equipo.nombre}
                                    </option>
                                    )
                                })}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </Container>
     );
}
 
export default RepListaFilto;