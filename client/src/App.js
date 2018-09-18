import React, { Component } from 'react';
import './App.css';

import { countries, framesPerSecond, initialOpacity, minOpacity, initialRadius, maxRadius } from './country_data.js';
import mapboxgl from 'mapbox-gl';
import Pie from './Pie';

mapboxgl.accessToken = 'pk.eyJ1Ijoia3lsZXNjaGlsbGVyIiwiYSI6ImNqazNzMjQ3NzBiY24zcHQxMW9tMWthaTgifQ.1F20yXYI3kS3bdK0K7ZKjQ';

class App extends Component {
  state = {
    data: [],
    deaths: 0,
  };

  // dummy() {
  componentDidMount() {
    this.getData();
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v8',
    });

    map.on('load', ()  => {
      const updateCountries = () => {
        countries.map(c => {
          if (c.time <= 0) {
            if (Math.random() < c.rate) {
              c.time += framesPerSecond;
              this.setState({
                deaths: this.state.deaths + 1
              });
            }
          }

          if (c.time > 0) {
            var id = `point${c.name}`;

            map.setPaintProperty(id, 'circle-radius', c.radius);
            map.setPaintProperty(id, 'circle-opacity', c.opacity);

            c.radius += (maxRadius - c.radius) / framesPerSecond;
            c.opacity -= ( 1.15 / framesPerSecond );

            if (c.opacity <= minOpacity) {
              c.radius = initialRadius;
              c.opacity = initialOpacity;
              c.time = 0;
            }

            c.time -= 1;
          }
        });
      }

      var currentTimeout;
      function animateMarker(timestamp) {
        currentTimeout = setInterval(function() {
          requestAnimationFrame(updateCountries);
        }, 1000 / framesPerSecond);
      }

      countries.map(country => {
        var id = `point${country.name}`;
        // Add a source and layer displaying a point which will be animated in a circle.
        map.addSource(id , {
            "type": "geojson",
            "data": {
                "type": "Point",
                "coordinates": country.longlat,
            }
        });

        map.addLayer({
            "id": id,
            "source": id,
            "type": "circle",
            "paint": {
                "circle-radius": initialRadius,
                "circle-radius-transition": {duration: 0},
                "circle-opacity-transition": {duration: 0},
                "circle-color": "#007cbf"
            }
        });
      })
      animateMarker(0);
    });
  }

  getData = () => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => this.setState({ data }));
  }

  render() {
    const { data } = this.state;
    const mapStyle = {
      width: '500px',
      height: '300px',
      position: 'relative',
      margin: 'auto',
    };

    return (
      <div className="App">
        <div className="title-wrap">
          <div className="title">
            A map of every human death in real time
          </div>
          <div className="subtitle">
            (more or less)
          </div>
        </div>
        <div id='map' style={mapStyle}></div>
        <p className="caption">
          Since you opened this page, {this.state.deaths} people have died.
        </p>
        <p className="top-caption">
          Here are the 10 leading causes:
        </p>
        <Pie />
        <p className="subheader">
          Secondary Effects, Hidden Killers
        </p>
        <p>
          It’s worth noting that many of these causes are merely the secondary effects of broader structural problems.
        </p>
        <p>
          For example, air pollution isn’t a direct cause of death, but is still responsible for 7 million deaths each year. According to data from the WHO, many of the top killers are air pollution in disguise, with  24% of deaths from stoke (1.4M / year), 25% of deaths from heart disease (2.4M / year) and 43% of deaths from lung disease (1.8M / year) attributable to air pollution.
        </p>
        <p className="subheader">
          Data-Driven Questioning
        </p>
        <p>
          Death is a pretty bad proxy for suffering, so none of this should be translated uncritically into career, ethical or global priority recommendations. Still, mapping human mortality this way helps provoke questions that can help guide thinking in those domains.
        </p>
        <p>
          What makes a death acceptable or premature?
        </p>
        <p>
          Which causes of death imply a life of suffering for the deceased or for their loved ones?
        </p>
        <p>
          Who’s deaths are worth preventing?
        </p>
        <p className="subheader">
          Effective Giving
        </p>
        <p>
          Some deaths are difficult and costly to prevent, others, not so much.
        </p>
        <p>
          Give Well’s 2018 Cost-Effectiveness Analysis estimates that donating to the most effective charities in the world can result in an outcome equivalent to averting the death of an individual under 5 for as little as $858.
        </p>
        <p>
          Though diseases like Malaria (.44M deaths / year) and Schistosomiasis (between .024M and .2M deaths / year) aren’t responsible for enough absolute deaths to show up on our previous chart, they’re among the cheapest to prevent, and have, according to Give Well estimates, the highest marginal benefit per donated dollar of any disease.
        </p>
      </div>
    );
  }
}

export default App;