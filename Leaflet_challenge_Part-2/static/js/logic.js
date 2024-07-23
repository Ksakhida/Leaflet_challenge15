//console.log to see the structure of the data
console.log("Step 2 working");

// Initialize the map centered at [20, -100] with a zoom level of 2.45
let map = L.map('map').setView([20, -100], 2.45);

// Define tile layers for different base maps
let satellite = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
  {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });

let grayscale = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
  {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });


let outdoors = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
  {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });


// Add the satellite layer to the map as the default layer
satellite.addTo(map);

// Define base maps object to hold the different layers
let baseMaps = {
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoors": outdoors
};

// Define layer groups for earthquakes and tectonic plates
let earthquakes = L.layerGroup();
let tectonicPlates = L.layerGroup();

// Define overlay maps object to hold the overlay layers
let overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
};

// Add layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(map);

// URL for the earthquake data in GeoJSON format
let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch the earthquake data using D3
d3.json(earthquakeUrl).then(data => {
    // Create a GeoJSON layer with the fetched data
    L.geoJson(data, {
        // Define how each point will be represented on the map
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        // Define the style of each point based on its properties
        style: function (feature) {
            return {
                radius: getRadius(feature.properties.mag),
                fillColor: getColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
        },
        // Add a popup to each point with additional information
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
        }
    }).addTo(earthquakes);

    // Add the earthquakes layer to the map
    earthquakes.addTo(map);
});

// URL for the tectonic plates data in GeoJSON format
let tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Fetch the tectonic plates data using D3
d3.json(tectonicPlatesUrl).then(data => {
    // Create a GeoJSON layer with the fetched data
    L.geoJson(data, {
        color: "orange",
        weight: 2
    }).addTo(tectonicPlates);

    // Add the tectonic plates layer to the map
    tectonicPlates.addTo(map);
});

// Function to determine the radius of each point based on the earthquake magnitude
function getRadius(magnitude) {
    return magnitude * 4;
}

// Function to determine the color of each point based on the earthquake depth
function getColor(depth) {
    return depth > 90 ? '#FF0000' :
           depth > 70 ? '#FF4500' :
           depth > 50 ? '#FF8C00' :
           depth > 30 ? '#FFA500' :
           depth > 10 ? '#FFD700' :
                        '#ADFF2F';
}

// Create a legend control for the map
let legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend');
    let depths = [0, 10, 30, 50, 70, 90];
    let colors = ['#ADFF2F', '#FFD700', '#FFA500', '#FF8C00', '#FF4500', '#FF0000'];

    // Loop through depth intervals and generate a label with a colored square for each interval
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    }

    return div;
};

// Add the legend to the map
legend.addTo(map);
