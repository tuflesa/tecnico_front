import React, { useEffect, useRef} from 'react';
import {
    select,
    scaleLinear,
    axisBottom,
    axisLeft,
    line
  } from 'd3';
import './qs.css';
import useResizeObserver from '../utilidades/use_resizeObserver';

const HeightChart = ({alturas}) => {

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

        const limite = 200;
                
        const xScale = scaleLinear()
            .domain([0, 10100])
            .range([0, innerWidth]);
        
        const yScale = scaleLinear()
            .domain([-limite, limite])
            .range([innerHeight, 0]);

        const ejeX = axisBottom(xScale);
        const ejeY = axisLeft(yScale);

        select(svg).select('.grafico')
        .attr('transform', `translate(${margin.left},${margin.top})`);

        select(svg).select('.eje-x')
        .attr('transform',`translate(${margin.left},${margin.top + innerHeight / 2})`)
        .call(ejeX);

        select(svg).select('.eje-y')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .call(ejeY);

        function make_x_gridlines() {
            return axisBottom(xScale)
                .ticks(10)
          }

        function make_y_gridlines() {
            return axisLeft(yScale)
                .ticks(10)
          }

        const myLine = line()
            .x( d => xScale(d.x))
            .y( d => yScale(d.y));

        // lineas
        alturas && select(svg).select('.grafico')
            .selectAll('path')
            .data(alturas)
            .join('path')
            .attr('fill', 'none')
            .attr('stroke', a => a.color)
            .style("stroke-width", 2)
            .transition()
            .attr('d', a => myLine(a.puntos));

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
    },[dimensions, alturas]);

    return (
        <div ref={wrapperRef}>
            <svg ref={svgRef} 
                 className='heightChart'
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

export default HeightChart;