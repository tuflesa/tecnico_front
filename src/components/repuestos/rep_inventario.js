import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import ReactExport from 'react-data-export';

const RepInventario = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);

    const [datos, setDatos] = useState({        
        empresa: user['tec-user'].perfil.empresa.id,        
    }); 
    const[listInventario, setListInventario]=useState(null);
    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    useEffect(()=>{
        axios.get(BACKEND_SERVER + `/api/repuestos/stocks_minimo_detalle/?almacen__empresa__id=${datos.empresa}&repuesto__descatalogado=${false}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
                }
        })
        .then( res => {
            {res.data && res.data.map( r => {
                r['alm'] = r.almacen.nombre;
                r['articulo'] = r.repuesto.nombre;
            })}
            setListInventario(res.data.sort(function(a, b){
                if(a.articulo > b.articulo){
                    return 1;
                }
                if(a.articulo < b.articulo){
                    return -1;
                }
                return 0;
            }));
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);
    return (
        <Container>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Inventario empresa {datos.empresa__nombre}</h5>
                    <ExcelFile filename={"ExcelExportExample"} element={<button>Exportar a Excel</button>}>
                        <ExcelSheet data={listInventario} name="Inventario">
                            <ExcelColumn label="Id" value="id"/>
                            <ExcelColumn label="Nombre" value="articulo"/>
                            <ExcelColumn label="Almacén" value="alm"/>
                            <ExcelColumn label="Cantidad" value="stock_act"/>
                        </ExcelSheet>
                    </ExcelFile> 
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Almacén</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listInventario && listInventario.map( inventario => {
                                return (
                                    <tr key={inventario.id}>
                                        <td>{inventario.articulo}</td>
                                        <td>{inventario.alm}</td>
                                        <td>{inventario.stock_act}</td>
                                    </tr>
                                )})
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    )
}

export default RepInventario;