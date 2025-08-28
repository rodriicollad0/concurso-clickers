-- Script para configurar la base de datos quiz_system
-- Ejecutar este script una vez que PostgreSQL esté instalado

-- Crear la base de datos
CREATE DATABASE quiz_system;

-- Conectar a la base de datos quiz_system
\c quiz_system;

-- Verificar que estamos en la base de datos correcta
SELECT current_database();

-- El resto de las tablas se crearán automáticamente cuando se ejecute el backend
-- gracias a la opción synchronize: true en desarrollo
