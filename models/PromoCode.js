// models/PromoCode.js
module.exports = (sequelize, DataTypes) => {
  const PromoCode = sequelize.define('PromoCode', {
    id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    trader_id:      DataTypes.INTEGER,
    code:           DataTypes.STRING,
    discount_type:  DataTypes.ENUM('percentage', 'fixed'),
    discount_value: DataTypes.DECIMAL(10, 2),
    start_date:     DataTypes.DATEONLY,
    end_date:       DataTypes.DATEONLY,
    usage_limit:    DataTypes.INTEGER,
    used_count:     { type: DataTypes.INTEGER, defaultValue: 0 },
    description:    DataTypes.TEXT,
    is_active:      { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'promo_codes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });
  PromoCode.associate = (models) => {
    PromoCode.belongsTo(models.User, { foreignKey: 'trader_id' });
    PromoCode.hasMany(models.PromoCodeUsage, { foreignKey: 'promo_code_id' });
  };
  return PromoCode;
};

// models/PromoCodeUsage.js
module.exports = (sequelize, DataTypes) => {
  const PromoCodeUsage = sequelize.define('PromoCodeUsage', {
    id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    promo_code_id: DataTypes.INTEGER,
    order_id:      DataTypes.INTEGER,
    user_id:       DataTypes.INTEGER,
    used_at:       { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'promo_code_usage',
    timestamps: false
  });
  PromoCodeUsage.associate = (models) => {
    PromoCodeUsage.belongsTo(models.PromoCode, { foreignKey: 'promo_code_id' });
    PromoCodeUsage.belongsTo(models.Order, { foreignKey: 'order_id' });
    PromoCodeUsage.belongsTo(models.User, { foreignKey: 'user_id' });
  };
  return PromoCodeUsage;
};
