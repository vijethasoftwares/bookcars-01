import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FormControl,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import env from '@/config/env.config'; // Make sure your API key is in env.config
import * as bookcarsTypes from ':bookcars-types';
import * as bookcarsHelper from ':bookcars-helper';
import { strings as commonStrings } from '@/lang/common';
import { strings } from '@/lang/search-form';
import '@/assets/css/search-form.css';

const MapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;




interface SearchFormProps {
  pickupLocation?: string;
  ranges?: bookcarsTypes.CarRange[];
  onCancel?: () => void;
}

const SearchFormagri = ({
  pickupLocation: __pickupLocation,
  ranges: __ranges,
  onCancel,
}: SearchFormProps) => {
  const navigate = useNavigate();

  const _minDate = new Date();
  _minDate.setDate(_minDate.getDate() + 1);

  const [pickupLocation, setPickupLocation] = useState('');
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<bookcarsTypes.Location | undefined>(undefined);
  const [minDate, setMinDate] = useState(_minDate);
  const [from, setFrom] = useState<Date>();
  const [ranges, setRanges] = useState(bookcarsHelper.getAllRanges());
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [address, setAddress] = useState(''); // Added state for address

  // Function to geocode latitude and longitude into address
  const geocodeLatLng = (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(lat, lng);

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        setAddress(results[0].formatted_address); // Set the address after geocoding
      } else {
        setAddress('Address not found');
      }
    });
  };

  useEffect(() => {
    setRanges(__ranges || bookcarsHelper.getAllRanges());
  }, [__ranges]);

  const handleOpenMap = () => {
    setIsMapOpen(true);
  };

  const handleCloseMap = () => {
    setIsMapOpen(false);
  };

  const handlePickupLocationChange = (locationName: string, lat: number, lng: number) => {
    const location: bookcarsTypes.Location = {
      _id: `id-${Date.now()}`, // Generate a unique ID for the location
      name: locationName,
      latitude: lat, // Add latitude
      longitude: lng, // Add longitude
    };

    setPickupLocation(locationName);
    setSelectedPickupLocation(location);
    setIsMapOpen(false);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationName = `Lat: ${latitude}, Lng: ${longitude}`;
          handlePickupLocationChange(locationName, latitude, longitude);
        },
        (error) => {
          console.error('Error fetching location:', error);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!pickupLocation || !from || !selectedPickupLocation) {
      return;
    }

    navigate('/search', {
      state: {
        pickupLocationId: selectedPickupLocation._id,
        from,
        ranges,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="home-search-form">
      <FormControl className="pickup-location">
        <Button
          variant="outlined"
          onClick={handleOpenMap}
          className="btn-pickup-location"
        >
          {pickupLocation || commonStrings.PICK_UP_LOCATION}
        </Button>
      </FormControl>

      <Dialog open={isMapOpen} onClose={handleCloseMap} fullWidth maxWidth="sm">
        <DialogTitle>{commonStrings.PICK_UP_LOCATION}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search location"
            margin="dense"
          />
          <div
            className="map-container"
            style={{ height: "400px", width: "100%" }}
          >
            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                center={mapCenter}
                zoom={12}
                mapContainerStyle={{ width: '100%', height: '400px' }}
                onClick={(e) => {
                  const latLng = e.latLng;
                  if (latLng) {
                    const lat = latLng.lat();
                    const lng = latLng.lng();
                    setMapCenter({ lat, lng });
                    geocodeLatLng(lat, lng); // Call geocode function
                  } else {
                    console.error('Failed to get lat/lng from the map click event');
                  }
                }}
              >
                <Marker position={mapCenter} />
              </GoogleMap>
            </LoadScript>
          </div>
          <Button
            variant="contained"
            onClick={handleGetCurrentLocation}
            className="btn-current-location"
          >
            Get Current Location
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMap} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() =>
              handlePickupLocationChange(
                "Selected Location Name",
                mapCenter.lat,
                mapCenter.lng
              )
            }
            variant="contained"
          >
            Select Location
          </Button>
        </DialogActions>
      </Dialog>

      <FormControl className="from">
        <TextField
          type="datetime-local"
          value={from?.toISOString().substring(0, 16) || ""}
          onChange={(e) => setFrom(new Date(e.target.value))}
          required
        />
      </FormControl>

      <Button type="submit" variant="contained" className="btn-search">
        {commonStrings.SEARCH}
      </Button>
      {onCancel && (
        <Button
          variant="outlined"
          color="inherit"
          className="btn-cancel"
          onClick={onCancel}
        >
          {commonStrings.CANCEL}
        </Button>
      )}

      {/* Display the selected address */}
      {address && (
        <div>
          <strong>Selected Address:</strong> {address}
        </div>
      )}
    </form>
  );
};

export default SearchFormagri;
