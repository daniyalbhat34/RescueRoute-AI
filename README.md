# 🚨 RescueRoute AI

### Hazard-Aware Emergency Routing Powered by Graph Algorithms

**RescueRoute AI** is a full-stack emergency routing prototype that helps users explore alternative driving routes when roads become blocked or hazardous.

Built for **Cutie Hack 2026**, the application combines real-world OpenStreetMap road data, graph-based shortest-path algorithms, an interactive React map, and a Python FastAPI backend.

The initial prototype focuses on **Riverside, California**, demonstrating how road-network graphs can support dynamic rerouting around reported hazards.

> **Disclaimer:** RescueRoute AI is a hackathon prototype, not a certified emergency navigation system. It does not use verified live road-closure data and should not be relied upon during actual emergencies. Always follow official emergency instructions.

---

## The Problem

During emergencies such as wildfires, floods, earthquakes, and severe storms, roads can become blocked or unsafe.

Traditional shortest-path routing may not account for newly reported hazards, potentially directing users toward inaccessible roads.

RescueRoute AI explores a simple idea:

**What if a routing system could dynamically update its road network when a hazard is reported and calculate an alternative path?**

## Solution

RescueRoute AI models a city's driving network as a **directed, weighted graph**.

- **Nodes** represent road-network intersections and endpoints.
- **Edges** represent drivable road segments.
- **Edge weights** represent road lengths.
- **Hazards** identify road segments that should be excluded from route calculations.

The application uses NetworkX to calculate shortest paths and recompute routes after a selected road edge is removed from a temporary graph.

The result is displayed on an interactive map, allowing users to compare the original route with an alternative.

## Features

- **Interactive Map:** Explore Riverside using OpenStreetMap and React Leaflet.
- **Point Selection:** Choose a starting location and destination directly on the map.
- **Shortest-Path Routing:** Calculate driving routes using NetworkX and real-world road geometry.
- **Hazard Reporting:** Select a location representing a potentially blocked road.
- **Alternative Routing:** Recalculate a route after excluding a selected directed road edge.
- **Route Visualization:** Display original and alternative routes with distinct colors.
- **REST API:** Connect the React frontend to a Python FastAPI routing service.
- **Cached Road Network:** Store the downloaded road graph locally to avoid downloading it at every startup.
- 
## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Mapping | React Leaflet, Leaflet, OpenStreetMap |
| Backend | Python, FastAPI, Uvicorn |
| Road Network | OSMnx |
| Graph Algorithms | NetworkX |
| Geometry | Shapely |
| API Communication | REST, JSON |

## System Architecture

```text
                    USER
                     |
                     v
          React + TypeScript UI
                     |
                     v
             React Leaflet Map
                     |
                     | HTTP / JSON
                     v
                FastAPI
                     |
             +-------+-------+
             |               |
             v               v
        OSMnx Graph     Hazard Selection
             |               |
             +-------+-------+
                     |
                     v
             NetworkX Routing
                     |
              Shortest Path
              /           \
       Original Route   Modified Graph
                            |
                      Alternative Route
              \           /
               \         /
                v       v
              Map Visualization
```

## How It Works

### 1. Build the Road Network

OSMnx retrieves the drivable road network for Riverside, California, from OpenStreetMap.

The network is represented as a NetworkX `MultiDiGraph`, supporting directed road connections and multiple edges between nodes.

The graph is saved as `riverside.graphml` for reuse.

### 2. Select Locations

Users click the map to select a starting point and destination.

The backend uses OSMnx's nearest-node functionality to associate those coordinates with road-network nodes.

### 3. Calculate the Original Route

NetworkX computes the shortest driving path using road length as the edge weight.

```python
path = nx.shortest_path(
    G,
    source=start_node,
    target=dest_node,
    weight="length"
)
```

Road-edge geometry is converted into latitude/longitude coordinates so React Leaflet can display the path along the mapped roads.

### 4. Report a Hazard

The user selects a location on the map to represent a blocked or hazardous road.

The backend identifies the nearest road edge using OSMnx.

### 5. Recalculate the Route

The backend creates a temporary copy of the road graph and removes the selected directed edge.

```python
modified_graph = G.copy()
modified_graph.remove_edge(u, v, key)
```

NetworkX then computes a new shortest path using the modified graph.

The original graph remains unchanged.

**Current limitation:** The prototype removes a selected directed edge, rather than implementing a complete, validated closure of every affected road direction.

### 6. Visualize the Results

The frontend displays:

- 🔵 **Blue:** Original shortest route
- 🟢 **Green:** Calculated alternative route
- 🔴 **Red:** User-reported hazard location

## Getting Started

### Prerequisites

Ensure you have:

- Python 3.12 or a compatible Python 3 version
- Node.js and npm
- Git
- An internet connection for the initial OpenStreetMap download and map tiles

### 1. Clone the Repository

```bash
git clone https://github.com/daniyalbhat34/RescueRoute-AI.git
cd RescueRoute-AI
```

### 2. Set Up the Backend

```bash
cd backend

python3 -m venv .venv
source .venv/bin/activate

pip3 install -r requirements.txt
```

Start the FastAPI server:

```bash
python3 -m uvicorn main:app --reload
```

Backend URL:

`http://localhost:8000`

Interactive API documentation:

`http://localhost:8000/docs`

**Note:** On the first run, OSMnx may need to download Riverside's road network. Subsequent runs can load the cached GraphML file.

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend

npm i
npm run dev
```

## Future Improvements

- **AI Hazard Detection:** Classify uploaded images of floods, debris, fire, and road obstructions.
- **Verified Road Closures:** Integrate trusted hazard and closure data sources.
- **Improved Edge Matching:** Identify the exact road segment selected by the user.
- **Bidirectional Closures:** Correctly exclude all affected directions of a blocked road.
- **Travel-Time Optimization:** Compare routes using estimated travel time rather than distance alone.
- **Multiple Route Options:** Generate and rank alternative paths.
- **Incident Management:** Track reported hazards and their status.
- **Scalability:** Extend routing beyond Riverside to additional cities.

## Hackathon

**Event:** Cutie Hack 2026  
**Project:** RescueRoute AI  
**Category:** Emergency Navigation / Geospatial Technology

RescueRoute AI demonstrates how graph algorithms, geospatial data, and modern web technologies can be combined to prototype dynamic routing around road hazards.

## License

No license has been specified yet. Add a `LICENSE` file if you intend to distribute the project under an open-source license.

---

**Built for Cutie Hack 2026.**
