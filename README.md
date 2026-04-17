# El Encuentro

Herramienta para coordinar asados y reuniones sociales eliminando la fricción logística: fechas, lugar, compras y gastos.

## Requisitos

- Node.js 18+
- npm

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Crear la base de datos y aplicar el schema
npx prisma db push

# 3. Poblar con datos del grupo de Juan (92 días sin asado)
npm run seed

# 4. Iniciar el servidor de desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Usuarios demo

Podés iniciar sesión con cualquiera de estos emails (sin contraseña):

| Email                        | Nombre      | Ciudad       | Restricciones |
|------------------------------|-------------|--------------|---------------|
| `juan@encuentro.app`         | Juan        | Berazategui  | —             |
| `mariano@encuentro.app`      | Mariano     | San Isidro   | —             |
| `nicolas.r@encuentro.app`    | Nicolás R.  | Recoleta     | Vegano        |
| `rafael@encuentro.app`       | Rafael      | Córdoba      | —             |
| `diego@encuentro.app`        | Diego       | Banfield     | —             |
| `blas@encuentro.app`         | Blas        | Villa Crespo | —             |
| `nicolas.f@encuentro.app`    | Nicolás F.  | La Plata     | —             |

## Flujo principal

1. **Dashboard** → trigger emocional "Han pasado N días desde tu último asado"
2. **Nuevo asado** → wizard 4 pasos: nombre/lugar → invitados → fechas → restricciones
3. **Votación de fechas** → accesible sin login en `/vote/[id]`
4. **Lista de compras** → generada automáticamente según el grupo (veganos, celíacos)
5. **Split de gastos** → registrá lo que gastó cada uno, la app calcula quién debe a quién

## Variables de entorno

El archivo `.env` ya está configurado para desarrollo local:

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="el-encuentro-secret-2025"
```

## Stack

- **Next.js 16** (App Router, params/searchParams como Promises)
- **Prisma 7** + SQLite via better-sqlite3 adapter
- **NextAuth v5** beta (Credentials provider — magic link demo)
- **Tailwind CSS v4** + shadcn/ui
- **date-fns v4** · **SWR** · **Zustand**
- Sistema de diseño "Thermal Memory" (#1D9E75 teal, fondo #12191A)

## Scripts

```bash
npm run dev          # Desarrollo en localhost:3000
npm run build        # Build de producción
npm run seed         # Re-poblar la base de datos
npx prisma studio    # GUI para explorar la BD
```
