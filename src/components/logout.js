import React from 'react';
import { useCookies } from 'react-cookie';
import { Button } from 'react-bootstrap';

const Logout = () => {
    const [ , , deleteToken] = useCookies(['tec-token']);

    const logout = () => {
        deleteToken(['tec-token']);
    }

    return (
        <React.Fragment>
            <Button onClick={logout} variant="info">Logout</Button>
        </React.Fragment>
    )
}

export default Logout;