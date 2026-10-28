class AssetManager {
  // Inicializa el registro de imágenes cargadas.
  constructor() {
    this.images = {};
  }

  // Carga un objeto con pares { nombre: ruta } y rechaza la promesa si falla algún recurso.
  loadImages(sources) {
    const promises = [];

    for (const [key, src] of Object.entries(sources)) {
      promises.push(
        new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            this.images[key] = img;
            resolve(img);
          };
          img.onerror = () => reject(`Error al cargar la imagen: ${src}`);
        })
      );
    }

    return Promise.all(promises);
  }

  // Devuelve la imagen cargada por su clave.
  getImage(key) {
    return this.images[key];
  }
}