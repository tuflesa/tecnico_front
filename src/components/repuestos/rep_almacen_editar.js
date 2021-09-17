import React, { useState, useEffect } from 'react';
import RepAlmacenForm from './rep_almacen_form';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const RepAlmacenEdit = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [almacen, setAlmacenes] = useState(null);

    useEffect(() => {
        // console.log('Detalle');
        axios.get(BACKEND_SERVER + `/api/repuestos/almacen/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            console.log(res.data);
            setAlmacenes (res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return (
        <React.Fragment>
            {almacen ? <RepAlmacenForm nombre={almacen.nombre} empresa={almacen.empresa} almacen_id={almacen.id}/> : null}
        </React.Fragment>
    )
}

export default RepAlmacenEdit;