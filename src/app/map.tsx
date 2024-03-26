'use client';
import * as React from 'react';
import Map, { MapRef, Marker, FullscreenControl, ScaleControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSearchParams } from 'next/navigation';
import { FaMapMarkerAlt } from "react-icons/fa";

type Location = {
  name: string;
  latitude: number;
  longitude: number;
};

function MapComponent() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search');
  const [locations, setLocation] = React.useState<Location[]>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setError] = React.useState(false);
  const mapRef = React.useRef<MapRef>(null);

  const flyTo = (coordinates: [number, number]): void => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.flyTo({
      center: coordinates,
      essential: true,
      zoom: 14,
    });
  };

  React.useEffect(() => {
    if (!search) {
      setIsLoading(false);
      return;
    }

    async function fetchCoordinate() {
      setIsLoading(true);
      const res = await fetch(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${search}&returnGeom=Y&getAddrDetails=Y&pageNum=1`);
      const data = await res.json();
      if (!data || !data.results || data.results.length == 0) {
        setError(true);
      }

      const markers = data.results.map((result: any) => {
        return {
          name: result.ADDRESS,
          latitude: result.LATITUDE,
          longitude: result.LONGITUDE,
        }
      })
       


      setLocation(markers);
      setIsLoading(false);
    }
    fetchCoordinate();
  }, [search]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!search) {
    return <div>Please provide a search parameter.</div>;
  }

  if (isError) {
    return <div>Use proper params</div>
  }

  return (
    <Map
    maxBounds={[103.596, 1.1443, 104.1, 1.4835]}
      ref={mapRef}
      mapStyle="https://www.onemap.gov.sg/maps/json/raster/mbstyle/Default.json"
    >
      {locations?.map((location) => {
        return (
        <Marker
          key={location?.name}
          latitude={location?.latitude as number}
          longitude={location?.longitude as number}
          offset={[0, -50]}
        >
          <div style={{ position: 'relative', textAlign: 'center' }}>
            {/* <div className='bg-white p-2 rounded-md' style={{ position: 'absolute', top: '-56px', left: '-135%', minWidth: '201px', height: '50px' }}>
              {location?.name}
            </div> */}
            <FaMapMarkerAlt
              size={50}
              title={location?.name}
              className='mx-auto'
              style={{ position: 'relative' }}
            />
          </div>
        </Marker>
        )


      })}

      <FullscreenControl />
      <ScaleControl />
    </Map>
  );
}


export default function MapComponentWithSuspense() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <MapComponent />
    </React.Suspense>
  );
}

