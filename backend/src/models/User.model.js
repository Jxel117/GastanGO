
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
