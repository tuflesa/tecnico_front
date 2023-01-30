import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from 'react-bootstrap/Modal'
import { Button, Row, Form, Col, Table } from 'react-bootstrap';
import { ArrowDownCircle} from 'react-bootstrap-icons';
import { local } from 'd3';

//import TablePagination from '@mui/material/TablePagination';

const BuscarRepuestos = ({cerrarListRepuestos, show, almacen, elegirRepuesto})=>{
    const [token] = useCookies(['tec-token']);
    const [filtroII, setFiltroII] = useState(`?stocks_minimos__almacen__id=${almacen}`);
    const [repuesto, setRepuesto] = useState(null);
    const [count, setCount] = useState(null);
    const [filtro, setFiltro] = useState( '');
    const [buscando, setBuscando] = useState(false);
    //var pagina = 1;

    const [datos, setDatos] = useState({
        id:'',
        nombre: '',  
        nombre_comun: '',   
        pagina: 1,
    });

    const actualizaFiltro = str => {
        setFiltroII(str);
    }

    useEffect(()=>{
        if (!buscando){
            setFiltro(filtroII);
        }
    },[buscando, filtroII, show]);
  
    useEffect(()=>{
        const filtro2 = `?stocks_minimos__almacen__id=${almacen}&page=${datos.pagina}&nombre__icontains=${datos.nombre}&id=${datos.id}&nombre_comun__icontains=${datos.nombre_comun}`;
        actualizaFiltro(filtro2);
    },[datos.id, datos.nombre, datos.nombre_comun, almacen, datos.pagina]);

    useEffect(()=>{
        if (filtro){
            setBuscando(true);
            almacen && axios.get(BACKEND_SERVER + `/api/repuestos/detalle/`+ filtro,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }     
            })
            .then( res => { 
                setRepuesto(res.data.results);
                setCount(res.data.count);
                datos.next=(res.data.next);
                datos.previous=res.data.previous;
                setBuscando(false);
            })
            .catch(err => { console.log(err);})
        } 
    },[filtro, almacen]);    
    
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    } 
    
    const cambioPagina = (pag) => {
        if(pag<=0){
            pag=1;
        }
        if(pag>count/3){
            if(count % 3 === 0){
                pag=Math.trunc(count/3);
            }
            if(count % 3 !== 0){
                pag=Math.trunc(count/3)+1;
            }
        }
        console.log(Math.trunc(count/3));
        console.log(pag);
        if(pag>0){
            setDatos({
                ...datos,
                pagina: pag,
            })
        }
    } 
   
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
                                            {/* <td>{localizaciones && localizaciones.map(localizacion =>{
                                                if(localizacion.repuesto=== rep.id){return(localizacion.localizacion)}
                                            })} </td> */}
                                            <td>{rep.stocks_minimos && rep.stocks_minimos.map(localizacion =>{
                                                if(localizacion.repuesto.id=== rep.id){return(localizacion.localizacion)}
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
                <table>
                    <tbody>
                        <th><button type="button" class="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                        <th><button type="button" class="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                        {/* <th>
                            {repuesto && repuesto.map( rep => {                                    
                                return (                                 
                                    <th key={rep.id}>
                                        <td><button type="button" class="btn btn-default">{rep.id}</button></td>                                       
                                    </th>
                                )})
                            }
                        </th> */}
                    </tbody>
                </table>
                <Button variant="info" onClick={cerrarListRepuestos}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>    
    )
}
export default BuscarRepuestos;