// ============================================================
//  CONFIGURACIÓN DE FIREBASE  (este es el ÚNICO archivo que hay que completar)
//  Firebase Console > Configuración del proyecto (engranaje) > Tus apps > Web (</>)
//  Copiá los valores de "firebaseConfig" y pegalos acá abajo, reemplazando los TU_...
// ============================================================
export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// ============================================================
//  IMÁGENES
//  Opción 1 (gratis, sin tarjeta): carpeta "imagenes/" de tu repositorio de GitHub.
//     Subís las fotos a esa carpeta y el panel te las muestra para elegirlas.
//     Completá GITHUB_REPO con "usuario/repositorio" (el repositorio tiene que ser público).
//  Opción 2: Firebase Storage (subís las fotos desde el panel; Google exige plan Blaze = tarjeta).
//     Cambiá USAR_STORAGE a true solo si activaste Storage.
// ============================================================
export const imagenes = {
  GITHUB_REPO: "",        // ej: "saanty086-netizen/elemental"
  GITHUB_RAMA: "main",
  CARPETA: "imagenes",    // carpeta del sitio donde van las fotos
  USAR_STORAGE: false
};

export const configurado = !/TU_/.test(firebaseConfig.apiKey + firebaseConfig.projectId);
