# 🚀 PASOS EXACTOS PARA RODRIGO (@rodriicollad0)

## 📋 Lista de verificación:

### ✅ Ya hecho:
- [x] Proyecto creado y configurado
- [x] Git inicializado 
- [x] Commit inicial hecho
- [x] Remote de GitHub configurado
- [x] Archivos de configuración para Render listos

### 🔄 Lo que tienes que hacer AHORA:

## 1. 📂 Crear repositorio en GitHub
1. Ve a [github.com](https://github.com)
2. Haz clic en "New repository" (botón verde)
3. Nombre: `peluqueria-app`
4. Descripción: `Sistema de reservas para peluquería con Web Serial API`
5. ✅ Public
6. ❌ NO marques "Add a README file" (ya tenemos uno)
7. ❌ NO marques ".gitignore" (ya tenemos uno)
8. Haz clic en "Create repository"

## 2. 🚀 Subir código
Ejecuta en PowerShell desde tu carpeta del proyecto:

```powershell
cd "c:\Users\rodri\OneDrive - Universidad de Castilla-La Mancha\Escritorio\Peluquería"
git push -u origin main
```

## 3. 🌐 Desplegar en Render
1. Ve a [render.com](https://render.com)
2. "Sign up" → "Continue with GitHub"
3. Autoriza a Render acceso a tus repos
4. En dashboard: "New +" → "Static Site"
5. Busca "peluqueria-app" → "Connect"
6. Configuración automática:
   - Name: `peluqueria-app`
   - Branch: `main`
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `dist`
7. "Create Static Site"
8. ¡Espera 2-3 minutos!

## 4. ✅ ¡Tu app estará live!
URL final será algo como:
```
https://peluqueria-app-xyz123.onrender.com
```

## 🔧 Verificación final:
- Chrome Desktop: ✅ Web Serial API funcional
- Chrome Android 12+: ⚠️ Funcional con flags
- Otros navegadores: ✅ Solo reservas (sin serial)

---

## 🆘 Si algo falla:

**Error en git push:**
```bash
git config --global user.email "tu-email@gmail.com"
git config --global user.name "rodriicollad0"
```

**Error en Render:**
- Verifica que el repo sea público
- Comprueba que se detecte `package.json`

---

¡Tu app de peluquería estará online en menos de 10 minutos! 🎉
