import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import logo from '../../assets/logo_bornay.svg';
import rod_inf from '../../assets/rod_inf.svg';
import rod_sup from '../../assets/rod_sup.svg';
import { useCookies } from 'react-cookie';
import RodBancadaFiltro from './rod_bancada_filtro';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';
import { setMaxListeners } from 'process';
import { useLocation } from 'react-router-dom';


const RodBancada = () => {
    const [token] = useCookies(['tec-token']);
    const [user] = useCookies(['tec-user']);
    const [operaciones, setOperaciones] = useState(null);
    const [secciones, setSecciones] = useState(null);
    const [maquina, setMaquina] = useState('');
    const [filtro, setFiltro] = useState(`?maquina__empresa__id=${user['tec-user'].perfil.empresa.id}`);

    useEffect(() => {
        const params = new URLSearchParams(filtro);
        const maquinaValue = params.get('maquina');
        setMaquina(maquinaValue);
    }, [filtro]);

    useEffect(() => {
        axios.get(BACKEND_SERVER + `/api/rodillos/seccion/`+filtro,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setSecciones(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, filtro]);

    useEffect(() => {
        if(maquina){
            axios.get(BACKEND_SERVER + `/api/rodillos/operacion/?seccion__maquina__id=${maquina}`,{
                headers: {
                    'Authorization': `token ${token['tec-token']}`
                }
            })
            .then( r => {
                setOperaciones(r.data);
            })
            .catch( err => {
                console.log(err);
            });
        }
    }, [maquina]);

    const actualizaFiltro = str => {
        setFiltro(str);
    }
    
    return (
        <Container>
            <img src ={logo} width="200" height="200"></img>
            <Row>
                <Col>
                    <RodBancadaFiltro actualizaFiltro={actualizaFiltro}/>
                </Col>
            </ Row>
            {maquina? 
            <Row>
                <Col>
                    <h5 className="mb-3 mt-3">Bancada</h5>
                    <Table striped bordered hover>
                        <thead>
                            {secciones && secciones.map( seccion => {
                                return (   
                                    <th>{seccion.nombre}</th>                                             
                                    /* <tr key={seccion.id}>
                                        <th>{seccion.nombre}</th>
                                    </tr> */
                                )})
                            }
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
            :''} 

        </Container>
    )
}
export default RodBancada;