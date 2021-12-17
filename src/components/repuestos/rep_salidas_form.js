import React , { useState, useEffect } from "react";
import RepAlmacenForm from './rep_almacen_form';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button, Form } from 'react-bootstrap';
import { Trash, PlusSquare, DashSquare } from 'react-bootstrap-icons';

const RepSalidas = ({alm}) => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [almacenes, setAlmacenes] = useState(null);
    const [numeroBar, setNumeroBar] = useState({
        id: '',
        almacen: alm ? alm : ''
    });
    const [datos, setDatos] = useState({
        usuario: user['tec-user'],
        almacen: alm ? alm : '',
        id: '',
        nombre: '',
        stock: '',
        critico: '',
        cantidad: ''
    }); 
    const [lineasSalida, setLineasSalida] = useState([]);
    const [cambioCodigo, setCambioCodigo] = useState(false);
    const [almacenesBloqueado, setAlmacenesBloqueado] = useState(false);

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/almacen/?empresa=${datos.usuario.perfil.empresa.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            let newAlmacenes = [];
            if (alm) {
                newAlmacenes = res.data.filter( a => a.id === alm);
                setNumeroBar({
                    ...numeroBar,
                    almacen: alm
                })
                setAlmacenesBloqueado(true);
            }
            else newAlmacenes = res.data;


            setAlmacenes(newAlmacenes); 
            
        })
        .catch(err => { console.log(err);})
    },[token, alm]);
    
    useEffect(()=>{
        datos.id && datos.almacen && axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimos/?repuesto=${datos.id}&almacen=${datos.almacen}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            // setStock_minimo(res);
            console.log('esto es stock_minimo');
            console.log(res.data);
            if(res.data.length === 0){
                console.log ('no hay stock');
                alert('Este Repuesto NO existe en este almacen, revise almacen seleccionado');
                numeroBar.id='';
                numeroBar.almacen='';
                datos.id='';
                datos.almacen='';
            }
            else{
                axios.get(BACKEND_SERVER + `/api/repuestos/detalle/${res.data[0].repuesto}/`,{
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                        }
                })
                .then( r => {
                    const repuestoRepetido = lineasSalida.filter(l => l.repuesto === datos.id);
                    if( repuestoRepetido.length===0){
                        setLineasSalida([...lineasSalida, {
                            repuesto: datos.id, 
                            almacen: datos.almacen, 
                            cantidad: 1,
                            nombre: r.data.nombre,
                            stock: res.data[0].stock_act,
                            critico: r.data.es_critico ? 'Si' : 'No' }]);
                    }
                    else {
                        // console.log('repuesto repetido ...')
                        const newLineas = [...lineasSalida];
                        newLineas.forEach( l => {
                            if (l.repuesto === res.data[0].repuesto) l.cantidad = l.cantidad + 1;
                        });
                        // console.log(res);
                        setLineasSalida(newLineas);
                    }
                })
                .catch( err => {
                    console.log(err);
                });
            }
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, cambioCodigo]);


    const handleInputChange = (event) => { 
        setNumeroBar ({
            ...numeroBar,
            [event.target.name] : event.target.value                
        });
        // console.log(numeroBar.id);
        if(numeroBar.id.length===11){
            setDatos({
                ...datos,
                id: parseInt(numeroBar.id),
                almacen: numeroBar.almacen
            });
            setNumeroBar({
                ...numeroBar,
                id: ''
            });
            setCambioCodigo(!cambioCodigo);
            console.log('pasa pr aqui')
        }
    }

    const updateCantidad = (cantidad, linea) => {
        const newLineas = [...lineasSalida];
        newLineas.forEach( l => {
            if (l.repuesto === linea.repuesto){
                l.cantidad += cantidad;
                if (l.cantidad < 1) l.cantidad = 1;
            } 
        });
        setLineasSalida(newLineas);
    }

    const borrarLinea = (linea) => {
        const newLineas = lineasSalida.filter( l => l.repuesto !== linea.repuesto);
        setLineasSalida(newLineas);
    }

    return (
        <Container>
            <Row>                
                <Col>
                    <Form.Group controlId="almacen">
                        <Form.Label>Almacén</Form.Label>
                        <Form.Control as="select"  
                                    name='almacen' 
                                    value={numeroBar.almacen}
                                    disabled = {lineasSalida.length>0 || almacenesBloqueado}
                                    placeholder="Almacén"
                                    onChange={handleInputChange}> 
                                    {!alm && <option key={0} value={''}>
                                            ----
                                    </option>}
                                    {!alm && almacenes && almacenes.map( almacen => {
                                        return (
                                        <option key={almacen.id} value={almacen.id}>
                                            {almacen.nombre}
                                        </option>
                                        )
                                    })}   
                                    {/* {alm && almacenes && <option key={alm} value={alm}>
                                            {almacenes[0].nombre}
                                    </option>}  */}  
                                    {alm && almacenes && almacenes.map( almacen => {
                                        return (
                                        <option key={almacen.id} value={almacen.id}>
                                            {almacen.nombre}
                                        </option>
                                        )
                                    })}                                                                                          
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="formId">
                        <Form.Label>Codigo Barras</Form.Label>
                        <Form.Control type="text" 
                                    name='id' 
                                    value={numeroBar.id}
                                    onChange={handleInputChange}
                                    placeholder="Codigo de barras" />
                    </Form.Group>
                </Col>                
            </Row> 
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Repuestos</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Stock Actual</th>                                
                                <th>Crítico</th>
                                <th>Cantidad</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineasSalida.map(linea => {
                                return (
                                        <tr>
                                            <td>{linea.nombre}</td>
                                            <td>{linea.stock}</td>
                                            <td>{linea.critico}</td> 
                                            <td>{linea.cantidad}</td>    
                                            <td>
                                                <PlusSquare className="mr-3 pencil"  onClick={event => {updateCantidad(1, linea)}} />
                                                <DashSquare className="mr-3 pencil"  onClick={event => {updateCantidad(-1, linea)}} />
                                                <Trash className="mr-3 pencil"  onClick={event => {borrarLinea(linea)}} />
                                            </td>                             
                                        </tr>
                            )})}
                        </tbody>
                    </Table>
                </Col>                
            </Row>
            <Form.Row className="justify-content-center">
                {lineasSalida.length>0 ? 
                    <Button variant="info" type="submit" className={'mx-2'} onClick={null}>Hacer Salida</Button> :
                    null
                }
                <Link to='/home'>
                    <Button variant="warning" >
                        Cancelar
                    </Button>
                </Link>                            
            </Form.Row>
        </Container>
    )
}

export default RepSalidas;