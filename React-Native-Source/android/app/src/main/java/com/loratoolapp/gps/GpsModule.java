package com.loratoolapp.gps;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

public class GpsModule extends ReactContextBaseJavaModule {
    private static final String TAG = "GpsModule";
    private static final long TIMEOUT_MS = 15000; // 15 seconds timeout
    
    private LocationManager locationManager;
    private Handler timeoutHandler;

    public GpsModule(ReactApplicationContext reactContext) {
        super(reactContext);
        locationManager = (LocationManager) reactContext.getSystemService(Context.LOCATION_SERVICE);
        timeoutHandler = new Handler(Looper.getMainLooper());
    }

    @NonNull
    @Override
    public String getName() {
        return "GpsModule";
    }

    @ReactMethod
    public void getCurrentLocation(final Promise promise) {
        Log.d(TAG, "getCurrentLocation called");
        
        if (locationManager == null) {
            Log.e(TAG, "LocationManager is null");
            promise.reject("ERROR", "LocationManager not available");
            return;
        }

        // Check permission
        boolean hasFine = ContextCompat.checkSelfPermission(getReactApplicationContext(), 
            Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean hasCoarse = ContextCompat.checkSelfPermission(getReactApplicationContext(), 
            Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        
        Log.d(TAG, "Permissions - FINE: " + hasFine + ", COARSE: " + hasCoarse);
        
        if (!hasFine && !hasCoarse) {
            Log.e(TAG, "No location permission");
            promise.reject("PERMISSION", "Location permission not granted");
            return;
        }

        try {
            // First try to get last known location (fastest)
            Location lastLocation = getLastKnownLocation();
            if (lastLocation != null) {
                Log.d(TAG, "Returning last known location");
                promise.resolve(locationToMap(lastLocation));
                return;
            }
            
            // Request fresh location
            requestFreshLocation(promise);
            
        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException: " + e.getMessage());
            promise.reject("PERMISSION", e.getMessage());
        } catch (Exception e) {
            Log.e(TAG, "Exception: " + e.getMessage());
            promise.reject("ERROR", e.getMessage());
        }
    }

    private Location getLastKnownLocation() {
        Location bestLocation = null;
        
        try {
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                Location gpsLoc = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                if (gpsLoc != null) {
                    Log.d(TAG, "Last GPS location: " + gpsLoc.getLatitude() + ", " + gpsLoc.getLongitude());
                    bestLocation = gpsLoc;
                }
            }
        } catch (SecurityException e) {
            Log.w(TAG, "Cannot get last GPS location: " + e.getMessage());
        }
        
        try {
            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                Location networkLoc = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                if (networkLoc != null) {
                    Log.d(TAG, "Last Network location: " + networkLoc.getLatitude() + ", " + networkLoc.getLongitude());
                    // Use network location if GPS is older or not available
                    if (bestLocation == null || networkLoc.getTime() > bestLocation.getTime()) {
                        bestLocation = networkLoc;
                    }
                }
            }
        } catch (SecurityException e) {
            Log.w(TAG, "Cannot get last Network location: " + e.getMessage());
        }
        
        // Check if location is fresh enough (within 5 minutes)
        if (bestLocation != null) {
            long age = System.currentTimeMillis() - bestLocation.getTime();
            if (age > 300000) { // 5 minutes
                Log.d(TAG, "Last location is too old: " + age + "ms");
                return null;
            }
        }
        
        return bestLocation;
    }

    @SuppressLint("MissingPermission")
    private void requestFreshLocation(final Promise promise) {
        Log.d(TAG, "Requesting fresh location");
        
        final boolean[] resolved = {false};
        final LocationListener[] listenerHolder = {null};
        
        final Runnable timeoutRunnable = new Runnable() {
            @Override
            public void run() {
                if (!resolved[0]) {
                    resolved[0] = true;
                    Log.w(TAG, "Location request timeout");
                    if (listenerHolder[0] != null) {
                        try {
                            locationManager.removeUpdates(listenerHolder[0]);
                        } catch (Exception ignored) {}
                    }
                    promise.reject("TIMEOUT", "Location request timed out after " + TIMEOUT_MS + "ms");
                }
            }
        };
        
        // Start timeout
        timeoutHandler.postDelayed(timeoutRunnable, TIMEOUT_MS);
        
        LocationListener listener = new LocationListener() {
            @Override
            public void onLocationChanged(@NonNull Location location) {
                if (!resolved[0]) {
                    resolved[0] = true;
                    timeoutHandler.removeCallbacks(timeoutRunnable);
                    
                    Log.d(TAG, "Got fresh location: " + location.getLatitude() + ", " + location.getLongitude());
                    
                    try {
                        locationManager.removeUpdates(this);
                    } catch (Exception ignored) {}
                    
                    promise.resolve(locationToMap(location));
                }
            }
            
            @Override
            public void onProviderEnabled(@NonNull String provider) {
                Log.d(TAG, "Provider enabled: " + provider);
            }
            
            @Override
            public void onProviderDisabled(@NonNull String provider) {
                Log.d(TAG, "Provider disabled: " + provider);
                if (!resolved[0]) {
                    resolved[0] = true;
                    timeoutHandler.removeCallbacks(timeoutRunnable);
                    
                    try {
                        locationManager.removeUpdates(this);
                    } catch (Exception ignored) {}
                    
                    promise.reject("PROVIDER_DISABLED", "Provider " + provider + " was disabled");
                }
            }
        };
        
        listenerHolder[0] = listener;
        
        Looper looper = Looper.getMainLooper();
        boolean requested = false;
        
        // Request from Network provider first (faster)
        if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
            try {
                Log.d(TAG, "Requesting Network updates");
                locationManager.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER,
                    0, 0, listener, looper
                );
                requested = true;
            } catch (SecurityException e) {
                Log.w(TAG, "Cannot request Network updates: " + e.getMessage());
            }
        }
        
        // Also request from GPS
        if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
            try {
                Log.d(TAG, "Requesting GPS updates");
                locationManager.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    0, 0, listener, looper
                );
                requested = true;
            } catch (SecurityException e) {
                Log.w(TAG, "Cannot request GPS updates: " + e.getMessage());
            }
        }
        
        if (!requested) {
            resolved[0] = true;
            timeoutHandler.removeCallbacks(timeoutRunnable);
            Log.e(TAG, "No provider available");
            promise.reject("NO_PROVIDER", "No location provider available");
        }
    }

    private WritableMap locationToMap(Location location) {
        WritableMap map = Arguments.createMap();
        map.putDouble("latitude", location.getLatitude());
        map.putDouble("longitude", location.getLongitude());
        map.putDouble("accuracy", location.hasAccuracy() ? location.getAccuracy() : 0);
        map.putDouble("timestamp", location.getTime());
        map.putString("provider", location.getProvider() != null ? location.getProvider() : "unknown");
        
        if (location.hasAltitude()) {
            map.putDouble("altitude", location.getAltitude());
        }
        if (location.hasSpeed()) {
            map.putDouble("speed", location.getSpeed());
        }
        
        return map;
    }
}
