import React from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import logo from '../../assets/logo_bornay.svg';
import rod_inf from '../../assets/rod_inf.svg';
import rod_sup from '../../assets/rod_sup.svg';

const RodTooling = () => {
    var numero = 2;
    
    return (
        <Container>
            <img src ={logo} width="500" height="500"></img>
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Lista de Almacenes</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th colspan ={numero}>Id Repuesto precio</th>
                                <th>Nombre</th>
                                <th>Imagen</th>
                                <th>Proveedor</th>
                            </tr>
                            <tr align='center'>
                                <th><img src = {rod_inf} width="50" height="50"></img></th>
                                <th><img src = {rod_sup} width="50" height="50"></img></th>
                                <th><img src = {rod_inf} width="50" height="50"></img></th>
                                <th><img src = {rod_sup} width="50" height="50"></img></th>
                                <th><img src = {rod_inf} width="50" height="50"></img></th>
                            </tr>
                        </thead>
                        {/* <tbody>
                            {repuestos && repuestos.map( repuesto => {
                                return (
                                    <tr key={repuesto.id}>
                                        <td>{repuesto.nombre}</td>
                                        <td>{repuesto.proveedor===29?<img src = {logo}></img>:repuesto.proveedor===30?<img src = {cuchilla}></img>:''}</td>
                                        <td>{repuesto.proveedor}</td>
                                    </tr>
                                )})
                            }
                        </tbody> */}
                    </Table>
                </Col>
            </Row>  

        </Container>
    )
}
export default RodTooling;