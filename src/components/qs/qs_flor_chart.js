import React, { useEffect, useRef, useState} from 'react';
import {
    select,
    scaleLinear,
    axisBottom,
    axisLeft,
    path
  } from 'd3';
import './qs.css';
import useResizeObserver from '../utilidades/use_resizeObserver';

const FlowerChart = ({montaje, ejes, fleje}) => {

    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);

    useEffect(()=>{
        if (!dimensions) return;
        const width = dimensions.width
            , height = dimensions.height
        const margin = {top: 20, right: 20, bottom: 20, left: 20};
        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom;

        const svg =svgRef.current;

        const limite = 150;
                
        const xScale = scaleLinear()
            .domain([-limite, limite])
            .range([0, innerWidth]);
        
        const yScale = scaleLinear()
            .domain([-limite, limite])
            .range([innerHeight, 0]);

        const rScale = scaleLinear()
            .domain([0, 2*limite])
            .range([0, innerWidth]);

        const ejeX = axisBottom(xScale);
        const ejeY = axisLeft(yScale);

        select(svg).select('.grafico')
        .attr('transform', `translate(${margin.left},${margin.top})`);

        select(svg).select('.eje-x')
        .attr('transform',`translate(${margin.left},${margin.top + innerHeight / 2})`)
        .call(ejeX);

        select(svg).select('.eje-y')
        .attr('transform', `translate(${margin.left + innerWidth / 2},${margin.top})`)
        .call(ejeY);

        function make_x_gridlines() {
            return axisBottom(xScale)
                .ticks(10)
          }

        function make_y_gridlines() {
            return axisLeft(yScale)
                .ticks(10)
          }

        function draw_BD(m, i) {
            // Definición del rodillo
            const roll = m.rodillos[0]; // Solo usamos el rodillo interior
            const R = roll.parametros.R;
            let alfa = roll.parametros.alfa * Math.PI / 180;
            let L; // longitud de fleje fuera del radio (tramo recto)
            if (R * alfa > fleje.ancho) {
                alfa = fleje.ancho / R;
                L = 0;
                
            }
            else {
                L = fleje.ancho - R * alfa;
            }

            // const Dext = roll.parametros.Dext;
            const Df = roll.parametros.Df;
            // const Ancho = roll.parametros.Ancho;
            const AxisPos0 = -ejes.filter(e => e.op == m.operacion)[0].pos[0]; // Posición del eje referido al centro de la máquina
        
            // Calculos
            const xc = 0;
            const yc = AxisPos0 + Df/2 + R;
            const pos = R - yc; // Posición del fondo del rodillo respecto al centro de máquina
            const x0 = R * Math.sin(alfa/2) + (L/2) * Math.cos(alfa/2);
            const y0 = R * (1 - Math.cos(alfa/2)) + (L/2) * Math.sin(alfa/2) - pos;
            const y1 = y0 + fleje.espesor * Math.cos(alfa/2);
            const x1 = x0 - fleje.espesor * Math.sin(alfa/2);//+ (y1-y0) / Math.tan((Math.PI + alfa)/2);
            const x2 = 0;
            const y2 = y1 - x1 / Math.tan((Math.PI - alfa)/2);
            

            // Centro de masas
            const M1 = alfa * (Math.pow(R,2) - Math.pow((R-fleje.espesor),2)) / 2; // Area de la sección circular
            const ycm1 = yc - ((2/(3*M1))*(Math.pow(R,3) - Math.pow((R-fleje.espesor),3)) * Math.sin(alfa/2)); // Centro de masas;

            const M2 = fleje.espesor * L;
            const yi = R * (1 - Math.cos(alfa/2)) - pos;
            const ycm2 = yi + (L/4) + Math.sin(alfa/2) + (fleje.espesor/2) * Math.cos(alfa/2);

            const ycm = (ycm1*M1 + ycm2*M2) /(M1+M2);
            console.log('ycm: ', ycm);
            
        
            // Dibujo
            const r = path();

            r.arc(xScale(xc), yScale(yc), rScale(R), (Math.PI - alfa)/2, (alfa + Math.PI)/2);
            r.lineTo(xScale(-x0), yScale(y0));
            r.lineTo(xScale(-x1), yScale(y1));
            r.arcTo(xScale(x2), yScale(y2), xScale(x1), yScale(y1), rScale(R - fleje.espesor));
            r.lineTo(xScale(x1), yScale(y1));
            r.lineTo(xScale(x0), yScale(y0));
            r.closePath();

            return r.toString()
        }

        function draw_BD_W(m, i) {
            // Definición del rodillo
            const roll = m.rodillos[0]; // Solo usamos el rodillo interior
            const R1 = roll.parametros.R1;
            let alfa1 = roll.parametros.alfa1 * Math.PI / 180;
            const R2 = roll.parametros.R2;
            let alfa2 = roll.parametros.alfa2 * Math.PI / 180;
            const Dext = roll.parametros.Dext;
            const Df = roll.parametros.Df;
            const Dc = roll.parametros.Dc;
            const Ancho = roll.parametros.Ancho;
            const AxisPos0 = -ejes.filter(e => e.op == m.operacion)[0].pos[0]; // Posición del eje referido al centro de la máquina

            // Calculos
            const xc1 = - roll.parametros.xc1;
            const yc1 = AxisPos0 + Df/2 + R1;
            const pos = R1 - yc1; // Posición del fondo del rodillo respecto al centro de máquina
            const xc2 = 0;
            const yc2 = (Dc-Df)/2 - R2 - pos;
            const x0 = xc1 + R1 * Math.sin(alfa2);
            const y0 = yc1 - R1 * Math.cos(alfa2);
            const x1 = xc2 - R2 * Math.sin(alfa2);
            const y1 = yc2 + R2 * Math.cos(alfa2);

            // longitud de fleje fuera del radio (tramo recto)
            const d1 = 2* Math.sqrt(Math.pow((x0-x1),2)+Math.pow((y0-y1),2)); // Tramo recto entre radios
            const d2 = R2 * 2 * alfa2; // Longitud tramo central
            const d3 = 2 * R1 * alfa2; 
            const d4 = 2 * R1 * alfa1;
            const d5 = d1 + d2 + d3 + d4;

            let L; 
            if (d5 > fleje.ancho) {
                alfa1 = (d5 - fleje.ancho)/(2*R1);
                L = 0;
                
            }
            else {
                L = fleje.ancho - d5;
            }

            const x2 = -xc1 + R1 * Math.sin(alfa1);
            const y2 = yc1 - R1 * Math.cos(alfa1);
            const x3 = x2 - fleje.espesor * Math.sin(alfa1);
            const y3 = y2 + fleje.espesor * Math.cos(alfa1);
            const x4 = -x1 - fleje.espesor * Math.sin(alfa2);
            const y4 = y1 + fleje.espesor * Math.cos(alfa2);
            const x5 = x0 - fleje.espesor * Math.sin(alfa2);
            const y5 = y0 + fleje.espesor * Math.cos(alfa2);

            // // Centro de masas
            // const M1 = alfa * (Math.pow(R,2) - Math.pow((R-fleje.espesor),2)) / 2; // Area de la sección circular
            // const ycm1 = yc - ((2/(3*M1))*(Math.pow(R,3) - Math.pow((R-fleje.espesor),3)) * Math.sin(alfa/2)); // Centro de masas;

            // const M2 = fleje.espesor * L;
            // const yi = R * (1 - Math.cos(alfa/2)) - pos;
            // const ycm2 = yi + (L/4) + Math.sin(alfa/2) + (fleje.espesor/2) * Math.cos(alfa/2);

            // const ycm = (ycm1*M1 + ycm2*M2) /(M1+M2);
            // console.log('ycm: ', ycm);
            
        
            // // Dibujo
            const r = path();
            r.arc(xScale(xc1), yScale(yc1), rScale(R1), Math.PI/2 + alfa1, Math.PI/2 - alfa2, true);
            r.lineTo(xScale(x1), yScale(y1));
            r.arc(xScale(xc2), yScale(yc2), rScale(R2), 3*Math.PI/2 - alfa2, 3*Math.PI/2 + alfa2);
            r.lineTo(xScale(-x0), yScale(y0));
            r.arc(xScale(-xc1), yScale(yc1), rScale(R1), Math.PI/2 + alfa2, Math.PI/2 - alfa1, true);
            r.lineTo(xScale(x3), yScale(y3));
            r.arc(xScale(-xc1), yScale(yc1), rScale(R1 - fleje.espesor), Math.PI/2 - alfa1, Math.PI/2 + alfa2);
            r.lineTo(xScale(x4), yScale(y4));
            r.arc(xScale(xc2), yScale(yc2), rScale(R2 + fleje.espesor), 3*Math.PI/2 + alfa2, 3*Math.PI/2 - alfa2, true);
            r.lineTo(xScale(x5), yScale(y5));
            r.arc(xScale(xc1), yScale(yc1), rScale(R1-fleje.espesor), Math.PI/2 - alfa2, Math.PI/2 + alfa1);
            r.closePath();

            return r.toString()
        }

        function draw_BD_2R(m, i) {
            // Definición del rodillo
            const roll = m.rodillos[0]; // Solo usamos el rodillo interior
            const R1 = roll.parametros.R1;
            let alfa1 = roll.parametros.alfa1 * Math.PI / 180;
            const R2 = roll.parametros.R2;
            let alfa2 = roll.parametros.alfa2 * Math.PI / 180;
            const R3 = roll.parametros.R3;
            const Dext = roll.parametros.Dext;
            const Df = roll.parametros.Df;
            const AxisPos0 = -ejes.filter(e => e.op == m.operacion)[0].pos[0]; // Posición del eje referido al centro de la máquina

            // Calculos
            const xc1 = 0;
            const yc1 = AxisPos0 + Df/2 + R1;
            const pos = R1 - yc1; // Posición del fondo del rodillo respecto al centro de máquina
            const xc2 = (R1-R2) * Math.sin(alfa1/2);
            const yc2 = yc1 - (R1-R2) * Math.cos(alfa1/2);
            const xc3 = xc2 - (R3-R2) * Math.sin(alfa2);
            const yc3 = yc2 + (R3-R2) * Math.cos(alfa2);

            // longitud de fleje fuera del radio (tramo recto)
            const d1 = R1 * alfa1; // Longitud tramo central
            const d2 = 2 * R2 * alfa2;
            const d3 = d1 + d2;

            let alfa3 = 0;
            if (d3 > fleje.ancho) {
                alfa2 = (d3 - fleje.ancho)/(2*R2);
            }
            else {
                alfa3 = (fleje.ancho - d3)/(2*R3);
            }
            
            const x0 = xc3 + R3 * Math.sin(alfa2+alfa3);
            const y0 = yc3 - R3 * Math.cos(alfa2+alfa3);
            const x1 = x0 - fleje.espesor * Math.sin(alfa2+alfa3);
            const y1 = y0 + fleje.espesor * Math.cos(alfa2+alfa3);
            // const x4 = -x1 - fleje.espesor * Math.sin(alfa2);
            // const y4 = y1 + fleje.espesor * Math.cos(alfa2);
            // const x5 = x0 - fleje.espesor * Math.sin(alfa2);
            // const y5 = y0 + fleje.espesor * Math.cos(alfa2);

            // // Centro de masas
            // const M1 = alfa * (Math.pow(R,2) - Math.pow((R-fleje.espesor),2)) / 2; // Area de la sección circular
            // const ycm1 = yc - ((2/(3*M1))*(Math.pow(R,3) - Math.pow((R-fleje.espesor),3)) * Math.sin(alfa/2)); // Centro de masas;

            // const M2 = fleje.espesor * L;
            // const yi = R * (1 - Math.cos(alfa/2)) - pos;
            // const ycm2 = yi + (L/4) + Math.sin(alfa/2) + (fleje.espesor/2) * Math.cos(alfa/2);

            // const ycm = (ycm1*M1 + ycm2*M2) /(M1+M2);
            // console.log('ycm: ', ycm);
            
        
            // // Dibujo
            const r = path();
            r.arc(xScale(xc1), yScale(yc1), rScale(R1), (Math.PI + alfa1)/2, (Math.PI - alfa1)/2, true);
            r.arc(xScale(xc2), yScale(yc2), rScale(R2), (Math.PI - alfa1)/2, Math.PI/2 - alfa2, true);
            r.arc(xScale(xc3), yScale(yc3), rScale(R3), Math.PI/2 - alfa2,  Math.PI/2 - alfa2 - alfa3, true);
            r.lineTo(xScale(x1), yScale(y1));
            r.arc(xScale(xc3), yScale(yc3), rScale(R3-fleje.espesor), Math.PI/2 - alfa2 - alfa3, Math.PI/2 - alfa2);
            r.arc(xScale(xc2), yScale(yc2), rScale(R2-fleje.espesor), Math.PI/2 - alfa2, (Math.PI - alfa1)/2);
            r.arc(xScale(xc1), yScale(yc1), rScale(R1-fleje.espesor), (Math.PI - alfa1)/2, (Math.PI + alfa1)/2);
            r.arc(xScale(-xc2), yScale(yc2), rScale(R2-fleje.espesor), (Math.PI + alfa1)/2, Math.PI/2 + alfa2);
            r.arc(xScale(-xc3), yScale(yc3), rScale(R3-fleje.espesor),  Math.PI/2 + alfa2, Math.PI/2 + alfa2 + alfa3);
            r.lineTo(xScale(-x0), yScale(y0));
            r.arc(xScale(-xc3), yScale(yc3), rScale(R3), Math.PI/2 + alfa2 + alfa3, Math.PI/2 + alfa2, true);
            r.arc(xScale(-xc2), yScale(yc2), rScale(R2), Math.PI/2 + alfa2, (Math.PI + alfa1)/2, true);
            r.closePath();

            return r.toString()
        }

        function draw_FP(m, i) {
            // Rodillos y ejes
            const roll_i = m.rodillos[0];
            const roll_s = m.rodillos[1];
            const AxisPos0_i = ejes.filter(e => e.op == m.operacion)[0].pos[0];
            const AxisPos0_s = ejes.filter(e => e.op == m.operacion)[0].pos[1];

            // Dibujo rodillo inferior
            // Variables
            let xc, yc, xc2, yc2;
            let xc1_s, yc1_s, xc2_s, yc2_s;
            let x1, y1, x2, y2, x3, y3;//, x4, y4, x5, y5, x6, y6;
            let xcr, ycr; // Centro de los rodillos
            let Dext_i, Df_i, Dc_i, C, D_cuchilla;
            let Dext_s, Df_s, Dc_s
            let R1, alfa1, R2, alfa2, R3, alfa3, R4;
            let R1_s, alfa1_s, R2_s, alfa2_s, R3_s, alfa3_s;
            let pos_i, pos_s;
            // let ycm, ycm1, ycm2, ycm3, ycm4;

            // Parametros
            R1 = roll_i.parametros.R1;
            R2 = roll_i.parametros.R2;
            R3 = roll_i.parametros.R3;
            alfa1 = roll_i.parametros.alfa1 * Math.PI / 180;
            alfa2 = roll_i.parametros.alfa2 * Math.PI / 180;
            alfa3 = roll_i.parametros.alfa3 * Math.PI / 180;

            Dext_i = roll_i.parametros.Dext;
            Df_i = roll_i.parametros.Df;
            Dc_i = roll_i.parametros.Dc;
            Dext_s = roll_s.parametros.Dext;
            Df_s = roll_s.parametros.Df;
            Dc_s = roll_s.parametros.Dc;

            // Calculos
            pos_i = -AxisPos0_i + Df_i / 2;
            ycr = ((AxisPos0_s - Dc_s/2) + (-AxisPos0_i + Dc_i/2)) / 2; 
            xc = 0;
            yc = pos_i + R1;
            xc2 = (R2-R1) * Math.sin(alfa1/2);
            yc2 = yc + (R2-R1) * Math.cos(alfa1/2);
            x3 = xc2 - R2 * Math.cos(alfa3);
            y3 = yc2 - R2 * Math.sin(alfa3);
            xcr = x3 + (1/Math.tan(alfa3)) * (ycr - y3);
            R4 = Math.sqrt(Math.pow(x3-xcr,2)+Math.pow(y3 - ycr,2));

            Df_s = roll_s.parametros.Df
            R1_s = roll_s.parametros.R1;
            R2_s = roll_s.parametros.R2;
            R3_s = roll_s.parametros.R3;
            alfa1_s = roll_s.parametros.alfa1 * Math.PI / 180;
            alfa2_s = roll_s.parametros.alfa2 * Math.PI / 180;
            alfa3_s = roll_s.parametros.alfa3 * Math.PI / 180;
            C = roll_s.parametros.Cuchilla;

            let alfa_c = 0;
             if (R1_s != 0) {
                alfa_c = Math.asin(C/(2*R1_s));
             }
            
            pos_s = AxisPos0_s - Df_s / 2;
            x1 = -C/2;
            y1 = pos_s;
            
            xc1_s = 0;
            
            if (R1_s===0){
                xc2_s = R2_s * Math.cos(alfa2_s) - C/2;
                yc2_s = y1 - R2_s * Math.sin(alfa2_s);
                x2 = x1 + fleje.espesor*Math.cos(alfa2_s);
                y2 = y1 - fleje.espesor*Math.sin(alfa2_s);
            }
            else{
                yc1_s = pos_s - Math.sqrt(Math.pow(R1_s,2)-Math.pow(C/2,2));
                xc2_s = (R2_s-R1_s) * Math.cos(alfa2_s);
                yc2_s = yc1_s - (R2_s-R1_s) * Math.sin(alfa2_s);
                x2 = x1 + fleje.espesor*Math.sin(alfa_c);
                y2 = y1 - fleje.espesor*Math.cos(alfa_c);
            }
            // console.log('alfa_c: ', alfa_c*180/Math.PI);

            // Desarrollo
            // console.log('R4: ', R4);
            // console.log('alfa3:', alfa3*180/Math.PI);
            const Desarrollo = R1*alfa1 + 2*R2*((Math.PI-alfa1)/2 - alfa3) + 2*R4*(2*alfa3) + 2*R2_s*(alfa2_s-alfa3_s) + 2*R1_s*(alfa1_s/2-alfa_c);
            console.log(m.nombre + ' desarrollo: ', Desarrollo); 

            // Centro de masas
            

            // Dibujo
            const r = path();
            r.arc(xScale(xc), yScale(yc), rScale(R1), (Math.PI - alfa1)/2, (Math.PI + alfa1)/2);
            r.arc(xScale(xc2), yScale(yc2), rScale(R2), (Math.PI+alfa1)/2, Math.PI - alfa3);
            r.arc(xScale(xcr), yScale(ycr), rScale(R4), Math.PI - alfa3, Math.PI + alfa3); 
            r.arc(xScale(xc2_s), yScale(yc2_s), rScale(R2_s), Math.PI + alfa3_s, Math.PI + alfa2_s);
            if(R1_s!==0){
                r.arc(xScale(xc1_s), yScale(yc1_s), rScale(R1_s), Math.PI + alfa2_s, (3*Math.PI/2) - alfa_c);
                r.lineTo(xScale(x2), yScale(y2));
                r.arc(xScale(xc1_s), yScale(yc1_s), rScale(R1_s-fleje.espesor), 3*Math.PI/2 - alfa_c, Math.PI + alfa2_s, true);
            }
            else{
                r.lineTo(xScale(x2), yScale(y2));
            }
            r.arc(xScale(xc2_s), yScale(yc2_s), rScale(R2_s-fleje.espesor), Math.PI + alfa2_s, Math.PI + alfa3_s, true);
            r.arc(xScale(xcr), yScale(ycr), rScale(R4-fleje.espesor), Math.PI + alfa3 , Math.PI - alfa3, true);
            r.arc(xScale(xc2), yScale(yc2), rScale(R2-fleje.espesor), Math.PI - alfa3, (Math.PI+alfa1)/2, true);
            r.arc(xScale(xc), yScale(yc), rScale(R1-fleje.espesor), (Math.PI + alfa1)/2, (Math.PI - alfa1)/2, true);
            r.arc(xScale(-xc2), yScale(yc2), rScale(R2-fleje.espesor), (Math.PI-alfa1)/2, alfa3, true);
            r.arc(xScale(-xcr), yScale(ycr), rScale(R4-fleje.espesor), alfa3 , - alfa3 , true);
            r.arc(xScale(-xc2_s), yScale(yc2_s), rScale(R2_s-fleje.espesor), -alfa3_s, -alfa2_s, true);
            if(R1_s!==0){
                r.arc(xScale(-xc1_s), yScale(yc1_s), rScale(R1_s-fleje.espesor), -alfa2_s, 3*Math.PI/2+ alfa_c,true);
                r.lineTo(xScale(-x1), yScale(y1));
                r.arc(xScale(-xc1_s), yScale(yc1_s), rScale(R1_s), 3*Math.PI/2+ alfa_c, -alfa2_s);
            }
            else{
                r.lineTo(xScale(-x1), yScale(y1));
            }
            r.arc(xScale(-xc2_s), yScale(yc2_s), rScale(R2_s), -alfa2_s, -alfa3_s,);
            r.arc(xScale(-xcr), yScale(ycr), rScale(R4), -alfa3 ,  alfa3);
            r.arc(xScale(-xc2), yScale(yc2), rScale(R2), alfa3, (Math.PI-alfa1)/2);
 
            return r.toString()
        }
        
        function draw_flawer(m,i) {
          let p = '';
          if (ejes){
            switch (m.tipo) {
                case 'BD':
                    p = draw_BD(m,i);
                    break;
                case 'BD_W':
                    p = draw_BD_W(m,i);
                    break;
                case 'BD_2R':
                    p = draw_BD_2R(m,i);
                    break;
                case 'FP':
                    p = draw_FP(m, i);
                break;
            }
        }
          return p;
        }

        select(svg).select('.grid-x')
            .attr('transform',`translate(${margin.left},${margin.top + innerHeight})`)
            .style("stroke-dasharray",("3,3"))
            .call(make_x_gridlines()
              .tickSize(-innerHeight)
              .tickFormat("")
            );

        select(svg).select('.grid-y')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .style("stroke-dasharray",("3,3"))
            .call(make_y_gridlines()
              .tickSize(-innerWidth)
              .tickFormat("")
            );

        // Dibujo del fleje
        select(svg).select('.grafico')
            .selectAll('rect')
            .data([fleje])
            .join('rect')
            .attr('fill', fleje.color) 
            .attr('opacity', 0.5)
            .attr('stroke', fleje => fleje.color)
            .style("stroke-width", 1)
            .attr('x', xScale(-fleje.ancho/2))
            .attr('y', yScale(fleje.espesor /2))
            .attr('width', rScale(fleje.ancho))
            .attr('height', rScale(fleje.espesor))

        // Dibujo de la flor
        select(svg).select('.grafico')
            .selectAll('path')
            .data(montaje)
            .join('path')
            .attr('fill', m => m.color)
            //.attr('fill', 'none')
            .attr('opacity', 0.5)
            .attr('stroke', m => m.color)
            .style("stroke-width", 1)
            .attr('d', (m,i) => draw_flawer(m,i));
               
    },[dimensions, montaje, ejes, fleje]);

    return (
        <div ref={wrapperRef}>
            <svg ref={svgRef} 
                 className='standChart'
                >
                <g className='grafico'></g>
                <g className='grid-x grid'></g>
                <g className='grid-y grid'></g>
                <g className='eje-x'></g>
                <g className='eje-y'></g>  
            </svg>
        </div>
    );
}

export default FlowerChart;