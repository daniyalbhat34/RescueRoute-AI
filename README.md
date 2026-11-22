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

### Implemented

- **Interactive Map:** Explore Riverside using OpenStreetMap and React Leaflet.
- **Point Selection:** Choose a starting location and destination directly on the map.
- **Shortest-Path Routing:** Calculate driving routes using Network
