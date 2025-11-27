import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';
import { IAdminAttributes, IAdminCreationAttributes } from '../types/models';

interface AdminInstance extends Model<IAdminAttributes, IAdminCreationAttributes>, IAdminAttributes {
  validatePassword(password: string): Promise<boolean>;
}

const Admin = sequelize.define<AdminInstance>('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 50]
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('superadmin', 'moderator'),
    defaultValue: 'moderator'
  }
}, {
  tableName: 'admins',
  indexes: [
    {
      unique: true,
      fields: ['username']
    }
  ]
});

// Instance method to check password
(Admin.prototype as any).validatePassword = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, (this as any).passwordHash);
};

// Static method to hash password
(Admin as any).hashPassword = async function(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
};

export default Admin;

