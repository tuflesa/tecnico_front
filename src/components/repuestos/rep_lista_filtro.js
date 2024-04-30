import React , { useState, useEffect } from "react";
import { Container, Row, Form, Col } from 'react-bootstrap';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const RepListaFilto = ({actualizaFiltro}) => {
    const [token] = useCookies(['tec-token']);
    //const [user] = useCookies(['tec-user']);  

    const [datos, setDatos] = useState({
        id:'',
        nombre: '',
        nombre_comun: '',
        fabricante: '',
        modelo: [],
        modelo_proveedor: '',
        critico: '',
        tipo_repuesto: '',
        descatalogado: false,
        empresa: '',
        zona: '',
        seccion: '',
        equipo: '',
        proveedor: '',
    });

    const [numeroBar, setnumeroBar] = useState({id:''});
    const [tiposRepuesto, setTiposRepuesto] = useState(null);
    const [empresas, setEmpresas] = useState(null);
    const [proveedores, setProveedores] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [zonas, setZonas] = useState(null);
    const [equipos, setEquipos] = useState(null);

    /* eslint-disable react-hooks/exhaustive-deps */
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
        axios.get(BACKEND_SERVER + '/api/repuestos/tipo_repuesto/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setTiposRepuesto(res.data);
        })
        .catch( err => {
            console.log(err);
        });
        axios.get(BACKEND_SERVER + '/api/repuestos/proveedor/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setProveedores(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

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
            axios.get(BACKEND_SERVER + `/api/estructura/zona/?empresa=${datos.empresa}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( res => {
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
    /* eslint-disable react-hooks/exhaustive-deps */

    useEffect(()=>{
        const filtro1 = `?precios__modelo_proveedor__icontains=${datos.modelo_proveedor}&nombre__icontains=${datos.nombre}&nombre_comun__icontains=${datos.nombre_comun}&precios__fabricante__icontains=${datos.fabricante}&id=${datos.id}&es_critico=${datos.critico}&descatalogado=${datos.descatalogado}&tipo_repuesto=${datos.tipo_repuesto}&proveedores__id=${datos.proveedor}`;
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
    },[datos, numeroBar]);


    const handleInputChange = (event) => {
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
        else{
            datos.id ='';
        }
    }

    return ( 
        <Container>
            <h5 className="mb-3 mt-3">Filtro</h5>
            <Form>
                <Row>                    
                    <Col>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Nombre contiene</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange}                                        
                                        placeholder="Nombre contiene"
                                        autoFocus/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="formDescripcionEtiq">
                            <Form.Label>Descripción Etiqueta</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre_comun' 
                                        value={datos.nombre_comun}
                                        onChange={handleInputChange}                                        
                                        placeholder="Descripción contiene"/>
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
                        <Form.Group controlId="modelo_proveedor">
                            <Form.Label>Modelo contiene</Form.Label>
                            <Form.Control type="text" 
                                        name='modelo_proveedor' 
                                        value={datos.modelo_proveedor}
                                        onChange={handleInputChange} 
                                        placeholder="Modelo contiene" />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="formId">
                            <Form.Label>Codigo Barras</Form.Label>
                            <Form.Control type="text" 
                                        name='id' 
                                        value={numeroBar.id}
                                        onChange={handleInputChange2}
                                        placeholder="Codigo de barras" 
                                        />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="id">
                            <Form.Label>Id Repuesto</Form.Label>
                            <Form.Control type="text" 
                                        name='id' 
                                        value={datos.id}
                                        onChange={handleInputChange} 
                                        placeholder="Id repuesto" />
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
                    <Col>
                        <Form.Group controlId="proveedor">
                            <Form.Label>Proveedor</Form.Label>
                            <Form.Control as="select"  
                                        name='proveedor' 
                                        value={datos.proveedor}
                                        onChange={handleInputChange}
                                        placeholder="Proveedor">
                                            <option key={0} value={''}>Todos</option>
                                        {proveedores && proveedores.map( prov => {
                                            return (
                                            <option key={prov.id} value={prov.id}>
                                                {prov.nombre}
                                            </option>
                                            )
                                        })}
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