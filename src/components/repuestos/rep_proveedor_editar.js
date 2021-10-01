import React, { useState, useEffect } from 'react';
import RepProveedorForm from './rep_proveedor_form';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';
import axios from 'axios';

const RepProveedorEdit = ({ match }) => {
    const [token] = useCookies(['tec-token']);
    const [proveedor, setProveedores] = useState(null);

    useEffect(() => {
        console.log('proveedor detalle ...');
        axios.get(BACKEND_SERVER + `/api/repuestos/proveedor_detalle/${match.params.id}`,{
            headers: {
                'Authorization': `token ${token['tec-token']}`
              }
        })
        .then( res => {
            console.log(res.data)
            setProveedores (res.data);
        })
        .catch( err => {
            console.log(err);
        });
    }, [token, match]);

    return (
        <React.Fragment>
            {proveedor ? <RepProveedorForm proveedor={proveedor}/> : null}           
        </React.Fragment>
    )
}

export default RepProveedorEdit;