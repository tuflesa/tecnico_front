import { Container } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie';

const RodNuevo = () => {
    const [token] = useCookies(['tec-token']);
    const [empresas, setEmpresas] = useState(null);
    const [user] = useCookies(['tec-user']);

    const [datos, setDatos] = useState({
        empresa: user['tec-user'].perfil.empresa.id,
        zona: '',
        seccion: '',
        equipo: ''
    });

    useEffect(() => {
        axios.get(BACKEND_SERVER + '/api/estructura/empresa/',{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            setEmpresas(res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token]);

    return (
        <Container className='mt-5'>
            <h5 className='mt-5'>Creando un rodillo nuevo</h5>
        </Container>
    );
}
export default RodNuevo;