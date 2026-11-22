import { useState } from "react";
import {
  Map,
  MapPin,
  Navigation,
  RotateCcw,
  ShieldAlert,
  Route,
  AlertTriangle,
  CheckCircle2,
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

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function App() {
  const [start, setStart] = useState<Coordinates | null>(null);
  const [blockedSegment, setBlockedSegment] = useState<Coordinates[]>([]);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<Coordinates[]>([]);
  const [alternativeRoute, setAlternativeRoute] = useState<Coordinates[]>([]);
  const [hazard, setHazard] = useState<Coordinates | null>(null);
  const [hazardMode, setHazardMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectPoint(point: Coordinates) {
    setError(null);

    if (hazardMode) {
      setHazard(point);
      setAlternativeRoute([]);
      setBlockedSegment([]);
      setHazardMode(false);
      return;
    }

    setRoute([]);
    setAlternativeRoute([]);
    setBlockedSegment([]);
    setHazard(null);

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
    setHazard(null);
    setBlockedSegment([]);
    setHazardMode(false);
    setError(null);
  }

  async function findRoute() {
    if (!start || !destination) return;

    setLoading(true);
    setError(null);
    setHazard(null);
    setHazardMode(false);
    setAlternativeRoute([]);
    setBlockedSegment([]);

    try {
      const response = await fetch(`${API_URL}/route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start,
          destination,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to calculate route.");
      }

      const data = await response.json();

      console.log("API response:", data);
      console.log("Route length:", data.route?.length);

      setRoute(data.route ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the routing backend."
      );
    } finally {
      setLoading(false);
    }
  }

  
  async function findAlternativeRoute() {
    if (!start || !destination || !hazard) return;

    setLoading(true);
    setError(null);
    setAlternativeRoute([]);
    setBlockedSegment([]);

    try {
      const response = await fetch(
        `${API_URL}/route/alternative`,
        {
          method: "POST",
          headers: {
           "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start,
            destination,
            blocked_location: hazard,
         }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail ?? "Unable to calculate alternative route."
        );
      }

      const data = await response.json();

      setAlternativeRoute(data.alternative_route);
      setBlockedSegment(data.blocked_segment ?? []);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Alternative routing failed."
      );
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

          <div className="flex items-center gap-3 rounded-lg border border-slate-700 p-3 text-slate-300">
            <AlertTriangle size={19} />
            <span>Hazard-Aware Routing</span>
          </div>
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
                Select your starting point and destination on the map.
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

              {route.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Hazard Reporting
                  </div>

                  <Button
                    variant={hazardMode ? "default" : "outline"}
                    className="w-full"
                    disabled={loading}
                    onClick={() => {
                      setHazardMode(!hazardMode);
                      setError(null);
                    }}
                  >
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    {hazardMode
                      ? "Cancel Hazard Selection"
                      : "Report Road Hazard"}
                  </Button>

                  {hazardMode && (
                    <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                      Click a road on the blue route to mark a hazard.
                    </p>
                  )}

                  {hazard && (
                    <>
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-sm font-semibold text-red-800">
                          Hazard Location Selected
                        </p>
                        <p className="mt-1 text-xs text-red-700">
                          {formatPoint(hazard)}
                        </p>
                      </div>

                      <Button
                        className="w-full bg-teal-700 hover:bg-teal-800"
                        disabled={loading}
                        onClick={findAlternativeRoute}
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        {loading
                          ? "Calculating Detour..."
                          : "Calculate Safe Route"}
                      </Button>
                    </>
                  )}
                </div>
              )}

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
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="flex items-center gap-2 font-semibold text-blue-800">
                    <CheckCircle2 className="h-4 w-4" />
                    Original Route Found
                  </p>
                </div>
              )}

              {alternativeRoute.length > 0 && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="flex items-center gap-2 font-semibold text-green-800">
                    <CheckCircle2 className="h-4 w-4" />
                    Alternative Route Found
                  </p>
                  <p className="mt-1 text-xs text-green-700">
                    Detour calculated around the selected directed road edge.
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
                hazard={hazard}
                blockedSegment={blockedSegment}
                hazardMode={hazardMode}
                onSelect={selectPoint}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
