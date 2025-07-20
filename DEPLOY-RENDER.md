# 🚀 Instrucciones de Despliegue en Render

## Pasos para desplegar tu app en Render.com:

### 1. 📂 Subir a GitHub
Primero necesitas subir tu código a GitHub:

```bash
# Ya hemos hecho git init, add y commit
# Ahora conecta con tu repositorio de GitHub:

git remote add origin https://github.com/rodriicollad0/peluqueria-app.git
git push -u origin main
```

### 2. 🌐 Crear cuenta en Render
1. Ve a [render.com](https://render.com)
2. Haz clic en "Get Started for Free"
3. Conéctate con tu cuenta de GitHub (@rodriicollad0)

### 3. 🔗 Conectar repositorio
1. En el dashboard, haz clic en "New +"
2. Selecciona "Static Site"
3. Conecta tu repositorio de GitHub
4. Selecciona el repo "peluqueria-app"

### 4. ⚙️ Configuración automática
Render detectará automáticamente:
- ✅ Build Command: `npm ci && npm run build`
- ✅ Publish Directory: `dist`
- ✅ Headers para Web Serial API
- ✅ Redirects para SPA

### 5. 🚀 Deploy
1. Haz clic en "Create Static Site"
2. Espera 2-3 minutos
3. ¡Tu app estará live!

### 6. 🔗 URL final
Tu app estará disponible en:
```
https://peluqueria-app-XXXX.onrender.com
```

## 🔧 Características incluidas:

- ✅ **HTTPS automático**
- ✅ **Headers para Web Serial API**
- ✅ **Deploy automático** en cada push
- ✅ **CDN global** (rápido en todo el mundo)
- ✅ **100% gratis** (para static sites)

## 📱 Funcionalidad:

- **Chrome Desktop:** ✅ 100% funcional
- **Chrome Android 12+:** ⚠️ Funcional con flags
- **Otros navegadores:** ✅ Funcional (sin Web Serial)

## 🔄 Actualizaciones:

Cada vez que hagas `git push`, Render automáticamente:
1. Detecta los cambios
2. Ejecuta `npm run build`
3. Despliega la nueva versión
4. ¡En 2-3 minutos está live!

## 🆘 Problemas comunes:

**Error en build:** 
- Verifica que `npm run build` funcione localmente

**Headers no funcionan:**
- El archivo `render.yaml` ya está configurado

**404 en refresh:**
- El archivo `_redirects` ya está configurado

---

¡Tu app está lista para el mundo! 🌎
