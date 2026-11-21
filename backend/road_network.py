import osmnx as ox

def load_road_network():
    G = ox.graph_from_place("Riverside, California, USA", network_type="drive")

print(type(G))
print(G.number_of_nodes())
print(G.number_of_edges())