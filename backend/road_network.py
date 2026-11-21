import osmnx as ox
from pathlib import Path

GRAPH_PATH = Path(__file__).resolve().parent / "riverside.graphml"


def load_road_network():
    if GRAPH_PATH.exists():
        print("Loading cached road network...")
        G = ox.load_graphml(GRAPH_PATH)
    else:
        print("Downloading Riverside road network...")

        G = ox.graph_from_place(
            "Riverside, California, USA",
            network_type="drive"
        )

        ox.save_graphml(G, GRAPH_PATH)
        print("Road network saved successfully.")

    print("Nodes:", G.number_of_nodes())
    print("Edges:", G.number_of_edges())

    return G


if __name__ == "__main__":
    load_road_network()
