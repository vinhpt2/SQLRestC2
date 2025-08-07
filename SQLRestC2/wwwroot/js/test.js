window.onload = function () {
    require(["esri/identity/IdentityManager","esri/Map", "esri/views/MapView"], (esriId,Map, MapView) => {

        const map = new Map({
            basemap: "topo-vector"
        });

        const view = new MapView({
            container: "divMap", // reference to the div id
            map: map,
            zoom: 4,
            center: [15, 65]
        });

    });
}