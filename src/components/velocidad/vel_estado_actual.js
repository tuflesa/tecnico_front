import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const EstadoActual = ({ estado, seleccionLinea }) => {
    return (
        <div>
            <Link to={`/velocidad/estado/${estado.zona.id}`} target="_blank" rel="noopener noreferrer">
                <Button>{estado.zona.siglas}</Button>
            </Link>
            <h4>{estado.velocidad_actual && estado.velocidad_actual.toFixed(2)}</h4>
            <Form.Check type="checkbox" 
                        label="Ver"
                        checked={estado.seleccion}
                        value={estado.zona.siglas}
                        onChange={seleccionLinea} />
        </div>
    )
}

export default EstadoActual; 