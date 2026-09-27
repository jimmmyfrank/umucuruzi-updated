module.exports = (sequelize, DataTypes) => {
  const PromoCodeUsage = sequelize.define(
    'PromoCodeUsage',
    {
      id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      promo_code_id: { type: DataTypes.INTEGER, allowNull: false },
      order_id:      { type: DataTypes.INTEGER, allowNull: false },
      user_id:       { type: DataTypes.INTEGER, allowNull: false },
      used_at:       { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    },
    {
      tableName: 'promo_code_usage',
      freezeTableName: true,
      timestamps: false
    }
  );

  PromoCodeUsage.associate = (models) => {
    PromoCodeUsage.belongsTo(models.PromoCode, { foreignKey: 'promo_code_id' });
    PromoCodeUsage.belongsTo(models.Order, { foreignKey: 'order_id' });
    PromoCodeUsage.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return PromoCodeUsage;
};
