import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { BACKEND_SERVER } from '../../constantes';

const ParteForm = ({parte, setParte}) => {
    return(
        <h5>hola estamos en parte Form</h5>
    )
}
export default ParteForm;