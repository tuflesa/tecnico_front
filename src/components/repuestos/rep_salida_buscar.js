import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from 'react-bootstrap/Modal'
import { Button, Row, Form, Col, Table } from 'react-bootstrap';
import { ArrowDownCircle} from 'react-bootstrap-icons';
const BuscarRepuestos = ({cerrarListRepuestos, show, almacen, elegirRepuesto})=>{
    const [token] = useCookies(['tec-token']);
    const [filtro, setFiltro] = useState(null);
    const [repuesto, setRepuesto] = useState(null);
    const [localizaciones, setLocalizaciones] = useState(null);
    const [datos, setDatos] = useState({
        id:'',
        nombre: '',     
    });

    useEffect(()=>{
        console.log('filtro ...');
        console.log(filtro);
        filtro && almacen && axios.get(BACKEND_SERVER + `/api/repuestos/detalle/`+ filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => {   
            console.log(res.data);
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
        })
        .catch(err => { console.log(err);})
    },[filtro]);    

    const actualizaFiltro = str => {
        setFiltro(str);
    }
    
    const handleInputChange = (event) => {
        setDatos({
            ...datos,
            [event.target.name] : event.target.value
        })
    }  
    
    useEffect(()=>{
        const filtro = `?stocks_minimos__almacen__id=${almacen}&nombre__icontains=${datos.nombre}`;
        actualizaFiltro(filtro);
    },[datos, almacen]);

    return(
        <Modal show={show} backdrop="static" keyboard={ false } animation={false} size="xl">
            <Modal.Title>Buscar Repuesto</Modal.Title>
            <Modal.Header>                             
                <Row>
                    <Col>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Buscar por Nombre</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange}                                        
                                        placeholder="Nombre contiene" 
                                        autoFocus/>
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