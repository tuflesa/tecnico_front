import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Trash, PencilFill, Receipt } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import RepListaFilto from './rep_lista_filtro';
import ReactExport from 'react-data-export';

const RepLista = () => {
    const [token] = useCookies(['tec-token']);
    //const [user] = useCookies(['tec-user']);
    const [repuestos, setRepuestos] = useState(null);
    const [show, setShow] = useState(false);
    const [repuestoBorrar, setRepuestoBorrar] = useState(null);
    const [filtro, setFiltro] = useState(`?descatalogado=${false}`);
    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    const actualizaFiltro = str => {
        setFiltro(str);
    }

    useEffect(()=>{
        if (!show){
            axios.get(BACKEND_SERVER + '/api/repuestos/lista/' + filtro,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }
            })
            .then( res => {
                setRepuestos(res.data.sort(function(a, b){
                    if(a.nombre > b.nombre){
                        return 1;
                    }
                    if(a.nombre < b.nombre){
                        return -1;
                    }
                    return 0;
                }));
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [token, filtro, show]);

    const handleClose = () => setShow(false);

    const handleTrashClick = (repuesto) => {
        setShow(true);
        setRepuestoBorrar(repuesto);
    }

    const borrarRepuesto = () => {
        axios.patch(BACKEND_SERVER + `/api/repuestos/lista/${repuestoBorrar.id}/`,{
            descatalogado: true
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
            })
            .then(res => {
                setShow(false);
                setRepuestoBorrar(null);
            })
            .catch(err => {console.log(err);})
    }

    return (
        <Container>
            <Row>
                <Col>
                    <RepListaFilto actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Repuestos</h5>
                    <ExcelFile filename={"ExcelExportExample"} element={<button>Exportar a Excel</button>}>
                        <ExcelSheet data={repuestos} name="Repuestos">
                            <ExcelColumn label="Id" value="id"/>
                            <ExcelColumn label="Nombre" value="nombre"/>
                            <ExcelColumn label="Descripción Etiqueta" value="nombre_comun"/>
                            <ExcelColumn label="Fabricante" value="fabricante"/>
                            <ExcelColumn label="Modelo" value="modelo"/>
                            <ExcelColumn label="Crítico" value="es_critico"/>
                            <ExcelColumn label="Descatalogado" value="descatalogado"/>
                        </ExcelSheet>
                    </ExcelFile> 
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Descripción Proveedor</th>
                                <th>Descripción Etiqueta</th>
                                <th>Fabricante</th>
                                <th>Modelo</th>
                                {/* <th>Crítico</th>
                                <th>Descatalogado</th> */}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {repuestos && repuestos.map( repuesto => {
                                return (
                                    <tr key={repuesto.id}>
                                        <td>{repuesto.nombre}</td>
                                        <td>{repuesto.nombre_comun}</td>
                                        <td>{repuesto.fabricante}</td>
                                        <td>{repuesto.modelo}</td>
                                        {/* <td>{repuesto.es_critico ? 'Si' : 'No'}</td>
                                        <td>{repuesto.descatalogado ? 'Si' : 'No'}</td> */}
                                        <td>
                                            <Link title='Detalle/Modificar'to={`/repuestos/${repuesto.id}`}>
                                                <PencilFill className="mr-3 pencil"/>
                                            </Link>
                                            <Trash className="mr-3 trash" onClick={event => {handleTrashClick(repuesto)}} />
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Descatalogar</Modal.Title>
                </Modal.Header>
                <Modal.Body>Está a punto de descatalogar el repuesto: <strong>{repuestoBorrar && repuestoBorrar.nombre}</strong></Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={borrarRepuesto}>
                        Descatalogar
                    </Button>
                    <Button variant="waring" onClick={handleClose}>
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    )
}

export default RepLista;