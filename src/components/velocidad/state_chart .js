import React, { useEffect, useRef, useState } from 'react';
import {
    select,
    scaleTime,
    scaleLinear,
    axisBottom,
    axisLeft,
    axisRight,
    line,
    curveStepAfter,
    pointer,
    bisector
  } from 'd3';
import moment from 'moment';
import './velocidad.css';

const useResizeObserver = (ref) => {
    const [dimensions, setDimensions] = useState(null);
    useEffect(() => {
      const observeTarget = ref.current;
      const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          setDimensions(entry.contentRect);
        });
      });
      resizeObserver.observe(observeTarget);
      return () => {
        resizeObserver.unobserve(observeTarget);
      };
    }, [ref]);
    return dimensions;
  };

const StateChart = ({data, flejes, fecha, hora_inicio, hora_fin, ver, maquina}) => {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);

    // Cuando cambian los datos actualizamos el grafico
    useEffect(()=>{
        if (!dimensions || !maquina) return;
        const width = dimensions.width
            , height = dimensions.height
        const margin = {top: 20, right: 30, bottom: 20, left: 30};
        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom;

        const svg =svgRef.current;
        
        // console.log(flejes);

        const inicio = moment(fecha + ' ' + hora_inicio)
        const fin = moment(fecha + ' ' + hora_fin)
        const n_ticks_x = fin.diff(inicio, 'hours');
                
        const xScale = scaleTime()
            .domain([inicio, fin])
            .range([0, innerWidth]);
        
        const yScale = scaleLinear()
            .domain([-40, maquina.v_max])
            .range([innerHeight, 0]);

        const yScalePotencia = scaleLinear().domain([0, maquina.hf_pmax]).range([yScale(0), 0]);
        const yScaleFrecuencia = scaleLinear().domain([0 , maquina.hf_fmax + 50]).range([yScale(0), 0]);
        const yScalePresion = scaleLinear().domain([0, maquina.fuerza_max]).range([yScale(0), 0]);

        const ejeX = axisBottom(xScale);
        const ejeY = axisLeft(yScale)
          .tickValues(yScale.ticks(10).filter(t => t >= 0));

        const ejePotencia = axisRight(yScalePotencia).ticks(5);
        const ejeFrecuencia = axisRight(yScaleFrecuencia).ticks(5);
        const ejePresion = axisRight(yScalePresion).ticks(5);

        const offsetPotencia = margin.left + innerWidth;
        const offsetFrecuencia = margin.left + innerWidth + 40;
        const offsetPresion = margin.left + innerWidth + 80;

        select(svg).select('.grafico')
        .attr('transform', `translate(${margin.left},${margin.top})`);

        select(svg).select('.eje-x')
        .attr('transform', `translate(${margin.left},${margin.top + yScale(0)})`)
        .call(ejeX);

        select(svg).select('.eje-y')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .call(ejeY);

        select(svg).select('.eje-potencia')
        .attr('transform', `translate(${offsetPotencia},${margin.top})`)
        .call(ejePotencia);

      select(svg).select('.eje-frecuencia')
        .attr('transform', `translate(${offsetFrecuencia},${margin.top})`)
        .call(ejeFrecuencia);

      select(svg).select('.eje-presion')
        .attr('transform', `translate(${offsetPresion},${margin.top})`)
        .call(ejePresion);


        function make_x_gridlines() {
            return axisBottom(xScale)
                .ticks(n_ticks_x)
        }

        function make_y_gridlines() {
            const ticks = yScale.ticks(10).filter(t => t > 0); // solo y > 0
            return axisLeft(yScale)
              .tickValues(ticks);
        }

        const myLine = line()
            .curve(curveStepAfter)
            .x( d => xScale(d.x))
            .y( d => {
                if (d.y>0) {
                    return yScale(d.y);
                }
                else {
                    return yScale(0);
                }
            });

        const myLinePower = line()
            .curve(curveStepAfter)
            .x( d => xScale(d.x))
            .y( d => {
                if (d.potencia>0) {
                    return yScalePotencia(d.potencia);
                }
                else {
                    return yScalePotencia(0);
                }
            });

        const myLineFrequency = line()
            .curve(curveStepAfter)
            .x( d => xScale(d.x))
            .y( d => {
                if (d.frecuencia>0) {
                    return yScaleFrecuencia(d.frecuencia);
                }
                else {
                    return yScaleFrecuencia(0);
                }
            });

        const myLineForce = line()
            .curve(curveStepAfter)
            .x( d => xScale(d.x))
            .y( d => {
                if (d.fuerza>0) {
                    return yScalePresion(d.fuerza);
                }
                else {
                    return yScalePresion(0);
                }
            });
        
        const gridHeightYPositivos = yScale(0); // posición en píxeles de y = 0

        // Velocidad
        data && select(svg).select('.grafico')
            .selectAll('path.velocidad')
            .data(data)
            .join('path')
            .attr("class", "velocidad")
            .attr('fill', 'none')
            .attr('stroke', value => value.color)
            .style("stroke-width", 2)
            .transition()
            .attr('d', value => ver.velocidad ? myLine(value.registros) : '');

        // Potencia
        data && select(svg).select('.grafico')
            .selectAll('path.power')
            .data(data)
            .join('path')
            .attr("class", "power")
            .attr('fill', 'none')
            .attr('stroke', 'brown')
            .style("stroke-width", 2)
            .transition()
            .attr('d', value => ver.potencia ? myLinePower(value.registros) : '');

        // Frecuencia
        data && select(svg).select('.grafico')
            .selectAll('path.frequency')
            .data(data)
            .join('path')
            .attr("class", "frequency")
            .attr('fill', 'none')
            .attr('stroke', 'teal')
            .style("stroke-width", 2)
            .transition()
            .attr('d', value => ver.frecuencia ? myLineFrequency(value.registros) : '');    

        // Fuerza
        data && select(svg).select('.grafico')
            .selectAll('path.force')
            .data(data)
            .join('path')
            .attr("class", "frequency")
            .attr('fill', 'none')
            .attr('stroke', 'deepskyblue')
            .style("stroke-width", 2)
            .transition()
            .attr('d', value => ver.fuerza ? myLineForce(value.registros) : '');    

        // Circulos para señalizar el cursor
        data && select(svg).select('.grafico')
            .selectAll('circle')
            .data(data)
            .join('circle')
            .attr("r", 0)
            .attr("fill", value => value.color)
            .attr("class", value => value.siglas)
            .style("stroke", "white")
            .attr("opacity", .70)
            .style("pointer-events", "none");

        // Textos
        data && select(svg).select('.grafico')
            .selectAll('text')
            .data(data)
            .join('text')
            .attr("fill", value => value.color)
            .attr("class", value => 't-' + value.siglas)
            .text('');

        // Dibujar Flejes
        flejes && select(svg).select('.grafico')
          .selectAll('rect.fleje')
          .data(flejes)
          .join('rect')
          .attr("class", "fleje")
          .attr("x", f => xScale(f.x_in))
          .attr("y", f => yScale(f.y_in))
          .attr("width", f => xScale(f.x_out) - xScale(f.x_in))
          .attr("height", f => yScale(f.y_in) - yScale(f.y_out))
          .attr("fill", f => f.color)
          .on("mouseover", function(event, f) {
              select(svg).select('.grafico')
                .append("text")
                .attr("class", "fleje-label")
                .attr("x", xScale(f.x_in) + 5)
                .attr("y", yScale(f.y_in) - 5)
                .attr("fill", "black")
                .attr("font-size", "12px")
                .text(f.descripcion);
            })
            .on("mouseout", function() {
              select(svg).select('.grafico').selectAll(".fleje-label").remove();
            });

        // Texto centrado en cada rectángulo
        flejes && select(svg).select('.grafico')
          .selectAll('text.fleje-pos')
          .data(flejes)
          .join('text')
          .attr("class", "fleje-pos")
          .attr("x", f => xScale(f.x_in) + (xScale(f.x_out) - xScale(f.x_in)) / 2)
          .attr("y", f => yScale(f.y_in) + ((yScale(f.y_in) - yScale(f.y_out)) / 2))
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "white") // o negro, según contraste
          .attr("font-size", "12px")
          .text(f => f.pos);
        
        // Lisening rectangles: para saber cuando entra y sale el ratón
        data && select(svg).select('.grafico')
            .selectAll('rect.listener')
            .data(data)
            .join('rect')
            .attr("class", "listener")
            .attr("width", innerWidth) //dimensions.width)
            .attr("height", innerHeight - yScale(40)) //dimensions.height)
            .on("mousemove", event => {
              const [xCoord] = pointer(event, this);
              const bisectDate = bisector(d => d.x).left;
              const x0 = xScale.invert(xCoord);
              data.map(maquina => {
                const i = bisectDate(maquina.registros, x0, 1);
                const d0 = maquina.registros[i - 1];
                const d1 = maquina.registros[i];
                if(d0&&d1){
                  const d = x0 - d0.x > d1.x - x0 ? d1 : d0;
                  const xPos = xScale(d.x);
                  const yPos = yScale(d.y);
                  // console.log(d.x.getHours() + ':' + d.x.getMinutes());
                  select(svg).select('.grafico').select('.' + maquina.siglas)
                    .attr("cx", xPos)
                    .attr("cy", yPos)
                    .transition()
                    .duration(50)
                    .attr("r", 5);

                  select(svg).select('.grafico').select('.t-' + maquina.siglas)
                    .attr("x", (xScale(fin) - xScale(inicio))/2 - 100)
                    .attr("y", -10)
                    .attr('fill', 'black')
                    .attr('font-size', '12px')
                    .text(d.x.toLocaleTimeString() + ' - ' + d.y.toFixed(1) + ' m/min '
                        + d.potencia.toFixed(0) + ' KW ' + d.frecuencia.toFixed(0) + ' KHz '
                        + d.fuerza.toFixed(0) + ' KN');
                  }
              });
            });

        select(svg).select('.grid-x')
            // .attr("class","rejilla")
            .attr('transform',`translate(${margin.left},${margin.top + yScale(0)})`)
            .style("stroke-dasharray",("3,3"))
            .call(make_x_gridlines()
              // .tickSize(-innerHeight)
              .tickSize(-gridHeightYPositivos) // solo hasta y > 0
              .tickFormat("")
              );

        select(svg).select('.grid-y')
            // .attr("class","rejilla")
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .style("stroke-dasharray",("3,3"))
            .call(make_y_gridlines()
              .tickSize(-innerWidth)
              .tickFormat("")
            );
        
        // Añadir texto para Velocidad
        select(svg).select('.eje-y')
          .append('text')
          .attr('x', 10)
          .attr('y', -10)
          .attr('text-anchor', 'middle')
          .attr('fill', 'black')
          .attr('font-size', '12px')
          .text('V (m/min)');

        // Añadir texto para Potencia
        select(svg).select('.eje-potencia')
          .append('text')
          .attr('x', 0)
          .attr('y', -10)
          .attr('text-anchor', 'middle')
          .attr('fill', 'black')
          .attr('font-size', '12px')
          .text('P (KW)');

          // Añadir texto para Frecuencia
          select(svg).select('.eje-frecuencia')
            .append('text')
            .attr('x', 10)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .attr('fill', 'black')
            .attr('font-size', '12px')
            .text('Fq (KHz)');

          // Añadir texto para Presión
          select(svg).select('.eje-presion')
            .append('text')
            .attr('x', 20)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .attr('fill', 'black')
            .attr('font-size', '12px')
            .text('F (KN)');

        // Añadir texto para Flejes
        select(svg).select('.eje-y')
          .append('text')
          .attr('x', -20)
          .attr('y', yScale(-25))
          .attr('text-anchor', 'middle')
          .attr('fill', 'black')
          .attr('font-size', '12px')
          .text('Flejes');

    },[data, fecha, hora_fin, hora_inicio, dimensions, ver]);

    return (
        <div ref={wrapperRef} id='speedChart'>
            <svg ref={svgRef} 
                 className='speedChart'
                // width={size.width} 
                // height={size.height}
                // viewBox={`0 0 ${size.width} ${size.height}`}
                >
                <g className='grafico'></g>
                <g className='grid-x grid'></g>
                <g className='grid-y grid'></g>
                <g className='eje-x'></g>
                <g className='eje-y'></g>  
                <g class="eje-potencia"></g>
                <g class="eje-frecuencia"></g>
                <g class="eje-presion"></g>
            </svg>
        </div>
    );
}

export default StateChart;