# UI - Road Network View

Browser-based interface for the Intelligent Traffic Routing and Dynamic Congestion Simulation project (DSCPP-III-2026-T355).

## How to run
Open `index.html` in any browser. No build step or server is needed.

## Files
- `index.html` - page layout, start/destination lists, legend, map canvas
- `style.css` - layout and traffic colour scheme
- `script.js` - sample road network, canvas drawing, node selection

## Done
- Road network drawn on a canvas (intersections and roads with distances)
- Traffic levels shown by colour: free, moderate, heavy, closed (sample data)
- Start and destination selection by clicking the map or using the lists

## Pending
- Route highlighting once the C++ A* engine returns a path
- Traffic controls (add congestion, accident, road closure)
- Simulated vehicle movement along the route
- Loading the network and routes from the C++ engine (for example as JSON)
- UI and integration testing
