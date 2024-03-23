'use client';
import * as React from 'react';
import Map, { MapRef, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSearchParams } from 'next/navigation';
import { FaMapMarkerAlt } from "react-icons/fa";

type Location = {
 name: string;
 latitude: number;
 longitude: number;
};

export default function MapComponent() {
 const searchParams = useSearchParams();
 const search = searchParams.get('search');
 const [location, setLocation] = React.useState<Location>();
 const [isLoading, setIsLoading] = React.useState(true);
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
      setLocation({
        name: data?.results[0]?.ADDRESS,
        latitude: data?.results[0]?.LATITUDE,
        longitude: data?.results[0]?.LONGITUDE,
      });
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

 return (
    <Map
      ref={mapRef}
      initialViewState={{
        latitude:location?.latitude,
        longitude:location?.longitude,
        zoom:13
      }}
      mapStyle="https://www.onemap.gov.sg/maps/json/raster/mbstyle/Default.json"
    >
      <Marker
        key={location?.name}
        latitude={location?.latitude as number}
        longitude={location?.longitude as number}
      >
        <div className='bg-white text-center p-2 rounded-md'>
          {location?.name}
        </div>
        <FaMapMarkerAlt
          size={50}
          title={location?.name}
          className='mx-auto'
        />
      </Marker>
    </Map>
 );
}
