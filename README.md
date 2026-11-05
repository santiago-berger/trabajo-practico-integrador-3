## Trabajo Práctico Integrador III

### Materia: Taller de Programación II

### Profesores: Centurión Agustín, Britos Diego, Franco Marcos

### Alumno: Berger Santiago Christian

API REST para gestionar usuarios, eventos y categorías con Node.js, Express, MongoDB y Mongoose.

## Tecnologías
- Express, Mongoose (ODM), MongoDB
- JWT en cookie httpOnly, bcrypt
- express-validator (validationResult y matchedData)
- ESModules

Variables: PORT, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN.

## Modelos y relaciones
- **User**: profile embebido (1:1), deletedAt (eliminación lógica), virtual populate events.
- **Event**: location embebido (1:1), organizer -> User (1:N), categories -> Category (N:M).
- **Category**: virtual populate events.

Eliminación en cascada:
- Al eliminar lógicamente un usuario se eliminan sus eventos.
- Al eliminar una categoría se quita de todos los eventos que la referencian.

## Endpoints
- Auth: POST /api/auth/register, POST /api/auth/login, GET/PUT /api/auth/profile, POST /api/auth/logout
- Users (admin): GET /api/users, GET/PUT/DELETE /api/users/:id
- Events: POST/GET /api/events, GET /api/events/my, GET/PUT/DELETE /api/events/:id (PUT/DELETE: organizador o admin)
- Categories: GET /api/categories, GET /api/categories/:id (autenticado); POST, PUT, DELETE (admin)

## Primer admin
Todos se registran con rol user. Para el primer admin:
```js
db.users.updateOne({ username: "admin1" }, { $set: { role: "admin" } })
```
