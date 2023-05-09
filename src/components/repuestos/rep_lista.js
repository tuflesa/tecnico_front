import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap';
import { Trash, PencilFill, Receipt } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import RepListaFilto from './rep_lista_filtro';
import ReactExport from 'react-data-export';
import { select } from 'd3';

const RepLista = () => {
    const [token] = useCookies(['tec-token']);
    //const [user] = useCookies(['tec-user']);
    const [repuestos, setRepuestos] = useState(null);
    //const [result_repuestos, setResulRepuestos] = useState(null);
    const [show, setShow] = useState(false);
    const [repuestoBorrar, setRepuestoBorrar] = useState(null);
    const [filtro, setFiltro] = useState(null);
    const [filtroII,setFiltroII] = useState( `?descatalogado=${false}`);
    const [buscando,setBuscando] = useState(false);
    const [count, setCount] = useState(null);
    let filtroPag=(null);

    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    const [datos, setDatos] = useState({
        pagina: 1,
        total_pag:0,
    });
    useEffect(()=>{
        filtroPag = (`&page=${datos.pagina}`);
        if (!buscando){
            setFiltro(filtroII + filtroPag);
        }
    },[buscando, filtroII, datos.pagina]);

    useEffect(()=>{
        if (!show && filtro){
            setBuscando(true);
            axios.get(BACKEND_SERVER + '/api/repuestos/lista/' + filtro,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                  }
            })
            .then( res => {
                setRepuestos(res.data.results);
                setBuscando(false);
                setCount(res.data.count);
                
            })
            .catch( err => {
                console.log(err);
            });
        }
        
    }, [token, filtro, show]);

    /* useEffect(()=>{
        if(repuestos){
            const map = new Map(repuestos.map(pos => [pos.repuesto.id, pos.repuesto]));
            const unicos = [...map.values()];
            setResulRepuestos(unicos);
        }
    }, [repuestos]); */

    useEffect(()=>{
        if(count % 20 === 0){
            setDatos({
                ...datos,
                total_pag:Math.trunc(count/20),
            })
        }
        else if(count % 20 !== 0){
            setDatos({
                ...datos,
                total_pag:Math.trunc(count/20)+1,
            })
        }
    }, [count, filtro]);

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

    const actualizaFiltro = str => {
        datos.pagina=1;
        setFiltroII(str);
    }

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
        <Container className='mt-5'>
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
                    <table>
                        <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                        <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                        <th>Número páginas: {datos.pagina} / {datos.total_pag}</th>
                    </table>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Descripción Repuesto</th>
                                <th>Descripción Etiqueta</th>
                                <th>Fabricante</th>
                                <th>Modelo</th>
                                {/* <th>Crítico</th>
                                <th>Descatalogado</th> */}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* {result_repuestos && result_repuestos.map( re => { */}
                            {repuestos && repuestos.map( re => {
                                return (
                                    <tr key={re.id}>
                                        <td>{re.id}</td>
                                        <td>{re.nombre}</td>
                                        <td>{re.nombre_comun}</td>
                                        <td>{re.fabricante}</td>
                                        <td>{re.modelo}</td>
                                        {/* <td>{repuesto.es_critico ? 'Si' : 'No'}</td>
                                        <td>{repuesto.descatalogado ? 'Si' : 'No'}</td> */}
                                        <td>
                                            <Link title='Detalle/Modificar'to={`/repuestos/${re.id}`}>
                                                <PencilFill className="mr-3 pencil"/>
                                            </Link>
                                            <Trash className="mr-3 trash" onClick={event => {handleTrashClick(re)}} />
                                        </td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row>
                <table>
                        <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_anterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina-1)}}>Pág Anterior</button></th> 
                        <th><button type="button" className="btn btn-default" value={datos.pagina} name='pagina_posterior' onClick={event => {cambioPagina(datos.pagina=datos.pagina+1)}}>Pág Siguiente</button></th> 
                        <th>Número páginas: {datos.pagina} / {datos.total_pag}</th>
                </table>
            </Row>
            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={ false } animation={false}>
                <Modal.Header>
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