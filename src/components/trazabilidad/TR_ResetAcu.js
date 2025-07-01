import React, {useState} from 'react';
import axios from 'axios';
import { Button, Row, Col, Form, Table} from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';

const ResetAcu = ({Acumulador, setAcumulador, Flejes}) => {
    const [token] = useCookies(['tec-token']);

    const [flejeSeleccionado, setFlejeSeleccionado] = useState(null);

    const resetAcu = () => {
        // Guarda el fleje seleccionado en la tabla de Flejes
        axios.post(BACKEND_SERVER + `/api/trazabilidad/flejes/`, {
            pos: flejeSeleccionado.pos,
            idProduccion: flejeSeleccionado.idProduccion,
            IdArticulo: flejeSeleccionado.IdArticulo,
            peso: flejeSeleccionado.peso,
            of: flejeSeleccionado.of,
            maquina_siglas: flejeSeleccionado.maquina_siglas,
            descripcion: flejeSeleccionado.descripcion,
            acumulador: Acumulador.id,
            finalizada: false
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            console.log('post flejes')
            console.log(res);
        })
        .catch(err => { console.log(err);})

        // Actualiza el acumulador
        axios.patch(BACKEND_SERVER + `/api/trazabilidad/acumuladores/${Acumulador.id}/`, {
            of_activa: flejeSeleccionado.of,
            n_bobina_activa: flejeSeleccionado.pos,
            n_bobina_ultima: flejeSeleccionado.pos
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            console.log(res.data);
            setAcumulador(res.data);
        })
        .catch(err => { console.log(err);})

        // Actualiza PLC
        axios.post(BACKEND_SERVER + `/api/trazabilidad/resetPLC/`, {
            pos: flejeSeleccionado.pos,
            idProduccion: flejeSeleccionado.idProduccion,
            IdArticulo: flejeSeleccionado.IdArticulo,
            peso: flejeSeleccionado.peso,
            of: flejeSeleccionado.of,
            maquina_siglas: flejeSeleccionado.maquina_siglas,
            descripcion: flejeSeleccionado.descripcion,
            acumulador: Acumulador.id,
            finalizada: false,
            acumulador: Acumulador.id
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }     
        })
        .then( res => { 
            console.log(res);
        })
        .catch(err => { console.log(err);})
    }

    const handleChange = (event) =>{
        console.log(Acumulador);
        const fid = event.target.id; 
        // console.log('fid', fid);
        const fs = Flejes.filter(f => f.idProduccion == fid)[0];
        console.log(fs);
        setFlejeSeleccionado(fs);
    }

    return (
        <React.Fragment>
            <Table striped bordered hover>
                <thead>
                    <tr>
                    <th>Pos</th>
                    <th>ID Produccion</th>
                    <th>Descripcion</th>
                    <th>Peso</th>
                    <th>Check</th>
                    </tr>
                </thead>
                <tbody>
                    {Flejes&&Flejes.map(fdb => {
                        return (
                            <tr key={fdb.of + ':' + fdb.pos}>
                                <td>{fdb.pos}</td>
                                <td>{fdb.idProduccion}</td>
                                <td>{fdb.descripcion}</td>
                                <td>{fdb.peso}</td>
                                <td>
                                    <Form.Check
                                        inline
                                        name="group1"
                                        type={'radio'}
                                        id={fdb.idProduccion}
                                        onChange ={handleChange}
                                    />
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
            <Row>
                    <Col>
                        <Button variant="primary" onClick={resetAcu}>
                            Reset Acumulador
                        </Button>
                    </Col>
            </Row>
        </React.Fragment>
    )
}

export default ResetAcu