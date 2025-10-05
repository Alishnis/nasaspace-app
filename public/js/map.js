// Map service for displaying air quality data on maps
class MapService {
    constructor() {
        this.map = null;
        this.markers = [];
        this.airQualityLayer = null;
        this.isInitialized = false;
    }

    async initialize(containerId, options = {}) {
        try {
            // Check if Leaflet is available
            if (typeof L === 'undefined') {
                console.error('Leaflet is not loaded. Please include Leaflet CSS and JS files.');
                return false;
            }

            const defaultOptions = {
                center: [40.7128, -74.0060], // New York City
                zoom: 10,
                ...options
            };

            this.map = L.map(containerId).setView(defaultOptions.center, defaultOptions.zoom);

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize map:', error);
            return false;
        }
    }

    addAirQualityMarker(lat, lng, data, options = {}) {
        if (!this.map) {
            console.error('Map not initialized');
            return null;
        }

        const defaultOptions = {
            color: this.getAQIColor(data.aqi),
            fillColor: this.getAQIColor(data.aqi),
            fillOpacity: 0.7,
            radius: 15,
            ...options
        };

        const marker = L.circleMarker([lat, lng], defaultOptions)
            .bindPopup(this.createAirQualityPopup(data))
            .addTo(this.map);

        this.markers.push(marker);
        return marker;
    }

    addAirQualityLayer(dataPoints) {
        if (!this.map) {
            console.error('Map not initialized');
            return;
        }

        // Remove existing layer
        if (this.airQualityLayer) {
            this.map.removeLayer(this.airQualityLayer);
        }

        const markers = dataPoints.map(point => {
            return L.circleMarker([point.lat, point.lng], {
                color: this.getAQIColor(point.aqi),
                fillColor: this.getAQIColor(point.aqi),
                fillOpacity: 0.7,
                radius: 15
            }).bindPopup(this.createAirQualityPopup(point));
        });

        this.airQualityLayer = L.layerGroup(markers).addTo(this.map);
    }

    createAirQualityPopup(data) {
        const aqiClass = this.getAQIClass(data.aqi);
        
        return `
            <div class="air-quality-popup">
                <h3>Air Quality: ${data.aqi}</h3>
                <p class="aqi-category ${aqiClass}">${data.category}</p>
                <p class="health-message">${data.healthMessage}</p>
                <div class="pollutants">
                    <h4>Pollutants:</h4>
                    <ul>
                        ${Object.entries(data.pollutants).map(([name, value]) => `
                            <li>${name.toUpperCase()}: ${value ? parseFloat(value).toFixed(1) : 'N/A'}</li>
                        `).join('')}
                    </ul>
                </div>
                <p class="timestamp">Updated: ${new Date(data.timestamp).toLocaleString()}</p>
            </div>
        `;
    }

    getAQIColor(aqi) {
        if (aqi <= 50) return '#10b981'; // Good - Green
        if (aqi <= 100) return '#f59e0b'; // Moderate - Yellow
        if (aqi <= 150) return '#f97316'; // Unhealthy for Sensitive Groups - Orange
        if (aqi <= 200) return '#ef4444'; // Unhealthy - Red
        if (aqi <= 300) return '#8b5cf6'; // Very Unhealthy - Purple
        return '#7c2d12'; // Hazardous - Dark Red
    }

    getAQIClass(aqi) {
        if (aqi <= 50) return 'good';
        if (aqi <= 100) return 'moderate';
        if (aqi <= 150) return 'unhealthy';
        if (aqi <= 200) return 'very-unhealthy';
        return 'hazardous';
    }

    centerMap(lat, lng, zoom = 12) {
        if (this.map) {
            this.map.setView([lat, lng], zoom);
        }
    }

    fitBounds(bounds) {
        if (this.map) {
            this.map.fitBounds(bounds);
        }
    }

    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    clearAirQualityLayer() {
        if (this.airQualityLayer) {
            this.map.removeLayer(this.airQualityLayer);
            this.airQualityLayer = null;
        }
    }

    addHeatmap(dataPoints) {
        if (!this.map) {
            console.error('Map not initialized');
            return;
        }

        // Simple heatmap implementation
        const heatmapData = dataPoints.map(point => ({
            lat: point.lat,
            lng: point.lng,
            intensity: point.aqi / 500 // Normalize to 0-1
        }));

        // Create heatmap layer (simplified version)
        const heatmapLayer = L.layerGroup();
        
        dataPoints.forEach(point => {
            const intensity = point.aqi / 500;
            const radius = Math.max(10, intensity * 50);
            const opacity = Math.min(0.8, intensity);
            
            L.circle([point.lat, point.lng], {
                radius: radius,
                color: this.getAQIColor(point.aqi),
                fillColor: this.getAQIColor(point.aqi),
                fillOpacity: opacity
            }).addTo(heatmapLayer);
        });

        heatmapLayer.addTo(this.map);
        return heatmapLayer;
    }

    addTrajectoryPath(points) {
        if (!this.map || points.length < 2) {
            return null;
        }

        const latlngs = points.map(point => [point.lat, point.lng]);
        const polyline = L.polyline(latlngs, {
            color: '#3b82f6',
            weight: 3,
            opacity: 0.7
        }).addTo(this.map);

        return polyline;
    }

    addWindVectors(windData) {
        if (!this.map) {
            return;
        }

        windData.forEach(point => {
            const { lat, lng, speed, direction } = point;
            const length = Math.min(20, speed * 2); // Scale wind speed to arrow length
            
            // Create wind arrow
            const arrow = L.polyline([
                [lat, lng],
                [
                    lat + (length * Math.cos(direction * Math.PI / 180)) / 111000,
                    lng + (length * Math.sin(direction * Math.PI / 180)) / 111000
                ]
            ], {
                color: '#0ea5e9',
                weight: 2,
                opacity: 0.8
            }).bindPopup(`Wind: ${speed.toFixed(1)} m/s at ${direction.toFixed(0)}°`);

            arrow.addTo(this.map);
        });
    }

    exportMap() {
        if (!this.map) {
            return null;
        }

        // Export map as image (requires html2canvas library)
        const mapContainer = this.map.getContainer();
        return new Promise((resolve, reject) => {
            if (typeof html2canvas !== 'undefined') {
                html2canvas(mapContainer).then(canvas => {
                    resolve(canvas.toDataURL());
                }).catch(reject);
            } else {
                reject(new Error('html2canvas library not loaded'));
            }
        });
    }

    getBounds() {
        if (this.map) {
            return this.map.getBounds();
        }
        return null;
    }

    getCenter() {
        if (this.map) {
            return this.map.getCenter();
        }
        return null;
    }

    getZoom() {
        if (this.map) {
            return this.map.getZoom();
        }
        return null;
    }

    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.markers = [];
        this.airQualityLayer = null;
        this.isInitialized = false;
    }
}

// Utility functions for map operations
const MapUtils = {
    // Calculate distance between two points
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    // Generate grid points for interpolation
    generateGrid(bounds, resolution = 0.1) {
        const points = [];
        for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += resolution) {
            for (let lng = bounds.getWest(); lng <= bounds.getEast(); lng += resolution) {
                points.push({ lat, lng });
            }
        }
        return points;
    },

    // Interpolate air quality data
    interpolateAirQuality(points, targetLat, targetLng) {
        if (points.length === 0) return null;
        if (points.length === 1) return points[0];

        // Simple inverse distance weighting
        let totalWeight = 0;
        let weightedAQI = 0;
        let weightedPollutants = {};

        points.forEach(point => {
            const distance = MapUtils.calculateDistance(targetLat, targetLng, point.lat, point.lng);
            const weight = 1 / (distance * distance + 0.001); // Add small value to avoid division by zero
            
            totalWeight += weight;
            weightedAQI += point.aqi * weight;
            
            Object.keys(point.pollutants).forEach(pollutant => {
                if (!weightedPollutants[pollutant]) {
                    weightedPollutants[pollutant] = 0;
                }
                weightedPollutants[pollutant] += (point.pollutants[pollutant] || 0) * weight;
            });
        });

        // Normalize weights
        weightedAQI /= totalWeight;
        Object.keys(weightedPollutants).forEach(pollutant => {
            weightedPollutants[pollutant] /= totalWeight;
        });

        return {
            lat: targetLat,
            lng: targetLng,
            aqi: Math.round(weightedAQI),
            pollutants: weightedPollutants
        };
    }
};
