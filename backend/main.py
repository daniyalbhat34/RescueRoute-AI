from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import networkx as nx
from road_network import load_road_network
from routing import (
    calculate_route,
    calculate_alternative_route,
    find_nearest_route_edge,
    get_edge_coordinates,
)

G = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global G
    G = load_road_network()
    yield


app = FastAPI(
    title="RescueRoute AI API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RouteRequest(BaseModel):
    start: tuple[float, float]
    destination: tuple[float, float]

class AlternativeRouteRequest(BaseModel):
    start: tuple[float, float]
    destination: tuple[float, float]
    blocked_location: tuple[float, float]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/route")
def get_route(request: RouteRequest):
    try:
        coordinates = calculate_route(
            G,
            request.start,
            request.destination
        )

        return {
            "route": coordinates,
            "alternative_route": []
        }

    except nx.NetworkXNoPath:
        raise HTTPException(
            status_code=404,
            detail="No driving route found between these locations"
        )
    except nx.NodeNotFound:
        raise HTTPException(
            status_code=404,
            detail="Road network node not found"
        )

@app.post("/route/alternative")
def get_alternative_route(request: AlternativeRouteRequest):
    try:
        lat, lon = request.blocked_location

        blocked_edge = find_nearest_route_edge(
            G,
            request.start,
            request.destination,
            lat,
            lon
        )

        alternative = calculate_alternative_route(
            G,
            request.start,
            request.destination,
            blocked_edge
        )

        return {
            "alternative_route": alternative,
            "blocked_segment": get_edge_coordinates(G, blocked_edge),
            "blocked_edge": list(blocked_edge)
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    except nx.NetworkXNoPath:
        raise HTTPException(
            status_code=404,
            detail="No alternative route available after blocking this road"
        )

    except nx.NodeNotFound:
        raise HTTPException(
            status_code=404,
            detail="Road network node not found"
        )
