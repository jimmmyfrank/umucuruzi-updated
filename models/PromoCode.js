module.exports = (sequelize, DataTypes) => {
  const PromoCode = sequelize.define(
    'PromoCode',
    {
      id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      trader_id:      { type: DataTypes.INTEGER, allowNull: false },
      code:           { type: DataTypes.STRING(50), allowNull: false, unique: true },
      discount_type:  { type: DataTypes.ENUM('percentage', 'fixed'), allowNull: false },
      discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      start_date:     { type: DataTypes.DATEONLY, allowNull: false },
      end_date:       { type: DataTypes.DATEONLY, allowNull: false },
      usage_limit:    { type: DataTypes.INTEGER, allowNull: true },
      used_count:     { type: DataTypes.INTEGER, defaultValue: 0 },
      description:    { type: DataTypes.TEXT },
      is_active:      { type: DataTypes.BOOLEAN, defaultValue: true }
    },
    {
      tableName: 'promo_codes',
      freezeTableName: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true
    }
  );

  PromoCode.associate = (models) => {
    PromoCode.belongsTo(models.User, { foreignKey: 'trader_id' });
    PromoCode.hasMany(models.PromoCodeUsage, { foreignKey: 'promo_code_id' });
  };

  return PromoCode;
};
