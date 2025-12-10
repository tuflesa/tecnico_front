import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_SERVER } from '../../constantes';
import { useCookies } from 'react-cookie'; 
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const HorarioSemanal = () => {
  const [diasSemana, setDiasSemana] = useState([]);
  const [token] = useCookies(['tec-token']);  

  useEffect(() => {
    cargarSemana();
  }, []);

  const cargarSemana = async () => {
    try {
        const res = await axios.get(BACKEND_SERVER + `/api/velocidad/horarios/semana/`, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        });
        setDiasSemana(res.data);
    } catch (error) {
        console.error("Error cargando semana:", error);
    }
  };

  const manejarCambioHora = (claveDia, campo, valor) => {
    const nuevos = diasSemana.map(d =>
        d.fecha === claveDia ? { ...d, [campo]: valor } : d
    );
    setDiasSemana(nuevos);
  };

  const guardar = async (dia) => {
    try {
        await axios.put(BACKEND_SERVER + `/api/velocidad/horarios/${dia.fecha}/`, {
            inicio: dia.inicio,
            fin: dia.fin
        }, {
            headers: {
                'Authorization': `token ${token['tec-token']}`
            }
        });
        alert("Horario guardado correctamente");
    } catch (error) {
        console.error("Error guardando:", error);
        alert("Error al guardar el horario");
    }
  };

  /* const generarAnual = async () => {
    const confirmar = window.confirm("¿Deseas generar todos los horarios del año actual?");
    if (!confirmar) return;

    try {
        await axios.post(BACKEND_SERVER + `/api/velocidad/horarios/generar/`, {}, { 
            headers: {
                'Authorization': `token ${token['tec-token']}` 
            }
        });
        alert("Año generado correctamente");
        cargarSemana();
    } catch (error) {
        console.error("Error generando el año:", error);
        alert("Hubo un error generando el año: " + (error.response?.data?.mensaje || error.message));
    }
  }; */

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
                {/* <button
                    onClick={generarAnual}
                    style={{
                        marginBottom: "20px",
                        backgroundColor: "#16a34a",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "600"
                    }}
                >
                    Generar año actual
                </button> */}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>📅</span>
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Configurar Horarios</h1>
                        <Link to="/velocidad">
                            <Button variant="info">Volver</Button>
                        </Link>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {diasSemana.map(dia => (
                        <div 
                            key={dia.fecha}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '12px',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                backgroundColor: dia.es_fin_de_semana ? '#f3f4f6' : 'white'
                            }}
                        >
                        <span style={{ fontWeight: '600', minWidth: '80px' }}>{dia.nombreDia}</span>
                        <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '70px' }}>{dia.fecha}</span>
                          <>
                              <span style={{ fontSize: '14px', color: '#6b7280' }}>Inicio</span>
                              <input
                                  type="time"
                                  value={dia.inicio}
                                  onChange={(e) => manejarCambioHora(dia.fecha, 'inicio', e.target.value)}
                                  style={{
                                      border: '1px solid #d1d5db',
                                      borderRadius: '4px',
                                      padding: '6px 8px',
                                      fontSize: '14px'
                                  }}
                              />

                              <span style={{ fontSize: '14px', color: '#6b7280' }}>Fin</span>
                              <input
                                  type="time"
                                  value={dia.fin}
                                  onChange={(e) => manejarCambioHora(dia.fecha, 'fin', e.target.value)}
                                  style={{
                                      border: '1px solid #d1d5db',
                                      borderRadius: '4px',
                                      padding: '6px 8px',
                                      fontSize: '14px'
                                  }}
                              />

                              <button
                                  onClick={() => guardar(dia)}
                                  style={{
                                      marginLeft: '15px',
                                      backgroundColor: '#2563eb',
                                      color: 'white',
                                      padding: '6px 14px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      cursor: 'pointer'
                                  }}
                              >
                                  Guardar
                              </button>
                            </>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default HorarioSemanal;