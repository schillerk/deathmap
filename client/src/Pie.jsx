import React, { Component } from 'react';
import * as d3 from "d3";

const radius = 70;

function getCoor(percent) {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x*70, y*70];
}

const labels = ['Heart Disease', 'Stroke', 'Pulmonary Disease', 'Respiratory Infections', 'Dementias', 'Lung Cancer', 'Diabetes', 'Road Injury', 'Diarrhea', 'Tuberculosis'];
const data = [9.5, 6, 3, 3, 2.5, 2, 2, 1.5, 1.5, 1.5];
const sum = data.reduce((acc, el) => acc + el, 0);
const min = Math.min(...data);
const max = Math.max(...data);

const percentScale = d3.scaleLinear()
  .domain([min, max])
  .range([min/sum, max/sum]);

class Pie extends Component {
	constructor() {
		super();
		this.state = {
			hovered: -1,
		};
	}

	componentDidMount() {
		this.renderChart()
	}

	componentDidUpdate() {
		this.renderChart()
	}

	renderChart() {
		const pieSVG = d3.select('#price-chart');

    const width = 800;
    const height = 400;

		pieSVG
			.attr('height', height)
			.attr('width', width);

    const radius = Math.min(width, height) / 2;
   	d3.selectAll('text').remove();

	  const colors = ['#141414','#232323','#303030','#3f3f3f','#4e4e4e','#5f5f5f','#6f6f6f','#7f7f7f','#919191','#a3a3a3'];
		let cumulativePercent = 0;
	  data.forEach((el, idx) => {
	  	if (idx > 11) {
	  		return;
	  	}
	  	const percent = percentScale(el);
  	  const largeArcFlag = percent > .5 ? 1 : 0;
			const [startX, startY] = getCoor(cumulativePercent);
		  cumulativePercent += percent;
			const [endX, endY] = getCoor(cumulativePercent);
		  pieSVG.append("path")
	      .attr("d", `M${startX} ${startY}
	      	A 70 70 0 ${largeArcFlag} 1 ${endX} ${endY}
	      	L 0 0
	      `)
	      .attr('idx', idx)
        .on('mouseover', () => {
          this.setState({ hovered: idx });
        })
	      .style('fill', colors[idx]);

	   	const hovered = this.state.hovered === idx;
	    pieSVG.append('rect')
	    	.attr('x', 93)
	    	.attr('y', 13 * idx - 60)
	    	.attr('width', 5)
	    	.attr('height', 5)
	    	.attr('fill', colors[idx]);
	    pieSVG.append('text')
	    	.attr('x', 100)
	    	.attr('y', 13 * idx - 56)
	    	.attr('font-size', 6)
	    	.attr('font-weight', hovered ? 'bold' : '')
	    	.text(`${labels[idx]} - ${el}M deaths per year`);
	  });
	}

	handleHover() {
		console.log(this.state);
		this.setState({
			hovered: d3.select(this).attr('idx'),
		});
	}

	render() {
		return (
			<div className="calculator">
        <svg id="price-chart"
          viewBox="0 -100 200 200">
        </svg>
			</div>
		);
	}
}

export default Pie;
