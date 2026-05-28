import React from "react";
import { Table } from "react-bootstrap";

function CuadroEstadisticas({ nombre, calidad, disponibilidad, rendimiento, oee }) {
  return (
    <div style={{ marginLeft: "0px" }}>
      
      {/* Nombre centrado sobre todo el bloque */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <h4>OEE {nombre} {oee?.toFixed(2) ?? "--"} %</h4>
      </div>

      {/* Contenedor horizontal: tabla + cuadro OEE */}
      <div className="d-flex align-items-center gap-5">
        
        {/* Tabla */}
        <Table striped bordered hover style={{ width: "auto", marginBottom: 0 }}>
          <tbody>
            <tr>
              <td style={{ minWidth: "200px" }}>Calidad</td>
              <td style={{ minWidth: "100px" }}>
                {calidad?.toFixed(2) ?? "--"} %
              </td>
            </tr>

            <tr>
              <td style={{ minWidth: "200px" }}>Disponibilidad</td>
              <td style={{ minWidth: "100px" }}>
                {disponibilidad?.toFixed(2) ?? "--"} %
              </td>
            </tr>

            <tr>
              <td style={{ minWidth: "200px" }}>Rendimiento</td>
              <td style={{ minWidth: "100px" }}>
                {rendimiento?.toFixed(2) ?? "--"} %
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default CuadroEstadisticas;
