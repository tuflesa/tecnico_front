import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from 'react-bootstrap/Modal'
import { Button, Row, Form, Col, Table, Container } from 'react-bootstrap';
import { ArrowDownCircle} from 'react-bootstrap-icons';

//import TablePagination from '@mui/material/TablePagination';

const BuscarRepuestos = ({cerrarListRepuestos, show, almacen, elegirRepuesto})=>{
    const [token] = useCookies(['tec-token']);
    const [filtroII, setFiltroII] = useState(`?stocks_minimos__almacen__id=${almacen}`);
    const [repuesto, setRepuesto] = useState(null);
    const [count, setCount] = useState(null);
    const [filtro, setFiltro] = useState( '');
    const [buscando, setBuscando] = useState(false);

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
        if(pag>count/20){
            if(count % 20 === 0){
                pag=Math.trunc(count/20);
            }
            if(count % 20 !== 0){
                pag=Math.trunc(count/20)+1;
            }
        }
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
                <table>
                    <tbody>
                        <tr>
                            <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                            <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                            <th>Número registros: {count}</th>
                            <th>
                                <Button variant="info" onClick={cerrarListRepuestos}>
                                    Cerrar
                                </Button>
                            </th>
                        </tr>
                    </tbody>
                </table>  
            </Modal.Header>  
            <Modal.Header>
                <Container> 
                    <Form>                   
                        <Row>
                            <Col>
                                <Form.Group controlId="formNombre">
                                    <Form.Label>Buscar por Descripción Repuesto</Form.Label>
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
                    </Form> 
                </Container> 
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
                                            <th>{rep.nombre}</th>  
                                            {/* <td>{localizaciones && localizaciones.map(localizacion =>{
                                                if(localizacion.repuesto=== rep.id){return(localizacion.localizacion)}
                                            })} </td> */}
                                            <th>{rep.stocks_minimos && rep.stocks_minimos.map(localizacion =>{
                                                if(localizacion.repuesto.id=== rep.id){return(localizacion.localizacion)}
                                            })} </th>
                                            <th>
                                            <ArrowDownCircle className="mr-3 pencil" onClick={event => {elegirRepuesto(rep.id)}}/>
                                            </th>                                                
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
                        <tr>
                            <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                            <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                            <th>Número registros: {count}</th>
                            <th>
                                <Button variant="info" onClick={cerrarListRepuestos}>
                                    Cerrar
                                </Button>
                            </th>
                        </tr>
                    </tbody>
                </table>
            </Modal.Footer>
        </Modal>    
    )
}
export default BuscarRepuestos;