import React ,{ useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import VelocidadNavBar from './vel_nav_bar';
import { Container, Row } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useParams } from 'react-router-dom';


const GraficoEstado = () => {
    const [token] = useCookies(['tec-token']);
    const { id } = useParams();

    const [maquina, setMaquina] = useState(null);

    useEffect(()=>{
        console.log('Leer máquina');
        axios.get(BACKEND_SERVER + `/api/velocidad/estado/${id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then(res => {
            console.log(res.data);
            setMaquina(res.data);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[id]);

    return (
        <React.Fragment>
            <VelocidadNavBar />
            <Container>
                <Row>
                    <h1>{maquina&&maquina.nombre}</h1>
                </Row> 
            </Container>
        </React.Fragment>
    )
}

export default GraficoEstado;