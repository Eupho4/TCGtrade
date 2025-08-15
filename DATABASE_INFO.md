# 📊 Información de la Base de Datos - TCGtrade

## 🔥 Firebase Firestore - Estructura de Datos

### **Colección: `users`**
Cada usuario tiene un documento con su UID como ID del documento.

#### **Estructura del documento de usuario:**
```json
{
  "username": "usuario123",           // Nombre de usuario único (solo lectura)
  "email": "usuario@email.com",       // Email del usuario
  "name": "Juan",                     // Nombre real
  "lastName": "Pérez",                // Apellidos
  "address": "Calle Principal 123",   // Dirección (opcional)
  "birthDate": "1990-01-01",          // Fecha de nacimiento (opcional)
  "createdAt": "2024-01-01T00:00:00Z", // Fecha de creación
  "updatedAt": "2024-01-01T00:00:00Z"  // Fecha de última actualización
}
```

### **Colección: `userCards`** (futuro)
Para las cartas de cada usuario:
```json
{
  "userId": "uid_del_usuario",
  "cardId": "id_de_la_carta",
  "quantity": 2,
  "condition": "mint",
  "addedAt": "2024-01-01T00:00:00Z"
}
```

## 🔐 Firebase Authentication

### **Datos de autenticación:**
- **Email/Password**: Credenciales de acceso
- **UID**: Identificador único del usuario
- **Display Name**: Nombre mostrado (opcional)
- **Metadata**: Fechas de creación, último login, etc.

## 🛠️ Cómo Diagnosticar Problemas

### **1. Problema con guardar datos del perfil:**

**Pasos para diagnosticar:**
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Intenta guardar datos del perfil
4. Busca mensajes que empiecen con `🔧` o `❌`

**Posibles causas:**
- Usuario no autenticado
- Error de conexión con Firebase
- Permisos de Firestore incorrectos
- Datos de formulario inválidos

### **2. Problema con cambiar contraseña:**

**Pasos para diagnosticar:**
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Intenta cambiar la contraseña
4. Busca mensajes de error específicos

**Posibles causas:**
- Contraseña actual incorrecta
- Nueva contraseña muy débil
- Usuario requiere reautenticación
- Error de conexión con Firebase Auth

### **3. Verificar configuración de Firebase:**

**En la consola del navegador:**
```javascript
// Verificar si Firebase está configurado
console.log('Firebase config:', firebaseConfig);

// Verificar si el usuario está conectado
console.log('Usuario actual:', currentUser);

// Verificar conexión con Firestore
console.log('Firestore instance:', db);
```

## 🔧 Soluciones Comunes

### **Error: "Debes iniciar sesión"**
- Cierra sesión y vuelve a iniciar
- Verifica que el usuario esté autenticado

### **Error: "Contraseña actual incorrecta"**
- Asegúrate de escribir la contraseña correcta
- Si no recuerdas, usa "Olvidé mi contraseña"

### **Error: "Requiere reautenticación"**
- Cierra sesión y vuelve a iniciar
- Firebase requiere reautenticación por seguridad

### **Error: "Permisos denegados"**
- Verificar reglas de Firestore
- Contactar al administrador

## 📍 Dónde Ver los Datos

### **Firebase Console:**
1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Selecciona tu proyecto `tcgtrade-7ba27`
3. Ve a "Firestore Database" para ver los datos
4. Ve a "Authentication" para ver usuarios

### **Estructura en Firestore:**
```
tcgtrade-7ba27/
├── users/
│   ├── [uid_usuario_1]/
│   │   ├── username: "usuario1"
│   │   ├── email: "usuario1@email.com"
│   │   ├── name: "Juan"
│   │   └── ...
│   └── [uid_usuario_2]/
│       ├── username: "usuario2"
│       └── ...
└── (futuras colecciones)
```

## 🚀 Próximos Pasos

1. **Diagnosticar problemas** usando la consola del navegador
2. **Verificar datos** en Firebase Console
3. **Implementar más funcionalidades** según sea necesario
4. **Añadir validaciones** adicionales si es necesario