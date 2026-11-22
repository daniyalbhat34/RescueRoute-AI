import osmnx as ox
import networkx as nx
from road_network import load_road_network
from math import cos, radians
from shapely.geometry import Point, LineString
from shapely.ops import transform

def get_edge_coordinates(G, blocked_edge):
    u, v, key = blocked_edge

    edge = G[u][v][key]

    if "geometry" in edge:
        points = list(edge["geometry"].coords)
    else:
        points = [
            (G.nodes[u]["x"], G.nodes[u]["y"]),
            (G.nodes[v]["x"], G.nodes[v]["y"])
        ]

    return [[lat, lon] for lon, lat in points]

def calculate_route(G, start, destination):
    start_lat, start_lon = start
    dest_lat, dest_lon = destination

    start_node = ox.distance.nearest_nodes(
        G, X=start_lon, Y=start_lat
    )

    dest_node = ox.distance.nearest_nodes(
        G, X=dest_lon, Y=dest_lat
    )

    path = nx.shortest_path(
        G,
        source=start_node,
        target=dest_node,
        weight="length"
    )

    return path_to_coordinates(G, path)


def find_nearest_route_edge(G, start, destination, latitude, longitude):
    print("1. Finding nearest route edge", flush=True)

    start_node = ox.distance.nearest_nodes(
        G, X=start[1], Y=start[0]
    )
    dest_node = ox.distance.nearest_nodes(
        G, X=destination[1], Y=destination[0]
    )

    path = nx.shortest_path(
        G,
        source=start_node,
        target=dest_node,
        weight="length"
    )

    lat_scale = 111_320
    lon_scale = 111_320 * cos(radians(latitude))

    click_point = Point(0, 0)
    closest_edge = None
    closest_distance = float("inf")

    for u, v in zip(path[:-1], path[1:]):
        edges = G[u][v]
        key = min(edges, key=lambda k: edges[k]["length"])
        edge = edges[key]

        geometry = edge.get("geometry")

        if geometry is None:
            geometry = LineString([
                (G.nodes[u]["x"], G.nodes[u]["y"]),
                (G.nodes[v]["x"], G.nodes[v]["y"])
            ])

        local_geometry = transform(
            lambda x, y: to_local(
                x, y, longitude, latitude, lon_scale, lat_scale
            ),
            geometry
        )

        distance = local_geometry.distance(click_point)

        if distance < closest_distance:
            closest_distance = distance
            closest_edge = (u, v, key)

    print("2. Closest edge:", closest_edge, flush=True)
    print("3. Distance:", closest_distance, flush=True)

    if closest_edge is None or closest_distance > 30:
        raise ValueError(
            "Select a location within 30 meters of the original route."
        )

    return closest_edge
    
def to_local(x, y, longitude, latitude, lon_scale, lat_scale):
    return (
        (x - longitude) * lon_scale,
        (y - latitude) * lat_scale
    )

def calculate_alternative_route(G, start, destination, blocked_edge):
    start_node = ox.distance.nearest_nodes(
        G, X=start[1], Y=start[0]
    )
    dest_node = ox.distance.nearest_nodes(
        G, X=destination[1], Y=destination[0]
    )

    modified_graph = G.copy()

    u, v, key = blocked_edge

    if modified_graph.has_edge(u, v):
        modified_graph.remove_edges_from([
            (u, v, k) for k in list(modified_graph[u][v].keys())
        ])

    if modified_graph.has_edge(v, u):
        modified_graph.remove_edges_from([
            (v, u, k) for k in list(modified_graph[v][u].keys())
        ])

    print(
        "Alternative path exists:",
        nx.has_path(modified_graph, start_node, dest_node)
    )

    path = nx.shortest_path(
        modified_graph,
        source=start_node,
        target=dest_node,
        weight="length"
    )

    return path_to_coordinates(modified_graph, path)


def path_to_coordinates(G, path):
    coordinates = []

    for u, v in zip(path[:-1], path[1:]):
        edges = G.get_edge_data(u, v)

        edge = min(
            edges.values(),
            key=lambda data: data["length"]
        )

        if "geometry" in edge:
            points = list(edge["geometry"].coords)

            u_lon = G.nodes[u]["x"]
            u_lat = G.nodes[u]["y"]

            first_distance = (
                (points[0][0] - u_lon) ** 2
                + (points[0][1] - u_lat) ** 2
            )

            last_distance = (
                (points[-1][0] - u_lon) ** 2
                + (points[-1][1] - u_lat) ** 2
            )

            if last_distance < first_distance:
                points.reverse()
        else:
            points = [
                (G.nodes[u]["x"], G.nodes[u]["y"]),
                (G.nodes[v]["x"], G.nodes[v]["y"])
            ]

        for lon, lat in points:
            point = [lat, lon]

            if not coordinates or coordinates[-1] != point:
                coordinates.append(point)

    if len(path) == 1:
        node = path[0]
        coordinates.append([
            G.nodes[node]["y"],
            G.nodes[node]["x"]
        ])

    return coordinates


if __name__ == "__main__":
    G = load_road_network()

    start = [33.9806, -117.3755]
    destination = [33.9750, -117.3800]

    route = calculate_route(G, start, destination)

    print("Number of route points:", len(route))
    print("First five points:", route[:5])

