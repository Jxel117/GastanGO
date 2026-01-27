
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

// --- IMPLEMENTACIÓN DETALLADA ---
// Este archivo define el modelo 'User' que representa la tabla de usuarios en la base de datos.
// Usamos los hooks de Sequelize ('beforeCreate') para ejecutar lógica automáticamente antes de
// que un registro sea creado. Aquí, lo usamos para hashear la contraseña de forma segura.

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    // Método de instancia para comparar contraseñas
    async comparePassword(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Nombre completo del usuario',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Número de teléfono del usuario',
    },
    currency: {
      type: DataTypes.ENUM('USD', 'EUR', 'ARS', 'MXN'),
      defaultValue: 'USD',
      comment: 'Moneda preferida del usuario',
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL o ruta de la foto de perfil del usuario',
    },
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true, // Añade createdAt y updatedAt automáticamente
    hooks: {
      // Hook que se ejecuta antes de crear un nuevo usuario
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Podríamos añadir un hook beforeUpdate si permitimos cambiar la contraseña
    },
  });

  return User;
};
