# Tu Medicación

Aplicación web para ayudar a usuarios mayores a organizar su medicación, consultar tomas y revisar información oficial de medicamentos.

## Estado del proyecto

- Frontend estático publicado en Firebase Hosting.
- Base de datos en Firestore.
- Storage para fotos de perfil y documentos/imágenes.
- Cloud Functions para OCR con Document AI, aprobación de usuarios y correos.
- Panel de administración separado en `admin.html`.

## Estructura principal

- `index.html`: app pública y zona de usuario.
- `admin.html`: acceso y panel de administración.
- `app.js`: lógica principal de usuario.
- `admin-app.js`: lógica del panel de administración.
- `functions/`: Cloud Functions de Firebase.
- `firebase.json`: configuración de Hosting, Functions, Firestore y Storage.
- `firestore.rules`: reglas de Firestore.
- `storage.rules`: reglas de Storage.
- `firebase-config.example.js`: plantilla de configuración web de Firebase.

## Archivos que no se suben a GitHub

No se debe subir:

- `firebase-config.js`: configuración real local del proyecto.
- `functions/node_modules/`
- `.firebase/`
- `.env` o cualquier archivo de secretos.
- JSON de cuentas de servicio.

El repositorio incluye `.gitignore` para evitarlo.

## Configuración local

1. Clona el repositorio.
2. Copia `firebase-config.example.js` como `firebase-config.js`.
3. Rellena `firebase-config.js` con la configuración web de tu proyecto Firebase.
4. Instala dependencias de Functions:

```bash
cd functions
npm install
```

5. Sirve la carpeta raíz con un servidor local, por ejemplo:

```bash
python -m http.server 8000
```

6. Abre `http://localhost:8000`.

## Despliegue Firebase

```bash
firebase deploy --project mi-medicacion-senior-lopez
```

Para sólo Hosting:

```bash
firebase deploy --only hosting --project mi-medicacion-senior-lopez
```

## Secretos de Cloud Functions

Los secretos de Gmail OAuth no están escritos en el código. Se configuran en Firebase como secretos:

- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`

Ejemplo:

```bash
firebase functions:secrets:set GMAIL_CLIENT_ID --project mi-medicacion-senior-lopez
firebase functions:secrets:set GMAIL_CLIENT_SECRET --project mi-medicacion-senior-lopez
firebase functions:secrets:set GMAIL_REFRESH_TOKEN --project mi-medicacion-senior-lopez
```

## Antes de comercializar

Pendiente de revisión profesional:

- RGPD/LOPDGDD.
- Evaluación de si aplica normativa de producto sanitario.
- Política de privacidad y consentimiento sanitario.
- Accesibilidad WCAG.
- Auditoría de seguridad.
- Revisión clínica del lenguaje.

La app debe presentarse como ayuda organizativa, no como sustituto de criterio médico.
