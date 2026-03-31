mapboxgl.accessToken = 'pk.eyJ1IjoicGVkcm90YXAiLCJhIjoiY21uZGRnNnA1MWY2NDJxb243aHBtODd1dSJ9.IKw80JiSo-v4NJD8ZD_WNA';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/pedrotap/cmndew1aq000z01qq3u62ez82',
    center: [-99.462646, 19.215576],
    zoom: 18,
    pitch: 60,
    bearing: -20,
    antialias: true
});
new mapboxgl.Marker()
  .setLngLat([-99.462646, 19.215576])
  .addTo(map);

const modelOrigin = [-99.462646, 19.215576];
const modelAltitude = 0;
const modelRotate = [Math.PI / 2, 0, 0];

const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
    modelOrigin,
    modelAltitude
);

const modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
};

map.on('style.load', () => {

    const customLayer = {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',

        onAdd: function (map, gl) {
            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();

            const light = new THREE.DirectionalLight(0xffffff);
            light.position.set(0, -70, 100).normalize();
            this.scene.add(light);

            const loader = new THREE.GLTFLoader();

            loader.load('EO.glb', (gltf) => {
                this.scene.add(gltf.scene);
            });

            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true
            });

            this.renderer.autoClear = false;
        },

        render: function (gl, matrix) {

            const rotationX = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(1, 0, 0),
                modelTransform.rotateX
            );

            const rotationY = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 1, 0),
                modelTransform.rotateY
            );

            const rotationZ = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 0, 1),
                modelTransform.rotateZ
            );

            const m = new THREE.Matrix4().fromArray(matrix);

            const l = new THREE.Matrix4()
                .makeTranslation(
                    modelTransform.translateX,
                    modelTransform.translateY,
                    modelTransform.translateZ
                )
                .scale(
                    new THREE.Vector3(
                        modelTransform.scale,
                        -modelTransform.scale,
                        modelTransform.scale
                    )
                )
                .multiply(rotationX)
                .multiply(rotationY)
                .multiply(rotationZ);

            this.camera.projectionMatrix = m.multiply(l);

            this.renderer.resetState();
            this.renderer.render(this.scene, this.camera);
            map.triggerRepaint();
        }
    };

    map.addLayer(customLayer);

});
