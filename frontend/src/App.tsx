import { useState } from "react";
import {
  Map,
  MapPin,
  Navigation,
  RotateCcw,
  ShieldAlert,
  Route,
} from "lucide-react";

import MapView from "@/components/MapView";
import type { Coordinates } from "@/components/MapView";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function App() {
  const [start, setStart] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<Coordinates[]>([]);
  const [alternativeRoute, setAlternativeRoute] = useState<Coordinates[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectPoint(point: Coordinates) {
    setRoute([]);
    setAlternativeRoute([]);
    setError(null);

    if (!start || destination) {
      setStart(point);
      setDestination(null);
    } else {
      setDestination(point);
    }
  }

  function reset() {
    setStart(null);
    setDestination(null);
    setRoute([]);
    setAlternativeRoute([]);
    setError(null);
  }

  async function findRoute() {
    if (!start || !destination) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/route`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            start,
            destination,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to calculate route");
      }

      const data = await response.json();
      setRoute(data.route);
      setAlternativeRoute(data.alternative_route ?? []);
    } catch {
      setError("Could not connect to the routing backend.");
    } finally {
      setLoading(false);
    }
  }

  function formatPoint(point: Coordinates | null) {
    if (!point) return "Click on the map to select";
    return `${point[0].toFixed(5)}, ${point[1].toFixed(5)}`;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <aside className="w-full bg-slate-950 p-6 text-white lg:w-64">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-9 w-9 text-teal-400" />
          <div>
            <h1 className="text-xl font-bold">RescueRoute AI</h1>
            <p className="text-xs text-slate-400">
              Emergency Routing Prototype
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-teal-700 p-3">
            <Map size={19} />
            <span>Route Planner</span>
          </div>
          <p className="px-3 text-sm text-slate-400">
            Hazard reporting and incident management coming next.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-slate-700 p-4 text-sm text-slate-300">
          <ShieldAlert className="mb-2 text-red-400" />
          Demonstration only. Follow official emergency guidance.
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col gap-5 p-4 lg:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Emergency Route Planner
            </h2>
            <p className="text-sm text-slate-500">
              Riverside, California
            </p>
          </div>
          <Badge variant="secondary">Prototype Mode</Badge>
        </header>

        <div className="grid flex-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5 text-teal-700" />
                Plan Your Route
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Click on the map to select your starting point,
                then click again to select your destination.
              </p>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-green-600" />
                  Starting Point
                </div>
                <div className="rounded-lg border p-3 text-sm">
                  {formatPoint(start)}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-red-600" />
                  Destination
                </div>
                <div className="rounded-lg border p-3 text-sm">
                  {formatPoint(destination)}
                </div>
              </div>

              <Button
                className="w-full"
                disabled={!start || !destination || loading}
                onClick={findRoute}
              >
                <Navigation className="mr-2 h-4 w-4" />
                {loading ? "Calculating..." : "Find Route"}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={reset}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Selection
              </Button>

              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}

              {route.length > 0 && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="font-semibold text-green-800">
                    Route calculated
                  </p>
                  <p className="mt-1 text-sm text-green-700">
                    Route displayed on the map.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0 overflow-hidden">
            <CardContent className="h-[65vh] min-h-[450px] p-2 lg:h-[calc(100vh-150px)]">
              <MapView
                start={start}
                destination={destination}
                route={route}
                alternativeRoute={alternativeRoute}
                onSelect={selectPoint}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

