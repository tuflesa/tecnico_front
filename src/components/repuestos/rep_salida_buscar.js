import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from 'react-bootstrap/Modal'
import { Button, Row, Form, Col, Table } from 'react-bootstrap';
import { ArrowDownCircle} from 'react-bootstrap-icons';
const BuscarRepuestos = ({cerrarListRepuestos, show, almacen, elegirRepuesto})=>{
    const [token] = useCookies(['tec-token']);
    const [filtro, setFiltro] = useState('');
    const [repuesto, setRepuesto] = useState(null);
    const [localizaciones, setLocalizaciones] = useState(null);
    const [filtroII,setFiltroII] = useState( ``);
    const [buscando,setBuscando] = useState(false);
    const [datos, setDatos] = useState({
        id:'',
        nombre: '',  
        nombre_comun: '',   
    });
    
    const actualizaFiltro = str => {
        setFiltroII(str);
    }

    useEffect(()=>{
        if (!buscando){
            setFiltro(filtroII);
        }
    },[buscando, filtroII]);

    useEffect(()=>{
        if (filtro){
            setBuscando(true);
            filtro && almacen && axios.get(BACKEND_SERVER + `/api/repuestos/detalle/`+ filtro,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }     
            })
            .then( res => {  
                setRepuesto(res.data.sort(function(a, b){
                    if(a.nombre > b.nombre){
                        return 1;
                    }
                    if(a.nombre < b.nombre){
                        return -1;
                    }
                    return 0;
                }))
                axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimos/?almacen=${almacen}`,{
                    headers: {
                        'Authorization': `token ${token['tec-token']}`
                    }     
                })
                .then( r => {   
                    setLocalizaciones(r.data);           
                })
                .catch(err => { console.log(err);})
                setBuscando(false);
            })
            .catch(err => { console.log(err);})
        }
    },[filtro, token, show]);    
    
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }  
    
    useEffect(()=>{
        const filtro = `?stocks_minimos__almacen__id=${almacen}&nombre__icontains=${datos.nombre}&id=${datos.id}&nombre_comun__icontains=${datos.nombre_comun}`;
        actualizaFiltro(filtro);
    },[datos, almacen]);

    return(
        <Modal show={show} backdrop="static" keyboard={ false } animation={false} size="xl">
            <Modal.Title>Buscar Repuesto</Modal.Title>
            <Modal.Header>                             
                <Row>
                    <Col>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Buscar por Descripción Proveedor</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange}                                        
                                        placeholder="Nombre contiene" 
                                        autoFocus/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="formNombre_comun">
                            <Form.Label>Buscar por Nombre Etiqueta</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre_comun' 
                                        value={datos.nombre_comun}
                                        onChange={handleInputChange}                                        
                                        placeholder="Nombre etiqueta contiene" 
                                        />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="id_repuesto">
                        <Form.Label>Id Repuesto (sin el último dígito)</Form.Label>
                        <Form.Control   type="text" 
                                        name='id' 
                                        value={datos.id}
                                        onChange={handleInputChange} 
                                        placeholder="Id repuesto" />
                        </Form.Group>
                    </Col>
                </Row>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Localización</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {repuesto && repuesto.map( rep => {                                    
                                    return (                                                
                                        <tr key={rep.id}>
                                            <td>{rep.nombre}</td>  
                                            {/* <td>{repuesto.stocks_minimos.localizacion}</td> */}
                                            <td>{localizaciones && localizaciones.map(localizacion =>{
                                                if(localizacion.repuesto=== rep.id){return(localizacion.localizacion)}
                                            })} </td>
                                            <td>
                                            <ArrowDownCircle className="mr-3 pencil" onClick={event => {elegirRepuesto(rep.id)}}/>
                                            </td>                                                
                                        </tr>
                                    )})
                                }
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>                                               
                    <Button variant="info" onClick={cerrarListRepuestos}>
                        Cerrar
                    </Button>
                </Modal.Footer>
        </Modal>    
    )
}
export default BuscarRepuestos;