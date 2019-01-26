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

    const people = this.state.deaths == 1 ? 'person has' : 'people have';

    return (
      <div className="App">
        <div className="title-wrap">
          <div className="title">
            Human Deaths in Real Time
            <div className="subtitle">
              Since you opened this page, {this.state.deaths} {people} died.
            </div>
          </div>
        </div>
        <div id='map' style={mapStyle}></div>
      </div>
    );
  }
}

export default App;