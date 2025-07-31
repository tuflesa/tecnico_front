import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import Modal from 'react-bootstrap/Modal'
import { Button, Row, Form, Col, Table } from 'react-bootstrap';
import { ArrowDownCircle} from 'react-bootstrap-icons';
import debounce from 'lodash.debounce';

const BuscarRepuestosPedido = ({cerrarListRepuestos, show, proveedor_id, elegirRepuesto})=>{
    const [token] = useCookies(['tec-token']);
    const [filtro, setFiltro] = useState(null);
    const [repuestos, setRepuestos] = useState(null);
    const [lineasPendientes, setLineasPendientes] = useState(null);

    const [datos, setDatos] = useState({
        id:'',
        nombre: '', 
        modelo_proveedor: '',
        descripcion_proveedor: '',
    });

    useEffect(()=>{
        filtro && proveedor_id && axios.get(BACKEND_SERVER + `/api/repuestos/repuesto_precio/?proveedor=${proveedor_id}&repuesto__descatalogado=${false}`+ filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            setRepuestos(res.data);
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
        const debounceFiltro = debounce(() => {
            const filtro = `?proveedores__id=${proveedor_id}&descripcion_proveedor__icontains=${datos.descripcion_proveedor}&repuesto__descatalogado=${false}&repuesto__nombre__icontains=${datos.nombre}&repuesto__id=${datos.id}&modelo_proveedor__icontains=${datos.modelo_proveedor}`;
            actualizaFiltro(filtro);
        }, 500);

        debounceFiltro();
        return () => debounceFiltro.cancel();
    },[datos]);

    useEffect(() => { //buscamos las lineas de los pedidos pendientes para mostrar en las lineas de los articulos fuera de stock
        datos.empresa && axios.get(BACKEND_SERVER + `/api/repuestos/linea_pedido_pend/?pedido__finalizado=${'false'}&pedido__empresa=${datos.empresa}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        })
        .then( rs => {
            setLineasPendientes(rs.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    useEffect(()=>{
        let pedido = false;
        if(lineasPendientes && repuestos){
            for(var y=0;y<lineasPendientes.length;y++){
                for(var x=0; x<repuestos.length; x++){
                    if(lineasPendientes[y].repuesto.id === repuestos[x].repuesto.id){                                      ;
                        setRepuestos(prev => ({
                            ...prev,
                            [pedido]: true
                        }));
                    }
                    else{
                        setRepuestos(prev => ({
                            ...prev,
                            [pedido]: false
                        }));
                    }
                }
            }
        }
    },[lineasPendientes, repuestos]);

    return(
        <Modal show={show} backdrop="static" keyboard={ false } animation={false} size="xl">
            <Modal.Title>Buscar Repuesto</Modal.Title>
            <Modal.Header>                     
                <Row>
                    <Col>
                        <Form.Group controlId="nombre">
                            <Form.Label>Buscar por: Nombre</Form.Label>
                            <Form.Control type="text" 
                                        name='nombre' 
                                        value={datos.nombre}
                                        onChange={handleInputChange}                                        
                                        placeholder="Nombre contiene" 
                                        autoFocus
                                        />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="descripcion_proveedor">
                            <Form.Label>Descripción proveedor</Form.Label>
                            <Form.Control type="text" 
                                        name='descripcion_proveedor' 
                                        value={datos.descripcion_proveedor}
                                        onChange={handleInputChange}                                        
                                        placeholder="Descripción proveedor" 
                                        />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="modelo_proveedor">
                            <Form.Label>Modelo proveedor</Form.Label>
                            <Form.Control type="text" 
                                        name='modelo_proveedor' 
                                        value={datos.modelo_proveedor}
                                        onChange={handleInputChange}                                        
                                        placeholder="Modelo contiene" 
                                        />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                        <Form.Label>Id Repuesto</Form.Label>
                        <Form.Control   type="text" 
                                        name='id' 
                                        value={datos.id}
                                        onChange={handleInputChange} 
                                        placeholder="Id repuesto" 
                                        />
                        </Form.Group>
                    </Col>
                    <Button variant="info" onClick={cerrarListRepuestos}>
                        Cerrar
                    </Button> 
                </Row>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción Proveedor</th>
                                    <th>Modelo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {repuestos && repuestos.map( rep => {  
                                    const necesitaStock = rep.necesita_stock; // booleano
                                    const tienepedido = rep.pedido; // booleano
                                    const rowClass = tienepedido? 'text-success' : necesitaStock ? 'text-danger' : ''; // Pondrá la linea en rojo, verde o blanca
                                    return (                                                
                                        <tr key={rep.id} className={rowClass}>
                                            <td>{rep.repuesto.nombre}</td> 
                                            <td>{rep.descripcion_proveedor}</td>
                                            <td>{rep.modelo_proveedor}</td> 
                                            <td>
                                                <ArrowDownCircle className="mr-3 pencil" onClick={event => {elegirRepuesto(rep)}}/>
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
export default BuscarRepuestosPedido;